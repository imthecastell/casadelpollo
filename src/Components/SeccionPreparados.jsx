import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

const ORDEN_SIMPLES = ['natural', 'aplanada', 'empanizada', 'parmesano']
const EMPAP_IMG = 'https://res.cloudinary.com/do4juvxio/image/upload/ar_4:3,c_fill,g_west,w_320/marinados/empapeladas.png'

const esSimpleMil = (p) => {
  const n = p.name.toLowerCase()
  return ORDEN_SIMPLES.some(k => n.includes(k)) && !n.includes('empapelada')
}

function FilaProducto({ nombre, precio, nota, cantidad, onCambiar, onAgregar, agregado, idKey }) {
  return (
    <div className="producto-row">
      <div className="producto-info">
        <div className="producto-nombre">{nombre}</div>
        <div className="producto-precio">
          ${precio}/kg
          {nota && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--rojo)' }}>{nota}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ fontSize: 11, color: 'var(--texto-suave)', fontWeight: 500 }}>piezas</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="cantidad-ctrl">
            <button className="cantidad-btn" onClick={() => onCambiar(-1)} disabled={!cantidad}>−</button>
            <span className="cantidad-num">{cantidad}</span>
            <button className="cantidad-btn" onClick={() => onCambiar(1)}>+</button>
          </div>
          {cantidad > 0 && (
            <button
              className={`btn-primario ${agregado === idKey ? 'btn-agregado' : ''}`}
              style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
              onClick={onAgregar}
            >
              {agregado === idKey ? 'Agregado' : 'Agregar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SeccionPreparados() {
  const { agregarAlCarrito, productos } = useApp()
  const [cantidades, setCantidades] = useState({})
  const [cantSimples, setCantSimples] = useState({})
  const [cantEmpapeladas, setCantEmpapeladas] = useState({})
  const [empapOpen, setEmpapOpen] = useState(false)
  const [agregado, setAgregado] = useState(null)

  const productosSeccion = productos.filter(
    p => p.category_name === 'Preparados' && p.available !== false
  )

  const milanesas = productos.filter(
    p => p.category_name === 'Milanesas' && p.available !== false
  )

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

  const cambiarPreparado = (id, nombre, delta) => {
    const paso = esAlbondiga(nombre) ? 10 : 1
    const min = esAlbondiga(nombre) ? 10 : 0
    setCantidades(prev => {
      const actual = prev[id] || 0
      const nuevo = actual + delta * paso
      return { ...prev, [id]: nuevo <= 0 ? (delta > 0 ? min : 0) : nuevo }
    })
  }

  const agregarPreparado = (p) => {
    const cantidad = cantidades[p.id] || 0
    if (!cantidad) return
    const nota = esAlbondiga(p.name) ? ` (~${Math.round(cantidad / 20)} charola${cantidad >= 20 ? 's' : ''})` : ''
    agregarAlCarrito({
      tipo: 'preparado', nombre: p.name, cantidad,
      precioKg: p.price, precio: p.price, necesitaHora: true,
      resumen: `${p.name} × ${cantidad} pz${nota} · $${p.price}/kg`
    })
    setCantidades(prev => ({ ...prev, [p.id]: 0 }))
    marcarAgregado(p.id)
  }

  const agregarSimple = (m) => {
    const cantidad = cantSimples[m.id] || 0
    if (!cantidad) return
    agregarAlCarrito({
      tipo: 'milanesa', nombre: m.name, cantidad,
      precioKg: m.price, precio: m.price, necesitaHora: true,
      resumen: `${m.name} × ${cantidad} pz · $${m.price}/kg`
    })
    setCantSimples(prev => ({ ...prev, [m.id]: 0 }))
    marcarAgregado(m.id)
  }

  const agregarSabor = (flavor) => {
    const cantidad = cantEmpapeladas[flavor.id] || 0
    if (!cantidad) return
    const nombreSabor = flavor.name.replace(/^milanesa\s*/i, '')
    agregarAlCarrito({
      tipo: 'milanesa',
      nombre: `Empapelada ${nombreSabor}`,
      cantidad,
      precioKg: flavor.price,
      precio: flavor.price,
      necesitaHora: true,
      resumen: `Milanesa empapelada ${nombreSabor} × ${cantidad} pz · $${flavor.price}/kg`
    })
    setCantEmpapeladas(prev => ({ ...prev, [flavor.id]: 0 }))
    marcarAgregado(`emp-${flavor.id}`)
  }

  return (
    <div>
      <div className="seccion-titulo">Preparados y Milanesas</div>
      <p className="seccion-desc">Por pieza · precio por kg al pesar en el local</p>

      {/* Preparados */}
      {productosSeccion.length > 0 && (
        <div className="subseccion-menu">
          <div className="config-label" style={{ marginBottom: 12 }}>Preparados</div>
          {productosSeccion.map(p => (
            <FilaProducto
              key={p.id} idKey={p.id}
              nombre={p.name} precio={p.price}
              nota={esAlbondiga(p.name) ? '· ±10 pz · charola 20 pz' : null}
              cantidad={cantidades[p.id] || 0}
              onCambiar={d => cambiarPreparado(p.id, p.name, d)}
              onAgregar={() => agregarPreparado(p)}
              agregado={agregado}
            />
          ))}
        </div>
      )}

      {/* Milanesas simples */}
      {milSimples.length > 0 && (
        <div className="subseccion-menu">
          <div className="config-label" style={{ marginBottom: 12 }}>Milanesas</div>
          {milSimples.map(m => (
            <FilaProducto
              key={m.id} idKey={m.id}
              nombre={m.name} precio={m.price}
              cantidad={cantSimples[m.id] || 0}
              onCambiar={d => setCantSimples(prev => ({ ...prev, [m.id]: Math.max(0, (prev[m.id] || 0) + d) }))}
              onAgregar={() => agregarSimple(m)}
              agregado={agregado}
            />
          ))}
        </div>
      )}

      {/* Milanesas empapeladas — fila única expandible */}
      {milEmpapeladas.length > 0 && (
        <div className="subseccion-menu">
          <button
            className={`card-marinado ${empapOpen ? 'card-marinado-activo' : ''}`}
            onClick={() => setEmpapOpen(v => !v)}
          >
            <img src={EMPAP_IMG} alt="" style={{ width: 88, height: 66, borderRadius: 12, objectFit: 'cover', flexShrink: 0, order: -1 }} />
            <div style={{ flex: 1 }}>
              <div className="producto-nombre">Milanesas Empapeladas</div>
              <div className="producto-precio">${precioEmpapelada}/kg</div>
              <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 2 }}>
                {milEmpapeladas.length} sabores · {empapOpen ? 'ocultar ▴' : 'elegir sabor ▾'}
              </div>
            </div>
            {empapOpen && <div className="card-check">✓</div>}
          </button>

          {empapOpen && (
            <div className="configurador-card slide-up" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, gap: 10 }}>
              {milEmpapeladas.map(flavor => {
                const nombre = flavor.name.replace(/^milanesa\s*/i, '')
                const cantidad = cantEmpapeladas[flavor.id] || 0
                const key = `emp-${flavor.id}`
                return (
                  <div key={flavor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="producto-nombre" style={{ flex: 1 }}>{nombre}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="cantidad-ctrl">
                        <button className="cantidad-btn" onClick={() => setCantEmpapeladas(prev => ({ ...prev, [flavor.id]: Math.max(0, (prev[flavor.id] || 0) - 1) }))} disabled={!cantidad}>−</button>
                        <span className="cantidad-num">{cantidad}</span>
                        <button className="cantidad-btn" onClick={() => setCantEmpapeladas(prev => ({ ...prev, [flavor.id]: (prev[flavor.id] || 0) + 1 }))}>+</button>
                      </div>
                      {cantidad > 0 && (
                        <button
                          className={`btn-primario ${agregado === key ? 'btn-agregado' : ''}`}
                          style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                          onClick={() => agregarSabor(flavor)}
                        >
                          {agregado === key ? 'Agregado' : 'Agregar'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
