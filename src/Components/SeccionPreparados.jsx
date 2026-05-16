import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { MILANESAS } from '../data/menu.js'

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
  const [saborEmpapelado, setSaborEmpapelado] = useState('')
  const [cantEmpapelada, setCantEmpapelada] = useState(0)
  const [agregado, setAgregado] = useState(null)

  const productosSeccion = productos.filter(
    p => p.category_name === 'Preparados' && p.available !== false
  )
  const esAlbondiga = (nombre) => nombre.toLowerCase().includes('albondiga')

  const milaneasSimples = MILANESAS.simples.filter(m => m.available !== false)
  const empapeladas = MILANESAS.empapeladas.filter(m => m.available !== false)
  const saboresDisponibles = empapeladas
  const saborSeleccionado = empapeladas.find(e => e.id === saborEmpapelado)

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

  const cambiarSimple = (id, delta) => {
    setCantSimples(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))
  }

  const agregarSimple = (m) => {
    const cantidad = cantSimples[m.id] || 0
    if (!cantidad) return
    agregarAlCarrito({
      tipo: 'milanesa', nombre: m.nombre, cantidad,
      precioKg: m.precioKg, precio: m.precioKg, necesitaHora: true,
      resumen: `Milanesa ${m.nombre} × ${cantidad} pz · $${m.precioKg}/kg`
    })
    setCantSimples(prev => ({ ...prev, [m.id]: 0 }))
    marcarAgregado(m.id)
  }

  const agregarEmpapelada = () => {
    if (!saborSeleccionado || !cantEmpapelada) return
    agregarAlCarrito({
      tipo: 'milanesa',
      nombre: `Empapelada ${saborSeleccionado.nombre}`,
      cantidad: cantEmpapelada,
      precioKg: saborSeleccionado.precioKg,
      precio: saborSeleccionado.precioKg,
      necesitaHora: true,
      resumen: `Milanesa empapelada ${saborSeleccionado.nombre} × ${cantEmpapelada} pz · $${saborSeleccionado.precioKg}/kg`
    })
    setSaborEmpapelado('')
    setCantEmpapelada(0)
    marcarAgregado('empapelada')
  }

  return (
    <div>
      <div className="seccion-titulo">Preparados y Milanesas</div>
      <p className="seccion-desc">Por pieza · precio por kg al pesar en el local</p>

      {/* Preparados */}
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

      {/* Milanesas simples */}
      <div className="subseccion-menu">
        <div className="config-label" style={{ marginBottom: 12 }}>Milanesas</div>
        {milaneasSimples.map(m => (
          <FilaProducto
            key={m.id} idKey={m.id}
            nombre={m.nombre} precio={m.precioKg}
            cantidad={cantSimples[m.id] || 0}
            onCambiar={d => cambiarSimple(m.id, d)}
            onAgregar={() => agregarSimple(m)}
            agregado={agregado}
          />
        ))}
      </div>

      {/* Milanesas empapeladas */}
      <div className="subseccion-menu">
        <div className="config-label" style={{ marginBottom: 12 }}>Milanesas Empapeladas · $135/kg</div>
        <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 12 }}>
          Elige el sabor y la cantidad de piezas
        </p>

        <select
          className="bowl-select"
          value={saborEmpapelado}
          onChange={e => { setSaborEmpapelado(e.target.value); setCantEmpapelada(0) }}
          style={{ marginBottom: 14 }}
        >
          <option value="">— Elige el sabor —</option>
          {saboresDisponibles.map(s => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>

        {saborSeleccionado && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="cantidad-ctrl">
              <button className="cantidad-btn" onClick={() => setCantEmpapelada(v => Math.max(0, v - 1))} disabled={!cantEmpapelada}>−</button>
              <span className="cantidad-num">{cantEmpapelada}</span>
              <button className="cantidad-btn" onClick={() => setCantEmpapelada(v => v + 1)}>+</button>
            </div>
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
    </div>
  )
}
