/**
 * SeccionNuevo — pestaña sandbox, completamente aislada.
 * Diseño premium: grid 2 col vertical (móvil) → 1 col horizontal (desktop ≥ 640px)
 * Solo modifica ESTE archivo para iterar en el diseño.
 */
import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'

const PRODUCTOS = [
  {
    id: 'nuevo-1',
    name: 'Pollo al Pastor',
    price: 240,
    unidad: '/kg',
    se_puede_cocinar: true,
    emoji: '🍯',
    image_url:        `${CDN}/c_crop,fl_relative,x_0.00,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/marinados/pollo%20al%20pastor.png`,
    image_cooked_url: `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/marinados/pollo%20al%20pastor.png`,
  },
  {
    id: 'nuevo-2',
    name: 'Pechuga Rellena',
    price: 265,
    unidad: '/kg',
    se_puede_cocinar: true,
    emoji: '🍗',
    image_url:        `${CDN}/c_crop,fl_relative,x_0.00,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/preparados/pechuga_rellena.png`,
    image_cooked_url: `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/preparados/pechuga_rellena.png`,
  },
  {
    id: 'nuevo-3',
    name: 'Milanesa Natural',
    price: 175,
    unidad: '/kg',
    se_puede_cocinar: true,
    emoji: '🥩',
    image_url:        `${CDN}/c_crop,fl_relative,x_0.00,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/milanesas/milanesa_natural.png`,
    image_cooked_url: `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/milanesas/milanesa_natural.png`,
  },
]

const MIN = 200, MAX = 2000, PASO = 50

/* ══════════════════════════════════════════
   CSS inyectado — 100 % aislado (prefijo nv-)
   ══════════════════════════════════════════ */
