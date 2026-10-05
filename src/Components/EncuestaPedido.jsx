import { useState } from 'react'
import { enviarEncuestaPedido } from '../data/api.js'

/* Encuesta corta al terminar un pedido: dos preguntas con estrellas y un comentario
   opcional. Se contesta desde la pantalla de "Pedido recibido". */
const PREGUNTAS = [
  { id: 'q1', texto: '¿Qué te pareció nuestra app?', minimo: 'Mala', maximo: 'Excelente' },
  { id: 'q2', texto: '¿Qué tan fácil fue crear tu pedido?', minimo: 'Complicado', maximo: 'Muy fácil' },
]

function Estrella({ llena }) {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
      <path
        d="M12 2.8l2.86 5.8 6.4.93-4.63 4.51 1.09 6.38L12 17.4l-5.72 3.02 1.09-6.38L2.74 9.53l6.4-.93L12 2.8z"
        fill={llena ? '#F0A020' : 'none'} stroke={llena ? '#F0A020' : '#C9B8A8'} strokeWidth="1.6" strokeLinejoin="round"
      />
    </svg>
  )
}

function Estrellas({ pregunta, valor, onChange }) {
  return (
    <div className="v2-enc-pregunta" role="radiogroup" aria-label={pregunta.texto}>
      <div className="v2-enc-texto">{pregunta.texto}</div>
      <div className="v2-enc-estrellas">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" role="radio" aria-checked={valor === n}
            aria-label={`${n} de 5`} className="v2-enc-estrella" onClick={() => onChange(n)}>
            <Estrella llena={n <= valor} />
          </button>
        ))}
      </div>
      <div className="v2-enc-extremos"><span>{pregunta.minimo}</span><span>{pregunta.maximo}</span></div>
    </div>
  )
}

export default function EncuestaPedido({ numeroOrden, branchId, esPrueba }) {
  const [valores, setValores] = useState({ q1: 0, q2: 0 })
  const [comentario, setComentario] = useState('')
  const [verComentario, setVerComentario] = useState(false)
  const [estado, setEstado] = useState('pendiente') // pendiente | enviando | enviado | error

  const algunaEstrella = valores.q1 > 0 || valores.q2 > 0

  async function enviar() {
    if (!algunaEstrella || estado === 'enviando') return
    setEstado('enviando')
    try {
      await enviarEncuestaPedido({
        q1: valores.q1 || null, q2: valores.q2 || null,
        comments: comentario.trim() || null,
        numero_orden: numeroOrden, branch_id: branchId, es_prueba: !!esPrueba,
      })
      setEstado('enviado')
    } catch {
      setEstado('error')
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="v2-enc v2-enc-gracias" role="status">
        <b>¡Gracias por tu opinión!</b>
        <span>Nos ayuda a mejorar la app.</span>
      </div>
    )
  }

  return (
    <section className="v2-enc" aria-label="Encuesta de tu pedido">
      <h3>¿Cómo te fue?</h3>
      <p className="v2-enc-sub">Te toma 10 segundos.</p>
      {PREGUNTAS.map(p => (
        <Estrellas key={p.id} pregunta={p} valor={valores[p.id]}
          onChange={n => setValores(v => ({ ...v, [p.id]: n }))} />
      ))}
      {verComentario ? (
        <label className="v2-enc-comentario">
          <span>Comentario (opcional)</span>
          <textarea value={comentario} maxLength={600} rows={3} placeholder="¿Algo que quieras contarnos?"
            onChange={e => setComentario(e.target.value)} />
        </label>
      ) : (
        <button type="button" className="v2-enc-mas" onClick={() => setVerComentario(true)}>+ Dejar un comentario (opcional)</button>
      )}
      {estado === 'error' && <p className="v2-enc-error" role="alert">No se pudo enviar. Intenta de nuevo.</p>}
      <button type="button" className="v2-enc-enviar" disabled={!algunaEstrella || estado === 'enviando'} onClick={enviar}>
        {estado === 'enviando' ? 'Enviando…' : 'Enviar'}
      </button>
    </section>
  )
}
