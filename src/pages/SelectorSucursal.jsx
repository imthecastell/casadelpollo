import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import '../styles/selector.css'

/* Carrusel de productos cocinados — regla: slides/carruseles = cocinado */
const CDN  = 'https://res.cloudinary.com/do4juvxio/image/upload'
const COOK = (f) => `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_16:9,c_fill,w_960/${f}`
const HERO_ITEMS = [
  { img: COOK('marinados/teriyaki.png'),             nombre: 'Marinado Teriyaki' },
  { img: COOK('marinados/agridulce.png'),            nombre: 'Marinado Agridulce' },
  { img: COOK('preparados/pechuga_rellena.png'),     nombre: 'Pechuga Rellena' },
  { img: COOK('marinados/barbacoa.png'),             nombre: 'Marinado Barbacoa' },
  { img: COOK('marinados/hoisin.png'),               nombre: 'Marinado Hoisin' },
  { img: COOK('marinados/mostaza%20miel.png'),       nombre: 'Mostaza con Miel' },
]

export default function SelectorSucursal() {
  const { setSucursalActiva, setVista, sucursales, cargando, promociones, banners } = useApp()
  const [bannerActivo, setBannerActivo] = useState(0)
  const [heroIdx, setHeroIdx]           = useState(0)
  const [nombreVisible, setNombreVisible] = useState(true)

  /* rotación banners admin */
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setBannerActivo(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [banners.length])

  /* rotación carrusel de productos (siempre activo) */
  useEffect(() => {
    const t = setInterval(() => {
      setNombreVisible(false)
      setTimeout(() => {
        setHeroIdx(p => (p + 1) % HERO_ITEMS.length)
        setNombreVisible(true)
      }, 350)
    }, 3800)
    return () => clearInterval(t)
  }, [])

  const bannerHero = banners[bannerActivo]
  const promoLegacy = !banners.length ? (promociones.find(p => p.type === 'banner') || promociones[0]) : null

  const elegirSucursal = (sucursal) => {
    if (!sucursal.active) return
    setSucursalActiva(sucursal)
    setVista('menu')
  }

  if (cargando) return (
    <div className="selector-wrap" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: 'var(--texto-suave)' }}>Cargando...</div>
    </div>
  )

  return (
    <div className="selector-wrap">

      {/* Logo */}
      <div className="selector-header">
        <img
          src="/logo-small.png"
          alt="Casa del Pollo"
          style={{ width: '100%', maxWidth: 260, height: 'auto', mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Hero — carrusel de productos cocinados siempre visible */}
      <div className="selector-hero">
        {/* Imágenes rotativas de fondo */}
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

        {/* Chip con nombre del producto — sólo en modo carrusel sin banner */}
        {!bannerHero?.titulo && (
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

        {/* Si hay banner admin con imagen, lo mostramos encima */}
        {bannerHero?.imagen_url && (
          <img
            className="selector-hero-img"
            src={bannerHero.imagen_url} alt=""
            style={{ position: 'absolute', inset: 0, opacity: 1 }}
          />
        )}

        {/* Texto: banner admin o copy de marca */}
        <div className="selector-hero-caption">
          {bannerHero?.titulo
            ? <div className="selector-hero-titulo">{bannerHero.titulo}</div>
            : <>
                <div className="selector-hero-titulo">Marinados artesanales,<br />listos para recoger</div>
                <div className="selector-hero-sub">Preparados · Milanesas · Bowls · Fresco</div>
              </>
          }
        </div>

        {/* Dots del carrusel */}
        <div style={{ position: 'absolute', bottom: 12, right: 14, display: 'flex', gap: 5, zIndex: 2 }}>
          {HERO_ITEMS.map((_, i) => (
            <button key={i} onClick={() => { setHeroIdx(i); setNombreVisible(true); }} style={{
              width: i === heroIdx ? 20 : 7, height: 7,
              borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer',
              background: i === heroIdx ? 'white' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="selector-body">

        {/* Promo legacy */}
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
