import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import SemaforoCupo from '../Components/SemaforoCupo.jsx'
import LogoSlot from '../Components/LogoSlot.jsx'

function calcularLugaresBowls(carrito) {
  const numBowls = carrito.filter(i => i.tipo === 'bowl').length
  return Math.ceil(numBowls / 2)
}

function soloDigitos(valor) {
  return valor.replace(/\D/g, '').slice(0, 10)
}

function formatearTelefono(valor) {
  const digitos = soloDigitos(valor)
  return [
    digitos.slice(0, 3),
    digitos.slice(3, 6),
    digitos.slice(6, 10),
  ].filter(Boolean).join(' ')
}

function minutosDeHora(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function precioItem(item) {
  const tipo = item.precio_tipo || item.tipo
  if (tipo === 'pieza' || tipo === 'al_pesar') return 'Al pesar'
  if (tipo === 'preparado' || tipo === 'milanesa' || tipo === 'por_pieza') {
    return `$${parseFloat(item.precio || item.precioKg || 0).toFixed(2)}/kg`
  }
  const precio = parseFloat(item.precioTotal || item.precio || item.price || 0)
  return precio > 0 ? `$${precio.toFixed(2)}` : 'Al pesar'
}

export default function Carrito() {
  const { carrito, eliminarDelCarrito, confirmarPedido, setVista, slots, totalItems, diseno } = useApp()
  const [horaSeleccionada, setHoraSeleccionada] = useState(null)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  const lugaresBowls = calcularLugaresBowls(carrito)
  const telefonoDigitos = soloDigitos(telefono)
  const tiempoPreparacionPedido = Math.max(30, ...carrito.map(item => parseInt(item.tiempoEstimado || 0)))
  const ahora = new Date()
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes()

  const slotsDisponibles = slots.filter(s => {
    const lugaresLibres = s.capacidadTotal - s.ordenesReservadas
    return lugaresLibres >= Math.max(lugaresBowls, 1) && minutosDeHora(s.hora) >= minutosActuales + tiempoPreparacionPedido
  })

  const puedeConfirmar = nombre.trim().length > 0 && telefonoDigitos.length === 10 && horaSeleccionada

  const totalEstimado = carrito.reduce((sum, item) => {
    if (item.tipo === 'pieza' || item.tipo === 'preparado' || item.tipo === 'milanesa') return sum
    return sum + parseFloat(item.precioTotal || item.precio || item.price || 0)
  }, 0)

  const tieneItemsPorKg = carrito.some(i => i.tipo === 'pieza' || i.tipo === 'preparado' || i.tipo === 'milanesa')

  const handleConfirmar = () => {
    if (!puedeConfirmar) return
    setConfirmando(true)
    setTimeout(() => {
      confirmarPedido(horaSeleccionada, { nombre, telefono: telefonoDigitos, notas })
    }, 800)
  }

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="header-inner" style={{ position: 'relative' }}>
          <button
            onClick={() => setVista('menu')}
            style={{ background: 'none', border: 'none', color: 'var(--rojo)', fontSize: 14, fontFamily: 'var(--font-body), sans-serif', cursor: 'pointer', fontWeight: 600 }}
          >
            ← Seguir pidiendo
          </button>

          {/* Icon centrado — fondo de header es var(--rojo) */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
            <LogoSlot
              type="icon"
              src={diseno?.logo_icon_url}
              mode={diseno?.logo_color_mode}
              customFilter={diseno?.logo_custom_filter}
              width={30} height={30}
              placeholderStyle={{ border: '1.5px dashed rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.1)' }}
            />
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rojo)', fontFamily: 'var(--font-body), sans-serif' }}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </div>
        </div>
      </header>

      <div className="pagina">
        {carrito.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
            <div style={{ fontFamily: 'var(--font-title), sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--texto)', marginBottom: 8 }}>Tu pedido está vacío</div>
            <p style={{ fontSize: 14, color: 'var(--texto-suave)', marginBottom: 24 }}>Agrega productos desde el menú</p>
            <button className="btn-primario" style={{ width: 'auto', padding: '12px 24px' }} onClick={() => setVista('menu')}>
              Ver menú
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {carrito.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card-bg)', borderRadius: 'var(--radio)', padding: '14px 16px', boxShadow: 'var(--sombra)' }}>
                  {(item.imagen_url || item.imagen_referencia) ? (
                    <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, overflow: 'hidden', background: 'var(--crema-oscura)' }}>
                      <img
                        src={item.imagen_url || item.imagen_referencia}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize: 22, flexShrink: 0, width: 44, height: 44, background: 'var(--crema-oscura)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.tipo === 'bowl' ? '🥗' : item.tipo === 'marinado' ? '🍯' : item.tipo === 'complemento' ? '🫙' : '🍗'}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--texto)', lineHeight: 1.4 }}>{item.resumen}</div>
                    {item.tiempoEstimado && (
                      <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 3 }}>~{item.tiempoEstimado} min</div>
                    )}
                    <div style={{ fontSize: 13, color: item.tipo === 'pieza' ? 'var(--texto-suave)' : 'var(--rojo)', marginTop: 4, fontWeight: 700 }}>
                      {precioItem(item)}
                    </div>
                  </div>
                  <button onClick={() => eliminarDelCarrito(item.id)} style={{ background: 'none', border: 'none', color: 'var(--gris)', fontSize: 16, cursor: 'pointer', padding: 4, borderRadius: '50%', flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radio-lg)', padding: '18px', boxShadow: 'var(--sombra)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="config-label">Tu nombre</label>
                <input
                  type="text"
                  placeholder="A nombre de quien es el pedido?"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gris)', borderRadius: 'var(--radio)', fontFamily: 'var(--font-body), sans-serif', fontSize: 14, color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                />
              </div>
              <div>
                <label className="config-label">Numero de contacto</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="668 815 1425"
                  value={telefono}
                  onChange={e => setTelefono(formatearTelefono(e.target.value))}
                  maxLength={12}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gris)', borderRadius: 'var(--radio)', fontFamily: 'var(--font-body), sans-serif', fontSize: 14, color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                />
                {telefono && telefonoDigitos.length < 10 && (
                  <div style={{ fontSize: 12, color: 'var(--rojo)', marginTop: 6 }}>Escribe los 10 digitos del telefono.</div>
                )}
              </div>
              <div>
                <label className="config-label">Notas especiales</label>
                <textarea
                  placeholder='Ej: "Quitar la piel y partir el pollo" o "Partir la pechuga en 6 partes"'
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gris)', borderRadius: 'var(--radio)', fontFamily: 'var(--font-body), sans-serif', fontSize: 14, color: 'var(--texto)', background: 'var(--crema)', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>

            <SemaforoCupo />

            <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radio-lg)', padding: '18px', boxShadow: 'var(--sombra)', marginBottom: 16 }}>
              <label className="config-label">Hora de recogida</label>
              {slotsDisponibles.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--rojo)' }}>No hay horarios disponibles con el tiempo de preparacion requerido.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {slotsDisponibles.map(s => (
                    <button
                      key={s.hora}
                      onClick={() => setHoraSeleccionada(s.hora)}
                      style={{ padding: '10px 6px', border: `2px solid ${horaSeleccionada === s.hora ? 'var(--rojo)' : 'var(--gris)'}`, borderRadius: 'var(--radio)', background: horaSeleccionada === s.hora ? '#fff5f5' : 'var(--crema)', color: horaSeleccionada === s.hora ? 'var(--rojo)' : 'var(--texto)', fontFamily: 'var(--font-title), sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
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
                <span style={{ fontFamily: 'var(--font-title), sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--rojo)' }}>{horaSeleccionada}</span>
              </div>
            )}

            <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radio)', padding: '14px 16px', boxShadow: 'var(--sombra)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--texto-suave)', marginBottom: 6 }}>
                <span>Total de items</span>
                <span style={{ fontWeight: 600, color: 'var(--texto)' }}>{totalItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: 'var(--texto)' }}>Total estimado</span>
                <span style={{ fontWeight: 800, color: 'var(--rojo)', fontFamily: 'var(--font-title), sans-serif' }}>
                  ${totalEstimado.toFixed(2)}
                </span>
              </div>
              {tieneItemsPorKg && (
                <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginBottom: 6 }}>
                  Los productos por kg se confirman al pesar en tienda.
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--texto-suave)' }}>
                <span>Pago</span>
                <span style={{ fontWeight: 600, color: 'var(--texto)' }}>En el local</span>
              </div>
            </div>

            {!puedeConfirmar && (
              <div style={{ fontSize: 12, color: 'var(--texto-suave)', textAlign: 'center', marginBottom: 10 }}>
                {!nombre.trim() ? 'Escribe tu nombre · ' : ''}
                {telefonoDigitos.length !== 10 ? 'Escribe tu telefono a 10 digitos · ' : ''}
                {!horaSeleccionada ? 'Elige una hora de recogida' : ''}
              </div>
            )}

            <button
              className={`btn-primario ${confirmando ? 'btn-agregado' : ''}`}
              onClick={handleConfirmar}
              disabled={!puedeConfirmar || confirmando}
            >
              {confirmando ? 'Enviando pedido...' : 'Confirmar pedido →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
