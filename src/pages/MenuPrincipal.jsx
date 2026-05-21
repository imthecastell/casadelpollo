import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import LogoSlot from '../Components/LogoSlot.jsx'
import { SECCIONES } from '../data/menu.js'
import SeccionFresco from '../Components/SeccionFresco.jsx'
import SeccionMarinados from '../Components/SeccionMarinados.jsx'
import SeccionPreparados from '../Components/SeccionPreparados.jsx'
import SeccionComplementos from '../Components/SeccionComplementos.jsx'
import SeccionBowls from '../Components/SeccionBowls.jsx'
import '../styles/menu.css'

const BASE = 'https://res.cloudinary.com/do4juvxio/image/upload'
/* crop lado cocinado (derecho) con fl_relative — funciona con cualquier resolución */
const COOK = (f, ar = '4:3', w = 600) =>
  `${BASE}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_${ar},c_fill,w_${w}/${f}`
/* foto entera sin crop (para imágenes que no son combo) */
const FULL = (f, ar = '4:3', w = 600) =>
  `${BASE}/ar_${ar},c_fill,w_${w}/${f}`

/* ─── Imágenes que rotan en el hero ─── */
const HERO_IMGS = [
  COOK('marinados/teriyaki.png',           '3:2', 960),
  COOK('marinados/agridulce.png',          '3:2', 960),
  COOK('preparados/pechuga_rellena.png',   '3:2', 960),
  COOK('fresco/piernita.png',              '3:2', 960),
  COOK('marinados/barbacoa.png',           '3:2', 960),
]

/* ─── Strip de categorías — sin Nuggets para que quepan todos sin scroll ─── */
const CATS = [
  { label: 'Marinados',      emoji: '🍯', img: COOK('marinados/teriyaki.png',          '1:1', 180), tab: 'marinados'  },
  { label: 'Milanesas',      emoji: '🥩', img: COOK('milanesas/milanesa_natural.png',  '1:1', 180), tab: 'preparados' },
  { label: 'Preparados',     emoji: '🍳', img: COOK('preparados/pechuga_rellena.png',  '1:1', 180), tab: 'preparados' },
  { label: 'Pollo\nFresco',  emoji: '🐔', img: COOK('fresco/piernita.png',             '1:1', 180), tab: 'fresco'     },
  { label: 'Bowls',          emoji: '🥣', img: COOK('marinados/agridulce.png',         '1:1', 180), tab: 'bowls'      },
]

