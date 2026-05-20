import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { SECCIONES } from '../data/menu.js'
import SeccionFresco from '../Components/SeccionFresco.jsx'
import SeccionMarinados from '../Components/SeccionMarinados.jsx'
import SeccionPreparados from '../Components/SeccionPreparados.jsx'
import SeccionComplementos from "../Components/SeccionComplementos.jsx"
import SeccionBowls from '../Components/SeccionBowls.jsx'
import { cookedCrop } from '../Components/SeccionMarinados.jsx'
import '../styles/menu.css'

const BASE = 'https://res.cloudinary.com/do4juvxio/image/upload'

const ENTRADAS = [
  {
    id: 'pollo',
    titulo: 'Pollo fresco y marinados',
    descripcion: 'Marinados artesanales, preparados, milanesas y piezas frescas.',
    accion: 'Ver pollo →',
    tab: 'fresco',
    color: '#1a0408',
    imgs: [
      cookedCrop(`${BASE}/marinados/adobado.png`),
      cookedCrop(`${BASE}/marinados/teriyaki.png`),
      cookedCrop(`${BASE}/marinados/hoisin.png`),
      cookedCrop(`${BASE}/marinados/pollo%20al%20pastor.png`),
      cookedCrop(`${BASE}/marinados/mostaza%20miel.png`),
    ],
  },
  {
    id: 'bowls',
    titulo: 'Bowls',
    descripcion: 'Arma tu bowl con base y marinado listo para recoger.',
    accion: 'Armar bowl →',
    tab: 'bowls',
    color: '#0a2016',
    imgs: [],
  },
]

function EntradaCard({ entrada, onClic }) {
  const [idx, setIdx] = useState(0)
  const imgs = entrada.imgs || []

  useEffect(() => {
    if (imgs.length <= 1) return
    const t = setInterval(() => setIdx(p => (p + 1) % imgs.length), 3200)
    return () => clearInterval(t)
  }, [imgs.length])

  return (
    <button
      onClick={onClic}
      style={{
        position: 'relative', overflow: 'hidden', minHeight: 190,
        borderRadius: 24, border: 0, cursor: 'pointer',
        textAlign: 'left', width: '100%', display: 'block', padding: 0,
        boxShadow: 'var(--sombra-lg)',
      }}
    >
      {/* Fondo sólido base */}
      <div style={{ position: 'absolute', inset: 0, background: entrada.color }} />

      {/* Slideshow imágenes cocinadas (lado derecho) */}
      {imgs.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          opacity: i === idx ? 1 : 0,
          transition: 'opacity 1s ease',
        }} />
      ))}

      {/* Degradado: sólido a izquierda, transparente a derecha */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to right, ${entrada.color} 0%, ${entrada.color} 42%, ${entrada.color}e0 58%, ${entrada.color}60 75%, transparent 100%)`,
      }} />

      {/* Contenido */}
      <div style={{ position: 'relative', zIndex: 1, padding: '22px 20px', maxWidth: '68%', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 190, justifyContent: 'center' }}>
        <strong style={{ fontFamily: 'var(--font-title), sans-serif', fontWeight: 800, fontSize: 22, lineHeight: 1.1, color: '#fff', letterSpacing: '-0.3px' }}>
          {entrada.titulo}
        </strong>
        <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 1.4 }}>
          {entrada.descripcion}
        </span>
        <em style={{ color: '#fff', fontStyle: 'normal', fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9, marginTop: 4 }}>
          {entrada.accion}
        </em>
      </div>
    </button>
  )
}

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
                style={{ background: 'none', border: 'none', color: 'var(--rojo)', fontSize: 14, fontFamily: 'var(--font-body), sans-serif', cursor: 'pointer', fontWeight: 600, padding: 0, whiteSpace: 'nowrap' }}
              >
                ← Menú
              </button>
            )}
            {mostrarAtajos && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo-small.png" alt="Casa del Pollo" style={{ height: 36, width: 'auto', mixBlendMode: 'multiply' }} />
                <div className="logo-sucursal" style={{ fontSize: 12 }}>Sucursal {sucursalActiva?.name}</div>
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
                <span>{s.tabLabel || s.nombre}</span>
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
              <EntradaCard key={e.id} entrada={e} onClic={() => elegirEntrada(e)} />
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