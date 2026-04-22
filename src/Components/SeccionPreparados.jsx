import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

export default function SeccionPreparados() {
  const { agregarAlCarrito, productos } = useApp()
  const [cantidades, setCantidades] = useState({})
  const [agregado, setAgregado] = useState(null)

  const productosSeccion = productos.filter(
    p => p.category_name === 'Preparados' && p.available !== false
  )

  const esAlbondiga = (nombre) => nombre.toLowerCase().includes('albóndiga') || nombre.toLowerCase().includes('albondiga')

  const cambiar = (id, nombre, delta) => {
    const paso = esAlbondiga(nombre) ? 10 : 1
    setCantidades(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta * paso)
    }))
  }

  const handleAgregar = (producto) => {
    const cantidad = cantidades[producto.id] || 0
    if (cantidad === 0) return
    const unidad = esAlbondiga(producto.name) ? 'pz (charola de 20)' : 'pz'
    agregarAlCarrito({
      tipo: 'preparado',
      nombre: producto.name,
      cantidad,
      precioKg: producto.price,
      precio: producto.price,
      necesitaHora: true,
      resumen: `${producto.name} × ${cantidad} ${unidad} · $${producto.price}/kg`
    })
    setCantidades(prev => ({ ...prev, [producto.id]: 0 }))
    setAgregado(producto.id)
    setTimeout(() => setAgregado(null), 1200)
  }

  return (
    <div>
      <div className="seccion-titulo">🍽️ Preparados</div>
      <p className="seccion-desc">Por pieza · precio por kg al pesar en el local</p>

      {productosSeccion.map(p => (
        <div key={p.id} className="producto-row">
          <div className="producto-info">
            <div className="producto-nombre">{p.name}</div>
            <div className="producto-precio">
              ${p.price}/kg
              {esAlbondiga(p.name) && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--rojo)' }}>· intervalos de 10 pz</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontSize: 11, color: 'var(--texto-suave)', fontWeight: 500 }}>piezas</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="cantidad-ctrl">
                <button className="cantidad-btn" onClick={() => cambiar(p.id, p.name, -1)} disabled={!cantidades[p.id]}>−</button>
                <span className="cantidad-num">{cantidades[p.id] || 0}</span>
                <button className="cantidad-btn" onClick={() => cambiar(p.id, p.name, 1)}>+</button>
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