/* ─── Cards de entrada ─── */
const ENTRADAS = [
  {
    id: 'pollo', tab: 'fresco',
    titulo: 'Pollo fresco y marinados',
    desc: 'Marinados artesanales · preparados · milanesas · piezas frescas',
    color: '#1a0408',
    invertido: false,
    imgs: [
      COOK('marinados/adobado.png',           '4:3', 480),
      COOK('marinados/teriyaki.png',          '4:3', 480),
      COOK('marinados/hoisin.png',            '4:3', 480),
      COOK('marinados/barbacoa.png',          '4:3', 480),
      COOK('preparados/hamburguesa.png',      '4:3', 480),
    ],
  },
  {
    id: 'bowls', tab: 'bowls',
    titulo: 'Bowls',
    desc: 'Base + marinado cocinado · personaliza a tu gusto',
    color: '#0a2016',
    invertido: true,
    imgs: [
      COOK('marinados/agridulce.png',  '4:3', 480),
      COOK('marinados/almendrado.png', '4:3', 480),
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
  const inv  = !!entrada.invertido   // si true: imagen izquierda, texto derecha
  useEffect(() => {
    if (imgs.length <= 1) return
    const t = setInterval(() => setIdx(p => (p + 1) % imgs.length), 3400)
    return () => clearInterval(t)
  }, [imgs.length])

  const gradDir = inv ? 'to left' : 'to right'
  const imgPos  = inv ? 'left center' : 'right center'
  const textSide = inv ? { right: 0 } : { left: 0 }

  return (
    <button onClick={onClic} style={{
      position: 'relative', overflow: 'hidden', minHeight: 160,
      borderRadius: 22, border: 0, cursor: 'pointer',
      textAlign: inv ? 'right' : 'left', width: '100%', display: 'block', padding: 0,
      boxShadow: 'var(--sombra-lg)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: entrada.color }} />
      {imgs.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover', backgroundPosition: imgPos,
          opacity: i === idx ? 1 : 0, transition: 'opacity 1s ease',
        }} />
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(${gradDir}, ${entrada.color} 0%, ${entrada.color} 38%, ${entrada.color}d0 55%, ${entrada.color}50 72%, transparent 100%)`,
      }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0, ...textSide,
        zIndex: 1, padding: '20px 18px', maxWidth: '65%',
        display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center',
        alignItems: inv ? 'flex-end' : 'flex-start',
      }}>
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

/* ── Calcula si la sucursal está abierta ahora ── */
const DIAS_ES = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado']
function calcEstaAbierto(schedule) {
  if (!schedule || schedule.length === 0) return null // desconocido
  const now  = new Date()
  const dia  = DIAS_ES[now.getDay()]
  const hor  = schedule.find(h => h.dia === dia)
  if (!hor || !hor.activo) return false
  const [hAp, mAp] = (hor.apertura || '10:00').slice(0, 5).split(':').map(Number)
  const [hCi, mCi] = (hor.cierre  || '20:00').slice(0, 5).split(':').map(Number)
  const min = now.getHours() * 60 + now.getMinutes()
  return min >= hAp * 60 + mAp && min < hCi * 60 + mCi
}

export default function MenuPrincipal() {
  const { sucursalActiva, setVista, totalItems, bannersMenu = [], schedule, diseno } = useApp()
  const estaAbierto = calcEstaAbierto(schedule)
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
      {/* position:absolute cuando hay hero para que no deje barra blanca encima */}
      <header className="header" style={{
        position:     mostrarAtajos ? 'absolute' : undefined,
        width:        mostrarAtajos ? '100%' : undefined,
        background:   mostrarAtajos ? 'transparent' : undefined,
        backdropFilter: mostrarAtajos ? 'none' : undefined,
        boxShadow:    mostrarAtajos ? 'none' : undefined,
        borderBottom: mostrarAtajos ? 'none' : undefined,
      }}>
        <div className="header-inner" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!mostrarAtajos ? (
              <button onClick={volver} style={{ background: 'none', border: 'none', color: 'var(--rojo)', fontSize: 14, fontFamily: 'var(--font-body),sans-serif', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                ← Menú
              </button>
            ) : (
              /* ── Icon sobre hero oscuro → forzar blanco ── */
              <LogoSlot
                type="icon"
                src={diseno?.logo_icon_url}
                mode="blanco"
                width={44} height={44}
                placeholderStyle={{ border: '1.5px dashed rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}
              />
            )}
          </div>

          {/* Icon centrado en navbar de sección — header claro → color del tema */}
          {!mostrarAtajos && (
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
              <LogoSlot
                type="icon"
                src={diseno?.logo_icon_url}
                mode="original"
                width={30} height={30}
                placeholderStyle={{ border: '1.5px dashed var(--rojo)', background: 'rgba(0,0,0,0.03)', color: 'var(--rojo)' }}
              />
            </div>
          )}

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
              {sucursalActiva && estaAbierto !== null && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: estaAbierto ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.18)',
                  backdropFilter: 'blur(8px)', borderRadius: 999, padding: '4px 10px', marginBottom: 10,
                  border: estaAbierto ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: estaAbierto ? '#4ade80' : '#f87171', flexShrink: 0 }} />
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>
                    {sucursalActiva.name} · {estaAbierto ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 800, fontSize: 30, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6 }}>
                {diseno?.slogan_titulo || 'El pollo de casa,'}<br />
                <span style={{ color: '#fbbf24' }}>{diseno?.slogan_subtitulo || 'listo para recoger'}</span>
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
                {diseno?.cta_label || 'Inicia tu pedido →'}
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
                  <span style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 700, fontSize: 11, color: 'var(--texto)', letterSpacing: 0.2, whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.25 }}>
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
          <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ENTRADAS.map(e => (
              <EntradaCard key={e.id} entrada={e} onClic={() => irA(e.tab)} />
            ))}
          </div>

          {/* ── Pie de página ── */}
          <div style={{ padding: '12px 20px 90px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 4 }}>
            <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginBottom: 8 }}>
              Aceptamos todas las formas de pago
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['💵 Efectivo', '💳 Débito', '💳 Crédito', 'Amex'].map(p => (
                <span key={p} style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 999, padding: '3px 10px', fontSize: 11, color: 'var(--texto-suave)' }}>
                  {p}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 10, color: 'var(--texto-suave)', opacity: 0.6, letterSpacing: 0.3 }}>
              Solo recolección en local · Pedidos con anticipación
            </div>
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
