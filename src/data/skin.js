/* Skins de temporada de la tienda: decoración (stickers, papel picado, colores) que se enciende sola
   entre dos fechas y se apaga sin tocar código cuando pasan. Los adornos están en public/skins/<id>/.

   - `auto: true` la activa para todos los clientes dentro de su ventana de fechas.
   - Para probarla en cualquier momento: agregar ?skin=<id> al enlace de la tienda (queda recordada en esa pestaña).
     ?skin=off la apaga en esa pestaña, aunque esté en su ventana de fechas. */
const SKINS = [
  { id: 'muertos', desde: '2026-10-29', hasta: '2026-11-03', auto: false },
]

const LLAVE = 'cdp_skin'

const hoy = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function skinActivo() {
  let forzado = null
  try {
    const q = new URLSearchParams(window.location.search).get('skin')
    if (q) sessionStorage.setItem(LLAVE, q)
    forzado = sessionStorage.getItem(LLAVE)
  } catch { /* sin almacenamiento: solo cuenta el enlace */ }
  if (forzado === 'off') return null
  if (forzado && SKINS.some(s => s.id === forzado)) return forzado
  const f = hoy()
  return SKINS.find(s => s.auto && f >= s.desde && f <= s.hasta)?.id || null
}
