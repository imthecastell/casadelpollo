import { useEffect, useRef, useState } from 'react'
import { guiaDe, guiaDisponible } from '../data/guiaCocina.js'
import { generarImagenGuia, guardarImagen, nombreArchivoGuia } from '../data/guiaImagen.js'
import '../styles/guiaCocina.css'

export { guiaDisponible }

/* Panel "¿Cómo cocinar?": elige método (sartén / horno / airfryer) → pasos → guardar como imagen. */
export function GuiaCocinaPanel({ producto, imagenUrl, onVolver }) {
  const guia = guiaDe(producto)
  const [metodoId, setMetodoId] = useState(null)
  const [estado, setEstado] = useState('idle') // idle | guardando | listo | error
  const imagen = useRef({ clave: null, blob: null, promesa: null })
  const metodo = guia.metodos.find(m => m.id === metodoId) || null

  // Deja la imagen lista en cuanto se elige el método, para que "Guardar" responda al instante
  // (el menú de compartir del celular exige que se abra dentro del toque del usuario).
  useEffect(() => {
    if (!metodo) return
    const clave = `${producto.id}-${metodo.id}`
    const promesa = generarImagenGuia({
      nombre: producto.name,
      metodo: metodo.nombre,
      resumen: metodo.resumen,
      pasos: metodo.pasos,
      notas: guia.notas,
      imagenUrl: imagenUrl || producto.image_cooked_url || producto.image_url || null,
    }).then(blob => {
      if (imagen.current.clave === clave) imagen.current.blob = blob
      return blob
    }).catch(() => null)
    imagen.current = { clave, blob: null, promesa }
  }, [producto.id, metodoId]) // eslint-disable-line react-hooks/exhaustive-deps

  const guardar = async () => {
    if (!metodo || estado === 'guardando') return
    const actual = imagen.current
    setEstado('guardando')
    const blob = actual.blob || await actual.promesa
    if (!blob) {
      setEstado('error')
      setTimeout(() => setEstado('idle'), 3000)
      return
    }
    const resultado = await guardarImagen(blob, nombreArchivoGuia(producto.name, metodo.id), `Cómo cocinar ${producto.name}`)
    if (resultado === 'cancelada') { setEstado('idle'); return }
    setEstado('listo')
    setTimeout(() => setEstado('idle'), 2500)
  }

  return (
    <div className="gc-panel">
      <div className="gc-head">
        <div className="gc-titulo">
          <span className="gc-kicker">Cómo cocinar</span>
          <span className="gc-nombre">{producto.name}</span>
        </div>
        <button type="button" className="gc-volver" onClick={onVolver}>Volver</button>
      </div>

      <div className="gc-tabs" role="tablist">
        {guia.metodos.map(m => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={m.id === metodoId}
            className={`gc-tab${m.id === metodoId ? ' on' : ''}`}
            onClick={() => setMetodoId(m.id)}
          >
            <span className="gc-tab-ico" aria-hidden="true">{m.icono}</span>
            {m.nombre}
          </button>
        ))}
      </div>

      {!metodo ? (
        <p className="gc-hint">Elige cómo lo vas a cocinar y te decimos paso a paso.</p>
      ) : (
        <div className="gc-detalle">
          {metodo.resumen && <div className="gc-resumen">{metodo.resumen}</div>}
          <ol className="gc-pasos">
            {metodo.pasos.map((paso, i) => <li key={i}>{paso}</li>)}
          </ol>
          {guia.notas.map((n, i) => <p key={i} className="gc-nota">{n}</p>)}
          <button
            type="button"
            className={`gc-guardar${estado === 'listo' ? ' ok' : ''}`}
            onClick={guardar}
            disabled={estado === 'guardando'}
          >
            {estado === 'guardando' ? 'Preparando imagen…'
              : estado === 'listo' ? '✓ Listo'
              : estado === 'error' ? 'No se pudo crear la imagen'
              : 'Guardar como imagen'}
          </button>
        </div>
      )}
    </div>
  )
}

/* Versión autocontenida (v1): enlace discreto que se abre en un panel dentro del configurador. */
export function GuiaCocinaInline({ producto, imagenUrl, oculto = false }) {
  const [abierta, setAbierta] = useState(false)
  if (!guiaDisponible(producto) || oculto) return null
  return abierta
    ? <div className="gc-inline"><GuiaCocinaPanel producto={producto} imagenUrl={imagenUrl} onVolver={() => setAbierta(false)} /></div>
    : <button type="button" className="gc-link" onClick={() => setAbierta(true)}>¿Cómo cocinar? ›</button>
}
