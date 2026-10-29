import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PERSONAJES, cargarImagenes, crearJuego } from '../data/juegoGallina.js'
import '../styles/juego.css'

/* Página /juego: "El Salto del Pollo", minijuego para entretener al cliente mientras espera su pedido (se llega
   escaneando un QR). Portada con el fondo del póster oficial y las gallinas como botones individuales → correr →
   resultado.
   Todo vive en este dispositivo: el mejor récord y el personaje se guardan en localStorage; no hay backend ni cuenta. */
const BASE = import.meta.env.BASE_URL
const POSTER = { ancho: 941, alto: 1672 }

// cada gallina sobre el fondo: centro y radios de su zona tocable, y ancho del dibujo (todo en píxeles del póster)
const ZONAS = {
  bruja: { cx: 490, cy: 690, rx: 140, ry: 170, w: 350 },
  calabaza: { cx: 270, cy: 835, rx: 150, ry: 160, w: 325 },
  fantasma: { cx: 690, cy: 840, rx: 150, ry: 160, w: 335 },
  esqueleto: { cx: 360, cy: 1075, rx: 125, ry: 140, w: 295 },
  catrina: { cx: 615, cy: 1085, rx: 145, ry: 160, w: 325 },
}

// hojas que caen y murciélagos que cruzan la portada (posición, tamaño y ritmo de cada una)
const HOJAS = ['hoja-a', 'hoja-d', 'hoja-g', 'hoja-b', 'hoja-h', 'hoja-e', 'hoja-c', 'hoja-f'].map((n, i) => ({ n, x: 6 + i * 12.5, w: 26 + (i % 3) * 9, dur: 9 + (i % 4) * 2.2, retraso: -i * 1.7 }))
const CHISPAS = [{ n: 'chispa-a', x: 110, y: 85, w: 34 }, { n: 'chispa-b', x: 805, y: 150, w: 28 }, { n: 'chispa-c', x: 760, y: 430, w: 32 }]

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

        <button type="button" className={`jg-sonido${sonido ? '' : ' mudo'}${pantalla === 'elegir' ? ' arriba' : ''}`} onClick={() => setSonido(s => !s)} aria-label={sonido ? 'Silenciar' : 'Activar sonido'} aria-pressed={!sonido}>
          <img src={`${BASE}juego/btn-sonido.png`} alt="" draggable="false" />
        </button>

        {pantalla === 'elegir' && (
          <div className="jg-portada">
            <div className="jg-poster" style={{ width: poster.w, height: poster.h, left: (caja.w - poster.w) / 2, '--e': escala }}>
              <img className="jg-poster-img" src={`${BASE}juego/fondo.webp`} alt="" draggable="false" />
              <div className="jg-ambiente" aria-hidden="true">
                {HOJAS.map(h => (
                  <img key={h.n} className="jg-hoja" src={`${BASE}juego/${h.n}.png`} alt="" draggable="false"
                    style={{ left: `${h.x}%`, width: `${(h.w / POSTER.ancho) * 100 * 1.6}%`, animationDuration: `${h.dur}s`, animationDelay: `${h.retraso}s` }} />
                ))}
                <span className="jg-bat jg-bat-1"><img src={`${BASE}juego/murcielago-a.png`} alt="" draggable="false" /></span>
                <span className="jg-bat jg-bat-2"><img src={`${BASE}juego/murcielago-b.png`} alt="" draggable="false" /></span>
              </div>
              <h1 className="jg-titulo" style={{ left: pct(150, POSTER.ancho), top: pct(52, POSTER.alto), width: pct(640, POSTER.ancho) }}>
                <img src={`${BASE}juego/titulo.png`} alt="El Salto del Pollo: ¡aletea, esquiva y llega más lejos!" draggable="false" />
              </h1>
              {CHISPAS.map((c, i) => (
                <img key={c.n} className="jg-chispa" src={`${BASE}juego/${c.n}.png`} alt="" aria-hidden="true" draggable="false"
                  style={{ left: pct(c.x, POSTER.ancho), top: pct(c.y, POSTER.alto), width: pct(c.w, POSTER.ancho), animationDelay: `${i * 0.7}s` }} />
              ))}
              {PERSONAJES.map((p, i) => {
                const z = ZONAS[p.id]
                const on = p.id === personaje
                return (
                  <button key={p.id} type="button" aria-pressed={on} aria-label={`Elegir a ${p.nombre}`}
                    className={`jg-zona${on ? ' on' : ''}`} onClick={() => setPersonaje(p.id)}
                    style={{ left: pct(z.cx - z.rx, POSTER.ancho), top: pct(z.cy - z.ry, POSTER.alto), width: pct(z.rx * 2, POSTER.ancho), height: pct(z.ry * 2, POSTER.alto) }}>
                    <img src={`${BASE}juego/pj-${p.id}.png`} alt="" draggable="false" style={{ width: `${(z.w / (z.rx * 2)) * 100}%`, animationDelay: `${-i * 0.5}s` }} />
                    {on && <span className="jg-zona-nombre">{p.nombre} ✓</span>}
                  </button>
                )
              })}
              <button type="button" className="jg-jugar" disabled={!imgs} onClick={correr} aria-label={`Jugar con ${actual.nombre}`}
                style={{ left: pct(210, POSTER.ancho), top: pct(1232, POSTER.alto), width: pct(520, POSTER.ancho) }}>
                <img src={`${BASE}juego/jugar.png`} alt="" draggable="false" />
              </button>
              <img className="jg-tabla" src={`${BASE}juego/tabla.png`} alt="Disponible solo en tiendas" draggable="false"
                style={{ left: pct(235, POSTER.ancho), top: pct(1470, POSTER.alto), width: pct(470, POSTER.ancho) }} />
            </div>
            {mejor && (
              <div className="jg-mejor" aria-label={`Tu mejor carrera: ${mejor.metros} metros`}>
                <img src={`${BASE}juego/btn-record.png`} alt="" draggable="false" />
                <span>{mejor.metros} m</span>
              </div>
            )}
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
