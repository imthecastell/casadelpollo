import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { rawCrop, cookedCrop } from './SeccionMarinados.jsx'
import AvisoDisponibilidad from './AvisoDisponibilidad.jsx'

// Milanesas simples (sin empanado ni empapelado)
const ORDEN_SIMPLES = ['natural', 'aplanada']

// Imágenes de grupo — cocinado para carruseles/cards de grupo
const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'
const COOK_HALF = (f) => `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/${f}`
const EMPAP_IMG        = COOK_HALF('marinados/empapeladas.png')
const EMPANIZADAS_IMG  = COOK_HALF('milanesas/empanadas.png')
const NUGGETS_IMG      = `${CDN}/c_fill,w_600/preparados/nuggets_grupo.png`

const esSimpleMil = (p) => {
  const n = p.name.toLowerCase()
  return ORDEN_SIMPLES.some(k => n.includes(k)) && !n.includes('empapelada')
}

const esEmpanizada = (p) => {
  const n = p.name.toLowerCase()
  return (n.includes('empanizada') || n.includes('parmesano')) && !n.includes('empapelada')
}

const esNugget = (p) =>
  ['nugget', 'tender', 'trozo'].some(k => p.name.toLowerCase().includes(k))

/* ── Fila de producto individual ── */
function FilaProducto({ nombre, precio, nota, imagen, imagenCocinada, sePuedeCocinar, recogida, onRecogida, cantidad, onCambiar, onAgregar, agregado, idKey }) {
  const showCooked = !!(sePuedeCocinar && recogida === 'cocinado')
  const thumb = imagen
    ? (showCooked && (imagenCocinada || imagen) ? cookedCrop(imagenCocinada || imagen) : rawCrop(imagen))
    : null
  return (
    <div className="producto-row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {thumb
        ? <img src={thumb} alt="" className="producto-img" style={{ transition: 'opacity 0.3s' }} />
        : <div className="producto-img-placeholder">🍗</div>
      }
      <div className="producto-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="producto-nombre" style={{ lineHeight: 1.25 }}>{nombre}</div>
        <div className="producto-precio">
          ${precio}/kg
          {nota && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--rojo)' }}>{nota}</span>}
        </div>
        {sePuedeCocinar && cantidad > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              onClick={() => onRecogida?.('crudo')}
              style={{
                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1.5px solid',
                background: recogida === 'crudo' ? 'var(--rojo)' : 'transparent',
                color: recogida === 'crudo' ? '#fff' : 'var(--texto-suave)',
                borderColor: recogida === 'crudo' ? 'var(--rojo)' : 'var(--gris)',
              }}
            >📦 Crudo</button>
            <button
              onClick={() => onRecogida?.('cocinado')}
              style={{
                padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1.5px solid',
                background: recogida === 'cocinado' ? 'var(--rojo)' : 'transparent',
                color: recogida === 'cocinado' ? '#fff' : 'var(--texto-suave)',
                borderColor: recogida === 'cocinado' ? 'var(--rojo)' : 'var(--gris)',
              }}
            >🔥 Cocinado</button>
          </div>
        )}
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
            {conteo} variantes {open ? '· ocultar ▴' : ''}
          </div>
        </div>
        {open
          ? <div className="card-check">✓</div>
          : <div style={{ background: 'var(--rojo)', color: '#fff', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, flexShrink: 0, letterSpacing: 0.2 }}>
              Elegir
            </div>
        }
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
  const [cantidades, setCantidades]             = useState({})
  const [cantSimples, setCantSimples]           = useState({})
  const [cantEmpapeladas, setCantEmpapeladas]   = useState({})
  const [cantEmpanizadas, setCantEmpanizadas]   = useState({})
  const [cantNuggets, setCantNuggets]           = useState({})
  const [empapOpen, setEmpapOpen]               = useState(false)
  const [empanizadasOpen, setEmpanizadasOpen]   = useState(false)
  const [nuggetsOpen, setNuggetsOpen]           = useState(false)
  const [agregado, setAgregado]                 = useState(null)
  const [recogidaMap, setRecogidaMap]           = useState({})  // { [id]: 'crudo' | 'cocinado' }
  const [mostrarAvisoDisp, setMostrarAvisoDisp] = useState(false)

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
  const milEmpanizadas  = milanesas.filter(esEmpanizada)
  const milEmpapeladas  = milanesas.filter(p => !esSimpleMil(p) && !esEmpanizada(p))
  const precioEmpanizada  = milEmpanizadas[0]?.price ?? 225
  const precioEmpapelada  = milEmpapeladas[0]?.price ?? 230

  const esAlbondiga = (nombre) =>
    nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('albondiga')

  const marcarAgregado = (key) => {
    setAgregado(key)
    setTimeout(() => setAgregado(null), 1200)
  }

  /* ── Handler modo recogida para preparados cocinados ── */
  const handleRecogida = (id, modo, sePuedeCocinar) => {
    if (!sePuedeCocinar) return
    setRecogidaMap(prev => ({ ...prev, [id]: modo }))
    if (modo === 'cocinado') setMostrarAvisoDisp(true)
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
    const recogida = recogidaMap[p.id] || 'crudo'
    const nota = esAlbondiga(p.name) ? ` (~${Math.round(cantidad / 20)} charola${cantidad >= 20 ? 's' : ''})` : ''
    const tiempoEstimado = (p.se_puede_cocinar && recogida === 'cocinado') ? 20 : null
    agregarAlCarrito({
      tipo: 'preparado', nombre: p.name, cantidad,
      precioKg: p.price, precio: p.price,
      recogida: p.se_puede_cocinar ? recogida : undefined,
      tiempoEstimado,
      necesitaHora: true,
      resumen: `${p.name} × ${cantidad} pz${nota}${recogida === 'cocinado' ? ' · Cocinado ~20 min' : ''} · $${p.price}/kg`
    })
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

  /* ── Handlers empanizadas ── */
  const cambiarEmpanizada = (id, delta) =>
    setCantEmpanizadas(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const agregarEmpanizada = (m) => {
    const cantidad = cantEmpanizadas[m.id] || 0
    if (!cantidad) return
    agregarAlCarrito({ tipo: 'milanesa', nombre: m.name, cantidad, precioKg: m.price, precio: m.price, necesitaHora: true, resumen: `${m.name} × ${cantidad} pz · $${m.price}/kg` })
    setCantEmpanizadas(prev => ({ ...prev, [m.id]: 0 }))
    marcarAgregado(`epz-${m.id}`)
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
      {mostrarAvisoDisp && <AvisoDisponibilidad onCerrar={() => setMostrarAvisoDisp(false)} />}
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
              sePuedeCocinar={!!p.se_puede_cocinar}
              recogida={recogidaMap[p.id] || 'crudo'}
              onRecogida={modo => handleRecogida(p.id, modo, p.se_puede_cocinar)}
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

          {milEmpanizadas.length > 0 && (
            <GrupoExpandible
              titulo="Milanesas Empanizadas" precio={precioEmpanizada}
              imagen={EMPANIZADAS_IMG} emoji="🥩"
              conteo={milEmpanizadas.length}
              open={empanizadasOpen} onToggle={() => setEmpanizadasOpen(v => !v)}
            >
              {milEmpanizadas.map(m => (
                <FilaVariante
                  key={m.id} idKey={`epz-${m.id}`}
                  nombre={m.name}
                  cantidad={cantEmpanizadas[m.id] || 0}
                  onCambiar={d => cambiarEmpanizada(m.id, d)}
                  onAgregar={() => agregarEmpanizada(m)}
                  agregado={agregado}
                />
              ))}
            </GrupoExpandible>
          )}

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
