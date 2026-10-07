import { useEffect, useRef, useState } from 'react'
import { EVENTO_AVISO } from '../data/eventoAviso.js'

/* Aviso de un evento próximo: el póster en una ventana al entrar a la tienda, una sola vez al día
   en este dispositivo, con un botón "Cerrar" grande debajo. Solo informa: no redirige, no tiene
   enlaces ni botones pequeños, y también se cierra tocando fuera del póster o con Escape.
   Desaparece solo al terminar el evento (EVENTO_AVISO.hasta). */

const CLAVE = 'cdp_aviso_evento'
const hoyLocal = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mazatlan' })  // AAAA-MM-DD

function debeMostrar() {
  const e = EVENTO_AVISO
  if (!e || Date.now() > new Date(e.hasta).getTime() || Date.now() < new Date(e.desde).getTime()) return false
  try {
    const visto = JSON.parse(localStorage.getItem(CLAVE) || 'null')
    return !(visto && visto.id === e.id && visto.fecha === hoyLocal())
  } catch {
    return true   // sin almacenamiento: se muestra, pero solo en esta carga
  }
}

export default function AvisoEvento() {
  const [abierto, setAbierto] = useState(() => debeMostrar())
  const botonRef = useRef(null)

  // Se marca como visto en cuanto aparece, para que recargar la página no lo repita el mismo día.
  useEffect(() => {
    if (!abierto) return
    try { localStorage.setItem(CLAVE, JSON.stringify({ id: EVENTO_AVISO.id, fecha: hoyLocal() })) } catch { /* sin almacenamiento */ }
    botonRef.current?.focus()
  }, [abierto])

  useEffect(() => {
    if (!abierto) return undefined
    const alTeclear = (e) => { if (e.key === 'Escape') setAbierto(false) }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto])

  if (!abierto) return null

  return (
    <div className="v2-evento-fondo" onClick={() => setAbierto(false)}>
      <div className="v2-evento" role="dialog" aria-modal="true" aria-label={EVENTO_AVISO.titulo} onClick={e => e.stopPropagation()}>
        <img className="v2-evento-poster" src={EVENTO_AVISO.imagen} alt={EVENTO_AVISO.descripcion} />
        <button ref={botonRef} type="button" className="v2-evento-cerrar" onClick={() => setAbierto(false)}>Cerrar</button>
      </div>
    </div>
  )
}
