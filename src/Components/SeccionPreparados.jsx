import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { cookedCrop } from './SeccionMarinados.jsx'

const ORDEN_SIMPLES = ['natural', 'aplanada', 'empanizada', 'parmesano']

// Imagen de grupo — reemplazar con URL real cuando esté subida a Cloudinary
const EMPAP_IMG   = 'https://res.cloudinary.com/do4juvxio/image/upload/ar_4:3,c_fill,g_east,w_320/marinados/empapeladas.png'
const NUGGETS_IMG = null // subir foto grupal y poner URL aquí: .../preparados/nuggets.png

const esSimpleMil = (p) => {
  const n = p.name.toLowerCase()
  return ORDEN_SIMPLES.some(k => n.includes(k)) && !n.includes('empapelada')
}

const esNugget = (p) =>
  ['nugget', 'tender', 'trozo'].some(k => p.name.toLowerCase().includes(k))

/* ── Fila de producto individual ── */
function FilaProducto({ nombre, precio, nota, imagen, imagenCocinada, cantidad, onCambiar, onAgregar, agregado, idKey }) {
  const thumb = imagenCocinada || (imagen ? cookedCrop(imagen) : null)
  return (
    <div className="producto-row">
      {thumb
        ? <img src={thumb} alt="" className="producto-img" />
        : <div className="producto-img-placeholder">🍗</div>
      }
      <div className="producto-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="producto-nombre" style={{ lineHeight: 1.25 }}>{nombre}</div>
        <div className="producto-precio">
          ${precio}/kg
          {nota && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--rojo)' }}>{nota}</span>}
        </div>
      </div>
      {cantidad === 0 ? (
        <button className="btn-add" onClick={() => onCambiar(1)}>+</button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="qty-pill">
            <button className="qty-pill-btn" onClick={() => onCambiar(-1)} disabled={cantidad <= 1}>−</button>
            <span className="qty-pill-num">{cantidad}</span>
            <button className="qty-pill-btn" onClick={() => onCambiar(1)}>+</button>
          </div>
          <button
            className={`btn-confirm ${agregado === idKey ? 'confirmado' : ''}`}
            onClick={onAgregar}
          >
            {agregado === idKey ? '✓' : 'Agregar'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Fila expandible (grupo) — Empapeladas o Nuggets ── */
function GrupoExpandible({ titulo, precio, imagen, emoji, conteo, open, onToggle, children }) {
  return (
    <div>
      <button
        className={`card-marinado ${open ? 'card-marinado-activo' : ''}`}
        onClick={onToggle}
      >
        {imagen
          ? <img src={imagen} alt="" style={{ width: 68, height: 68, borderRadius: 14, objectFit: 'cover', flexShrink: 0, order: -1 }} />
          : <div style={{ width: 68, height: 68, borderRadius: 14, background: 'var(--crema-oscura)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, order: -1 }}>{emoji}</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="producto-nombre">{titulo}</div>
          <div className="producto-precio">${precio}/kg</div>
          <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 2 }}>
            {conteo} variantes · {open ? 'ocultar ▴' : 'elegir ▾'}
          </div>
        </div>
        {open && <div className="card-check">✓</div>}
      </button>
      {open && (
        <div className="configurador-card slide-up" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, gap: 8 }}>
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Fila de variante dentro del grupo expandido ── */
function FilaVariante({ nombre, cantidad, onCambiar, onAgregar, agregado, idKey }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="producto-nombre" style={{ flex: 1 }}>{nombre}</div>
      {cantidad === 0 ? (
        <button className="btn-add" onClick={() => onCambiar(1)}>+</button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="qty-pill">
            <button className="qty-pill-btn" onClick={() => onCambiar(-1)} disabled={cantidad <= 1}>−</button>
            <span className="qty-pill-num">{cantidad}</span>
            <button className="qty-pill-btn" onClick={() => onCambiar(1)}>+</button>
          </div>
          <button
            className={`btn-confirm ${agregado === idKey ? 'confirmado' : ''}`}
            onClick={onAgregar}
          >
            {agregado === idKey ? '✓' : 'Agregar'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════ */
export default function SeccionPreparados() {
  const { agregarAlCarrito, productos } = useApp()
  const [cantidades, setCantidades]       = useState({})  // preparados normales
  const [cantSimples, setCantSimples]     = useState({})  // milanesas simples
  const [cantEmpapeladas, setCantEmpapeladas] = useState({})
  const [cantNuggets, setCantNuggets]     = useState({})
  const [empapOpen, setEmpapOpen]         = useState(false)
  const [nuggetsOpen, setNuggetsOpen]     = useState(false)
  const [agregado, setAgregado]           = useState(null)

  const todoPreparado = productos.filter(p => p.category_name === 'Preparados' && p.available !== false)
  const productosNormales = todoPreparado.filter(p => !esNugget(p))
  const nuggets = todoPreparado.filter(esNugget)
  const precioNuggets = nuggets[0]?.price ?? 205

  const milanesas = productos.filter(p => p.category_name === 'Milanesas' && p.available !== false)
  const milSimples = milanesas
    .filter(esSimpleMil)
    .sort((a, b) => {
      const ai = ORDEN_SIMPLES.findIndex(k => a.name.toLowerCase().includes(k))
      const bi = ORDEN_SIMPLES.findIndex(k => b.name.toLowerCase().includes(k))
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  const milEmpapeladas = milanesas.filter(p => !esSimpleMil(p))
  const precioEmpapelada = milEmpapeladas[0]?.price ?? 230

  const esAlbondiga = (nombre) =>
    nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('albondiga')

  const marcarAgregado = (key) => {
    setAgregado(key)
    setTimeout(() => setAgregado(null), 1200)
  }

  /* ── Handlers preparados normales ── */
  const cambiarPreparado = (id, nombre, delta) => {
    const paso = esAlbondiga(nombre) ? 10 : 1
    const min = esAlbondiga(nombre) ? 10 : 1
    setCantidades(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= min) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? min : Math.max(0, actual + delta * paso) }
    })
  }

  const agregarPreparado = (p) => {
    const cantidad = cantidades[p.id] || 0
    if (!cantidad) return
    const nota = esAlbondiga(p.name) ? ` (~${Math.round(cantidad / 20)} charola${cantidad >= 20 ? 's' : ''})` : ''
    agregarAlCarrito({ tipo: 'preparado', nombre: p.name, cantidad, precioKg: p.price, precio: p.price, necesitaHora: true, resumen: `${p.name} × ${cantidad} pz${nota} · $${p.price}/kg` })
    setCantidades(prev => ({ ...prev, [p.id]: 0 }))
    marcarAgregado(p.id)
  }

  /* ── Handlers milanesas simples ── */
  const cambiarSimple = (id, delta) =>
    setCantSimples(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const agregarSimple = (m) => {
    const cantidad = cantSimples[m.id] || 0
    if (!cantidad) return
    agregarAlCarrito({ tipo: 'milanesa', nombre: m.name, cantidad, precioKg: m.price, precio: m.price, necesitaHora: true, resumen: `${m.name} × ${cantidad} pz · $${m.price}/kg` })
    setCantSimples(prev => ({ ...prev, [m.id]: 0 }))
    marcarAgregado(m.id)
  }

  /* ── Handlers empapeladas ── */
  const cambiarEmpap = (id, delta) =>
    setCantEmpapeladas(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const agregarEmpap = (flavor) => {
    const cantidad = cantEmpapeladas[flavor.id] || 0
    if (!cantidad) return
    const nombreSabor = flavor.name.replace(/^milanesa\s*/i, '')
    agregarAlCarrito({ tipo: 'milanesa', nombre: `Empapelada ${nombreSabor}`, cantidad, precioKg: flavor.price, precio: flavor.price, necesitaHora: true, resumen: `Empapelada ${nombreSabor} × ${cantidad} pz · $${flavor.price}/kg` })
    setCantEmpapeladas(prev => ({ ...prev, [flavor.id]: 0 }))
    marcarAgregado(`emp-${flavor.id}`)
  }

  /* ── Handlers nuggets ── */
  const cambiarNugget = (id, delta) =>
    setCantNuggets(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const agregarNugget = (p) => {
    const cantidad = cantNuggets[p.id] || 0
    if (!cantidad) return
    agregarAlCarrito({ tipo: 'preparado', nombre: p.name, cantidad, precioKg: p.price, precio: p.price, necesitaHora: true, resumen: `${p.name} × ${cantidad} pz · $${p.price}/kg` })
    setCantNuggets(prev => ({ ...prev, [p.id]: 0 }))
    marcarAgregado(`nug-${p.id}`)
  }

  return (
    <div>
      <div className="seccion-titulo">Preparados y Milanesas</div>
      <p className="seccion-desc">Por pieza · precio por kg al pesar en el local</p>

      {/* ── Preparados normales ── */}
      {productosNormales.length > 0 && (
        <div className="subseccion-menu">
          <div className="config-label" style={{ marginBottom: 12 }}>Preparados</div>
          {productosNormales.map(p => (
            <FilaProducto
              key={p.id} idKey={p.id}
              nombre={p.name} precio={p.price} imagen={p.image_url} imagenCocinada={p.image_cooked_url}
              nota={esAlbondiga(p.name) ? '±10 pz · charola 20' : null}
              cantidad={cantidades[p.id] || 0}
              onCambiar={d => cambiarPreparado(p.id, p.name, d)}
              onAgregar={() => agregarPreparado(p)}
              agregado={agregado}
            />
          ))}
        </div>
      )}

      {/* ── Nuggets (grupo expandible) ── */}
      {nuggets.length > 0 && (
        <div className="subseccion-menu">
          <GrupoExpandible
            titulo="Nuggets" precio={precioNuggets}
            imagen={NUGGETS_IMG} emoji="🍗"
            conteo={nuggets.length}
            open={nuggetsOpen} onToggle={() => setNuggetsOpen(v => !v)}
          >
            {nuggets.map(p => (
              <FilaVariante
                key={p.id} idKey={`nug-${p.id}`}
                nombre={p.name}
                cantidad={cantNuggets[p.id] || 0}
                onCambiar={d => cambiarNugget(p.id, d)}
                onAgregar={() => agregarNugget(p)}
                agregado={agregado}
              />
            ))}
          </GrupoExpandible>
        </div>
      )}

      {/* ── Milanesas ── */}
      {(milSimples.length > 0 || milEmpapeladas.length > 0) && (
        <div className="subseccion-menu">
          <div className="config-label" style={{ marginBottom: 12 }}>Milanesas</div>

          {milSimples.map(m => (
            <FilaProducto
              key={m.id} idKey={m.id}
              nombre={m.name} precio={m.price} imagen={m.image_url} imagenCocinada={m.image_cooked_url}
              cantidad={cantSimples[m.id] || 0}
              onCambiar={d => cambiarSimple(m.id, d)}
              onAgregar={() => agregarSimple(m)}
              agregado={agregado}
            />
          ))}

          {milEmpapeladas.length > 0 && (
            <GrupoExpandible
              titulo="Milanesas Empapeladas" precio={precioEmpapelada}
              imagen={EMPAP_IMG} emoji="🌶"
              conteo={milEmpapeladas.length}
              open={empapOpen} onToggle={() => setEmpapOpen(v => !v)}
            >
              {milEmpapeladas.map(flavor => (
                <FilaVariante
                  key={flavor.id} idKey={`emp-${flavor.id}`}
                  nombre={flavor.name.replace(/^milanesa\s*/i, '')}
                  cantidad={cantEmpapeladas[flavor.id] || 0}
                  onCambiar={d => cambiarEmpap(flavor.id, d)}
                  onAgregar={() => agregarEmpap(flavor)}
                  agregado={agregado}
                />
              ))}
            </GrupoExpandible>
          )}
        </div>
      )}
    </div>
  )
}
