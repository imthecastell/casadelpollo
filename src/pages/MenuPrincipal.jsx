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

const TABS_POLLO = SECCIONES

export default function MenuPrincipal() {
  const { sucursalActiva, setVista, totalItems, diseno, promociones, bannersMenu = [] } = useApp()
  const [mostrarAtajos, setMostrarAtajos] = useState(true)
  const [entrada, setEntrada] = useState(null)
  const [tabActiva, setTabActiva] = useState(null)
  const [bannerActivo, setBannerActivo] = useState(0)

  const SeccionActiva = COMPONENTES[tabActiva]
  const banner = promociones.find(p => p.type === 'banner')
  const bannerMenuActual = bannersMenu[bannerActivo]
  const heroImg = bannerMenuActual?.imagen_url || diseno?.header_image

  useEffect(() => {
    if (bannersMenu.length <= 1) return
    const interval = setInterval(() => {
      setBannerActivo(prev => (prev + 1) % bannersMenu.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [bannersMenu.length])

  const elegirEntrada = (e) => {
    setEntrada(e.id)
    setMostrarAtajos(false)
    setTabActiva(e.tab)
  }

  const volverAlMenu = () => {
    setMostrarAtajos(true)
    setEntrada(null)
    setTabActiva(null)
  }

  return (
    <div className="app-wrapper">

      {/* Hero fondo con degradado */}
      {heroImg && (
        <div className="hero-fondo">
          <img className="hero-fondo-img" src={heroImg} alt="" />
          <div className="hero-fondo-overlay" />
        </div>
      )}

      <header className="header">
        <div className="header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!mostrarAtajos && (
              <button
                onClick={volverAlMenu}
                style={{ background: 'none', border: 'none', color: 'var(--dorado-claro)', fontSize: 14, fontFamily: 'var(--font-body), sans-serif', cursor: 'pointer', fontWeight: 500, padding: 0, whiteSpace: 'nowrap' }}
              >
                ← Menú
              </button>
            )}
            {mostrarAtajos && (
              <div>
                <div className="logo-nombre">Casa del Pollo</div>
                <div className="logo-sucursal">Sucursal {sucursalActiva?.name}</div>
              </div>
            )}
          </div>
          <button className="carrito-btn" onClick={() => setVista('carrito')}>
            🛒
            {totalItems > 0 && <span className="carrito-badge">{totalItems}</span>}
            Mi pedido
          </button>
        </div>

        {!mostrarAtajos && (
          <div className="menu-tabs">
            {TABS_POLLO.map(s => (
              <button
                key={s.id}
                className={`menu-tab ${tabActiva === s.id ? 'menu-tab-activo' : ''}`}
                onClick={() => { setEntrada(s.id === 'bowls' ? 'bowls' : 'pollo'); setTabActiva(s.id) }}
              >
                <span>{s.emoji}</span>
                <span>{s.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="pagina slide-up">

        {/* Banner menú con título y dots */}
        {bannerMenuActual?.titulo && (
          <section className="menu-promo">
            <strong>{bannerMenuActual.titulo}</strong>
            {bannersMenu.length > 1 && (
              <div style={{ display:'flex', gap:'4px', marginTop:'6px' }}>
                {bannersMenu.map((_, i) => (
                  <button key={i}
                    onClick={() => setBannerActivo(i)}
                    style={{ width: i === bannerActivo ? '16px' : '6px', height:'6px', borderRadius:'3px', border:'none', background: i === bannerActivo ? 'var(--rojo,#E63946)' : '#ccc', cursor:'pointer', padding:0, transition:'all 0.3s' }}
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
              <div className="seccion-titulo">¿Qué vas a pedir hoy?</div>
              <p className="seccion-desc">Sucursal {sucursalActiva?.name}</p>
            </div>
            {ENTRADAS.map(e => (
              <button key={e.id} className={`menu-entrada-card menu-entrada-${e.id}`} onClick={() => elegirEntrada(e)}>
                <strong>{e.titulo}</strong>
                <span>{e.descripcion}</span>
                <em>{e.accion} →</em>
              </button>
            ))}
          </section>
        ) : tabActiva === 'bowls' ? (
          <SeccionBowls />
        ) : (
          SeccionActiva && <SeccionActiva />
        )}
      </main>
    </div>
  )
}