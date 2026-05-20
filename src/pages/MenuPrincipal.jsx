import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { SECCIONES } from '../data/menu.js'
import SeccionFresco from '../Components/SeccionFresco.jsx'
import SeccionMarinados from '../Components/SeccionMarinados.jsx'
import SeccionPreparados from '../Components/SeccionPreparados.jsx'
import SeccionComplementos from '../Components/SeccionComplementos.jsx'
import SeccionBowls from '../Components/SeccionBowls.jsx'
import '../styles/menu.css'

const BASE = 'https://res.cloudinary.com/do4juvxio/image/upload'
const C    = (t, f) => `${BASE}/${t}/${f}`

/* ─── Imágenes que rotan en el hero ─── */
const HERO_IMGS = [
  C('ar_3:2,c_fill,g_east,w_960', 'marinados/teriyaki.png'),
  C('ar_3:2,c_fill,g_east,w_960', 'marinados/agridulce.png'),
  C('ar_3:2,c_fill,g_east,w_960', 'preparados/pechuga_rellena.png'),
  C('ar_3:2,c_fill,g_east,w_960', 'fresco/piernita.png'),
  C('ar_3:2,c_fill,g_east,w_960', 'marinados/barbacoa.png'),
]

/* ─── Strip de categorías ─── */
const CATS = [
  { label: 'Marinados',   emoji: '🍯', img: C('ar_1:1,c_fill,g_east,w_180', 'marinados/teriyaki.png'),        tab: 'marinados'    },
  { label: 'Milanesas',   emoji: '🥩', img: C('ar_1:1,c_fill,g_east,w_180', 'milanesas/milanesa_natural.png'), tab: 'preparados'   },
  { label: 'Preparados',  emoji: '🍳', img: C('ar_1:1,c_fill,g_east,w_180', 'preparados/pechuga_rellena.png'), tab: 'preparados'   },
  { label: 'Nuggets',     emoji: '🍗', img: C('c_fill,w_180,h_180',         'preparados/nuggets_grupo.png'),   tab: 'preparados'   },
  { label: 'Fresco',      emoji: '🐔', img: C('ar_1:1,c_fill,g_east,w_180', 'fresco/piernita.png'),            tab: 'fresco'       },
  { label: 'Bowls',       emoji: '🥣', img: C('ar_1:1,c_fill,g_east,w_180', 'marinados/agridulce.png'),        tab: 'bowls'        },
]

/* ─── Cards de entrada ─── */
const ENTRADAS = [
  {
    id: 'pollo', tab: 'fresco',
    titulo: 'Pollo fresco y marinados',
    desc: 'Marinados artesanales · preparados · milanesas · piezas frescas',
    color: '#1a0408',
    imgs: [
      C('ar_4:3,c_fill,g_east,w_480', 'marinados/adobado.png'),
      C('ar_4:3,c_fill,g_east,w_480', 'marinados/teriyaki.png'),
      C('ar_4:3,c_fill,g_east,w_480', 'marinados/hoisin.png'),
      C('ar_4:3,c_fill,g_east,w_480', 'marinados/barbacoa.png'),
      C('ar_4:3,c_fill,g_east,w_480', 'preparados/hamburguesa.png'),
    ],
  },
  {
    id: 'bowls', tab: 'bowls',
    titulo: 'Bowls',
    desc: 'Arma tu bowl con marinado y base a elegir',
    color: '#0a2016',
    imgs: [
      C('ar_4:3,c_fill,g_east,w_480', 'marinados/agridulce.png'),
      C('ar_4:3,c_fill,g_east,w_480', 'marinados/almendrado.png'),
    ],
  },
]

/* ── Hero slideshow ── */
function HeroSlide({ imgs, idx }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {imgs.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: i === idx ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }} />
      ))}
      {/* gradiente base → top para texto legible */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(10,4,2,0.90) 0%, rgba(10,4,2,0.45) 40%, rgba(10,4,2,0.15) 70%, transparent 100%)',
      }} />
    </div>
  )
}

