import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

const ORDEN_SIMPLES = ['natural', 'aplanada', 'empanizada', 'parmesano']

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
  const [saborId, setSaborId] = useState('')
  const [cantEmpapelada, setCantEmpapelada] = useState(0)
  const [agregado, setAgregado] = useState(null)

  // Preparados desde DB
  const productosSeccion = productos.filter(
    p => p.category_name === 'Preparados' && p.available !== false
  )

  // Milanesas desde DB
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
  const saborSeleccionado = milEmpapeladas.find(e => e.id === saborId)
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
      resumen: `Milanesa ${m.name} × ${cantidad} pz · $${m.price}/kg`
    })
    setCantSimples(prev => ({ ...prev, [m.id]: 0 }))
    marcarAgregado(m.id)
  }

  const agregarEmpapelada = () => {
    if (!saborSeleccionado || !cantEmpapelada) return
    agregarAlCarrito({
      tipo: 'milanesa',
      nombre: `Empapelada ${saborSeleccionado.name}`,
      cantidad: cantEmpapelada,
      precioKg: saborSeleccionado.price,
      precio: saborSeleccionado.price,
      necesitaHora: true,
      resumen: `Milanesa empapelada ${saborSeleccionado.name} × ${cantEmpapelada} pz · $${saborSeleccionado.price}/kg`
    })
    setSaborId('')
    setCantEmpapelada(0)
    marcarAgregado('empapelada')
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

      {/* Milanesas empapeladas */}
      {milEmpapeladas.length > 0 && (
        <div className="subseccion-menu">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="config-label" style={{ marginBottom: 0 }}>Milanesas Empapeladas</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--rojo)', background: '#fff0f0', borderRadius: 999, padding: '3px 10px' }}>
              ${precioEmpapelada}/kg
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {milEmpapeladas.map(s => (
              <button
                key={s.id}
                onClick={() => { setSaborId(s.id === saborId ? '' : s.id); setCantEmpapelada(0) }}
                style={{
                  padding: '10px 12px',
                  border: `2px solid ${saborId === s.id ? 'var(--rojo)' : 'var(--gris)'}`,
                  borderRadius: 'var(--radio)',
                  background: saborId === s.id ? '#fff5f5' : 'var(--card-bg)',
                  color: saborId === s.id ? 'var(--rojo)' : 'var(--texto)',
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 13,
                  fontWeight: saborId === s.id ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {s.name.replace(/^milanesa\s*/i, '')}
              </button>
            ))}
          </div>

          {saborSeleccionado && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: 'var(--gris-claro)', borderRadius: 'var(--radio)', padding: '12px 14px' }}>
              <div className="cantidad-ctrl">
                <button className="cantidad-btn" onClick={() => setCantEmpapelada(v => Math.max(0, v - 1))} disabled={!cantEmpapelada}>−</button>
                <span className="cantidad-num">{cantEmpapelada}</span>
                <button className="cantidad-btn" onClick={() => setCantEmpapelada(v => v + 1)}>+</button>
              </div>
              <span style={{ fontSize: 13, color: 'var(--texto-suave)', flex: 1 }}>
                pz de {saborSeleccionado.name.replace(/^milanesa\s*/i, '')}
              </span>
              {cantEmpapelada > 0 && (
                <button
                  className={`btn-primario ${agregado === 'empapelada' ? 'btn-agregado' : ''}`}
                  style={{ width: 'auto', padding: '10px 18px', fontSize: 13 }}
                  onClick={agregarEmpapelada}
                >
                  {agregado === 'empapelada' ? 'Agregada' : `Agregar ${cantEmpapelada} pz`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
