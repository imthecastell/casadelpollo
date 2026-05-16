import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import '../styles/selector.css'

export default function SelectorSucursal() {
  const { setSucursalActiva, setVista, sucursales, cargando, promociones, banners } = useApp()
  const [bannerActivo, setBannerActivo] = useState(0)

  // Carrusel automático cada 4 segundos
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setBannerActivo(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [banners.length])

  const banner = promociones.find(p => p.type === 'banner') || promociones[0]
  const bannerImg = banners[bannerActivo]?.imagen_url || banner?.image_url

  const elegirSucursal = (sucursal) => {
    if (!sucursal.active) return
    setSucursalActiva(sucursal)
    setVista('menu')
  }

  if (cargando) return (
    <div className="selector-bg">
      <div className="selector-overlay" />
      <div className="selector-contenido">
        <div className="selector-cargando">Cargando...</div>
      </div>
    </div>
  )

  return (
    <div className="selector-bg">
      {bannerImg && <img className="selector-bg-img" src={bannerImg} alt="" />}
      <div className="selector-overlay" />

      <div className="selector-contenido">
        <div className="selector-logo">
          <div className="selector-logo-icono">Casa del Pollo</div>
          <div className="selector-logo-nombre">Casa del Pollo</div>
          <div className="selector-logo-sub">Marinados artesanales</div>
        </div>

        {banners.length > 0 && (
          <section className="promo-bienvenida">
            {banners[bannerActivo]?.titulo && <h1>{banners[bannerActivo].titulo}</h1>}
            {banners.length > 1 && (
              <div style={{ display:'flex', gap:'6px', justifyContent:'center', marginTop:'8px' }}>
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerActivo(i)}
                    style={{
                      width: i === bannerActivo ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: i === bannerActivo ? 'white' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!banners.length && banner && (
          <section className="promo-bienvenida">
            <span className="promo-etiqueta">Promocion activa</span>
            <h1>{banner.title}</h1>
            {banner.description && <p>{banner.description}</p>}
          </section>
        )}

        <div className="selector-pregunta">Elige donde recoges tu pedido</div>

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
                {!s.active && <div className="sucursal-pronto">Proximamente</div>}
              </div>
              {s.active && <span className="sucursal-flecha">→</span>}
            </button>
          ))}
        </div>

        <div className="selector-footer">
          <div>Solo recoleccion en local</div>
          <div className="selector-footer-pagos">
            <span className="pago-chip">💵 Efectivo</span>
            <span className="pago-chip">💳 Débito / Crédito</span>
            <span className="pago-chip">Amex</span>
          </div>
        </div>
      </div>
    </div>
  )
}