import { AIRFRYER_CONFIG } from './menu.js'

const DIAS_ES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

export function generarSlots(fecha, schedule = null) {
  const dia = new Date(fecha).getDay()
  const nombreDia = DIAS_ES[dia]

  const horarioDia = schedule?.find(h => h.dia === nombreDia)

  if (horarioDia && !horarioDia.activo) return []
  if (!horarioDia && dia === 0) return []

  const apertura = horarioDia?.apertura?.slice(0, 5) || '10:00'
  const cierre = horarioDia?.cierre?.slice(0, 5) || (dia === 6 ? '18:00' : '20:00')

  const slots = []
  const [hAp, mAp] = apertura.split(':').map(Number)
  const [hCi, mCi] = cierre.split(':').map(Number)

  const ahora = new Date()
  const horaActual = ahora.getHours()
  const minutoActual = ahora.getMinutes()
  const minutosActuales = horaActual * 60 + minutoActual

  let hora = hAp
  let minuto = mAp

  while (hora < hCi || (hora === hCi && minuto <= mCi)) {
    const label = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`
    const minutosSlot = hora * 60 + minuto

    // Solo agregar slots que sean al menos 30 minutos en el futuro
    if (minutosSlot >= minutosActuales + 30) {
      slots.push({
        hora: label,
        capacidadTotal: AIRFRYER_CONFIG.slotsCapacidad,
        ordenesReservadas: 0,
        disponible: true,
      })
    }

    minuto += AIRFRYER_CONFIG.intervaloMinutos
    if (minuto >= 60) {
      minuto -= 60
      hora += 1
    }
  }

  return slots
}

export function slotDisponible(slots, horaEntrega) {
  const slot = slots.find(s => s.hora === horaEntrega)
  if (!slot) return false
  return slot.ordenesReservadas < slot.capacidadTotal
}

export function reservarSlot(slots, horaEntrega) {
  return slots.map(s => {
    if (s.hora !== horaEntrega) return s
    const nuevasOrdenes = s.ordenesReservadas + 1
    return {
      ...s,
      ordenesReservadas: nuevasOrdenes,
      disponible: nuevasOrdenes < s.capacidadTotal,
    }
  })
}

export function horaPreparacion(horaEntrega) {
  const [h, m] = horaEntrega.split(':').map(Number)
  const totalMinutos = h * 60 + m - 30
  const hPrep = Math.floor(totalMinutos / 60)
  const mPrep = totalMinutos % 60
  return `${String(hPrep).padStart(2, '0')}:${String(mPrep).padStart(2, '0')}`
}