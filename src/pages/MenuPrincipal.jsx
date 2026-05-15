import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { SECCIONES } from '../data/menu.js'
import SeccionFresco from '../Components/SeccionFresco.jsx'
import SeccionMarinados from '../Components/SeccionMarinados.jsx'
import SeccionPreparados from '../Components/SeccionPreparados.jsx'
import SeccionComplementos from "../Components/SeccionComplementos.jsx"
import SeccionBowls from '../Components/SeccionBowls.jsx'
import '../styles/menu.css'

const ENTRADAS = [
  { id: 'pollo', titulo: 'Pollo fresco y marinados', descripcion: 'Piezas frescas, marinados, preparados, milanesas y complementos.', accion: 'Ver pollo', tab: 'fresco' },
  { id: 'bowls', titulo: 'Bowls', descripcion: 'Arma tu bowl con base y marinado listo para recoger.', accion: 'Armar bowls', tab: 'bowls' },
]

const COMPONENTES = {
  fresco: SeccionFresco,
  marinados: SeccionMarinados,
  preparados: SeccionPreparados,
  complementos: SeccionComplementos,
  bowls: SeccionBowls,
}

export default function MenuPrincipal() {
  const { sucursalActiva, setVista, totalItems, diseno, promociones, bannersMenu = [] } = useApp()
  const [mostrarAtajos, setMostrarAtajos] = useState(true)
  const [tabActiva, setTabActiva] = useState(null)
  const [bannerActivo, setBannerActivo] = useState(0)

  const SeccionActiva = COMPONENTES[tabActiva]
  const banner = promociones.find(p => p.type === 'banner')

  // Carrusel automático banners menú
  useEffect(() => {
    if (bannersMenu.length <= 1) return
    const interval = setInterval(() => {
      setBannerActivo(prev => (prev + 1) % bannersMenu.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [bannersMenu.length])

  const elegirEntrada = (entrada) => {
    setMostrarAtajos(false)
    setTabActiva(entrada.tab)
  }

  const bannerMenuActual = bannersMenu[bannerActivo]

  return (
    <div
      className="app-wrapper"
      style={diseno?.background_image ? { backgroundImage: `linear-gradient(rgba(253,248,240,0.88), rgba(253,248,240,0.96)), url(${diseno.background_image})` } : undefined}
    >
      <header className="header">
        <div className="header-inner">
          <div>
            <div className="logo-nombre">Casa del Pollo</div>
            <div className="logo-sucursal">Sucursal {sucursalActiva?.name}</div>
          </div>
          <button className="carrito-btn" onClick={() => setVista('carrito')}>
            🛒
            {totalItems > 0 && <span className="carrito-badge">{totalItems}</span>}
            Mi pedido
          </button>
        </div>

        {!mostrarAtajos && (
          <div className="menu-tabs">
            {SECCIONES.map(s => (
              <button
                key={s.id}
                className={`menu-tab ${tabActiva === s.id ? 'menu-tab-activo' : ''}`}
                onClick={() => setTabActiva(s.id)}
              >
                <span>{s.emoji}</span>
                <span>{s.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="pagina slide-up">
        {diseno?.header_image && <img className="menu-hero-img" src={diseno.header_image} alt="" />}

        {/* Banner menú desde admin */}
        {bannersMenu.length > 0 && (
          <section className="menu-promo" style={{ cursor: bannerMenuActual?.link_url ? 'pointer' : 'default' }}
            onClick={() => bannerMenuActual?.link_url && window.open(bannerMenuActual.link_url, '_blank')}
          >
            {bannerMenuActual?.imagen_url && (
              <img src={bannerMenuActual.imagen_url} alt={bannerMenuActual.titulo} style={{ width:'100%', borderRadius:'8px', marginBottom:'8px', maxHeight:'120px', objectFit:'cover' }} />
            )}
            {bannerMenuActual?.titulo && <strong>{bannerMenuActual.titulo}</strong>}
            {bannersMenu.length > 1 && (
              <div style={{ display:'flex', gap:'4px', justifyContent:'center', marginTop:'6px' }}>
                {bannersMenu.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setBannerActivo(i) }}
                    style={{ width: i === bannerActivo ? '16px' : '6px', height:'6px', borderRadius:'3px', border:'none', background: i === bannerActivo ? 'var(--rojo, #E63946)' : '#ccc', cursor:'pointer', padding:0, transition:'all 0.3s' }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Fallback promociones antiguas */}
        {bannersMenu.length === 0 && banner && (
          <section className="menu-promo">
            <strong>{banner.title}</strong>
            {banner.description && <span>{banner.description}</span>}
          </section>
        )}

        {mostrarAtajos ? (
          <section className="menu-entrada-grid">
            <div>
              <div className="seccion-titulo">Menu</div>
              <p className="seccion-desc">Elige como quieres empezar tu pedido.</p>
            </div>
            {ENTRADAS.map(entrada => (
              <button key={entrada.id} className={`menu-entrada-card menu-entrada-${entrada.id}`} onClick={() => elegirEntrada(entrada)}>
                <span className="menu-entrada-label">{entrada.id === 'pollo' ? 'Mostrador' : 'Cocina'}</span>
                <strong>{entrada.titulo}</strong>
                <span>{entrada.descripcion}</span>
                <em>{entrada.accion} -&gt;</em>
              </button>
            ))}
          </section>
        ) : (
          SeccionActiva && <SeccionActiva />
        )}
      </main>
    </div>
  )
}