const DIAS_ES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

/* Ventana de preparación dinámica: 20 min si todo el carrito es fresco
   (nada por cocinar), 40 min si hay al menos un producto que se cocina.
   `item.tiempoEstimado` ya lo marcan los componentes de producto — viene
   en null/undefined cuando el cliente elige "crudo" y con minutos cuando
   elige "cocinado" (o el producto siempre se cocina, como los bowls). */
export function ventanaPreparacion(carrito) {
  const tieneCocinados = carrito.some(item => item.tiempoEstimado != null && item.tiempoEstimado > 0)
  return tieneCocinados ? 40 : 20
}

/* Algunas sucursales cierran la cocina más temprano los sábados. Si la
   sucursal configuró ese horario especial (cocFinSabado) y hoy es sábado,
   se usa ese en vez del cierre de cocinados de siempre. */
export function obtenerCocFinEfectivo(cocFin, cocFinSabado) {
  const esSabado = new Date().getDay() === 6
  return (esSabado && cocFinSabado) ? cocFinSabado : cocFin
}

/* Horarios de recogida disponibles hoy: intervalos de 10 minutos a partir
   de ahora + la ventana de preparación del carrito, acotados al horario
   de apertura de la sucursal y, si el pedido lleva cocinados, al rango de
   cocción configurado para esa sucursal. */
export function generarHorariosDisponibles(carrito, schedule = null, cocInicio = null, cocFin = null, cocFinSabado = null) {
  const ahora = new Date()
  const nombreDia = DIAS_ES[ahora.getDay()]
  const horarioDia = schedule?.find(h => h.dia === nombreDia)

  if (horarioDia && !horarioDia.activo) return []

  const apertura = horarioDia?.apertura?.slice(0, 5) || '10:00'
  const cierre = horarioDia?.cierre?.slice(0, 5) || (ahora.getDay() === 6 ? '18:00' : '20:00')

  const ventana = ventanaPreparacion(carrito)
  const tieneCocinados = ventana === 40

  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes()
  const [hAp, mAp] = apertura.split(':').map(Number)
  const [hCi, mCi] = cierre.split(':').map(Number)
  const minutosApertura = hAp * 60 + mAp
  const minutosCierre = hCi * 60 + mCi

  // Primer horario disponible, redondeado hacia arriba al siguiente múltiplo de 10
  let minutosInicio = Math.ceil((minutosActuales + ventana) / 10) * 10
  if (minutosInicio < minutosApertura) minutosInicio = minutosApertura

  const cocFinEfectivo = obtenerCocFinEfectivo(cocFin, cocFinSabado)

  let minutosCocFin = null
  if (tieneCocinados && cocInicio && cocFinEfectivo) {
    const [hCoI, mCoI] = cocInicio.split(':').map(Number)
    const [hCoF, mCoF] = cocFinEfectivo.split(':').map(Number)
    const minutosCocIni = hCoI * 60 + mCoI
    minutosCocFin = hCoF * 60 + mCoF
    if (minutosInicio < minutosCocIni) minutosInicio = minutosCocIni
  }

  const horarios = []
  const limite = minutosCocFin != null ? Math.min(minutosCierre, minutosCocFin) : minutosCierre
  for (let m = minutosInicio; m <= limite; m += 10) {
    horarios.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return horarios
}
