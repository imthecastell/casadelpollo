import { useApp } from '../data/AppContext.jsx'

function minutosDeHora(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function calcularEstado(slots) {
  if (!slots || slots.length === 0) return null
  const ahora = new Date()
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes()

  // Slots de las próximas 2 horas
  const slotsCercanos = slots.filter(s => {
    const min = minutosDeHora(s.hora)
    return min >= minutosActuales && min <= minutosActuales + 120
  })

  if (slotsCercanos.length === 0) return null

  const totalCapacidad = slotsCercanos.reduce((sum, s) => sum + (s.capacidadTotal || 0), 0)
  const totalReservadas = slotsCercanos.reduce((sum, s) => sum + (s.ordenesReservadas || 0), 0)

  if (totalCapacidad === 0) return null

  const pct = totalReservadas / totalCapacidad
  const libres = totalCapacidad - totalReservadas

  if (pct < 0.5) return {
    semaforo: '🟢',
    label: 'Alta disponibilidad',
    sub: `${libres} lugar${libres !== 1 ? 'es' : ''} disponible${libres !== 1 ? 's' : ''} en las próximas 2 hrs`,
    bg: '#e8f5e9',
    border: '#4caf5044',
    textColor: '#1b5e20',
  }
  if (pct < 0.8) return {
    semaforo: '🟡',
    label: 'Disponibilidad limitada',
    sub: `${libres} lugar${libres !== 1 ? 'es' : ''} en las próximas 2 hrs · elige pronto`,
    bg: '#fff8e1',
    border: '#ff980044',
    textColor: '#e65100',
  }
  return {
    semaforo: '🔴',
    label: 'Cupo casi lleno',
    sub: libres > 0
      ? `Solo ${libres} lugar${libres !== 1 ? 'es' : ''} disponible${libres !== 1 ? 's' : ''} · date prisa`
      : 'Sin lugares disponibles en las próximas 2 hrs',
    bg: '#fff5f5',
    border: '#e85d0444',
    textColor: 'var(--rojo)',
  }
}

export default function SemaforoCupo() {
  const { slots } = useApp()
  const estado = calcularEstado(slots)

  if (!estado) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: estado.bg,
      border: `1.5px solid ${estado.border}`,
      borderRadius: 'var(--radio)',
      padding: '12px 16px',
      marginBottom: 12,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{estado.semaforo}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: estado.textColor }}>{estado.label}</div>
        <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 2 }}>{estado.sub}</div>
      </div>
    </div>
  )
}
