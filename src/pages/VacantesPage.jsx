import { useState, useEffect, useRef } from 'react'
import Icono from '../Components/Icono.jsx'
import { useVacantes, enviarPostulacion } from '../data/vacantes.js'
import '../styles/homeV2.css'
import '../styles/links.css'
import '../styles/vacantes.css'

const BASE = import.meta.env.BASE_URL

/* Una vacante con la etiqueta «Urgente» (la escribe quien administra, en las etiquetas visibles) va primero
   y se resalta. El resto conserva el orden en que llega del servidor. */
const esUrgente = (v) => (v.etiquetas || []).some(t => /^urgente/i.test(String(t).trim()))

/* Bolsa de trabajo pública: las vacantes abiertas con sus condiciones visibles y un formulario corto
   para dejar los datos. La solicitud en papel se entrega en la sucursal (lo dice cada vacante). */
export default function VacantesPage() {
  const { vacantes: lista, cargando } = useVacantes()
  const vacantes = [...lista].sort((a, b) => Number(esUrgente(b)) - Number(esUrgente(a)))
  const [postulando, setPostulando] = useState(null) // vacante elegida
  const [enviada, setEnviada] = useState(null)       // vacante a la que ya se postuló en esta visita

  useEffect(() => { document.title = 'Trabaja con nosotros · Casa del Pollo' }, [])

  return (
    <div className="v2-shell-root lk-root vb-root">
      <header className="lk-cab">
        <div className="lk-logo"><img src={`${BASE}logo.png`} alt="Casa del Pollo" /></div>
        <h1>Trabaja con nosotros</h1>
        <p>Vacantes abiertas en Casa del Pollo</p>
        <a className="vb-volver" href={BASE}>← Ir a la tienda</a>
      </header>

      <main className="lk-cuerpo">
        {cargando ? (
          <div className="vb-lista" aria-busy="true">
            <div className="lk-tarjeta lk-esqueleto" />
          </div>
        ) : vacantes.length === 0 ? (
          <div className="lk-tarjeta vb-vacio">
            <h2>Por ahora no hay vacantes abiertas</h2>
            <p>Vuelve a revisar pronto: cuando abramos una nueva la verás aquí.</p>
          </div>
        ) : (
          <div className="vb-lista">
            {vacantes.map(v => (
              <Vacante key={v.id} v={v} yaEnviada={enviada === v.id} onPostular={() => setPostulando(v)} />
            ))}
          </div>
        )}
      </main>

      <footer className="lk-pie">Casa del Pollo</footer>

      {postulando && (
        <Formulario
          vacante={postulando}
          onCerrar={() => setPostulando(null)}
          onEnviada={() => { setEnviada(postulando.id) }}
        />
      )}
    </div>
  )
}

function Seccion({ titulo, items }) {
  if (!items || items.length === 0) return null
  return (
    <section className="vb-seccion">
      {titulo && <h4>{titulo}</h4>}
      <ul>{items.map((t, i) => <li key={i}><Icono nombre="check-circle" tam="18px" /><span>{t}</span></li>)}</ul>
    </section>
  )
}

function Vacante({ v, yaEnviada, onPostular }) {
  const [abierta, setAbierta] = useState(false)
  const actividades = Array.isArray(v.actividades) ? v.actividades : []
  return (
    <article className={'lk-tarjeta vb-tarjeta' + (esUrgente(v) ? ' vb-urgente' : '')}>
      {esUrgente(v) && <div className="vb-urgente-cinta">Contratación urgente</div>}
      <div className="lk-tarjeta-cab">
        <h2>{v.puesto}</h2>
        {v.sucursal && <span className="lk-tipo"><Icono nombre="map-pin" tam="13px" /> {v.sucursal}</span>}
      </div>

      {(v.etiquetas?.length > 0 || v.horario) && (
        <ul className="vb-etiquetas">
          {v.horario && <li className="horario"><Icono nombre="clock" tam="15px" /> {v.horario}</li>}
          {(v.etiquetas || []).map((t, i) => <li key={i} className={/^urgente/i.test(String(t).trim()) ? 'urgente' : undefined}>{t}</li>)}
        </ul>
      )}

      {v.resumen && <p className="vb-resumen">{v.resumen}</p>}

      {abierta && (
        <div className="vb-detalle">
          {actividades.map((g, i) => <Seccion key={i} titulo={g.titulo || (i === 0 ? 'Actividades' : '')} items={g.items} />)}
          <Seccion titulo="Perfil deseado" items={v.perfil} />
          <Seccion titulo="Condiciones del puesto" items={v.condiciones} />
          {v.nota_importante && <p className="vb-nota"><b>Importante:</b> {v.nota_importante}</p>}
        </div>
      )}

      <button type="button" className="vb-mas" aria-expanded={abierta} onClick={() => setAbierta(a => !a)}>
        {abierta ? 'Ocultar detalles' : 'Ver actividades y condiciones'}
      </button>

      {v.como_postular && <p className="vb-como"><Icono nombre="storefront" tam="18px" /><span>{v.como_postular}</span></p>}

      {yaEnviada ? (
        <p className="vb-exito" role="status"><Icono nombre="check-circle" tam="20px" /> Recibimos tus datos. Te contactaremos.</p>
      ) : (
        <button type="button" className="lk-btn principal vb-postular" onClick={onPostular}>Dejar mis datos</button>
      )}
    </article>
  )
}

