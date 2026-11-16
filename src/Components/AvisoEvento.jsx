import { useEffect, useRef, useState } from 'react'
import { EVENTO_AVISO } from '../data/eventoAviso.js'

/* Aviso de un evento próximo: el póster en una ventana al entrar a la tienda, una sola vez al día
   en este dispositivo, con un botón "Cerrar" grande debajo. Por defecto solo informa: no redirige ni
   tiene enlaces ni botones pequeños. Si EVENTO_AVISO trae `enlace`, el póster entero es un enlace a esa
   página (para pósters que traen su propio botón dibujado). También se cierra tocando fuera del póster
   o con Escape.
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
        {EVENTO_AVISO.enlace
          ? <a className="v2-evento-enlace" href={EVENTO_AVISO.enlace}><img className="v2-evento-poster" src={EVENTO_AVISO.imagen} alt={EVENTO_AVISO.descripcion} /></a>
          : <img className="v2-evento-poster" src={EVENTO_AVISO.imagen} alt={EVENTO_AVISO.descripcion} />}
        <button ref={botonRef} type="button" className="v2-evento-cerrar" onClick={() => setAbierto(false)}>Cerrar</button>
      </div>
    </div>
  )
}
