/* Póster del evento que se muestra al entrar a la tienda (ver Components/AvisoEvento.jsx).
   Para un evento nuevo: sube el póster a public/eventos/, cambia estos datos y usa un `id` distinto
   (así lo vuelven a ver quienes ya cerraron el anterior). Fuera de las fechas no se muestra nada.
   Para quitar el aviso antes de tiempo, pon `EVENTO_AVISO = null`. */
export const EVENTO_AVISO = {
  id: 'cenas-fin-de-anio-2026-poster2',   // póster nuevo (21 nov): id distinto para que lo vean también quienes cerraron el anterior
  titulo: 'Cenas de fin de año · Casa del Pollo',
  imagen: `${import.meta.env.BASE_URL}eventos/cenas-fin-de-anio-2026-poster2.webp`,
  descripcion: 'Cenas de fin de año de Casa del Pollo: reserva tu cena para eventos, posadas, Navidad y Año Nuevo. Disponible en todas nuestras sucursales. Toca el póster para ver el menú y reservar.',
  enlace: `${import.meta.env.BASE_URL}cenas`,   // opcional: al tocar el póster abre esta página. Sin `enlace`, el aviso solo informa.
  desde: '2026-11-16T00:00:00-07:00',
  hasta: '2026-12-21T23:59:00-07:00',   // las reservas de las cenas llegan hasta el 21 de diciembre
}
