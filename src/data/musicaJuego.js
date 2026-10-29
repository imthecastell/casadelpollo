import { contextoAudio } from './juegoGallina.js'

/* Música de ambiente de "El Salto del Pollo": una pista tranquila para la portada y otra más movida para la
   carrera. Se repiten sin corte (WebAudio, con el empalme del final ya preparado en el archivo) y cambian de una
   a otra con un fundido. Los navegadores no dejan sonar nada antes del primer toque del usuario, así que la música
   arranca sola con el primer toque en la pantalla; el botón de sonido la apaga junto con los efectos. */
const PISTAS = { menu: 'musica-menu.m4a', juego: 'musica-juego.m4a' }
const VOLUMEN = 0.55     // nivel de la música respecto a los efectos
const FUNDIDO = 0.8      // segundos

const buffers = {}       // pista → promesa del audio ya decodificado
let base = ''
let maestro = null       // volumen general (silencio / atenuado)
let sonando = null       // { nombre, fuente, ganancia }
let pedida = null
let encendida = true
let atenuada = false

function salida() {
  const ctx = contextoAudio()
  if (!ctx) return null
  if (!maestro) {
    maestro = ctx.createGain()
    maestro.connect(ctx.destination)
    maestro.gain.value = encendida ? VOLUMEN : 0
  }
  return ctx
}

function cargar(nombre) {
  if (!buffers[nombre]) {
    const ctx = contextoAudio()
    buffers[nombre] = !ctx ? Promise.resolve(null)
      : fetch(`${base}juego/${PISTAS[nombre]}`).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).catch(() => null)
  }
  return buffers[nombre]
}

export function precargar(ruta) {
  base = ruta
  cargar('menu').then(() => cargar('juego'))
}

function nivel() { return encendida ? VOLUMEN * (atenuada ? 0.45 : 1) : 0 }

function aplicar() {
  const ctx = salida()
  if (!ctx || ctx.state !== 'running' || !pedida) return
  if (sonando?.nombre === pedida) return
  const nombre = pedida
  const anterior = sonando
  sonando = { nombre, fuente: null, ganancia: null }   // reserva el lugar mientras carga
  cargar(nombre).then((buf) => {
    if (!buf || pedida !== nombre || sonando?.nombre !== nombre) { if (sonando?.nombre === nombre && !buf) sonando = null; return }
    const t = ctx.currentTime
    const ganancia = ctx.createGain()
    ganancia.gain.setValueAtTime(0, t)
    ganancia.gain.linearRampToValueAtTime(1, t + FUNDIDO)
    const fuente = ctx.createBufferSource()
    fuente.buffer = buf; fuente.loop = true
    fuente.connect(ganancia); ganancia.connect(maestro)
    fuente.start(t)
    if (anterior?.ganancia) {
      anterior.ganancia.gain.cancelScheduledValues(t)
      anterior.ganancia.gain.setValueAtTime(anterior.ganancia.gain.value, t)
      anterior.ganancia.gain.linearRampToValueAtTime(0, t + FUNDIDO)
      anterior.fuente.stop(t + FUNDIDO + 0.1)
    }
    sonando = { nombre, fuente, ganancia }
  })
}

// pista que debe sonar ahora ('menu' o 'juego')
export function ponerPista(nombre) { pedida = nombre; aplicar() }

export function activarMusica(si) {
  encendida = si
  const ctx = salida()
  if (maestro && ctx) maestro.gain.setTargetAtTime(nivel(), ctx.currentTime, 0.08)
}

// baja el volumen (por ejemplo mientras se ve el resultado) y lo regresa
export function atenuarMusica(si) {
  atenuada = si
  const ctx = salida()
  if (maestro && ctx) maestro.gain.setTargetAtTime(nivel(), ctx.currentTime, 0.2)
}

// se llama con el primer toque del usuario: el navegador solo entonces deja sonar el audio
export function desbloquear() {
  const ctx = salida()
  if (!ctx) return true
  if (ctx.state === 'suspended') ctx.resume().then(aplicar).catch(() => {})
  else aplicar()
  return ctx.state === 'running'
}

if (typeof document !== 'undefined') {
  // en segundo plano no suena; al volver, sigue
  document.addEventListener('visibilitychange', () => {
    const ctx = contextoAudio()
    if (!ctx || ctx.state === 'closed') return
    if (document.hidden) ctx.suspend().catch(() => {})
    else if (sonando || pedida) ctx.resume().catch(() => {})
  })
}
