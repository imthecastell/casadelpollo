import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

const API_URL = 'https://casadelpollo-backend-production.up.railway.app'

const PREGUNTAS = [
  { id: 'q1', texto: '¿Qué tan fácil fue navegar y encontrar los productos?',   icono: '🧭' },
  { id: 'q2', texto: '¿Cómo calificarías el diseño visual de la aplicación?',    icono: '🎨' },
  { id: 'q3', texto: '¿El proceso para hacer tu pedido fue claro y sencillo?',   icono: '🛒' },
  { id: 'q4', texto: '¿La app funcionó con rapidez y sin problemas técnicos?',   icono: '⚡' },
  { id: 'q5', texto: '¿Qué tan satisfecho quedaste con la experiencia general?', icono: '😊' },
]

function Estrellas({ valor, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 36, padding: '4px 2px',
            filter: n <= (hover || valor)
              ? 'drop-shadow(0 0 4px rgba(255,215,0,0.7))'
              : 'grayscale(1) opacity(0.35)',
            transform: n <= (hover || valor) ? 'scale(1.15)' : 'scale(1)',
            transition: 'all 0.15s ease',
          }}
        >
          ⭐
        </button>
      ))}
    </div>
  )
}

export default function Feedback() {
  const { setVista, ultimoNumeroOrden } = useApp()
  const [ratings, setRatings] = useState({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 })
  const [comments, setComments] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const setRating = (campo, valor) => setRatings(prev => ({ ...prev, [campo]: valor }))

  const puedeEnviar = Object.values(ratings).some(v => v > 0)

  const handleEnviar = async () => {
    if (!puedeEnviar || enviando) return
    setEnviando(true)
    try {
      await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q1: ratings.q1 || null,
          q2: ratings.q2 || null,
          q3: ratings.q3 || null,
          q4: ratings.q4 || null,
          q5: ratings.q5 || null,
          comments: comments.trim() || null,
        }),
      })
      setEnviado(true)
    } catch {
      // Si falla el envío, igual seguimos — no bloquear al usuario
      setEnviado(true)
    } finally {
      setEnviando(false)
    }
  }

  /* ── Pantalla de agradecimiento ── */
  if (enviado) {
    return (
      <div style={estilos.wrapper}>
        <div style={{ ...estilos.card, marginTop: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🙏</div>
          <h2 style={estilos.titulo}>¡Gracias por tu opinión!</h2>
          <p style={estilos.sub}>
            Tu feedback es completamente anónimo y nos ayuda a mejorar la aplicación para todos.
          </p>
          <div style={{ ...estilos.anonimo, textAlign: 'center', marginTop: 16 }}>
            🔒 No almacenamos ningún dato personal.
          </div>
          <button
            className="btn-primario"
            onClick={() => setVista('menu')}
            style={{ marginTop: 24, width: '100%' }}
          >
            Hacer otro pedido
          </button>
          <button
            onClick={() => setVista('sucursales')}
            style={estilos.linkBtn}
          >
            Cambiar sucursal
          </button>
        </div>
      </div>
    )
  }

  /* ── Encuesta ── */
  return (
    <div style={estilos.wrapper}>
      <div style={estilos.card}>

        {/* Cabecera */}
        <div style={{ fontSize: 48, marginBottom: 12 }}>🧪</div>
        <div style={estilos.betaBadge}>BETA TESTER</div>
        <h2 style={estilos.titulo}>¿Cómo fue tu experiencia?</h2>
        {ultimoNumeroOrden && (
          <p style={{ ...estilos.sub, marginBottom: 4 }}>
            Pedido <strong style={{ color: 'var(--rojo)' }}>#{ultimoNumeroOrden}</strong> enviado ✓
          </p>
        )}
        <p style={estilos.anonimo}>
          🔒 Esta encuesta es completamente anónima. No almacenamos ningún dato personal, nombre, teléfono, ni historial de pedidos.
        </p>

        {/* Preguntas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
          {PREGUNTAS.map(p => (
            <div key={p.id} style={estilos.preguntaCard}>
              <p style={estilos.preguntaTexto}>
                <span style={{ fontSize: 20, marginRight: 8 }}>{p.icono}</span>
                {p.texto}
              </p>
              <Estrellas valor={ratings[p.id]} onChange={v => setRating(p.id, v)} />
              {ratings[p.id] > 0 && (
                <p style={estilos.ratingLabel}>
                  {['', 'Muy malo 😞', 'Malo 😕', 'Regular 😐', 'Bueno 😊', 'Excelente 🤩'][ratings[p.id]]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Comentarios */}
        <div style={{ marginTop: 24 }}>
          <label style={estilos.label}>
            💬 ¿Tienes algún comentario o sugerencia? <span style={{ color: '#aaa', fontWeight: 400 }}>(opcional)</span>
          </label>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Cuéntanos qué te gustó, qué mejorarías, o cualquier cosa que quieras decirnos..."
            maxLength={600}
            style={estilos.textarea}
          />
          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 2 }}>
            {comments.length}/600
          </p>
        </div>

        {/* Botones */}
        <button
          onClick={handleEnviar}
          disabled={!puedeEnviar || enviando}
          style={{
            ...estilos.btnEnviar,
            opacity: puedeEnviar ? 1 : 0.45,
            cursor: puedeEnviar ? 'pointer' : 'not-allowed',
          }}
        >
          {enviando ? '⏳ Enviando...' : '📤 Enviar calificación'}
        </button>

        <button
          onClick={() => setVista('menu')}
          style={estilos.linkBtn}
        >
          Omitir y hacer otro pedido
        </button>

      </div>
    </div>
  )
}

const estilos = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '32px 16px 48px',
    background: '#FFF8F0',
    fontFamily: 'DM Sans, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    background: 'white',
    borderRadius: 24,
    padding: '32px 24px',
    border: '1.5px solid #F3E8DC',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    textAlign: 'center',
  },
  betaBadge: {
    display: 'inline-block',
    background: '#FFFBEB',
    color: '#92400E',
    border: '1px solid #F59E0B55',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '2px',
    padding: '3px 12px',
    marginBottom: 12,
  },
  titulo: {
    fontFamily: 'var(--font-title), sans-serif',
    fontWeight: 800,
    fontSize: 22,
    color: '#1a1a1a',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  sub: {
    fontSize: 14,
    color: '#666',
    margin: '0 0 12px',
    lineHeight: 1.5,
  },
  anonimo: {
    background: '#FFFBEB',
    border: '1px solid #F59E0B33',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 12,
    color: '#78350F',
    lineHeight: 1.5,
    margin: '8px 0 0',
    textAlign: 'left',
  },
  preguntaCard: {
    background: '#FAFAFA',
    borderRadius: 14,
    padding: '16px',
    border: '1px solid #F0E8E0',
  },
  preguntaTexto: {
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
    marginBottom: 12,
    lineHeight: 1.4,
    textAlign: 'left',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: 700,
    marginTop: 6,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#444',
    marginBottom: 8,
    textAlign: 'left',
  },
  textarea: {
    width: '100%',
    minHeight: 100,
    background: '#FAFAFA',
    border: '1.5px solid #E8DDD5',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14,
    color: '#333',
    fontFamily: 'DM Sans, sans-serif',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btnEnviar: {
    width: '100%',
    marginTop: 20,
    background: 'var(--rojo, #c1121f)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radio, 12px)',
    padding: '14px',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'DM Sans, sans-serif',
    transition: 'opacity 0.2s',
    cursor: 'pointer',
  },
  linkBtn: {
    marginTop: 12,
    background: 'none',
    border: 'none',
    color: '#bbb',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    textDecoration: 'underline',
  },
}
