import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { rawCrop, cookedCrop } from './SeccionMarinados.jsx'
import AvisoDisponibilidad from './AvisoDisponibilidad.jsx'

// Milanesas simples (sin empanado ni empapelado)
const ORDEN_SIMPLES = ['natural', 'aplanada']

// Imágenes de grupo
const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'
const COOK_HALF = (f) => `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/${f}`
const EMPAP_IMG       = COOK_HALF('marinados/empapeladas.png')
const EMPANIZADAS_IMG = COOK_HALF('milanesas/empanadas.png')
const NUGGETS_IMG     = `${CDN}/c_fill,w_600/preparados/nuggets_grupo.png`

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
const esEmpanada = (p) => p.name.toLowerCase().includes('empanada')
const esAlbondiga = (nombre) =>
  nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('albondiga')

/* ── Imagen con transición crudo ↔ cocinado (igual que en Marinados) ── */
function PreparadoImg({ imageUrl, imageCookedUrl, isSelected, recogida }) {
  const rawSrc    = imageUrl ? rawCrop(imageUrl) : null
  const cookedSrc = (imageCookedUrl || imageUrl) ? cookedCrop(imageCookedUrl || imageUrl) : null
  const showCooked = !!(isSelected && recogida === 'cocinado' && cookedSrc)
  const size = isSelected ? 90 : 72
  const dur  = '0.38s cubic-bezier(.34,1.56,.64,1)'

  const imgStyle = (visible) => ({
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', transition: 'opacity 0.4s ease',
    opacity: visible ? 1 : 0,
  })

  if (!rawSrc && !cookedSrc) return (
    <div style={{
      width: size, height: size, borderRadius: 14, flexShrink: 0, order: -1,
      background: 'var(--crema-oscura)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 28,
      transition: `width ${dur}, height ${dur}`,
    }}>🍗</div>
  )

  return (
    <div style={{
      position: 'relative', width: size, height: size, borderRadius: 14,
      flexShrink: 0, order: -1, overflow: 'hidden',
      transition: `width ${dur}, height ${dur}`,
      boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
    }}>
      {rawSrc    && <img src={rawSrc}    alt="" style={imgStyle(!showCooked)} />}
      {cookedSrc && <img src={cookedSrc} alt="" style={imgStyle(showCooked)}  />}
    </div>
  )
}

