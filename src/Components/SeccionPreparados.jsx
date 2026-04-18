import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { SECCIONES } from '../data/menu.js'

export default function SeccionPreparados() {
  const { agregarAlCarrito, sucursalActiva } = useApp()
  const seccion = SECCIONES.find(s => s.id === 'preparados')
  const [cantidades, setCantidades] = useState({})
  const [agregado, setAgregado] = useState(null)

  const productos = seccion.productos.filter(
    p => p.disponible[sucursalActiva?.id]
  )

  const esAlbondiga = (id) => id === 'albondigas'

  const cambiar = (id, delta) => {
    const paso = esAlbondiga(id) ? 10 : 1
    setCantidades(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta * paso)
    }))
  }

  const handleAgregar = (producto) => {
    const cantidad = cantidades[producto.id] || 0
    if (cantidad === 0) return
    const unidad = esAlbondiga(producto.id) ? 'pz (charola de 20)' : 'pz'
    agregarAlCarrito({
      tipo: 'preparado',
      nombre: producto.nombre,
      cantidad,
      precioKg: producto.precioKg,
      necesitaHora: true,
      resumen: `${producto.nombre} × ${cantidad} ${unidad} · $${producto.precioKg}/kg`
    })
    setCantidades(prev => ({ ...prev, [producto.id]: 0 }))
    setAgregado(producto.id)
    setTimeout(() => setAgregado(null), 1200)
  }

  return (
    <div>
      <div className="seccion-titulo">{seccion.emoji} {seccion.nombre}</div>
      <p className="seccion-desc">Por pieza · precio por kg al pesar en el local</p>

      {productos.map(p => (
        <div key={p.id} className="producto-row">
          <div className="producto-info">
            <div className="producto-nombre">{p.nombre}</div>
            <div className="producto-precio">
              ${p.precioKg}/kg
              {esAlbondiga(p.id) && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--rojo)' }}>· intervalos de 10 pz</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontSize: 11, color: 'var(--texto-suave)', fontWeight: 500 }}>
              {esAlbondiga(p.id) ? 'piezas' : 'piezas'}
            </div>
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