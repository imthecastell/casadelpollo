import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { cookedCrop } from './SeccionMarinados.jsx'

export default function SeccionFresco() {
  const { agregarAlCarrito, productos } = useApp()
  const [cantidades, setCantidades] = useState({})
  const [agregado, setAgregado] = useState(null)

  const productosSeccion = productos.filter(
    p => p.category_name === 'Pollo Fresco' && p.available !== false
  )

  const cambiar = (id, delta) => {
    setCantidades(prev => {
      const actual = prev[id] || 0
      if (delta < 0 && actual <= 1) return { ...prev, [id]: 0 }
      return { ...prev, [id]: actual === 0 ? 1 : Math.max(0, actual + delta) }
    })
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
      <div className="seccion-titulo">🍗 Pollo Fresco</div>
      <p className="seccion-desc">Precio por kg · se cobra al pesar en el local</p>
      {productosSeccion.map(p => {
        const cantidad = cantidades[p.id] || 0
        const thumb = p.image_cooked_url || (p.image_url ? cookedCrop(p.image_url) : null)
        return (
          <div key={p.id} className="producto-row">
            {thumb
              ? <img className="producto-img" src={thumb} alt="" />
              : <div className="producto-img-placeholder">🍗</div>
            }
            <div className="producto-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="producto-nombre">{p.name}</div>
              <div className="producto-precio">${p.price}/kg</div>
            </div>
            {cantidad === 0 ? (
              <button className="btn-add" onClick={() => cambiar(p.id, 1)}>+</button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="qty-pill">
                  <button className="qty-pill-btn" onClick={() => cambiar(p.id, -1)} disabled={cantidad <= 1}>−</button>
                  <span className="qty-pill-num">{cantidad}</span>
                  <button className="qty-pill-btn" onClick={() => cambiar(p.id, 1)}>+</button>
                </div>
                <button
                  className={`btn-confirm ${agregado === p.id ? 'confirmado' : ''}`}
                  onClick={() => handleAgregar(p)}
                >
                  {agregado === p.id ? '✓' : 'Agregar'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
