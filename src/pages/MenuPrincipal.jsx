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
{diseno?.header_image && (
  <div className="hero-fondo">
    <img
      className="hero-fondo-img"
      src={diseno.header_image}
      alt=""
    />
    <div className="hero-fondo-overlay" />
  </div>
)}
  {/* Carrusel banners menú */}
{bannersMenu.length > 0 && bannerMenuActual?.imagen_url && (
  <section className="menu-banner-slider">
    <img
      src={bannerMenuActual.imagen_url}
      alt={bannerMenuActual.titulo || 'Banner'}
      className="menu-banner-img"
    />

    {bannerMenuActual?.titulo && (
      <div className="menu-banner-caption">
        {bannerMenuActual.titulo}
      </div>
    )}

    {bannersMenu.length > 1 && (
      <div className="menu-banner-dots">
        {bannersMenu.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setBannerActivo(i)}
            className={
              i === bannerActivo
                ? 'menu-dot menu-dot-active'
                : 'menu-dot'
            }
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