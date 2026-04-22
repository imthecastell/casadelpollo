import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

export default function SeccionFresco() {
  const { agregarAlCarrito, productos } = useApp()
  const [cantidades, setCantidades] = useState({})
  const [agregado, setAgregado] = useState(null)

  const productosSeccion = productos.filter(
    p => p.category_name === 'Pollo Fresco' && p.available !== false
  )

  const cambiar = (id, delta) => {
    setCantidades(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }))
  }

  const handleAgregar = (producto) => {
    const cantidad = cantidades[producto.id] || 0
    if (cantidad === 0) return
    agregarAlCarrito({
      tipo: 'pieza',
      nombre: producto.name,
      cantidad,
      precioKg: producto.price,
      precio: producto.price,
      resumen: `${producto.name} × ${cantidad} pz · $${producto.price}/kg (se pesa al entregar)`
    })
    setCantidades(prev => ({ ...prev, [producto.id]: 0 }))
    setAgregado(producto.id)
    setTimeout(() => setAgregado(null), 1200)
  }

  return (
    <div>
      <div className="seccion-titulo">🐔 Pollo Fresco</div>
      <p className="seccion-desc">Precio por kg · se cobra al pesar en el local</p>
      {productosSeccion.map(p => (
        <div key={p.id} className="producto-row">
          <div className="producto-info">
            <div className="producto-nombre">{p.name}</div>
            <div className="producto-precio">${p.price}/kg</div>
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
    </div>
  )
}