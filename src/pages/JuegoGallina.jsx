import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PERSONAJES, cargarImagenes, crearJuego, tono } from '../data/juegoGallina.js'
import { activarMusica, atenuarMusica, desbloquear, ponerPista, precargar } from '../data/musicaJuego.js'
import '../styles/juego.css'

/* Página /juego: "El Salto del Pollo", minijuego para entretener al cliente mientras espera su pedido (se llega
   escaneando un QR). Portada con el fondo del póster oficial y un carrusel infinito de gallinas (se desliza, tiene
   flechas y un botón "al azar" que las hace girar) → correr → resultado.
   Todo vive en este dispositivo: el mejor récord y el personaje se guardan en localStorage; no hay backend ni cuenta. */
const BASE = import.meta.env.BASE_URL
const POSTER = { ancho: 941, alto: 1672 }

// carrusel: distancia entre gallinas y ancho de cada una, en píxeles del póster
const N = PERSONAJES.length
const ESPACIO = 290
const ANCHO_GALLINA = 330
const envolver = (x) => ((x % N) + N) % N
const relativa = (i, p) => { let d = envolver(i - p); if (d > N / 2) d -= N; return d }
const suave = (k) => 1 - (1 - k) ** 3
const frenado = (k) => 1 - (1 - k) ** 4

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
  const carruselRef = useRef(null)
  const itemsRef = useRef([])
  const ctrlRef = useRef(null)
  const [girando, setGirando] = useState(false)
  const [aviso, setAviso] = useState('')

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
  // música de ambiente: se precarga, arranca con el primer toque y cambia de pista según la pantalla
  useEffect(() => {
    precargar(BASE)
    const eventos = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']
    const intentar = () => { if (desbloquear()) eventos.forEach(e => window.removeEventListener(e, intentar)) }
    eventos.forEach(e => window.addEventListener(e, intentar))
    return () => eventos.forEach(e => window.removeEventListener(e, intentar))
  }, [])
  useEffect(() => { activarMusica(sonido) }, [sonido])
  useEffect(() => {
    ponerPista(pantalla === 'elegir' ? 'menu' : 'juego')
    atenuarMusica(pantalla === 'fin')
  }, [pantalla])


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

  // carrusel infinito: la posición (pos) es un número con decimales; la gallina más cercana al centro es la elegida
  useEffect(() => {
    if (pantalla !== 'elegir') return
    const cont = carruselRef.current
    if (!cont) return
    const pos = { v: Math.max(0, PERSONAJES.findIndex(p => p.id === personaje)) }
    let anim = null
    let drag = null
    let ultimoId = null
    let ultimoCruce = Math.round(pos.v)
    let raf = 0
    let avisoT = 0

    const pintar = () => {
      const cercano = envolver(Math.round(pos.v))
      itemsRef.current.forEach((el, i) => {
        if (!el) return
        const d = relativa(i, pos.v)
        const a = Math.abs(d)
        el.style.left = `${50 + (d * ESPACIO / POSTER.ancho) * 100}%`
        el.style.opacity = a > 2.3 ? '0' : String(1 - 0.36 * a)
        el.style.zIndex = String(Math.round(100 - a * 10))
        el.style.transform = `translateX(-50%) scale(${1 - 0.32 * Math.min(a, 1.6)})`
        el.classList.toggle('centro', i === cercano)
      })
      const id = PERSONAJES[cercano].id
      if (id !== ultimoId) { ultimoId = id; setPersonaje(id) }
    }

    const animarA = (destino, dur, ease, alTerminar) => {
      anim = { desde: pos.v, hasta: destino, t0: performance.now(), dur, ease, alTerminar }
    }

    const cuadro = (ahora) => {
      if (anim) {
        const k = Math.min(1, (ahora - anim.t0) / anim.dur)
        pos.v = anim.desde + (anim.hasta - anim.desde) * anim.ease(k)
        const cruce = Math.round(pos.v)
        if (cruce !== ultimoCruce) { ultimoCruce = cruce; if (anim.dur > 1000) tono(() => sonidoRef.current, 760, 560, 0.04, 'square', 0.05) }
        if (k >= 1) { const fin = anim.alTerminar; anim = null; pos.v = envolver(pos.v); ultimoCruce = Math.round(pos.v); fin?.() }
      }
      pintar()
      raf = requestAnimationFrame(cuadro)
    }

    const ir = (delta) => { if (drag || (anim && anim.dur > 1000)) return; animarA(Math.round(pos.v) + delta, 320, suave) }
    const azar = () => {
      if (anim && anim.dur > 1000) return
      const base = Math.round(pos.v)
      const objetivo = Math.floor(Math.random() * N)
      const avance = envolver(objetivo - base) + N * 3
      setGirando(true); setAviso('')
      clearTimeout(avisoT)
      animarA(base + avance, 2800, frenado, () => {
        setGirando(false)
        const el = itemsRef.current[objetivo]
        if (el) { el.classList.remove('aterriza'); void el.offsetWidth; el.classList.add('aterriza') }
        tono(() => sonidoRef.current, 520, 1040, 0.22, 'triangle', 0.1)
        setAviso(`¡Te tocó ${PERSONAJES[objetivo].nombre}!`)
        avisoT = setTimeout(() => setAviso(''), 2400)
      })
    }
    ctrlRef.current = { ir, azar }

    const espacioPx = () => ESPACIO * (cont.clientWidth / POSTER.ancho)
    const alBajar = (ev) => {
      if (anim && anim.dur > 1000) return   // no se puede agarrar mientras gira
      anim = null
      drag = { x0: ev.clientX, p0: pos.v, x: ev.clientX, t: performance.now(), v: 0, movido: false, id: ev.pointerId }
      try { cont.setPointerCapture(ev.pointerId) } catch { /* ya liberado */ }
    }
    const alMover = (ev) => {
      if (!drag || ev.pointerId !== drag.id) return
      const dx = ev.clientX - drag.x0
      if (Math.abs(dx) > 6) drag.movido = true
      if (!drag.movido) return
      pos.v = drag.p0 - dx / espacioPx()
      const ahora = performance.now()
      const dt = Math.max(1, ahora - drag.t)
      drag.v = 0.7 * drag.v + 0.3 * (-(ev.clientX - drag.x) / espacioPx() / (dt / 1000))
      drag.x = ev.clientX; drag.t = ahora
    }
    const alSoltar = (ev) => {
      if (!drag || ev.pointerId !== drag.id) return
      const d = drag; drag = null
      if (!d.movido) {
        const el = ev.target.closest?.('[data-i]')
        if (el) { const dd = relativa(Number(el.dataset.i), pos.v); if (Math.abs(dd) > 0.3) animarA(pos.v + dd, 340, suave) }
        return
      }
      const meta = Math.round(pos.v + Math.max(-2, Math.min(2, d.v * 0.18)))
      animarA(meta, 380, suave)
    }
    cont.addEventListener('pointerdown', alBajar)
    cont.addEventListener('pointermove', alMover)
    cont.addEventListener('pointerup', alSoltar)
    cont.addEventListener('pointercancel', alSoltar)
    raf = requestAnimationFrame(cuadro)
    return () => {
      cancelAnimationFrame(raf); clearTimeout(avisoT)
      cont.removeEventListener('pointerdown', alBajar); cont.removeEventListener('pointermove', alMover)
      cont.removeEventListener('pointerup', alSoltar); cont.removeEventListener('pointercancel', alSoltar)
      ctrlRef.current = null
      setGirando(false); setAviso('')
    }
    // la posición inicial sale del personaje guardado; después el carrusel manda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantalla])

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
              <div className="jg-carrusel" ref={carruselRef} style={{ top: pct(500, POSTER.alto), height: pct(430, POSTER.alto) }} aria-label="Elige tu personaje: desliza a los lados">
                {PERSONAJES.map((p, i) => (
                  <div key={p.id} data-i={i} className="jg-item" ref={el => { itemsRef.current[i] = el }} style={{ width: pct(ANCHO_GALLINA, POSTER.ancho) }}>
                    <img src={`${BASE}juego/pj-${p.id}.png`} alt={p.nombre} draggable="false" />
                  </div>
                ))}
              </div>
              <div className="jg-nombre-caja" style={{ top: pct(945, POSTER.alto) }}>
                <div key={girando ? 'girando' : `${actual.id}-${aviso}`} className={`jg-nombre${aviso ? ' aviso' : ''}`}>{aviso || actual.nombre}</div>
                <div className="jg-puntos" aria-hidden="true">
                  {PERSONAJES.map(p => <span key={p.id} className={p.id === personaje ? 'on' : ''} />)}
                </div>
              </div>
              <button type="button" className={`jg-azar${girando ? ' girando' : ''}`} disabled={girando} onClick={() => ctrlRef.current?.azar()}
                style={{ top: pct(1080, POSTER.alto) }}>
                <svg className="jg-dado" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="#fff6dc" stroke="#7a1f14" strokeWidth="2" />
                  {[[8, 8], [16, 8], [12, 12], [8, 16], [16, 16]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.7" fill="#7a1f14" />)}
                </svg>
                <span>{girando ? 'Girando…' : 'Al azar'}</span>
              </button>
              <button type="button" className="jg-jugar" disabled={!imgs} onClick={correr} aria-label={`Jugar con ${actual.nombre}`}
                style={{ left: pct(210, POSTER.ancho), top: pct(1232, POSTER.alto), width: pct(520, POSTER.ancho) }}>
                <img src={`${BASE}juego/jugar.png`} alt="" draggable="false" />
              </button>
              <img className="jg-tabla" src={`${BASE}juego/tabla.png`} alt="Disponible solo en tiendas" draggable="false"
                style={{ left: pct(235, POSTER.ancho), top: pct(1470, POSTER.alto), width: pct(470, POSTER.ancho) }} />
            </div>
            <button type="button" className="jg-flecha jg-flecha-izq" aria-label="Personaje anterior" disabled={girando} onClick={() => ctrlRef.current?.ir(-1)} style={{ top: 690 * escala - 22 }}>‹</button>
            <button type="button" className="jg-flecha jg-flecha-der" aria-label="Personaje siguiente" disabled={girando} onClick={() => ctrlRef.current?.ir(1)} style={{ top: 690 * escala - 22 }}>›</button>
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
