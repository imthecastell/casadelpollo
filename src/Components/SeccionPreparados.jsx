import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { MILANESAS } from '../data/menu.js'

export default function SeccionPreparados() {
  const { agregarAlCarrito, productos } = useApp()
  const [cantidades, setCantidades] = useState({})
  const [cantMilanesas, setCantMilanesas] = useState({})
  const [agregado, setAgregado] = useState(null)

  const productosSeccion = productos.filter(
    p => p.category_name === 'Preparados' && p.available !== false
  )

  const esAlbondiga = (nombre) => nombre.toLowerCase().includes('albondiga')
  const milanesas = [...MILANESAS.basicas, ...MILANESAS.empapeladas].filter(m => m.available !== false)

  const cambiar = (id, nombre, delta) => {
    const paso = esAlbondiga(nombre) ? 10 : 1
    setCantidades(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta * paso)
    }))
  }

  const cambiarMilanesa = (id, delta) => {
    setCantMilanesas(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
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
      resumen: `${producto.name} x ${cantidad} ${unidad} · $${producto.price}/kg`
    })
    setCantidades(prev => ({ ...prev, [producto.id]: 0 }))
    setAgregado(producto.id)
    setTimeout(() => setAgregado(null), 1200)
  }

  const handleAgregarMilanesa = (producto) => {
    const cantidad = cantMilanesas[producto.id] || 0
    if (cantidad === 0) return
    agregarAlCarrito({
      tipo: 'milanesa',
      nombre: producto.nombre,
      cantidad,
      precioKg: producto.precioKg,
      precio: producto.precioKg,
      necesitaHora: true,
      resumen: `Milanesa ${producto.nombre} x ${cantidad} pz · $${producto.precioKg}/kg`
    })
    setCantMilanesas(prev => ({ ...prev, [producto.id]: 0 }))
    setAgregado(producto.id)
    setTimeout(() => setAgregado(null), 1200)
  }

  return (
    <div>
      <div className="seccion-titulo">Preparados y Milanesas</div>
      <p className="seccion-desc">Por pieza · precio por kg al pesar en el local</p>

      <div className="subseccion-menu">
        <div className="config-label" style={{ marginBottom: 12 }}>Preparados</div>
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
                  <button className="cantidad-btn" onClick={() => cambiar(p.id, p.name, -1)} disabled={!cantidades[p.id]}>-</button>
                  <span className="cantidad-num">{cantidades[p.id] || 0}</span>
                  <button className="cantidad-btn" onClick={() => cambiar(p.id, p.name, 1)}>+</button>
                </div>
                {(cantidades[p.id] || 0) > 0 && (
                  <button
                    className={`btn-primario ${agregado === p.id ? 'btn-agregado' : ''}`}
                    style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                    onClick={() => handleAgregar(p)}
                  >
                    {agregado === p.id ? 'Agregado' : 'Agregar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="subseccion-menu">
        <div className="config-label" style={{ marginBottom: 12 }}>Milanesas</div>
        {milanesas.map(p => (
          <div key={p.id} className="producto-row">
            <div className="producto-info">
              <div className="producto-nombre">{p.nombre}</div>
              <div className="producto-precio">${p.precioKg}/kg</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--texto-suave)', fontWeight: 500 }}>piezas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="cantidad-ctrl">
                  <button className="cantidad-btn" onClick={() => cambiarMilanesa(p.id, -1)} disabled={!cantMilanesas[p.id]}>-</button>
                  <span className="cantidad-num">{cantMilanesas[p.id] || 0}</span>
                  <button className="cantidad-btn" onClick={() => cambiarMilanesa(p.id, 1)}>+</button>
                </div>
                {(cantMilanesas[p.id] || 0) > 0 && (
                  <button
                    className={`btn-primario ${agregado === p.id ? 'btn-agregado' : ''}`}
                    style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                    onClick={() => handleAgregarMilanesa(p)}
                  >
                    {agregado === p.id ? 'Agregado' : 'Agregar'}
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
