import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { SECCIONES } from '../data/menu.js'

export default function SeccionMilanesas() {
  const { agregarAlCarrito } = useApp()
  const seccion = SECCIONES.find(s => s.id === 'milanesas')
  const [cantidades, setCantidades] = useState({})
  const [cantEmpapeladas, setCantEmpapeladas] = useState({})
  const [agregado, setAgregado] = useState(null)

  const cambiar = (id, delta, esEmpapelada = false) => {
    if (esEmpapelada) {
      setCantEmpapeladas(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))
    } else {
      setCantidades(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))
    }
  }

  const handleAgregar = (producto, esEmpapelada = false) => {
    const cantidad = esEmpapelada ? cantEmpapeladas[producto.id] || 0 : cantidades[producto.id] || 0
    if (cantidad === 0) return
    agregarAlCarrito({
      tipo: 'milanesa',
      nombre: producto.nombre,
      cantidad,
      precioKg: producto.precioKg,
      necesitaHora: true,
      resumen: `Milanesa ${producto.nombre} × ${cantidad} pz · $${producto.precioKg}/kg`
    })
    if (esEmpapelada) {
      setCantEmpapeladas(prev => ({ ...prev, [producto.id]: 0 }))
    } else {
      setCantidades(prev => ({ ...prev, [producto.id]: 0 }))
    }
    setAgregado(producto.id)
    setTimeout(() => setAgregado(null), 1200)
  }

  return (
    <div>
      <div className="seccion-titulo">{seccion.emoji} {seccion.nombre}</div>
      <p className="seccion-desc">Por pieza · precio por kg al pesar en el local</p>

      {seccion.subcategorias.map(p => (
        <div key={p.id} className="producto-row">
          <div className="producto-info">
            <div className="producto-nombre">{p.nombre}</div>
            <div className="producto-precio">${p.precioKg}/kg</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontSize: 11, color: 'var(--texto-suave)', fontWeight: 500 }}>piezas</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="cantidad-ctrl">
                <button className="cantidad-btn" onClick={() => cambiar(p.id, -1)} disabled={!cantidades[p.id]}>−</button>
                <span className="cantidad-num">{cantidades[p.id] || 0}</span>
                <button className="cantidad-btn" onClick={() => cambiar(p.id, 1)}>+</button>
              </div>
              {(cantidades[p.id] || 0) > 0 && (
                <button
                  className={`btn-primario ${agregado === p.id ? 'btn-agregado' : ''}`}
                  style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                  onClick={() => handleAgregar(p)}
                >
                  {agregado === p.id ? '✓' : 'Agregar'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <div style={{ background: 'var(--crema-oscura)', borderRadius: 'var(--radio)', padding: '14px 16px', marginTop: 8 }}>
        <div className="config-label" style={{ marginBottom: 12 }}>Empapeladas — elige sabor y cantidad</div>
        {seccion.empapeladas.map(p => (
          <div key={p.id} className="producto-row" style={{ marginBottom: 8, background: 'var(--blanco)' }}>
            <div className="producto-info">
              <div className="producto-nombre">{p.nombre}</div>
              <div className="producto-precio">${p.precioKg}/kg</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--texto-suave)', fontWeight: 500 }}>piezas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="cantidad-ctrl">
                  <button className="cantidad-btn" onClick={() => cambiar(p.id, -1, true)} disabled={!cantEmpapeladas[p.id]}>−</button>
                  <span className="cantidad-num">{cantEmpapeladas[p.id] || 0}</span>
                  <button className="cantidad-btn" onClick={() => cambiar(p.id, 1, true)}>+</button>
                </div>
                {(cantEmpapeladas[p.id] || 0) > 0 && (
                  <button
                    className={`btn-primario ${agregado === p.id ? 'btn-agregado' : ''}`}
                    style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                    onClick={() => handleAgregar(p, true)}
                  >
                    {agregado === p.id ? '✓' : 'Agregar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}