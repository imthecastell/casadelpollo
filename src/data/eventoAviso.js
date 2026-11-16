/* Póster del evento que se muestra al entrar a la tienda (ver Components/AvisoEvento.jsx).
   Para un evento nuevo: sube el póster a public/eventos/, cambia estos datos y usa un `id` distinto
   (así lo vuelven a ver quienes ya cerraron el anterior). Fuera de las fechas no se muestra nada.
   Para quitar el aviso antes de tiempo, pon `EVENTO_AVISO = null`. */
export const EVENTO_AVISO = {
  id: 'cenas-fin-de-anio-2026',
  titulo: 'Cenas de fin de año · Casa del Pollo',
  imagen: `${import.meta.env.BASE_URL}eventos/cenas-fin-de-anio-2026.webp`,
  descripcion: 'Cenas de fin de año de Casa del Pollo: paquetes listos para cocinar y servir, para 5 a 6 y 10 a 12 personas, desde $160 por persona. Disponible en todas las sucursales.',
  enlace: `${import.meta.env.BASE_URL}cenas`,   // opcional: al tocar el póster abre esta página. Sin `enlace`, el aviso solo informa.
  desde: '2026-11-16T00:00:00-07:00',
  hasta: '2026-12-21T23:59:00-07:00',   // las reservas de las cenas llegan hasta el 21 de diciembre
}