const CSS_NUEVO = `
/* grid */
.nv-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, 1fr);
  padding: 0 0 8px;
}

/* card base */
.nv-card {
  background: var(--crema);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(120,90,60,0.07);
  transition:
    transform    0.35s cubic-bezier(.22,1,.36,1),
    box-shadow   0.35s cubic-bezier(.22,1,.36,1),
    border-color 0.2s  ease;
  cursor: pointer;
  border: 2.5px solid transparent;
  display: flex;
  flex-direction: column;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  appearance: none;
  text-align: left;
  width: 100%;
  padding: 0;
}
.nv-card:hover     { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(120,90,60,0.12); }
.nv-card:active    { transform: scale(0.97); }
.nv-card.nv-activa {
  border-color: var(--rojo);
  box-shadow: 0 0 0 3px rgba(146,43,33,0.12), 0 14px 36px rgba(120,90,60,0.12);
}

/* imagen */
.nv-img {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}
.nv-img img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease, opacity 0.4s ease;
}
.nv-card:hover .nv-img img { transform: scale(1.05); }
.nv-img-emoji {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: var(--crema-oscura);
}

/* barra inferior */
.nv-content {
  background: #ffffff;
  padding: 11px 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: 1;
}
.nv-info { min-width: 0; flex: 1; }
.nv-nombre {
  font-family: var(--font-title), sans-serif;
  font-weight: 700;
  font-size: 12.5px;
  color: #111;
  margin-bottom: 3px;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nv-precio {
  font-family: var(--font-title), sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: var(--rojo);
}
.nv-sub {
  font-size: 10px;
  color: #aaa;
  margin-top: 1px;
}

/* botón acción (div, no button — evita nesting) */
.nv-btn {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: #EFE7DD;
  color: var(--rojo);
  font-size: 17px; font-weight: 700; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(.22,1,.36,1);
}
.nv-card:hover .nv-btn,
.nv-card.nv-activa .nv-btn {
  background: var(--rojo);
  color: #fff;
}

/* check overlay */
.nv-check {
  position: absolute; top: 8px; right: 8px;
  width: 24px; height: 24px;
  background: var(--rojo);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 12px; font-weight: 800;
  box-shadow: 0 2px 8px rgba(146,43,33,0.45);
  z-index: 2;
  animation: nvPop 0.25s cubic-bezier(.22,1,.36,1);
}
@keyframes nvPop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* ── configurador ── */
.nv-config {
  margin-top: 20px;
  background: #ffffff;
  border-radius: 24px;
  padding: 20px 18px;
  box-shadow: 0 8px 32px rgba(120,90,60,0.10);
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: nvSlide 0.22s cubic-bezier(.22,1,.36,1);
}
@keyframes nvSlide {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}

.nv-config-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid var(--crema-oscura);
}
.nv-config-thumb {
  width: 52px; height: 52px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
}
.nv-config-thumb img { width: 100%; height: 100%; object-fit: cover; }
.nv-config-title {
  font-family: var(--font-title), sans-serif;
  font-weight: 800; font-size: 17px; color: var(--texto);
}
.nv-config-price { font-size: 12px; color: var(--texto-suave); margin-top: 2px; }

/* recogida */
.nv-recogida { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.nv-rec-opt {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 14px 10px;
  border-radius: 16px;
  border: 2px solid var(--crema-oscura);
  background: var(--crema);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(.22,1,.36,1);
  font-family: var(--font-title), sans-serif;
}
.nv-rec-opt:hover  { border-color: var(--rojo); background: #fff; }
.nv-rec-opt.nv-on  { border-color: var(--rojo); background: #fff; box-shadow: 0 0 0 3px rgba(146,43,33,0.09); }
.nv-rec-titulo { font-weight: 700; font-size: 12px; color: var(--texto); }
.nv-rec-sub    { font-size: 10px; color: var(--texto-suave); }

/* footer */
.nv-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nv-total-label { font-size: 10px; color: var(--texto-suave); margin-bottom: 1px; }
.nv-total-num {
  font-family: var(--font-title), sans-serif;
  font-weight: 800; font-size: 26px; color: var(--rojo); line-height: 1;
}
.nv-agregar {
  flex: 1;
  padding: 14px 16px;
  background: var(--rojo);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-family: var(--font-title), sans-serif;
  font-weight: 700; font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(.22,1,.36,1);
  box-shadow: 0 4px 16px rgba(146,43,33,0.28);
}
.nv-agregar:hover    { filter: brightness(1.08); transform: translateY(-1px); }
.nv-agregar:active   { transform: scale(0.97); filter: brightness(0.97); }
.nv-agregar.nv-listo { background: var(--verde); box-shadow: none; }

/* ══ DESKTOP ≥ 640px: cards horizontales ══ */
@media (min-width: 640px) {
  .nv-grid { grid-template-columns: 1fr; gap: 20px; }

  .nv-card {
    flex-direction: row;
    height: 200px;
    border-radius: 28px;
  }
  .nv-img { width: 42%; aspect-ratio: auto; height: 100%; }

  .nv-content { flex: 1; padding: 32px 36px; }

  .nv-nombre {
    font-size: 22px;
    white-space: normal;
    margin-bottom: 6px;
  }
  .nv-precio { font-size: 16px; }
  .nv-sub    { font-size: 12px; margin-top: 4px; }

  .nv-btn    { width: 52px; height: 52px; font-size: 22px; }

  .nv-check  { top: 12px; right: 12px; width: 28px; height: 28px; font-size: 14px; }
}
`

/* ── Card individual ── */
function NvCard({ p, isSelected, recogida, onClick }) {
  const showCooked = isSelected && recogida === 'cocinado'

  return (
    <button className={`nv-card ${isSelected ? 'nv-activa' : ''}`} onClick={onClick}>
      <div className="nv-img">
        {p.image_url ? (
          <>
            <img src={p.image_url}        alt={p.name}                 style={{ opacity: showCooked ? 0 : 1 }} />
            <img src={p.image_cooked_url} alt={`${p.name} cocinado`}  style={{ opacity: showCooked ? 1 : 0 }} />
          </>
        ) : (
          <div className="nv-img-emoji">{p.emoji}</div>
        )}
      </div>

      <div className="nv-content">
        <div className="nv-info">
          <div className="nv-nombre">{p.name}</div>
          <div className="nv-precio">${p.price}{p.unidad}</div>
          {p.se_puede_cocinar && <div className="nv-sub">crudo o cocinado</div>}
        </div>
        <div className="nv-btn">{isSelected ? '✓' : '+'}</div>
      </div>

      {isSelected && <div className="nv-check">✓</div>}
    </button>
  )
}

