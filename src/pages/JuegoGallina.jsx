import { useEffect, useRef, useState } from 'react'
import { PERSONAJES, cargarImagenes, crearJuego } from '../data/juegoGallina.js'
import '../styles/juego.css'

/* Página /juego: minijuego para entretener al cliente mientras espera su pedido (se llega escaneando un QR).
   Elegir personaje → correr → resultado. Todo vive en este dispositivo: el mejor récord y el personaje se guardan
   en localStorage; no hay backend ni cuenta. */
const BASE = import.meta.env.BASE_URL
const img = (n) => `${BASE}skins/muertos/${n}.png`

const leer = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : v } catch { return def } }
const guardar = (k, v) => { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento */ } }
const leerMejor = () => { try { return JSON.parse(leer('cdp_juego_mejor', 'null')) } catch { return null } }

export default function JuegoGallina() {
  const [pantalla, setPantalla] = useState('elegir')   // elegir | jugando | fin
  const [personaje, setPersonaje] = useState(() => {
    const g = leer('cdp_juego_pj', 'catrina')
    return PERSONAJES.some(p => p.id === g) ? g : 'catrina'
  })
  const [imgs, setImgs] = useState(null)
  const [sonido, setSonido] = useState(() => leer('cdp_juego_sonido', '1') === '1')
  const [mejor, setMejor] = useState(leerMejor)
  const [resultado, setResultado] = useState(null)
  const canvasRef = useRef(null)
  const sonidoRef = useRef(sonido)
  const juegoRef = useRef(null)

  useEffect(() => { sonidoRef.current = sonido; guardar('cdp_juego_sonido', sonido ? '1' : '0') }, [sonido])
  useEffect(() => {
    // página "secreta": solo se llega por el QR o el enlace directo, así que se pide a los buscadores no listarla
    document.title = 'Corre, Gallina · Casa del Pollo'
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
  useEffect(() => { cargarImagenes(BASE).then(setImgs) }, [])

  useEffect(() => {
    if (pantalla !== 'jugando' || !imgs || !canvasRef.current) return
    const juego = crearJuego(canvasRef.current, imgs, personaje, {
      sonidoActivo: () => sonidoRef.current,
      onFin: (r) => {
        const previo = leerMejor()
        const record = !previo || r.metros > previo.metros
        if (record) { guardar('cdp_juego_mejor', JSON.stringify(r)); setMejor(r) }
        setResultado({ ...r, record })
        setPantalla('fin')
      },
    })
    juegoRef.current = juego
    return () => { juego.destruir(); juegoRef.current = null }
  }, [pantalla, imgs, personaje])

  const correr = () => { guardar('cdp_juego_pj', personaje); setResultado(null); setPantalla('jugando') }
  const actual = PERSONAJES.find(p => p.id === personaje)

  return (
    <div className="jg-raiz">
      <div className="jg-marco">
        {pantalla !== 'elegir' && (
          <>
            {/* el juego ocupa los 2/3 de arriba; el tercio de abajo es la zona de toque, libre para el pulgar */}
            <canvas ref={canvasRef} className="jg-canvas" aria-label="Juego" />
            <button type="button" className="jg-tap" onPointerDown={(ev) => { ev.preventDefault(); juegoRef.current?.saltar() }}>
              <span className="jg-tap-flecha" aria-hidden="true">⬆</span>
              <span className="jg-tap-txt">Toca aquí para saltar</span>
            </button>
          </>
        )}

        <button type="button" className="jg-sonido" onClick={() => setSonido(s => !s)} aria-label={sonido ? 'Silenciar' : 'Activar sonido'}>{sonido ? '🔊' : '🔇'}</button>

        {pantalla === 'elegir' && (
          <div className="jg-menu">
            <div className="jg-papel" aria-hidden="true" />
            <h1 className="jg-titulo">Corre, Gallina</h1>
            <p className="jg-sub">Salta los obstáculos, junta dulces y llega lo más lejos que puedas.</p>
            <div className="jg-personajes" role="radiogroup" aria-label="Elige tu personaje">
              {PERSONAJES.map(p => (
                <button key={p.id} type="button" role="radio" aria-checked={p.id === personaje}
                  className={`jg-pj${p.id === personaje ? ' on' : ''}`} onClick={() => setPersonaje(p.id)}>
                  <img src={img(p.img)} alt="" draggable="false" />
                  <span>{p.nombre}</span>
                </button>
              ))}
            </div>
            <button type="button" className="jg-cta" disabled={!imgs} onClick={correr}>{imgs ? `¡A correr con ${actual.nombre}!` : 'Cargando…'}</button>
            {mejor && <div className="jg-mejor">Tu mejor carrera: <b>{mejor.metros} m</b> · 🍬 {mejor.dulces}</div>}
            <a className="jg-link" href="/">Hacer mi pedido →</a>
          </div>
        )}

        {pantalla === 'fin' && resultado && (
          <div className="jg-fin">
            <div className="jg-fin-card">
              <img className="jg-fin-pj" src={img(actual.img)} alt="" draggable="false" />
              {resultado.record && <div className="jg-record">¡Nuevo récord!</div>}
              <div className="jg-fin-metros">{resultado.metros} m</div>
              <div className="jg-fin-det">🍬 {resultado.dulces} {resultado.dulces === 1 ? 'dulce' : 'dulces'}{!resultado.record && mejor ? ` · Mejor: ${mejor.metros} m` : ''}</div>
              <button type="button" className="jg-cta" onClick={correr}>Jugar otra vez</button>
              <button type="button" className="jg-sec" onClick={() => setPantalla('elegir')}>Cambiar personaje</button>
              <a className="jg-link" href="/">Hacer mi pedido →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