/* ── Card de entrada ── */
function EntradaCard({ entrada, onClic }) {
  const [idx, setIdx] = useState(0)
  const imgs = entrada.imgs || []
  useEffect(() => {
    if (imgs.length <= 1) return
    const t = setInterval(() => setIdx(p => (p + 1) % imgs.length), 3400)
    return () => clearInterval(t)
  }, [imgs.length])

  return (
    <button onClick={onClic} style={{
      position: 'relative', overflow: 'hidden', minHeight: 160,
      borderRadius: 22, border: 0, cursor: 'pointer',
      textAlign: 'left', width: '100%', display: 'block', padding: 0,
      boxShadow: 'var(--sombra-lg)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: entrada.color }} />
      {imgs.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover', backgroundPosition: 'right center',
          opacity: i === idx ? 1 : 0, transition: 'opacity 1s ease',
        }} />
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to right, ${entrada.color} 0%, ${entrada.color} 38%, ${entrada.color}d0 55%, ${entrada.color}50 72%, transparent 100%)`,
      }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 18px', maxWidth: '65%', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 160, justifyContent: 'center' }}>
        <strong style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 800, fontSize: 18, lineHeight: 1.15, color: '#fff', letterSpacing: '-0.2px' }}>
          {entrada.titulo}
        </strong>
        <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, lineHeight: 1.4 }}>
          {entrada.desc}
        </span>
        <em style={{ color: '#fff', fontStyle: 'normal', fontWeight: 700, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.9, marginTop: 2 }}>
          Ver →
        </em>
      </div>
    </button>
  )
}

const COMPONENTES = { fresco: SeccionFresco, marinados: SeccionMarinados, preparados: SeccionPreparados, complementos: SeccionComplementos, bowls: SeccionBowls }
const TABS_POLLO  = SECCIONES

export default function MenuPrincipal() {
  const { sucursalActiva, setVista, totalItems, bannersMenu = [] } = useApp()
  const [mostrarAtajos, setMostrarAtajos] = useState(true)
  const [tabActiva, setTabActiva]         = useState(null)
  const [heroIdx, setHeroIdx]             = useState(0)
  const [bannerActivo, setBannerActivo]   = useState(0)

  const SeccionActiva = COMPONENTES[tabActiva]
  const bannerMenuActual = bannersMenu[bannerActivo]

  /* rotación hero */
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(p => (p + 1) % HERO_IMGS.length), 4000)
    return () => clearInterval(t)
  }, [])

  /* rotación banner */
  useEffect(() => {
    if (bannersMenu.length <= 1) return
    const t = setInterval(() => setBannerActivo(p => (p + 1) % bannersMenu.length), 4000)
    return () => clearInterval(t)
  }, [bannersMenu.length])

  const irA = (tab) => {
    setTabActiva(tab)
    setMostrarAtajos(false)
  }

  const volver = () => {
    setMostrarAtajos(true)
    setTabActiva(null)
  }

  return (
    <div className="app-wrapper">

      {/* ── Header ── */}
      <header className="header" style={{ background: mostrarAtajos ? 'transparent' : undefined, backdropFilter: mostrarAtajos ? 'none' : undefined, boxShadow: mostrarAtajos ? 'none' : undefined, borderBottom: mostrarAtajos ? 'none' : undefined }}>
        <div className="header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!mostrarAtajos ? (
              <button onClick={volver} style={{ background: 'none', border: 'none', color: 'var(--rojo)', fontSize: 14, fontFamily: 'var(--font-body),sans-serif', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                ← Menú
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo-small.png" alt="Casa del Pollo" style={{ height: 34, width: 'auto', mixBlendMode: 'multiply', filter: 'brightness(0) invert(1)' }} />
              </div>
            )}
          </div>
          <button className="carrito-btn" onClick={() => setVista('carrito')}>
            🛒{totalItems > 0 && <span className="carrito-badge">{totalItems}</span>}
            Mi pedido
          </button>
        </div>

        {!mostrarAtajos && (
          <div className="menu-tabs">
            {TABS_POLLO.map(s => (
              <button key={s.id}
                className={`menu-tab ${tabActiva === s.id ? 'menu-tab-activo' : ''}`}
                onClick={() => irA(s.id)}>
                <span>{s.emoji}</span><span>{s.tabLabel || s.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {mostrarAtajos ? (
        /* ════════════════ PANTALLA DE BIENVENIDA ════════════════ */
        <div>

          {/* ── Hero ── */}
          <div style={{ position: 'relative', height: '52vh', minHeight: 280, maxHeight: 420, overflow: 'hidden' }}>
            <HeroSlide imgs={HERO_IMGS} idx={heroIdx} />

            {/* Dots hero */}
            <div style={{ position: 'absolute', bottom: 80, right: 16, display: 'flex', gap: 5, zIndex: 2 }}>
              {HERO_IMGS.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)} style={{
                  width: i === heroIdx ? 20 : 6, height: 6,
                  borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer',
                  background: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>

            {/* Texto encima del hero */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 22px 28px', zIndex: 2 }}>
              {sucursalActiva && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '4px 10px', marginBottom: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>
                    Sucursal {sucursalActiva.name} · Abierto
                  </span>
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 800, fontSize: 30, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>
                El pollo de casa,<br />
                <span style={{ color: '#fbbf24' }}>listo para recoger</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.4, marginBottom: 16 }}>
                Marinados artesanales · preparados · bowls
              </p>
              <button
                onClick={() => irA('marinados')}
                style={{
                  background: 'var(--button-bg)', color: '#fff', border: 'none',
                  borderRadius: 50, padding: '12px 24px',
                  fontFamily: 'var(--font-title),sans-serif', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', letterSpacing: 0.3,
                  boxShadow: '0 4px 16px rgba(146,43,33,0.45)',
                }}>
                Ver menú completo →
              </button>
            </div>
          </div>

          {/* ── Strip de categorías ── */}
          <div style={{ padding: '20px 0 4px', background: 'var(--app-bg)' }}>
            <div style={{ paddingLeft: 20, marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--texto)', letterSpacing: 0.1 }}>
                ¿Qué vas a pedir?
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 16px', scrollbarWidth: 'none' }}>
              {CATS.map(cat => (
                <button key={cat.label} onClick={() => irA(cat.tab)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 3px 12px rgba(0,0,0,0.14)', border: '2.5px solid var(--card-bg)' }}>
                    {cat.img
                      ? <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'var(--crema-oscura)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{cat.emoji}</div>
                    }
                  </div>
                  <span style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 700, fontSize: 11, color: 'var(--texto)', letterSpacing: 0.2 }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Banner promo (si existe) ── */}
          {bannerMenuActual?.titulo && (
            <div style={{ margin: '0 20px 16px' }}>
              <section className="menu-promo">
                <strong>{bannerMenuActual.titulo}</strong>
                {bannersMenu.length > 1 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {bannersMenu.map((_, i) => (
                      <button key={i} onClick={() => setBannerActivo(i)}
                        style={{ width: i === bannerActivo ? 16 : 6, height: 6, borderRadius: 3, border: 'none', background: i === bannerActivo ? 'var(--rojo)' : '#ccc', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── Cards de entrada ── */}
          <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ENTRADAS.map(e => (
              <EntradaCard key={e.id} entrada={e} onClic={() => irA(e.tab)} />
            ))}
          </div>

        </div>

      ) : (
        /* ════════════════ VISTA MENÚ ════════════════ */
        <main className="pagina slide-up">
          {tabActiva === 'bowls' ? <SeccionBowls /> : SeccionActiva && <SeccionActiva />}
        </main>
      )}
    </div>
  )
}
