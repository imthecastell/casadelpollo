import { useEffect, useRef, useState } from 'react'
import { cargarImagenes, crearJuego } from '../data/juegoPollitos.js'
import { desbloquear, sonar } from '../data/pollitosAudio.js'
import '../styles/pollitos.css'

/* Página /juego: "Atrapa los pollitos", el minijuego de la temporada navideña (se llega escaneando un QR en tienda).
   Se arrastra una canasta para atrapar pollitos y piezas del pedido; los adornos no van en el pedido.
   Detrás de la portada corre una demostración del propio motor. Todo vive en este dispositivo: el mejor récord y el
   sonido se guardan en localStorage; no hay backend ni cuenta.
   El juego anterior ("El Salto del Pollo", temporada de Día de Muertos) quedó archivado en JuegoGallina.jsx. */
const BASE = import.meta.env.BASE_URL
const IG = 'https://www.instagram.com/casadelpollolm'

const leer = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : v } catch { return def } }
const guardar = (k, v) => { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento */ } }
const leerMejor = () => { try { return JSON.parse(leer('cdp_pollitos_mejor', 'null')) } catch { return null } }
const miles = (n) => n.toLocaleString('es-MX')
const img = (n) => `${BASE}pollitos/${n}.webp`

const SI = ['pollito-1', 'muslo', 'papas-1', 'moneda-estrella']
const NO = ['esfera', 'pina', 'liston']

function titulo(r) {
  if (r.record) return '¡Nuevo récord!'
  if (r.puntos >= 600) return '¡Pedido de campeón!'
  if (r.puntos >= 250) return '¡Pedido listo!'
  return '¡Buen intento!'
}

