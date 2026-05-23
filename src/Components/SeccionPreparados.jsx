import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { rawCrop, cookedCrop } from './SeccionMarinados.jsx'
import AvisoDisponibilidad from './AvisoDisponibilidad.jsx'

// Milanesas simples (sin empanado ni empapelado)
const ORDEN_SIMPLES = ['natural', 'aplanada']

// Imágenes de grupo
const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'
const COOK_HALF = (f) => `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/${f}`
const EMPAP_IMG           = COOK_HALF('marinados/empapeladas.png')
const EMPANIZADAS_IMG     = COOK_HALF('milanesas/empanadas.png')
const NUGGETS_IMG         = `${CDN}/c_fill,w_600/preparados/nuggets_grupo.png`
const PECHUGA_RELLENA_IMG = COOK_HALF('preparados/pechuga_rellena.png')

const esSimpleMil = (p) => {
  const n = p.name.toLowerCase()
  return ORDEN_SIMPLES.some(k => n.includes(k)) && !n.includes('empapelada')
}
const esEmpanizada = (p) => {
  const n = p.name.toLowerCase()
  return (n.includes('empanizada') || n.includes('parmesano')) && !n.includes('empapelada')
}
const esNugget       = (p) => ['nugget', 'tender', 'trozo'].some(k => p.name.toLowerCase().includes(k))
const esEmpanada     = (p) => p.name.toLowerCase().includes('empanada')
const esPechugaRell  = (p) => p.name.toLowerCase().includes('pechuga rellena')
const esAlbondiga    = (nombre) =>
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

          {/* ¿Cómo lo quieres? */}
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

