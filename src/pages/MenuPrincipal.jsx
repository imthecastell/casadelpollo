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

console.log('BANNERS MENU:', bannersMenu)
console.log('BANNER ACTUAL:', bannerMenuActual)

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
{/* Imagen hero antigua desactivada */}
{/* {diseno?.header_image && <img className="menu-hero-img" src={diseno.header_image} alt="" />} */}
{/* HERO BANNER CINEMÁTICO */}
{bannersMenu.length > 0 && bannerMenuActual?.imagen_url && (
  <div
    className="hero-banner"
    onClick={() => {
      if (bannerMenuActual?.link_url) {
        window.open(
          bannerMenuActual.link_url,
          '_blank',
          'noopener,noreferrer'
        )
      }
    }}
  >
    <img
src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=1200"      alt={bannerMenuActual.titulo || 'Banner'}
      className="hero-banner-img"
    />

    <div className="hero-banner-overlay" />

    <div className="hero-banner-content">
      {bannerMenuActual?.titulo && (
        <h2>{bannerMenuActual.titulo}</h2>
      )}
    </div>

    {bannersMenu.length > 1 && (
      <div className="hero-banner-dots">
        {bannersMenu.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setBannerActivo(i)
            }}
            className={
              i === bannerActivo
                ? 'hero-dot hero-dot-active'
                : 'hero-dot'
            }
          />
        ))}
      </div>
    )}
  </div>
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