const DISPONIBILIDAD = ['Inmediata', 'En una semana', 'En dos semanas o más']

function Formulario({ vacante, onCerrar, onEnviada }) {
  const [f, setF] = useState({ nombre: '', telefono: '', edad: '', experiencia: '', disponibilidad: DISPONIBILIDAD[0], expectativa_salarial: '', mensaje: '', sitio_web: '' })
  const [acepta, setAcepta] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)
  const [abiertoEn] = useState(() => Date.now())
  const primero = useRef(null)

  useEffect(() => { primero.current?.focus() }, [])
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])

  const cambia = (campo) => (e) => setF(a => ({ ...a, [campo]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    const digitos = f.telefono.replace(/\D/g, '')
    if (f.nombre.trim().length < 3) return setError('Escribe tu nombre completo.')
    if (digitos.length < 10) return setError('Escribe tu teléfono a 10 dígitos.')
    if (!acepta) return setError('Para postularte acepta el aviso de privacidad.')
    setEnviando(true)
    const r = await enviarPostulacion(vacante.id, { ...f, edad: f.edad === '' ? null : Number(f.edad), acepta_privacidad: true, abierto_en: abiertoEn })
    setEnviando(false)
    if (!r.ok) return setError(r.error)
    setListo(true)
    onEnviada()
  }

  return (
    <div className="lk-fondo vb-fondo" onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}>
      <div className="lk-hoja vb-hoja" role="dialog" aria-modal="true" aria-label={`Postularme a ${vacante.puesto}`}>
        {listo ? (
          <>
            <h2>¡Gracias!</h2>
            <p className="vb-centrado">Recibimos tus datos para <b>{vacante.puesto}</b>. Te contactaremos por teléfono.</p>
            {vacante.como_postular && <p className="vb-como"><Icono nombre="storefront" tam="18px" /><span>{vacante.como_postular}</span></p>}
            <button type="button" className="lk-btn principal" onClick={onCerrar}>Listo</button>
          </>
        ) : (
          <form onSubmit={enviar} noValidate>
            <h2>{vacante.puesto}</h2>
            <p className="vb-centrado">Déjanos tus datos y te contactamos.</p>

            <label className="vb-campo">Nombre completo
              <input ref={primero} type="text" autoComplete="name" maxLength={120} value={f.nombre} onChange={cambia('nombre')} required />
            </label>
            <div className="vb-fila">
              <label className="vb-campo">Teléfono (10 dígitos)
                <input type="tel" inputMode="tel" autoComplete="tel-national" maxLength={20} value={f.telefono} onChange={cambia('telefono')} required />
              </label>
              <label className="vb-campo vb-edad">Edad
                <input type="number" inputMode="numeric" min="15" max="80" value={f.edad} onChange={cambia('edad')} />
              </label>
            </div>
            <label className="vb-campo">¿Cuándo podrías empezar?
              <select value={f.disponibilidad} onChange={cambia('disponibilidad')}>
                {DISPONIBILIDAD.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="vb-campo">Expectativa salarial (opcional)
              <input type="text" inputMode="text" maxLength={80} value={f.expectativa_salarial} onChange={cambia('expectativa_salarial')} placeholder="Ej. $2,000 a la semana" />
            </label>
            <label className="vb-campo">Experiencia (opcional)
              <textarea rows={3} maxLength={600} value={f.experiencia} onChange={cambia('experiencia')} placeholder="Dónde has trabajado o qué sabes hacer" />
            </label>
            <label className="vb-campo">Mensaje (opcional)
              <textarea rows={2} maxLength={600} value={f.mensaje} onChange={cambia('mensaje')} />
            </label>

            {/* Campo trampa: las personas no lo ven; los bots sí lo llenan. */}
            <div className="vb-trampa" aria-hidden="true">
              <label>Sitio web<input type="text" tabIndex={-1} autoComplete="off" value={f.sitio_web} onChange={cambia('sitio_web')} /></label>
            </div>

            <label className="vb-acepto">
              <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
              <span>
                Acepto que Casa del Pollo use mis datos solo para contactarme por esta vacante. No se comparten con nadie y
                puedo pedir en la sucursal que los borren.
              </span>
            </label>

            {error && <p className="vb-error" role="alert">{error}</p>}

            <div className="vb-acciones">
              <button type="button" className="lk-btn" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="lk-btn principal" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar mis datos'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}