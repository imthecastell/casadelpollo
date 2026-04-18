import { AIRFRYER_CONFIG } from './menu.js'

export function generarSlots(fecha) {
  const dia = new Date(fecha).getDay()
  const esSabado = dia === 6
  const esDomingo = dia === 0

  if (esDomingo) return []

  const apertura = '10:00'
  const cierre = esSabado ? '15:00' : '15:30'

  const slots = []
  const [hAp, mAp] = apertura.split(':').map(Number)
  const [hCi, mCi] = cierre.split(':').map(Number)

  let hora = hAp
  let minuto = mAp

  while (hora < hCi || (hora === hCi && minuto <= mCi)) {
    const label = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`
    slots.push({
      hora: label,
      capacidadTotal: AIRFRYER_CONFIG.slotsCapacidad,
      ordenesReservadas: 0,
      disponible: true,
    })
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