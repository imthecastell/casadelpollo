import { API_URL } from './vacantes.js'

/* Medición anónima de la página /cenas: cuántas visitas tiene y cuántas veces se consultó el
   precio de cada platillo. No se manda nombre, teléfono ni nada que identifique a la persona:
   solo el tipo de evento y el id del platillo.

   Está APAGADA (`activa: false`) porque todavía no existe dónde guardar los datos: hace falta un
   endpoint en el backend (POST /api/cenas/eventos) y una vista en el admin. Cuando existan, basta
   con poner `activa: true`; la página ya llama a `registrarEvento` en los lugares correctos. */
export const MEDICION = { activa: false }

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
