import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { SECCIONES } from '../data/menu.js'

export default function SeccionFresco() {
  const { agregarAlCarrito, sucursalActiva } = useApp()
  const seccion = SECCIONES.find(s => s.id === 'fresco')
  const [cantidades, setCantidades] = useState({})
  const [agregado, setAgregado] = useState(null)

  const productos = seccion.productos.filter(
    p => p.disponible[sucursalActiva?.id]
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
      nombre: producto.nombre,
      cantidad,
      precioKg: producto.precioKg,
      resumen: `${producto.nombre} × ${cantidad} pz · $${producto.precioKg}/kg (se pesa al entregar)`
    })
    setCantidades(prev => ({ ...prev, [producto.id]: 0 }))
    setAgregado(producto.id)
    setTimeout(() => setAgregado(null), 1200)
  }

  return (
    <div>
      <div className="seccion-titulo">{seccion.emoji} {seccion.nombre}</div>
      <p className="seccion-desc">Precio por kg · se cobra al pesar en el local</p>

      {productos.map(p => (
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
    </div>
  )
}