export default function JuegoPollitos() {
  const [pantalla, setPantalla] = useState('inicio')   // inicio | jugando | fin
  const [imgs, setImgs] = useState(null)
  const [sonido, setSonido] = useState(() => leer('cdp_pollitos_sonido', '1') === '1')
  const [mejor, setMejor] = useState(leerMejor)
  const [marcador, setMarcador] = useState({ puntos: 0, racha: 0, mult: 1 })
  const [vidas, setVidas] = useState(3)
  const [pausa, setPausa] = useState(false)
  const [resultado, setResultado] = useState(null)
  const canvasRef = useRef(null)
  const juegoRef = useRef(null)
  const sonidoRef = useRef(sonido)
  const vidasRef = useRef(3)

  useEffect(() => { sonidoRef.current = sonido; guardar('cdp_pollitos_sonido', sonido ? '1' : '0') }, [sonido])
  useEffect(() => {
    // página "secreta": solo se llega por el QR o el enlace directo, así que se pide a los buscadores no listarla
    document.title = 'Atrapa los pollitos · Casa del Pollo'
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
  useEffect(() => { cargarImagenes(BASE).then(setImgs) }, [])
  // los navegadores no dejan sonar nada antes del primer toque: se desbloquea el audio con el primero
  useEffect(() => {
    const eventos = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']
    const intentar = () => { if (desbloquear()) eventos.forEach(e => window.removeEventListener(e, intentar)) }
    eventos.forEach(e => window.addEventListener(e, intentar))
    return () => eventos.forEach(e => window.removeEventListener(e, intentar))
  }, [])

  // el motor vive mientras la página: en la portada hace una demostración, al jugar se le pide `iniciar()`
  useEffect(() => {
    if (!imgs || !canvasRef.current) return
    const juego = crearJuego(canvasRef.current, imgs, {
      sonidoActivo: () => sonidoRef.current,
      onPuntos: setMarcador,
      onVidas: (v) => { vidasRef.current = v; setVidas(v) },
      onPausa: setPausa,
      onFin: (r) => {
        const previo = leerMejor()
        const record = r.puntos > 0 && (!previo || r.puntos > previo.puntos)
        if (record) { guardar('cdp_pollitos_mejor', JSON.stringify(r)); setMejor(r) }
        sonar(() => sonidoRef.current, record ? 'record' : 'fin')
        setResultado({ ...r, record, anterior: previo })
        setPantalla('fin')
      },
    })
    juegoRef.current = juego
    return () => { juego.destruir(); juegoRef.current = null }
  }, [imgs])

  const jugar = () => {
    desbloquear()
    setResultado(null); setPausa(false)
    setMarcador({ puntos: 0, racha: 0, mult: 1 }); setVidas(3)
    setPantalla('jugando')
    juegoRef.current?.iniciar()
  }
  const pausar = (v) => { setPausa(v); juegoRef.current?.pausar(v) }
  const salir = () => { setPausa(false); juegoRef.current?.salir(); setPantalla('inicio') }

  const ig = (
    <a className="pp-ig" href={IG} target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
      <span className="pp-ig-txt"><b>Síguenos en Instagram</b><small>@casadelpollolm</small></span>
    </a>
  )

  const botonSonido = (
    <button type="button" className={`pp-redondo pp-sonido${sonido ? '' : ' mudo'}`} onClick={() => setSonido(s => !s)} aria-label={sonido ? 'Silenciar' : 'Activar sonido'} aria-pressed={!sonido}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M4 9.5v5h3.6l4.4 3.6V5.9L7.6 9.5H4z" fill="currentColor" />
        {sonido
          ? <path d="M15.5 8.6a4.6 4.6 0 0 1 0 6.8M17.9 6.2a8 8 0 0 1 0 11.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          : <path d="M15.6 9.6l5 4.8m0-4.8l-5 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
      </svg>
    </button>
  )

  return (
    <div className="pp-raiz">
      <div className="pp-lado pp-lado-izq" aria-hidden="true">
        <div className="pp-ig-tarjeta">
          <img src={img('icono-pollo')} alt="" draggable="false" />
          <span className="pp-ig-usuario">@casadelpollolm</span>
        </div>
      </div>

      <div className="pp-marco">
        <canvas ref={canvasRef} className="pp-canvas" aria-label="Juego: arrastra la canasta para atrapar los pollitos" />

        {pantalla === 'jugando' && (
          <div className="pp-hud">
            <div className="pp-hud-izq">
              <button type="button" className="pp-pausa" onClick={() => pausar(true)} aria-label="Pausa"><img src={img('pausa')} alt="" draggable="false" /></button>
              {botonSonido}
            </div>
            <div className="pp-marcador" aria-live="off">
              <div className="pp-puntos"><img src={img('moneda-estrella')} alt="" draggable="false" /><span key={marcador.puntos}>{miles(marcador.puntos)}</span></div>
              {marcador.racha >= 3 && (
                <div className={`pp-racha${marcador.mult > 1 ? ' fuerte' : ''}`}>{marcador.racha} seguidos{marcador.mult > 1 ? ` · ×${marcador.mult}` : ''}</div>
              )}
            </div>
            <div className="pp-vidas" aria-label={`${vidas} ${vidas === 1 ? 'corazón' : 'corazones'}`}>
              {[0, 1, 2].map(i => <img key={i} className={`pp-corazon${i < vidas ? '' : ' perdido'}`} src={img('corazon')} alt="" draggable="false" />)}
            </div>
            {!mejor && <div className="pp-pista">Arrastra el dedo para mover la canasta</div>}
          </div>
        )}

        {pantalla === 'inicio' && (
          <div className="pp-inicio">
            <div className="pp-sonido-arriba">{botonSonido}</div>
            <h1 className="pp-titulo">
              <img className="pp-titulo-pollo pp-titulo-pollo-a" src={img('pollito-3')} alt="" draggable="false" />
              <img className="pp-titulo-pollo pp-titulo-pollo-b" src={img('pollito-2')} alt="" draggable="false" />
              <span className="pp-t0">Casa del Pollo</span>
              <span className="pp-t1">Atrapa los</span>
              <span className="pp-t2">pollitos</span>
              <span className="pp-cinta">Minijuego navideño</span>
            </h1>

            <div className="pp-reglas">
              <div className="pp-regla si"><b>Atrapa</b><span>{SI.map(n => <img key={n} src={img(n)} alt="" draggable="false" />)}</span></div>
              <div className="pp-regla no"><b>Esquiva</b><span>{NO.map(n => <img key={n} src={img(n)} alt="" draggable="false" />)}</span></div>
              <p>Arrastra el dedo de lado a lado para mover la canasta. ¡Los adornos no van en el pedido!</p>
            </div>

            <button type="button" className="pp-jugar" disabled={!imgs} onClick={jugar}>
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
              Jugar
            </button>
            {mejor && <div className="pp-mejor"><img src={img('moneda-estrella')} alt="" draggable="false" />Tu mejor: <b>{miles(mejor.puntos)}</b></div>}
            <div className="pp-solo">Disponible solo en tiendas</div>
          </div>
        )}

        {pantalla === 'jugando' && pausa && (
          <div className="pp-velo">
            <div className="pp-tarjeta">
              <div className="pp-tarjeta-titulo">Pausa</div>
              <button type="button" className="pp-cta" onClick={() => pausar(false)}>Seguir jugando</button>
              <button type="button" className="pp-sec" onClick={salir}>Salir</button>
            </div>
          </div>
        )}

        {pantalla === 'fin' && resultado && (
          <div className="pp-velo">
            <div className="pp-tarjeta">
              <img className="pp-tarjeta-pollo" src={img('icono-pollo')} alt="" draggable="false" />
              <div className="pp-tarjeta-titulo">{titulo(resultado)}</div>
              <div className="pp-tarjeta-puntos">{miles(resultado.puntos)}</div>
              <div className="pp-tarjeta-det">
                <span><img src={img('pollito-1')} alt="" draggable="false" />{resultado.pollitos} {resultado.pollitos === 1 ? 'pollito' : 'pollitos'}</span>
                <span><img src={img('muslo')} alt="" draggable="false" />{resultado.piezas} {resultado.piezas === 1 ? 'pieza' : 'piezas'}</span>
              </div>
              {!resultado.record && mejor && <div className="pp-tarjeta-mejor">Tu mejor: {miles(mejor.puntos)}</div>}
              <button type="button" className="pp-cta" onClick={jugar}>Jugar otra vez</button>
              {ig}
              <a className="pp-link" href="/">Hacer mi pedido →</a>
            </div>
          </div>
        )}
      </div>

      <div className="pp-lado pp-lado-der" aria-hidden="true">
        <div className="pp-ig-tarjeta">
          <img src={img('pollito-2')} alt="" draggable="false" />
          <span className="pp-ig-usuario">@casadelpollolm</span>
        </div>
      </div>
    </div>
  )
}