/* ── Sección principal ── */
export default function SeccionNuevo() {
  const { agregarAlCarrito } = useApp()
  const [seleccion, setSeleccion] = useState(null)
  const [gramos, setGramos]       = useState(300)
  const [recogida, setRecogida]   = useState('crudo')
  const [agregado, setAgregado]   = useState(false)

  const seleccionar = (p) => {
    if (seleccion?.id === p.id) {
      setSeleccion(null); setGramos(300); setRecogida('crudo')
    } else {
      setSeleccion(p);    setGramos(300); setRecogida('crudo')
    }
  }

  const cambiarGramos = (delta) =>
    setGramos(prev => Math.min(MAX, Math.max(MIN, prev + delta)))

  const handleAgregar = () => {
    if (!seleccion) return
    const precioTotal = (gramos / 1000) * seleccion.price
    agregarAlCarrito({
      tipo: 'marinado',
      nombre: seleccion.name,
      gramos, recogida,
      tiempoEstimado: recogida === 'cocinado' ? 25 : null,
      precio: seleccion.price,
      precioTotal,
      imagen_url: recogida === 'cocinado' ? seleccion.image_cooked_url : seleccion.image_url,
      resumen: `${seleccion.name} ${gramos}g · ${recogida === 'crudo' ? 'Crudo' : 'Cocinado ~25 min'} · $${precioTotal.toFixed(2)}`,
    })
    setAgregado(true)
    setTimeout(() => {
      setAgregado(false); setSeleccion(null); setGramos(300); setRecogida('crudo')
    }, 1200)
  }

  const precioTotal = seleccion ? (gramos / 1000) * seleccion.price : 0
  const thumbImg    = seleccion
    ? (recogida === 'cocinado' ? seleccion.image_cooked_url : seleccion.image_url)
    : null

  return (
    <div>
      <style>{CSS_NUEVO}</style>

      <div className="seccion-titulo">✨ Nuevo</div>
      <p className="seccion-desc">Selecciona un producto para configurar tu pedido</p>

      {/* Grid de cards */}
      <div className="nv-grid">
        {PRODUCTOS.map(p => (
          <NvCard
            key={p.id}
            p={p}
            isSelected={seleccion?.id === p.id}
            recogida={recogida}
            onClick={() => seleccionar(p)}
          />
        ))}
      </div>

      {/* Configurador — panel debajo del grid */}
      {seleccion && (
        <div className="nv-config">

          {/* Header */}
          <div className="nv-config-header">
            {thumbImg && (
              <div className="nv-config-thumb">
                <img src={thumbImg} alt={seleccion.name} />
              </div>
            )}
            <div>
              <div className="nv-config-title">{seleccion.name}</div>
              <div className="nv-config-price">${seleccion.price}{seleccion.unidad}</div>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="config-label">Cantidad</label>
            <div className="cantidad-ctrl">
              <button className="cantidad-btn" onClick={() => cambiarGramos(-PASO)} disabled={gramos <= MIN}>−</button>
              <span className="cantidad-num" style={{ fontSize: 20, minWidth: 60, textAlign: 'center' }}>
                {gramos}g
              </span>
              <button className="cantidad-btn" onClick={() => cambiarGramos(PASO)} disabled={gramos >= MAX}>+</button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 6 }}>
              {MIN}g — {MAX}g · cada {PASO}g
            </div>
          </div>

          {/* Crudo / Cocinado */}
          {seleccion.se_puede_cocinar && (
            <div>
              <label className="config-label">¿Cómo lo quieres?</label>
              <div className="nv-recogida">
                <button
                  className={`nv-rec-opt ${recogida === 'crudo' ? 'nv-on' : ''}`}
                  onClick={() => setRecogida('crudo')}
                >
                  <span style={{ fontSize: 22 }}>📦</span>
                  <div className="nv-rec-titulo">Crudo</div>
                  <div className="nv-rec-sub">Lo llevas en frío</div>
                </button>
                <button
                  className={`nv-rec-opt ${recogida === 'cocinado' ? 'nv-on' : ''}`}
                  onClick={() => setRecogida('cocinado')}
                >
                  <span style={{ fontSize: 22 }}>🔥</span>
                  <div className="nv-rec-titulo">Cocinado</div>
                  <div className="nv-rec-sub">Listo para comer</div>
                </button>
              </div>
            </div>
          )}

          {/* Total + botón */}
          <div className="nv-footer">
            <div>
              <div className="nv-total-label">Total estimado</div>
              <div className="nv-total-num">${precioTotal.toFixed(2)}</div>
            </div>
            <button
              className={`nv-agregar ${agregado ? 'nv-listo' : ''}`}
              onClick={handleAgregar}
            >
              {agregado ? '✓ Agregado' : 'Agregar al pedido'}
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