/* ── Tarjeta de producto individual (preparados y milanesas simples) ── */
function CardProducto({ producto, seleccion, cantidad, recogida, onSeleccionar, onCambiar, onAgregar, onRecogida, agregado }) {
  const isActive = seleccion?.id === producto.id
  const esAlb = esAlbondiga(producto.name)
  const min = esAlb ? 10 : 1

  return (
    <div>
      <button
        className={`card-marinado ${isActive ? 'card-marinado-activo' : ''}`}
        onClick={() => onSeleccionar(producto)}
      >
        <PreparadoImg
          imageUrl={producto.image_url}
          imageCookedUrl={producto.image_cooked_url}
          isSelected={isActive}
          recogida={recogida}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="producto-nombre">{producto.name}</div>
          <div className="producto-precio">${producto.price}/kg</div>
          {esAlb && (
            <div style={{ fontSize: 11, color: 'var(--rojo)', marginTop: 2 }}>±10 pz · charola 20</div>
          )}
        </div>
        {isActive
          ? <div className="card-check">✓</div>
          : <div className="card-add">+</div>
        }
      </button>

      {isActive && (
        <div className="configurador-card slide-up" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>

          {/* Cantidad */}
          <div>
            <label className="config-label">Cantidad</label>
            <div className="cantidad-ctrl">
              <button className="cantidad-btn" onClick={() => onCambiar(-1)} disabled={cantidad <= min}>−</button>
              <span className="cantidad-num" style={{ fontSize: 20, minWidth: 64, textAlign: 'center' }}>
                {cantidad} pz
              </span>
              <button className="cantidad-btn" onClick={() => onCambiar(1)}>+</button>
            </div>
            {esAlb && (
              <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 6 }}>
                Intervalos de 10 pz · ~{Math.round(cantidad / 20)} charola{cantidad !== 20 ? 's' : ''}
              </div>
            )}
          </div>

          {/* ¿Cómo lo quieres? — igual que en Marinados */}
          {producto.se_puede_cocinar && (
            <div>
              <label className="config-label">¿Cómo lo quieres?</label>
              <div className="recogida-opts">
                <button
                  className={`recogida-opt ${recogida === 'crudo' ? 'recogida-activo' : ''}`}
                  onClick={() => onRecogida('crudo')}
                >
                  <span style={{ fontSize: 20 }}>📦</span>
                  <div>
                    <div className="recogida-titulo">Recoger crudo</div>
                    <div className="recogida-sub">Listo para llevar</div>
                  </div>
                </button>
                <button
                  className={`recogida-opt ${recogida === 'cocinado' ? 'recogida-activo' : ''}`}
                  onClick={() => onRecogida('cocinado')}
                >
                  <span style={{ fontSize: 20 }}>🔥</span>
                  <div>
                    <div className="recogida-titulo">Recoger cocinado</div>
                    <div className="recogida-sub">Listo en ~20 min</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          <button
            className={`btn-primario ${agregado === producto.id ? 'btn-agregado' : ''}`}
            onClick={onAgregar}
          >
            {agregado === producto.id
              ? '✓ Agregado'
              : `Agregar ${cantidad} pz de ${producto.name}`}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Fila expandible de grupo (Nuggets / Empanizadas / Empapeladas / Empanadas) ── */
function GrupoExpandible({ titulo, precio, unidad = '/kg', imagen, emoji, conteo, open, onToggle, children }) {
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
          <div className="producto-precio">${precio}{unidad}</div>
          <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 2 }}>
            {conteo} variantes {open ? '· ocultar ▴' : ''}
          </div>
        </div>
        {open
          ? <div className="card-check">✓</div>
          : <div style={{ background: 'var(--rojo)', color: '#fff', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>Elegir</div>
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

/* ── Variante dentro del grupo expandido ── */
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

  // Un solo producto activo a la vez (mismo patrón que Marinados)
  const [seleccion, setSeleccion]   = useState(null)
  const [cantidad, setCantidad]     = useState(1)
  const [recogida, setRecogida]     = useState('crudo')
  const [mostrarAvisoDisp, setMostrarAvisoDisp] = useState(false)
  const [agregado, setAgregado]     = useState(null)

  // Estado de grupos expandibles
  const [cantEmpapeladas, setCantEmpapeladas]   = useState({})
  const [cantEmpanizadas, setCantEmpanizadas]   = useState({})
  const [cantNuggets, setCantNuggets]           = useState({})
  const [cantEmpanadas, setCantEmpanadas]       = useState({})
  const [empapOpen, setEmpapOpen]               = useState(false)
  const [empanizadasOpen, setEmpanizadasOpen]   = useState(false)
  const [nuggetsOpen, setNuggetsOpen]           = useState(false)
  const [empanadasOpen, setEmpanadasOpen]       = useState(false)

  // Filtros de productos
  const todoPreparado = productos.filter(p => p.category_name === 'Preparados' && p.available !== false)
  const productosNormales = todoPreparado.filter(p => !esNugget(p) && !esEmpanada(p))
  const nuggets   = todoPreparado.filter(esNugget)
  const empanadas = todoPreparado.filter(esEmpanada)
  const precioNuggets = nuggets[0]?.price ?? 205

  const milanesas = productos.filter(p => p.category_name === 'Milanesas' && p.available !== false)
  const milSimples = milanesas
    .filter(esSimpleMil)
    .sort((a, b) => {
      const ai = ORDEN_SIMPLES.findIndex(k => a.name.toLowerCase().includes(k))
      const bi = ORDEN_SIMPLES.findIndex(k => b.name.toLowerCase().includes(k))
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  const milEmpanizadas = milanesas.filter(esEmpanizada)
  const milEmpapeladas = milanesas.filter(p => !esSimpleMil(p) && !esEmpanizada(p))
  const precioEmpanizada = milEmpanizadas[0]?.price ?? 225
  const precioEmpapelada = milEmpapeladas[0]?.price ?? 230

  const marcarAgregado = (key) => {
    setAgregado(key)
    setTimeout(() => setAgregado(null), 1200)
  }

  /* ── Handlers del producto activo ── */
  const seleccionar = (producto) => {
    if (seleccion?.id === producto.id) {
      // Deseleccionar
      setSeleccion(null)
      setCantidad(1)
      setRecogida('crudo')
    } else {
      setSeleccion(producto)
      setCantidad(esAlbondiga(producto.name) ? 10 : 1)
      setRecogida('crudo')
    }
  }

  const cambiarCantidad = (delta) => {
    if (!seleccion) return
    const paso = esAlbondiga(seleccion.name) ? 10 : 1
    const min  = esAlbondiga(seleccion.name) ? 10 : 1
    setCantidad(prev => Math.max(min, prev + delta * paso))
  }

  const elegirRecogida = (modo) => {
    setRecogida(modo)
    if (modo === 'cocinado') {
      setMostrarAvisoDisp(true)
    }
  }

  const agregarActivo = () => {
    if (!seleccion) return
    const nota = esAlbondiga(seleccion.name)
      ? ` (~${Math.round(cantidad / 20)} charola${cantidad >= 20 ? 's' : ''})`
      : ''
    const tiempoEstimado = (seleccion.se_puede_cocinar && recogida === 'cocinado') ? 20 : null
    agregarAlCarrito({
      tipo: 'preparado',
      nombre: seleccion.name,
      cantidad,
      precioKg: seleccion.price,
      precio: seleccion.price,
      recogida: seleccion.se_puede_cocinar ? recogida : undefined,
      tiempoEstimado,
      necesitaHora: true,
      imagen_url: recogida === 'cocinado'
        ? cookedCrop(seleccion.image_cooked_url || seleccion.image_url)
        : rawCrop(seleccion.image_url),
      resumen: `${seleccion.name} × ${cantidad} pz${nota}${recogida === 'cocinado' ? ' · Cocinado ~20 min' : ''} · $${seleccion.price}/kg`,
    })
    marcarAgregado(seleccion.id)
    setSeleccion(null)
    setCantidad(1)
    setRecogida('crudo')
  }

  /* ── Handlers de grupos ── */
  const cambiarNugget = (id, delta) =>
    setCantNuggets(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const agregarNugget = (p) => {
    const c = cantNuggets[p.id] || 0
    if (!c) return
    agregarAlCarrito({ tipo: 'preparado', nombre: p.name, cantidad: c, precioKg: p.price, precio: p.price, necesitaHora: true, imagen_url: rawCrop(p.image_url || p.image_cooked_url), resumen: `${p.name} × ${c} pz · $${p.price}/kg` })
    setCantNuggets(prev => ({ ...prev, [p.id]: 0 }))
    marcarAgregado(`nug-${p.id}`)
  }

  const cambiarEmpanada = (id, delta) =>
    setCantEmpanadas(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const agregarEmpanada = (p) => {
    const c = cantEmpanadas[p.id] || 0
    if (!c) return
    agregarAlCarrito({
      tipo: 'preparado',
      nombre: p.name,
      cantidad: c,
      precio: p.price,
      precioKg: p.price,
      necesitaHora: true,
      imagen_url: rawCrop(p.image_url || p.image_cooked_url),
      resumen: `${p.name} × ${c} pz · $${p.price}/pz`,
    })
    setCantEmpanadas(prev => ({ ...prev, [p.id]: 0 }))
    marcarAgregado(`empa-${p.id}`)
  }

  const cambiarEmpap = (id, delta) =>
    setCantEmpapeladas(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const agregarEmpap = (flavor) => {
    const c = cantEmpapeladas[flavor.id] || 0
    if (!c) return
    const nombreSabor = flavor.name.replace(/^milanesa\s*/i, '')
    agregarAlCarrito({ tipo: 'milanesa', nombre: `Empapelada ${nombreSabor}`, cantidad: c, precioKg: flavor.price, precio: flavor.price, necesitaHora: true, imagen_url: rawCrop(flavor.image_url || flavor.image_cooked_url), resumen: `Empapelada ${nombreSabor} × ${c} pz · $${flavor.price}/kg` })
    setCantEmpapeladas(prev => ({ ...prev, [flavor.id]: 0 }))
    marcarAgregado(`emp-${flavor.id}`)
  }

  const cambiarEmpanizada = (id, delta) =>
    setCantEmpanizadas(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const agregarEmpanizada = (m) => {
    const c = cantEmpanizadas[m.id] || 0
    if (!c) return
    agregarAlCarrito({ tipo: 'milanesa', nombre: m.name, cantidad: c, precioKg: m.price, precio: m.price, necesitaHora: true, imagen_url: rawCrop(m.image_url || m.image_cooked_url), resumen: `${m.name} × ${c} pz · $${m.price}/kg` })
    setCantEmpanizadas(prev => ({ ...prev, [m.id]: 0 }))
    marcarAgregado(`epz-${m.id}`)
  }

  return (
    <div>
      {mostrarAvisoDisp && (
        <AvisoDisponibilidad onCerrar={() => {
          sessionStorage.setItem('aviso_disp_visto', '1')
          setMostrarAvisoDisp(false)
        }} />
      )}

      <div className="seccion-titulo">Preparados y Milanesas</div>
      <p className="seccion-desc">Por pieza · precio por kg al pesar en el local</p>

      {/* ── Preparados normales ── */}
      {productosNormales.length > 0 && (
        <div className="subseccion-menu">
          <div className="config-label" style={{ marginBottom: 12 }}>Preparados</div>
          {productosNormales.map(p => (
            <CardProducto
              key={p.id}
              producto={p}
              seleccion={seleccion}
              cantidad={cantidad}
              recogida={recogida}
              onSeleccionar={seleccionar}
              onCambiar={cambiarCantidad}
              onAgregar={agregarActivo}
              onRecogida={elegirRecogida}
              agregado={agregado}
            />
          ))}
        </div>
      )}

      {/* ── Nuggets ── */}
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

      {/* ── Empanadas ── */}
      {empanadas.length > 0 && (
        <div className="subseccion-menu">
          <GrupoExpandible
            titulo="Empanadas"
            precio={empanadas[0]?.price ?? 0}
            unidad="/pz"
            emoji="🥟"
            conteo={empanadas.length}
            open={empanadasOpen}
            onToggle={() => setEmpanadasOpen(v => !v)}
          >
            {empanadas.map(p => (
              <FilaVariante
                key={p.id} idKey={`empa-${p.id}`}
                nombre={p.name.replace(/^empanada\s+de\s+/i, '')}
                cantidad={cantEmpanadas[p.id] || 0}
                onCambiar={d => cambiarEmpanada(p.id, d)}
                onAgregar={() => agregarEmpanada(p)}
                agregado={agregado}
              />
            ))}
          </GrupoExpandible>
        </div>
      )}

      {/* ── Milanesas ── */}
      {(milSimples.length > 0 || milEmpanizadas.length > 0 || milEmpapeladas.length > 0) && (
        <div className="subseccion-menu">
          <div className="config-label" style={{ marginBottom: 12 }}>Milanesas</div>

          {milSimples.map(m => (
            <CardProducto
              key={m.id}
              producto={m}
              seleccion={seleccion}
              cantidad={cantidad}
              recogida={recogida}
              onSeleccionar={seleccionar}
              onCambiar={cambiarCantidad}
              onAgregar={agregarActivo}
              onRecogida={elegirRecogida}
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
