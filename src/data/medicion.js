import { API_URL } from './vacantes.js'

/* Medición anónima de la página /cenas: cuántas visitas tiene y cuántas veces se consultó el
   precio de cada platillo. No se manda nombre, teléfono ni nada que identifique a la persona:
   solo el tipo de evento y el id del platillo.

   Los eventos se guardan en el backend (POST /api/cenas/eventos) y se ven en el admin, en
   «Cenas de fin de año». Si el endpoint aún no existe o falla, la petición se ignora en silencio
   y la página funciona igual. Para apagar la medición, pon `activa: false`. */
export const MEDICION = { activa: true }

const CLAVE_SESION = 'cdp-cenas-visita'

export function registrarEvento(tipo, producto = null) {
  if (!MEDICION.activa) return
  try {
    fetch(`${API_URL}/api/cenas/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, producto }),
      keepalive: true,
    }).catch(() => {})
  } catch { /* la medición nunca debe romper la página */ }
}

// Una visita por sesión del navegador (recargar no la cuenta otra vez).
export function registrarVisitaUnaVez() {
  try {
    if (sessionStorage.getItem(CLAVE_SESION)) return
    sessionStorage.setItem(CLAVE_SESION, '1')
  } catch { /* sin sessionStorage: se cuenta cada carga */ }
  registrarEvento('visita')
}
