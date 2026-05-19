import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import '../styles/selector.css'

export default function SelectorSucursal() {
  const { setSucursalActiva, setVista, sucursales, cargando, promociones, banners } = useApp()
  const [bannerActivo, setBannerActivo] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setBannerActivo(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [banners.length])

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

      {/* Hero image / placeholder */}
      <div className="selector-hero">
        {bannerHero?.imagen_url ? (
          <>
            <img className="selector-hero-img" src={bannerHero.imagen_url} alt="" />
            <div className="selector-hero-overlay" />
            {(bannerHero.titulo) && (
              <div className="selector-hero-caption">
                <div className="selector-hero-titulo">{bannerHero.titulo}</div>
              </div>
            )}
          </>
        ) : (
          <div className="selector-hero-placeholder">
            <span>🍗</span>
            <span>Marinados artesanales{'\n'}listos para recoger</span>
          </div>
        )}

        {/* Dots carrusel */}
        {banners.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, right: 14, display: 'flex', gap: 5 }}>
            {banners.map((_, i) => (
              <button key={i} onClick={() => setBannerActivo(i)} style={{
                width: i === bannerActivo ? 20 : 7, height: 7,
                borderRadius: 4, border: 'none', padding: 0,
                background: i === bannerActivo ? 'white' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        )}
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
