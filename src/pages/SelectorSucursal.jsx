import { useState, useEffect, useRef } from 'react'
import { useApp } from '../data/AppContext.jsx'
import LogoSlot from '../Components/LogoSlot.jsx'
import '../styles/selector.css'

/* Carrusel de productos cocinados */
const CDN  = 'https://res.cloudinary.com/do4juvxio/image/upload'
const COOK = (f) => `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_16:9,c_fill,w_960/${f}`
const HERO_ITEMS = [
  { img: COOK('marinados/teriyaki.png'),         nombre: 'Marinado Teriyaki' },
  { img: COOK('marinados/agridulce.png'),        nombre: 'Marinado Agridulce' },
  { img: COOK('preparados/pechuga_rellena.png'), nombre: 'Pechuga Rellena' },
  { img: COOK('marinados/barbacoa.png'),         nombre: 'Marinado Barbacoa' },
  { img: COOK('marinados/hoisin.png'),           nombre: 'Marinado Hoisin' },
  { img: COOK('marinados/mostaza%20miel.png'),   nombre: 'Mostaza con Miel' },
]

export default function SelectorSucursal() {
  const { setSucursalActiva, setVista, sucursales, cargando, promociones, banners, diseno } = useApp()

  // fase: 'banners' → muestra avisos del admin uno a uno
  //       'carrusel' → productos rotando indefinidamente
  const [fase, setFase]               = useState('carrusel')
  const [bannerActivo, setBannerActivo] = useState(0)
  const [bannerOpacity, setBannerOpacity] = useState(1) // para fade-out suave
  const [heroIdx, setHeroIdx]         = useState(0)
  const [nombreVisible, setNombreVisible] = useState(true)
  const iniciadoRef = useRef(false)
  const timerRef    = useRef(null)

  /* ── Cuando los banners cargan, arrancar la secuencia ── */
  useEffect(() => {
    if (iniciadoRef.current || banners.length === 0) return
    iniciadoRef.current = true

    setFase('banners')
    setBannerActivo(0)
    setBannerOpacity(1)

    const DURACION = 4000 // ms por banner

    const avanzar = (idx) => {
      const siguiente = idx + 1
      if (siguiente < banners.length) {
        // Fade-out del banner actual, luego mostrar el siguiente
        timerRef.current = setTimeout(() => {
          setBannerOpacity(0)
          setTimeout(() => {
            setBannerActivo(siguiente)
            setBannerOpacity(1)
            avanzar(siguiente)
          }, 500)
        }, DURACION)
      } else {
        // Último banner mostrado → fade-out y pasar al carrusel
        timerRef.current = setTimeout(() => {
          setBannerOpacity(0)
          setTimeout(() => setFase('carrusel'), 600)
        }, DURACION)
      }
    }

    avanzar(0)
    return () => clearTimeout(timerRef.current)
  }, [banners]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Rotación del carrusel de productos (sólo cuando fase === 'carrusel') ── */
  useEffect(() => {
    if (fase !== 'carrusel') return
    const t = setInterval(() => {
      setNombreVisible(false)
      setTimeout(() => {
        setHeroIdx(p => (p + 1) % HERO_ITEMS.length)
        setNombreVisible(true)
      }, 350)
    }, 3800)
    return () => clearInterval(t)
  }, [fase])

  const bannerHero = banners[bannerActivo]

  const elegirSucursal = (sucursal) => {
    if (!sucursal.active) return
    setSucursalActiva(sucursal)
    setVista('menu')
  }

  const promoLegacy = !banners.length
    ? (promociones.find(p => p.type === 'banner') || promociones[0])
    : null

  if (cargando) return (
    <div className="selector-wrap" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: 'var(--texto-suave)' }}>Cargando...</div>
    </div>
  )

  return (
    <div className="selector-wrap">

      {/* Logo */}
      <div className="selector-header">
        <LogoSlot
          type="logotipo"
          src={diseno?.logo_url}
          mode={diseno?.logo_color_mode}
          customFilter={diseno?.logo_custom_filter}
          width={200} height={42}
          placeholderStyle={{ border: '1.5px dashed rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)', margin: '0 auto' }}
          imgStyle={{ margin: '0 auto' }}
        />
      </div>

      {/* Hero */}
      <div className="selector-hero">

        {/* ── Carrusel de productos (siempre detrás) ── */}
        {HERO_ITEMS.map((item, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${item.img})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === heroIdx ? 1 : 0,
            transition: 'opacity 1.1s ease',
          }} />
        ))}
        <div className="selector-hero-overlay" />

        {/* ── Overlay de banner del admin — fade in/out sobre el carrusel ── */}
        {fase === 'banners' && bannerHero?.imagen_url && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${bannerHero.imagen_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: bannerOpacity,
            transition: 'opacity 0.5s ease',
          }} />
        )}

        {/* ── Chip con nombre del producto (sólo en fase carrusel) ── */}
        {fase === 'carrusel' && (
          <div style={{
            position: 'absolute', top: 14, left: 14, zIndex: 3,
            background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999, padding: '4px 12px',
            fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.3px',
            opacity: nombreVisible ? 1 : 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
          }}>
            {HERO_ITEMS[heroIdx].nombre}
          </div>
        )}

        {/* ── Indicador de banner (sólo fase banners con más de uno) ── */}
        {fase === 'banners' && banners.length > 1 && (
          <div style={{
            position: 'absolute', top: 14, left: 14, zIndex: 3,
            background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999, padding: '4px 12px',
            fontSize: 11, fontWeight: 600, color: 'white',
            opacity: bannerOpacity,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }}>
            {bannerActivo + 1} / {banners.length}
          </div>
        )}

        {/* ── Caption ── */}
        <div className="selector-hero-caption" style={{ opacity: fase === 'banners' ? bannerOpacity : 1, transition: 'opacity 0.5s ease' }}>
          {fase === 'banners' && bannerHero?.titulo
            ? <div className="selector-hero-titulo">{bannerHero.titulo}</div>
            : <>
                <div className="selector-hero-titulo">Marinados artesanales,<br />listos para recoger</div>
                <div className="selector-hero-sub">Preparados · Milanesas · Bowls · Fresco</div>
              </>
          }
        </div>

        {/* ── Dots (carrusel de productos) ── */}
        {fase === 'carrusel' && (
          <div style={{ position: 'absolute', bottom: 12, right: 14, display: 'flex', gap: 5, zIndex: 2 }}>
            {HERO_ITEMS.map((_, i) => (
              <button key={i} onClick={() => { setHeroIdx(i); setNombreVisible(true) }} style={{
                width: i === heroIdx ? 20 : 7, height: 7,
                borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer',
                background: i === heroIdx ? 'white' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        )}

        {/* ── Barra de progreso del banner (fase banners) ── */}
        {fase === 'banners' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, zIndex: 3,
            background: 'rgba(255,255,255,0.2)',
          }}>
            <div key={bannerActivo} style={{
              height: '100%',
              background: 'rgba(255,255,255,0.85)',
              animation: 'banner-progress 4s linear forwards',
            }} />
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="selector-body">
        {promoLegacy && (
          <section className="promo-bienvenida">
            <span className="promo-etiqueta">Promoción activa</span>
            <h1>{promoLegacy.title}</h1>
            {promoLegacy.description && <p>{promoLegacy.description}</p>}
          </section>
        )}

        <p className="selector-pregunta">¿Dónde recoges tu pedido?</p>

        <div className="selector-lista">
          {sucursales.map(s => (
            <button
              key={s.id}
              className={`sucursal-card ${!s.active ? 'sucursal-inactiva' : ''}`}
              onClick={() => elegirSucursal(s)}
            >
              <div className="sucursal-info">
                <div className="sucursal-nombre">{s.name}</div>
                <div className="sucursal-direccion">{s.address}</div>
                {!s.active && <div className="sucursal-pronto">Próximamente</div>}
              </div>
              {s.active && <span className="sucursal-flecha">→</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="selector-footer">
        <div>Solo recolección en local</div>
        <div className="selector-footer-pagos">
          <span className="pago-chip">💵 Efectivo</span>
          <span className="pago-chip">💳 Débito / Crédito</span>
          <span className="pago-chip">Amex</span>
        </div>
      </div>

    </div>
  )
}
