/* Horario de una sucursal (la lista que devuelve /api/schedule/:id). Lo usan el pie de la
   tienda y la página de Links. */
const DIAS_JS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const NOMBRE_DIA_LARGO = { lunes: 'el lunes', martes: 'el martes', miercoles: 'el miércoles', jueves: 'el jueves', viernes: 'el viernes', sabado: 'el sábado', domingo: 'el domingo' }

const minutos = (hhmm) => { const [h, m] = (hhmm || '0:0').split(':').map(Number); return h * 60 + (m || 0) }

export function hora12(hhmm) {
  const [h, m] = (hhmm || '0:0').split(':').map(Number)
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

// "Abierto hasta las 8:00 PM" / "Cerrado. Abre hoy a las 10:00 AM" / "Cerrado. Abre mañana a las 10:00 AM"
export function estadoHorario(schedule, ahora = new Date()) {
  if (!Array.isArray(schedule) || schedule.length === 0) return null
  const porDia = Object.fromEntries(schedule.map(d => [d.dia, d]))
  const i = ahora.getDay(), min = ahora.getHours() * 60 + ahora.getMinutes()
  const hoy = porDia[DIAS_JS[i]]
  if (hoy?.activo) {
    if (min >= minutos(hoy.apertura) && min < minutos(hoy.cierre)) return { abierto: true, texto: `Abierto hasta las ${hora12(hoy.cierre)}` }
    if (min < minutos(hoy.apertura)) return { abierto: false, texto: `Cerrado. Abre hoy a las ${hora12(hoy.apertura)}` }
  }
  for (let k = 1; k <= 7; k++) {
    const dia = DIAS_JS[(i + k) % 7], d = porDia[dia]
    if (d?.activo) return { abierto: false, texto: `Cerrado. Abre ${k === 1 ? 'mañana' : NOMBRE_DIA_LARGO[dia]} a las ${hora12(d.apertura)}` }
  }
  return { abierto: false, texto: 'Cerrado' }
}