/* ── Fila expandible de grupo ── */
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
/* Muestra selector crudo/cocinado cuando sePuedeCocinar=true y cantidad > 0 */
function FilaVariante({ nombre, cantidad, sePuedeCocinar = false, onCambiar, onAgregar, agregado, idKey }) {
  const [recogida, setRecogida] = useState('crudo')
  const mostrarOpciones = sePuedeCocinar && cantidad > 0

  const btnRecogida = (modo) => ({
    flex: 1, padding: '7px 4px', borderRadius: 10,
    border: `1.5px solid ${recogida === modo ? 'var(--rojo)' : 'rgba(0,0,0,0.1)'}`,
    background: recogida === modo ? 'var(--rojo)' : 'transparent',
    color: recogida === modo ? '#fff' : 'var(--texto)',
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    transition: 'all 0.18s',
  })

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden',
    }}>
      {/* Fila nombre + controles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        <div className="producto-nombre" style={{ flex: 1 }}>{nombre}</div>
        {cantidad === 0 ? (
          <button className="btn-add" onClick={() => onCambiar(1)}>+</button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="qty-pill">
              <button className="qty-pill-btn" onClick={() => onCambiar(-1)} disabled={cantidad <= 1}>−</button>
              <span className="qty-pill-num">{cantidad}</span>
              <button className="qty-pill-btn" onClick={() => onCambiar(1)}>+</button>
            </div>
            {/* Botón agregar solo cuando no hay opciones de cocción */}
            {!mostrarOpciones && (
              <button
                className={`btn-confirm ${agregado === idKey ? 'confirmado' : ''}`}
                onClick={() => onAgregar('crudo')}
              >
                {agregado === idKey ? '✓' : 'Agregar'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toggle crudo/cocinado + botón agregar */}
      {mostrarOpciones && (
        <div style={{
          padding: '8px 12px 12px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <button style={btnRecogida('crudo')} onClick={() => setRecogida('crudo')}>
            📦 Crudo
          </button>
          <button style={btnRecogida('cocinado')} onClick={() => setRecogida('cocinado')}>
            🔥 Cocinado
          </button>
          <button
            className={`btn-confirm ${agregado === idKey ? 'confirmado' : ''}`}
            style={{ flexShrink: 0 }}
            onClick={() => onAgregar(recogida)}
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

  const [seleccion, setSeleccion]   = useState(null)
  const [cantidad, setCantidad]     = useState(1)
  const [recogida, setRecogida]     = useState('crudo')
  const [mostrarAvisoDisp, setMostrarAvisoDisp] = useState(false)
  const [agregado, setAgregado]     = useState(null)

  // Estado de grupos expandibles
  const [cantNuggets,    setCantNuggets]    = useState({})
  const [cantEmpanadas,  setCantEmpanadas]  = useState({})
  const [cantPechugas,   setCantPechugas]   = useState({})
  const [cantEmpanizadas,setCantEmpanizadas]= useState({})
  const [cantEmpapeladas,setCantEmpapeladas]= useState({})

  const [nuggetsOpen,      setNuggetsOpen]      = useState(false)
  const [empanadasOpen,    setEmpanadasOpen]    = useState(false)
  const [pechugasOpen,     setPechugasOpen]     = useState(false)
  const [empanizadasOpen,  setEmpanizadasOpen]  = useState(false)
  const [empapOpen,        setEmpapOpen]        = useState(false)

  // ── Filtros ──
  const todoPreparado = productos.filter(p => p.category_name === 'Preparados' && p.available !== false)
  const productosNormales = todoPreparado.filter(p =>
    !esNugget(p) && !esEmpanada(p) && !esPechugaRell(p)
  )
  const nuggets        = todoPreparado.filter(esNugget)
  const empanadas      = todoPreparado.filter(esEmpanada)
  const pechugasRell   = todoPreparado.filter(esPechugaRell)
  const precioNuggets  = nuggets[0]?.price ?? 205

  const milanesas      = productos.filter(p => p.category_name === 'Milanesas' && p.available !== false)
  const milSimples     = milanesas
    .filter(esSimpleMil)
    .sort((a, b) => {
      const ai = ORDEN_SIMPLES.findIndex(k => a.name.toLowerCase().includes(k))
      const bi = ORDEN_SIMPLES.findIndex(k => b.name.toLowerCase().includes(k))
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  const milEmpanizadas  = milanesas.filter(esEmpanizada)
  const milEmpapeladas  = milanesas.filter(p => !esSimpleMil(p) && !esEmpanizada(p))
  const precioEmpanizada = milEmpanizadas[0]?.price ?? 225
  const precioEmpapelada = milEmpapeladas[0]?.price ?? 230

  const marcarAgregado = (key) => {
    setAgregado(key)
    setTimeout(() => setAgregado(null), 1200)
  }

  /* ── Producto individual activo ── */
  const seleccionar = (producto) => {
    if (seleccion?.id === producto.id) {
      setSeleccion(null); setCantidad(1); setRecogida('crudo')
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
    if (modo === 'cocinado') setMostrarAvisoDisp(true)
  }

  const agregarActivo = () => {
    if (!seleccion) return
    const nota = esAlbondiga(seleccion.name)
      ? ` (~${Math.round(cantidad / 20)} charola${cantidad >= 20 ? 's' : ''})`
      : ''
    const tiempoEstimado = (seleccion.se_puede_cocinar && recogida === 'cocinado') ? 20 : null
    agregarAlCarrito({
      tipo: 'preparado', nombre: seleccion.name, cantidad,
      precioKg: seleccion.price, precio: seleccion.price,
      recogida: seleccion.se_puede_cocinar ? recogida : undefined,
      tiempoEstimado, necesitaHora: true,
      imagen_url: recogida === 'cocinado'
        ? cookedCrop(seleccion.image_cooked_url || seleccion.image_url)
        : rawCrop(seleccion.image_url),
      resumen: `${seleccion.name} × ${cantidad} pz${nota}${recogida === 'cocinado' ? ' · Cocinado ~20 min' : ''} · $${seleccion.price}/kg`,
    })
    marcarAgregado(seleccion.id)
    setSeleccion(null); setCantidad(1); setRecogida('crudo')
  }

  /* ── Helpers de grupos ── */
  const mkCambiar = (setter) => (id, delta) =>
    setter(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })

  const cambiarNugget     = mkCambiar(setCantNuggets)
  const cambiarEmpanada   = mkCambiar(setCantEmpanadas)
  const cambiarPechuga    = mkCambiar(setCantPechugas)
  const cambiarEmpanizada = mkCambiar(setCantEmpanizadas)
  const cambiarEmpap      = mkCambiar(setCantEmpapeladas)

  /* ── agregarGrupo genérico ── */
  const mkAgregar = (cantState, setter, idPrefix, tipo, getNombre, getResumen) =>
    (p, recogida = 'crudo') => {
      const c = cantState[p.id] || 0
      if (!c) return
      const tiempoEstimado = recogida === 'cocinado' ? 20 : null
      agregarAlCarrito({
        tipo, nombre: getNombre(p), cantidad: c,
        precioKg: p.price, precio: p.price,
        recogida, tiempoEstimado, necesitaHora: true,
        imagen_url: recogida === 'cocinado'
          ? cookedCrop(p.image_cooked_url || p.image_url)
          : rawCrop(p.image_url || p.image_cooked_url),
        resumen: getResumen(p, c, recogida),
      })
      setter(prev => ({ ...prev, [p.id]: 0 }))
      marcarAgregado(`${idPrefix}-${p.id}`)
    }

  const agregarNugget = mkAgregar(
    cantNuggets, setCantNuggets, 'nug', 'preparado',
    p => p.name,
    (p, c, r) => `${p.name} × ${c} pz · $${p.price}/kg${r === 'cocinado' ? ' · Cocinado ~20 min' : ''}`,
  )
  const agregarEmpanada = mkAgregar(
    cantEmpanadas, setCantEmpanadas, 'empa', 'preparado',
    p => p.name,
    (p, c, r) => `${p.name} × ${c} pz · $${p.price}/pz${r === 'cocinado' ? ' · Cocinado ~20 min' : ''}`,
  )
  const agregarPechuga = mkAgregar(
    cantPechugas, setCantPechugas, 'pech', 'preparado',
    p => p.name,
    (p, c, r) => `${p.name} × ${c} pz · $${p.price}/kg${r === 'cocinado' ? ' · Cocinado ~20 min' : ''}`,
  )
  const agregarEmpanizada = mkAgregar(
    cantEmpanizadas, setCantEmpanizadas, 'epz', 'milanesa',
    p => p.name,
    (p, c, r) => `${p.name} × ${c} pz · $${p.price}/kg${r === 'cocinado' ? ' · Cocinado ~20 min' : ''}`,
  )
  const agregarEmpap = mkAgregar(
    cantEmpapeladas, setCantEmpapeladas, 'emp', 'milanesa',
    p => `Empapelada ${p.name.replace(/^milanesa\s*/i, '')}`,
    (p, c, r) => {
      const sabor = p.name.replace(/^milanesa\s*/i, '')
      return `Empapelada ${sabor} × ${c} pz · $${p.price}/kg${r === 'cocinado' ? ' · Cocinado ~20 min' : ''}`
    },
  )

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

      {/* ── Preparados normales (cards individuales) ── */}
      {productosNormales.length > 0 && (
        <div className="subseccion-menu">
          <div className="config-label" style={{ marginBottom: 12 }}>Preparados</div>
          {productosNormales.map(p => (
            <CardProducto
              key={p.id} producto={p}
              seleccion={seleccion} cantidad={cantidad} recogida={recogida}
              onSeleccionar={seleccionar} onCambiar={cambiarCantidad}
              onAgregar={agregarActivo} onRecogida={elegirRecogida}
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
                sePuedeCocinar={!!p.se_puede_cocinar}
                cantidad={cantNuggets[p.id] || 0}
                onCambiar={d => cambiarNugget(p.id, d)}
                onAgregar={r => agregarNugget(p, r)}
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
            open={empanadasOpen} onToggle={() => setEmpanadasOpen(v => !v)}
          >
            {empanadas.map(p => (
              <FilaVariante
                key={p.id} idKey={`empa-${p.id}`}
                nombre={p.name.replace(/^empanada\s+de\s+/i, '')}
                sePuedeCocinar={!!p.se_puede_cocinar}
                cantidad={cantEmpanadas[p.id] || 0}
                onCambiar={d => cambiarEmpanada(p.id, d)}
                onAgregar={r => agregarEmpanada(p, r)}
                agregado={agregado}
              />
            ))}
          </GrupoExpandible>
        </div>
      )}

      {/* ── Pechugas Rellenas ── */}
      {pechugasRell.length > 0 && (
        <div className="subseccion-menu">
          <GrupoExpandible
            titulo="Pechugas Rellenas"
            precio={pechugasRell[0]?.price ?? 0}
            imagen={PECHUGA_RELLENA_IMG} emoji="🍗"
            conteo={pechugasRell.length}
            open={pechugasOpen} onToggle={() => setPechugasOpen(v => !v)}
          >
            {pechugasRell.map(p => (
              <FilaVariante
                key={p.id} idKey={`pech-${p.id}`}
                nombre={p.name.replace(/^pechuga\s+rellena\s+(?:de\s+)?/i, '')}
                sePuedeCocinar={!!p.se_puede_cocinar}
                cantidad={cantPechugas[p.id] || 0}
                onCambiar={d => cambiarPechuga(p.id, d)}
                onAgregar={r => agregarPechuga(p, r)}
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
              key={m.id} producto={m}
              seleccion={seleccion} cantidad={cantidad} recogida={recogida}
              onSeleccionar={seleccionar} onCambiar={cambiarCantidad}
              onAgregar={agregarActivo} onRecogida={elegirRecogida}
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
                  sePuedeCocinar={!!m.se_puede_cocinar}
                  cantidad={cantEmpanizadas[m.id] || 0}
                  onCambiar={d => cambiarEmpanizada(m.id, d)}
                  onAgregar={r => agregarEmpanizada(m, r)}
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
                  sePuedeCocinar={!!flavor.se_puede_cocinar}
                  cantidad={cantEmpapeladas[flavor.id] || 0}
                  onCambiar={d => cambiarEmpap(flavor.id, d)}
                  onAgregar={r => agregarEmpap(flavor, r)}
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
