import { useState, useEffect } from 'react'

/* Bolsa de trabajo: vacantes abiertas (públicas) y envío de postulaciones. */
export const API_URL = import.meta.env.VITE_API_URL || 'https://casadelpollo-backend.onrender.com'

// Una sola consulta compartida por el pie, la página de Links y la página de vacantes.
let consulta = null
export function cargarVacantes() {
  if (!consulta) {
    consulta = fetch(`${API_URL}/api/vacantes`)
      .then(r => (r.ok ? r.json() : []))
      .then(l => (Array.isArray(l) ? l : []))
      .catch(() => { consulta = null; return [] })
  }
  return consulta
}

// { vacantes, cargando } — vacantes es [] si no hay o si falla la conexión.
export function useVacantes() {
  const [estado, setEstado] = useState({ vacantes: [], cargando: true })
  useEffect(() => {
    let vigente = true
    cargarVacantes().then(vacantes => { if (vigente) setEstado({ vacantes, cargando: false }) })
    return () => { vigente = false }
  }, [])
  return estado
}

// Devuelve { ok: true } o { ok: false, error: 'texto para la persona' }.
export async function enviarPostulacion(vacanteId, datos) {
  try {
    const r = await fetch(`${API_URL}/api/vacantes/${vacanteId}/postular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })
    if (r.ok) return { ok: true }
    const d = await r.json().catch(() => ({}))
    return { ok: false, error: d.error || 'No pudimos enviar tu postulación. Inténtalo de nuevo.' }
  } catch {
    return { ok: false, error: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.' }
  }
}