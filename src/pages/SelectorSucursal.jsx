import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import '../styles/selector.css'

/* Carrusel de productos cocinados — regla: slides/carruseles = cocinado */
const CDN  = 'https://res.cloudinary.com/do4juvxio/image/upload'
const COOK = (f) => `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_16:9,c_fill,w_960/${f}`
const HERO_IMGS = [
  COOK('marinados/teriyaki.png'),
  COOK('marinados/agridulce.png'),
  COOK('preparados/pechuga_rellena.png'),
  COOK('marinados/barbacoa.png'),
  COOK('marinados/hoisin.png'),
  COOK('marinados/mostaza%20miel.png'),
]

export default function SelectorSucursal() {
  const { setSucursalActiva, setVista, sucursales, cargando, promociones, banners } = useApp()
  const [bannerActivo, setBannerActivo] = useState(0)
  const [heroIdx, setHeroIdx]           = useState(0)

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
    const t = setInterval(() => setHeroIdx(p => (p + 1) % HERO_IMGS.length), 3800)
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
        {HERO_IMGS.map((img, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === heroIdx ? 1 : 0,
            transition: 'opacity 1.1s ease',
          }} />
        ))}
        <div className="selector-hero-overlay" />

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
          {HERO_IMGS.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{
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
