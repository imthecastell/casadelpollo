/**
 * SeccionNuevo — pestaña sandbox, completamente aislada.
 * Al seleccionar una card muta a vista expandida (hero + config embebido).
 * Solo modifica ESTE archivo para iterar en el diseño.
 */
import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

// unidad display según precio_tipo del producto
const unidadDe = (p) => {
  if (p.precio_tipo === 'por_pieza' || p.precio_tipo === 'por_porcion') return '/pz'
  if (p.precio_tipo === 'por_gramos') return '/100g'
  return '/kg'   // al_pesar (default)
}

// ¿Este producto usa gramos o piezas?
const esPorGramos = (p) =>
  !p.precio_tipo || p.precio_tipo === 'al_pesar' || p.precio_tipo === 'por_gramos'

const MIN_G = 200, MAX_G = 2000, PASO_G = 50
const MIN_PZ = 1,  MAX_PZ = 20

/* ══════════════════════════════════════════
   CSS aislado — prefijo nv-
   ══════════════════════════════════════════ */
const CSS_NUEVO = `
/* ── grid ── */
.nv-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, 1fr);
  padding: 0 0 8px;
}

/* ── card compacta (no seleccionada) ── */
.nv-card {
  background: var(--crema);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(120,90,60,0.07);
  transition:
    transform    0.35s cubic-bezier(.22,1,.36,1),
    box-shadow   0.35s cubic-bezier(.22,1,.36,1),
    border-color 0.2s ease;
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

/* ── imagen compacta ── */
.nv-img {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}
.nv-img img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease, opacity 0.4s ease;
}
.nv-card:hover .nv-img img { transform: scale(1.05); }
.nv-img-emoji {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 48px; background: var(--crema-oscura);
}

/* ── barra de contenido compacta ── */
.nv-content {
  background: #fff;
  padding: 11px 13px;
  display: flex; align-items: center;
  justify-content: space-between;
  gap: 8px; flex: 1;
}
.nv-info { min-width: 0; flex: 1; }
.nv-nombre {
  font-family: var(--font-title), sans-serif;
  font-weight: 700; font-size: 12.5px; color: #111;
  margin-bottom: 3px; line-height: 1.25;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nv-precio {
  font-family: var(--font-title), sans-serif;
  font-weight: 700; font-size: 12px; color: var(--rojo);
}
.nv-sub { font-size: 10px; color: #aaa; margin-top: 1px; }

/* ── botón + / ✓ en card compacta ── */
.nv-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: #EFE7DD; color: var(--rojo);
  font-size: 17px; font-weight: 700; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(.22,1,.36,1);
}
.nv-card:hover .nv-btn { background: var(--rojo); color: #fff; }

/* ══════════════════════════════════════════
   CARD EXPANDIDA — muta al seleccionar
   ══════════════════════════════════════════ */
.nv-expanded {
  grid-column: 1 / -1;         /* ocupa ambas columnas */
  flex-direction: column;
  border-radius: 24px;
  border-color: var(--rojo);
  box-shadow: 0 0 0 3px rgba(146,43,33,0.12), 0 20px 48px rgba(120,90,60,0.16);
  cursor: default;
  animation: nvMuta 0.36s cubic-bezier(.22,1,.36,1);
  height: auto;
  transform: none !important;  /* disable hover translate on expanded */
}
@keyframes nvMuta {
  from { opacity: 0.4; transform: scale(0.95) translateY(6px); }
  to   { opacity: 1;   transform: scale(1)    translateY(0);   }
}

/* ── hero imagen grande ── */
.nv-hero {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  flex-shrink: 0;
}
.nv-hero img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}
.nv-hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 55%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}
.nv-hero-badge {
  position: absolute; bottom: 12px; left: 14px;
  padding: 5px 13px;
  border-radius: 50px;
  font-family: var(--font-title), sans-serif;
  font-weight: 700; font-size: 12px; color: #fff;
  background: rgba(0,0,0,0.42);
  backdrop-filter: blur(10px);
  z-index: 2;
  transition: all 0.35s ease;
  pointer-events: none;
}
.nv-hero-note {
  position: absolute; bottom: 10px; right: 12px;
  font-size: 9px; color: rgba(255,255,255,0.6);
  font-style: italic; letter-spacing: 0.2px;
  z-index: 2; pointer-events: none;
}

.nv-hero-close {
  position: absolute; top: 10px; right: 10px;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; z-index: 3;
  transition: background 0.2s;
}
.nv-hero-close:hover { background: rgba(0,0,0,0.65); }

/* ── configurador embebido ── */
.nv-inner {
  background: #fff;
  padding: 16px 16px 20px;
  display: flex; flex-direction: column; gap: 16px;
  min-width: 0; overflow: hidden;
}
.nv-inner-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
}
.nv-inner-name {
  font-family: var(--font-title), sans-serif;
  font-weight: 800; font-size: 19px; color: var(--texto); line-height: 1.15;
}
.nv-inner-price { font-size: 13px; color: var(--texto-suave); margin-top: 3px; }

/* recogida opts — apilados verticalmente, layout horizontal */
.nv-recogida { display: flex; flex-direction: column; gap: 8px; }
.nv-rec-opt {
  display: flex; flex-direction: row; align-items: center; gap: 14px;
  padding: 13px 16px; border-radius: 14px;
  border: 2px solid var(--crema-oscura); background: var(--crema);
  cursor: pointer; text-align: left; width: 100%;
  transition: all 0.22s cubic-bezier(.22,1,.36,1);
  font-family: var(--font-title), sans-serif;
}
.nv-rec-opt:hover  { border-color: var(--rojo); background: #fff; }
.nv-rec-opt.nv-on  {
  border-color: var(--rojo); background: #fff;
  box-shadow: 0 0 0 3px rgba(146,43,33,0.09);
}
.nv-rec-icon {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  background: var(--crema-oscura);
  transition: background 0.2s;
}
.nv-rec-opt.nv-on .nv-rec-icon { background: rgba(146,43,33,0.10); }
.nv-rec-texto { display: flex; flex-direction: column; gap: 1px; }
.nv-rec-titulo { font-weight: 700; font-size: 13px; color: var(--texto); }
.nv-rec-sub    { font-size: 11px; color: var(--texto-suave); }

/* footer */
.nv-footer { display: flex; align-items: center; gap: 12px; }
.nv-total-label { font-size: 10px; color: var(--texto-suave); margin-bottom: 1px; }
.nv-total-num {
  font-family: var(--font-title), sans-serif;
  font-weight: 800; font-size: 26px; color: var(--rojo); line-height: 1;
}
.nv-agregar {
  flex: 1; min-width: 0;
  padding: 14px 16px; background: var(--rojo); color: #fff; border: none;
  border-radius: 50px; font-family: var(--font-title), sans-serif;
  font-weight: 700; font-size: 15px; cursor: pointer; text-align: center;
  transition: all 0.3s cubic-bezier(.22,1,.36,1);
  box-shadow: 0 4px 16px rgba(146,43,33,0.28);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nv-agregar:hover    { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(146,43,33,0.35); }
.nv-agregar:active   { transform: scale(0.97); }
.nv-agregar.nv-listo { background: var(--verde); box-shadow: none; }

/* ══ DESKTOP ≥ 640px: cards compactas horizontales ══ */
@media (min-width: 640px) {
  .nv-grid { grid-template-columns: 1fr; gap: 20px; }

  .nv-card:not(.nv-expanded) {
    flex-direction: row; height: 200px; border-radius: 28px;
  }
  .nv-card:not(.nv-expanded) .nv-img { width: 42%; aspect-ratio: auto; height: 100%; }
  .nv-card:not(.nv-expanded) .nv-content { flex: 1; padding: 32px 36px; }
  .nv-card:not(.nv-expanded) .nv-nombre { font-size: 22px; white-space: normal; margin-bottom: 6px; }
  .nv-card:not(.nv-expanded) .nv-precio { font-size: 16px; }
  .nv-card:not(.nv-expanded) .nv-sub    { font-size: 12px; margin-top: 4px; }
  .nv-card:not(.nv-expanded) .nv-btn    { width: 52px; height: 52px; font-size: 22px; }

  /* Expanded en desktop: imagen izquierda + config derecha */
  .nv-expanded {
    flex-direction: row;
    min-height: 300px;
    border-radius: 28px;
    align-items: stretch;
  }
  .nv-hero { width: 45%; aspect-ratio: auto; height: auto; }
  .nv-inner { flex: 1; min-width: 0; padding: 28px 32px; justify-content: center; }
  .nv-inner-name { font-size: 22px; }
}
`

