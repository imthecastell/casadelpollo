import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

function calcularLugaresBowls(carrito) {
  const numBowls = carrito.filter(i => i.tipo === 'bowl').length
  return Math.ceil(numBowls / 2)
}

export default function Carrito() {
  const { carrito, eliminarDelCarrito, confirmarPedido, setVista, slots, totalItems } = useApp()
  const [horaSeleccionada, setHoraSeleccionada] = useState(null)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const lugaresBowls = calcularLugaresBowls(carrito)

  const slotsDisponibles = slots.filter(s => {
    const lugaresLibres = s.capacidadTotal - s.ordenesReservadas
    return lugaresLibres >= Math.max(lugaresBowls, 1)
  })

  const puedeConfirmar = nombre.trim().length > 0 && telefono.trim().length > 0 && horaSeleccionada

  const totalEstimado = carrito.reduce((sum, item) => {
  if (item.tipo === 'pieza' || item.tipo === 'preparado') return sum
  const precio = parseFloat(item.precioTotal || item.precio || item.price || 0)
  const cantidad = parseInt(item.cantidad || 1)
  return sum + (precio * cantidad)
}, 0)

const tieneItemsPorKg = carrito.some(i => i.tipo === 'pieza' || i.tipo === 'preparado')

  const handleConfirmar = () => {
    if (!puedeConfirmar) return
    setConfirmando(true)
    setTimeout(() => {
      confirmarPedido(horaSeleccionada, { nombre, telefono, notas })
    }, 800)
  }

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="header-inner">
          <button
            onClick={() => setVista('menu')}
            style={{ background: 'none', border: 'none', color: 'var(--dorado-claro)', fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', fontWeight: 500 }}
          >
            ← Seguir pidiendo
          </button>
          <div className="logo-nombre" style={{ fontSize: 16 }}>
            Tu pedido ({totalItems})
          </div>
        </div>
      </header>

      <div className="pagina">
        {carrito.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--texto-suave)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <p style={{ marginBottom: 20 }}>Tu pedido esta vacio</p>
            <button className="btn-primario" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => setVista('menu')}>
              Ver menu
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {carrito.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--blanco)', borderRadius: 'var(--radio)', padding: '14px 16px', boxShadow: 'var(--sombra)' }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>
                    {item.tipo === 'bowl' ? '🥣' : item.tipo === 'marinado' ? '🍯' : item.tipo === 'complemento' ? '🥗' : '🍗'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--texto)', lineHeight: 1.4 }}>{item.resumen}</div>
                    {item.tiempoEstimado && (
                      <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 3 }}>⏱ ~{item.tiempoEstimado} min</div>
                    )}
                  </div>
                  <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'none', border: 'none', color: 'var(--gris)', fontSize: 16, cursor: 'pointer', padding: 4, borderRadius: '50%', flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--blanco)', borderRadius: 'var(--radio-lg)', padding: '18px', boxShadow: 'var(--sombra)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="config-label">Tu nombre</label>
                <input
                  type="text"
                  placeholder="¿A nombre de quien es el pedido?"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gris)', borderRadius: 'var(--radio)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                />
              </div>
              <div>
                <label className="config-label">Numero de contacto</label>
                <input
                  type="tel"
                  placeholder="Tu numero de WhatsApp o telefono"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gris)', borderRadius: 'var(--radio)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                />
              </div>
              <div>
                <label className="config-label">Notas especiales</label>
                <textarea
                  placeholder='Ej: "Quitar la piel y partir el pollo" o "Partir la pechuga en 6 partes"'
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gris)', borderRadius: 'var(--radio)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--texto)', background: 'var(--crema)', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ background: 'var(--blanco)', borderRadius: 'var(--radio-lg)', padding: '18px', boxShadow: 'var(--sombra)', marginBottom: 16 }}>
              <label className="config-label">Hora de recogida</label>
              {slotsDisponibles.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--rojo)' }}>No hay horarios disponibles.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {slotsDisponibles.map(s => (
                    <button
                      key={s.hora}
                      onClick={() => setHoraSeleccionada(s.hora)}
                      style={{ padding: '10px 6px', border: `2px solid ${horaSeleccionada === s.hora ? 'var(--rojo)' : 'var(--gris)'}`, borderRadius: 'var(--radio)', background: horaSeleccionada === s.hora ? '#fff5f5' : 'var(--crema)', color: horaSeleccionada === s.hora ? 'var(--rojo)' : 'var(--texto)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {s.hora}
                      <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--texto-suave)', marginTop: 2 }}>
                        {s.capacidadTotal - s.ordenesReservadas} lugar{s.capacidadTotal - s.ordenesReservadas !== 1 ? 'es' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {horaSeleccionada && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff5eb', border: '1.5px solid #e85d0433', borderRadius: 'var(--radio)', padding: '12px 16px', marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: 'var(--cafe-medio)' }}>Hora de recogida</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--rojo)' }}>{horaSeleccionada}</span>
              </div>
            )}

            <div style={{ background: 'var(--blanco)', borderRadius: 'var(--radio)', padding: '14px 16px', boxShadow: 'var(--sombra)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--texto-suave)', marginBottom: 6 }}>
                <span>Total de items</span>
                <span style={{ fontWeight: 600, color: 'var(--texto)' }}>{totalItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: 'var(--texto)' }}>Total estimado</span>
                <span style={{ fontWeight: 800, color: 'var(--rojo)', fontFamily: 'Syne, sans-serif' }}>
                  ${totalEstimado.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--texto-suave)' }}>
                <span>Pago</span>
                <span style={{ fontWeight: 600, color: 'var(--texto)' }}>En el local</span>
              </div>
            </div>

            {!puedeConfirmar && (
              <div style={{ fontSize: 12, color: 'var(--texto-suave)', textAlign: 'center', marginBottom: 10 }}>
                {!nombre.trim() ? 'Escribe tu nombre · ' : ''}
                {!telefono.trim() ? 'Escribe tu telefono · ' : ''}
                {!horaSeleccionada ? 'Elige una hora de recogida' : ''}
              </div>
            )}

            <button
              className={`btn-primario ${confirmando ? 'btn-agregado' : ''}`}
              onClick={handleConfirmar}
              disabled={!puedeConfirmar || confirmando}
            >
              {confirmando ? '✓ Enviando pedido...' : 'Confirmar pedido →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}