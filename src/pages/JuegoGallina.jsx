import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PERSONAJES, cargarImagenes, crearJuego } from '../data/juegoGallina.js'
import '../styles/juego.css'

/* Página /juego: "El Salto del Pollo", minijuego para entretener al cliente mientras espera su pedido (se llega
   escaneando un QR). Portada con el póster oficial (se toca a la gallina para elegirla) → correr → resultado.
   Todo vive en este dispositivo: el mejor récord y el personaje se guardan en localStorage; no hay backend ni cuenta. */
const BASE = import.meta.env.BASE_URL
const POSTER = { ancho: 941, alto: 1672 }

// zona tocable de cada gallina sobre el póster (centro y radios, en píxeles del póster)
const ZONAS = {
  bruja: { cx: 490, cy: 690, rx: 140, ry: 170 },
  calabaza: { cx: 270, cy: 830, rx: 150, ry: 160 },
  fantasma: { cx: 690, cy: 840, rx: 150, ry: 160 },
  esqueleto: { cx: 360, cy: 1075, rx: 125, ry: 140 },
  catrina: { cx: 615, cy: 1085, rx: 145, ry: 160 },
}

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
  const [caja, setCaja] = useState({ w: 0, h: 0 })
  const canvasRef = useRef(null)
  const marcoRef = useRef(null)
  const sonidoRef = useRef(sonido)
  const juegoRef = useRef(null)

  useEffect(() => { sonidoRef.current = sonido; guardar('cdp_juego_sonido', sonido ? '1' : '0') }, [sonido])
  useEffect(() => {
    // página "secreta": solo se llega por el QR o el enlace directo, así que se pide a los buscadores no listarla
    document.title = 'El Salto del Pollo · Casa del Pollo'
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
  useEffect(() => { cargarImagenes(BASE).then(setImgs) }, [])

  // el póster cubre toda la pantalla (alineado arriba); sus zonas tocables se calculan sobre ese rectángulo
  useLayoutEffect(() => {
    const el = marcoRef.current
    if (!el) return
    const medir = () => setCaja({ w: el.clientWidth, h: el.clientHeight })
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
  const escala = caja.w ? Math.max(caja.w / POSTER.ancho, caja.h / POSTER.alto) : 0
  const poster = { w: POSTER.ancho * escala, h: POSTER.alto * escala }
  const pct = (x, total) => `${(x / total) * 100}%`

  return (
    <div className="jg-raiz">
      <div className="jg-marco" ref={marcoRef}>
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
          <div className="jg-portada">
            <div className="jg-poster" style={{ width: poster.w, height: poster.h, left: (caja.w - poster.w) / 2 }}>
              <img className="jg-poster-img" src={`${BASE}juego/poster.webp`} alt="El Salto del Pollo: ¡aletea, esquiva y llega más lejos!" draggable="false" />
              {PERSONAJES.map(p => {
                const z = ZONAS[p.id]
                const on = p.id === personaje
                return (
                  <button key={p.id} type="button" aria-pressed={on} aria-label={`Elegir a ${p.nombre}`}
                    className={`jg-zona${on ? ' on' : ''}`} onClick={() => setPersonaje(p.id)}
                    style={{ left: pct(z.cx - z.rx, POSTER.ancho), top: pct(z.cy - z.ry, POSTER.alto), width: pct(z.rx * 2, POSTER.ancho), height: pct(z.ry * 2, POSTER.alto) }}>
                    {on && <span className="jg-zona-nombre">{p.nombre} ✓</span>}
                  </button>
                )
              })}
              <button type="button" className="jg-cta jg-cta-poster" disabled={!imgs} onClick={correr} style={{ top: pct(1262, POSTER.alto) }}>
                {imgs ? `¡A correr con ${actual.nombre}!` : 'Cargando…'}
              </button>
            </div>
            {mejor && <div className="jg-mejor">🏆 {mejor.metros} m</div>}
          </div>
        )}

        {pantalla === 'fin' && resultado && (
          <div className="jg-fin">
            <div className="jg-fin-card">
              <img className="jg-fin-pj" src={`${BASE}skins/muertos/${actual.img}.png`} alt="" draggable="false" />
              <div className="jg-fin-titulo">{resultado.record ? '¡Nuevo récord!' : '¡Buen salto!'}</div>
              <div className="jg-fin-metros">{resultado.metros} m</div>
              <div className="jg-fin-det">🍬 {resultado.dulces} {resultado.dulces === 1 ? 'dulce' : 'dulces'}{!resultado.record && mejor ? ` · Mejor: ${mejor.metros} m` : ''}</div>
              <button type="button" className="jg-cta jg-cta-chico" onClick={correr}>Jugar otra vez</button>
              <button type="button" className="jg-sec" onClick={() => setPantalla('elegir')}>Cambiar personaje</button>
              <a className="jg-link" href="/">Hacer mi pedido →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