/* ── Card compacta (no seleccionada) ── */
function NvCardCompact({ p, onClick }) {
  return (
    <button className="nv-card" onClick={onClick}>
      <div className="nv-img">
        {p.image_url
          ? <img src={p.image_url} alt={p.name} style={{ opacity: 1 }} />
          : <div className="nv-img-emoji">{p.emoji}</div>
        }
      </div>
      <div className="nv-content">
        <div className="nv-info">
          <div className="nv-nombre">{p.name}</div>
          <div className="nv-precio">${p.price}{p.unidad}</div>
          {p.se_puede_cocinar && <div className="nv-sub">crudo o cocinado</div>}
        </div>
        <div className="nv-btn">+</div>
      </div>
    </button>
  )
}

/* ── Card expandida (seleccionada — muta aquí) ── */
function NvCardExpandida({ p, recogida, gramos, precioTotal, agregado, onClose, onCantidadChange, onRecogidaChange, onAgregar }) {
  const showCooked = recogida === 'cocinado'

  return (
    <div className="nv-card nv-expanded">

      {/* Hero con crossfade */}
      <div className="nv-hero">
        {p.image_url
          ? <>
              <img src={p.image_url}        alt={p.name}               style={{ opacity: showCooked ? 0 : 1 }} />
              <img src={p.image_cooked_url} alt={`${p.name} cocinado`} style={{ opacity: showCooked ? 1 : 0 }} />
            </>
          : <div style={{ position: 'absolute', inset: 0, background: 'var(--crema-oscura)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>{p.emoji}</div>
        }
        <div className="nv-hero-gradient" />
        <div className="nv-hero-badge">
          {showCooked ? '🔥 Cocinado' : '📦 Crudo'}
        </div>
        <div className="nv-hero-note">* Imagen ilustrativa</div>
        <button className="nv-hero-close" onClick={onClose}>✕</button>
      </div>

      {/* Configurador embebido */}
      <div className="nv-inner">

        {/* Nombre + precio */}
        <div className="nv-inner-head">
          <div>
            <div className="nv-inner-name">{p.name}</div>
            <div className="nv-inner-price">${p.price}{p.unidad}</div>
          </div>
        </div>

        {/* Cantidad */}
        <div>
          <label className="config-label">Cantidad</label>
          {esPorGramos(p) ? (
            <>
              <div className="cantidad-ctrl">
                <button className="cantidad-btn" onClick={() => onCantidadChange(-PASO_G)} disabled={gramos <= MIN_G}>−</button>
                <span className="cantidad-num" style={{ fontSize: 20, minWidth: 60, textAlign: 'center' }}>{gramos}g</span>
                <button className="cantidad-btn" onClick={() => onCantidadChange(PASO_G)}  disabled={gramos >= MAX_G}>+</button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 6 }}>{MIN_G}g — {MAX_G}g · cada {PASO_G}g</div>
            </>
          ) : (
            <div className="cantidad-ctrl">
              <button className="cantidad-btn" onClick={() => onCantidadChange(-1)} disabled={gramos <= MIN_PZ}>−</button>
              <span className="cantidad-num" style={{ fontSize: 20, minWidth: 60, textAlign: 'center' }}>{gramos} pz</span>
              <button className="cantidad-btn" onClick={() => onCantidadChange(1)}  disabled={gramos >= MAX_PZ}>+</button>
            </div>
          )}
        </div>

        {/* Crudo / Cocinado */}
        {p.se_puede_cocinar && (
          <div>
            <label className="config-label">¿Cómo lo quieres?</label>
            <div className="nv-recogida">
              <button
                className={`nv-rec-opt ${recogida === 'crudo' ? 'nv-on' : ''}`}
                onClick={() => onRecogidaChange('crudo')}
              >
                <div className="nv-rec-icon">📦</div>
                <div className="nv-rec-texto">
                  <div className="nv-rec-titulo">Crudo</div>
                  <div className="nv-rec-sub">Lo llevas en frío</div>
                </div>
              </button>
              <button
                className={`nv-rec-opt ${recogida === 'cocinado' ? 'nv-on' : ''}`}
                onClick={() => onRecogidaChange('cocinado')}
              >
                <div className="nv-rec-icon">🔥</div>
                <div className="nv-rec-texto">
                  <div className="nv-rec-titulo">Cocinado</div>
                  <div className="nv-rec-sub">Listo para comer</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Total + Agregar */}
        <div className="nv-footer">
          <div>
            <div className="nv-total-label">Total estimado</div>
            <div className="nv-total-num">${precioTotal.toFixed(2)}</div>
          </div>
          <button
            className={`nv-agregar ${agregado ? 'nv-listo' : ''}`}
            onClick={onAgregar}
          >
            {agregado ? '✓ Listo' : 'Agregar'}
          </button>
        </div>

      </div>
    </div>
  )
}

/* ── Sección principal ── */
export default function SeccionNuevo() {
  const { agregarAlCarrito, productos } = useApp()
  const [seleccion, setSeleccion] = useState(null)
  const [cantidad, setCantidad]   = useState(300)   // gramos o piezas según producto
  const [recogida, setRecogida]   = useState('crudo')
  const [agregado, setAgregado]   = useState(false)

  // Productos marcados is_nuevo, disponibles en esta sucursal
  const nuevos = productos.filter(p => p.is_nuevo && p.available !== false)

  const seleccionar = (p) => {
    if (seleccion?.id === p.id) {
      setSeleccion(null); setCantidad(esPorGramos(p) ? 300 : 1); setRecogida('crudo')
    } else {
      setSeleccion(p); setCantidad(esPorGramos(p) ? 300 : 1); setRecogida('crudo')
    }
  }

  const cambiarCantidad = (delta) => {
    if (!seleccion) return
    if (esPorGramos(seleccion)) {
      setCantidad(prev => Math.min(MAX_G, Math.max(MIN_G, prev + delta)))
    } else {
      setCantidad(prev => Math.min(MAX_PZ, Math.max(MIN_PZ, prev + delta)))
    }
  }

  const calcTotal = () => {
    if (!seleccion) return 0
    if (esPorGramos(seleccion)) return (cantidad / 1000) * seleccion.price
    return cantidad * seleccion.price
  }

  const handleAgregar = () => {
    if (!seleccion) return
    const precioTotal = calcTotal()
    const porGramos   = esPorGramos(seleccion)
    agregarAlCarrito({
      tipo: 'marinado',
      nombre: seleccion.name,
      gramos: porGramos ? cantidad : undefined,
      cantidad: porGramos ? undefined : cantidad,
      recogida,
      tiempoEstimado: recogida === 'cocinado' ? 25 : null,
      precio: seleccion.price,
      precioTotal,
      necesitaHora: true,
      imagen_url: recogida === 'cocinado'
        ? (seleccion.image_cooked_url || seleccion.image_url)
        : seleccion.image_url,
      resumen: porGramos
        ? `${seleccion.name} ${cantidad}g · ${recogida === 'crudo' ? 'Crudo' : 'Cocinado ~25 min'} · $${precioTotal.toFixed(2)}`
        : `${seleccion.name} × ${cantidad} pz · ${recogida === 'crudo' ? 'Crudo' : 'Cocinado ~25 min'} · $${precioTotal.toFixed(2)}`,
    })
    setAgregado(true)
    setTimeout(() => {
      setAgregado(false); setSeleccion(null)
      setCantidad(seleccion && esPorGramos(seleccion) ? 300 : 1); setRecogida('crudo')
    }, 1200)
  }

  return (
    <div>
      <style>{CSS_NUEVO}</style>

      <div className="seccion-titulo">✨ Nuevo</div>
      <p className="seccion-desc">Selecciona un producto para configurar tu pedido</p>

      {nuevos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--texto-suave)', fontSize: 14 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          Próximamente novedades
        </div>
      ) : (
        <div className="nv-grid">
          {nuevos.map(p => {
            const isSelected = seleccion?.id === p.id
            // adaptar campos DB al formato que espera NvCard
            const card = { ...p, unidad: unidadDe(p), emoji: '✨' }

            if (isSelected) {
              return (
                <NvCardExpandida
                  key={p.id}
                  p={card}
                  recogida={recogida}
                  gramos={cantidad}
                  precioTotal={calcTotal()}
                  agregado={agregado}
                  onClose={() => seleccionar(p)}
                  onCantidadChange={cambiarCantidad}
                  onRecogidaChange={setRecogida}
                  onAgregar={handleAgregar}
                />
              )
            }
            return <NvCardCompact key={p.id} p={card} onClick={() => seleccionar(p)} />
          })}
        </div>
      )}
    </div>
  )
}
