/* Póster del evento que se muestra al entrar a la tienda (ver Components/AvisoEvento.jsx).
   Para un evento nuevo: sube el póster a public/eventos/, cambia estos datos y usa un `id` distinto
   (así lo vuelven a ver quienes ya cerraron el anterior). Fuera de las fechas no se muestra nada.
   Para quitar el aviso antes de tiempo, pon `EVENTO_AVISO = null`. */
export const EVENTO_AVISO = {
  id: 'calabazar-2026',
  titulo: 'Calabazar 2026',
  imagen: `${import.meta.env.BASE_URL}eventos/calabazar-2026.jpg`,
  descripcion: 'Nos vemos en Calabazar 2026, de El Álamo Eventos. Sábado 24 y domingo 25 de octubre, de 12:00 pm a 9:00 pm.',
  desde: '2026-10-06T00:00:00-07:00',
  hasta: '2026-10-25T21:00:00-07:00',   // termina el domingo 25 a las 9:00 pm, hora de Los Mochis
}
