/* Motor del minijuego "Atrapa los pollitos": una canasta (que se arrastra de lado a lado) atrapa los pollitos y las
   piezas del pedido que caen; los adornos (esfera, piña, listón) no van en el pedido y quitan un corazón. Las
   rachas multiplican los puntos. Cuando no hay partida corre una demostración sola detrás de la portada.

   El mundo se dibuja en un lienzo de ancho fijo (W unidades) y alto variable según la pantalla, así el tiempo de
   reacción es el mismo en cualquier teléfono. Los dibujos viven en public/pollitos/; el fondo (mercadito de noche
   con luces) se pinta con código, una sola vez por tamaño de pantalla. */
import { sonar } from './pollitosAudio.js'

const W = 400
const MOSTRADOR = 92           // alto de la franja del mostrador (suelo)
const CANASTA_W = 108
const VEL_CANASTA = 1500       // unidades por segundo
const VIDAS = 3

const BUENOS = [
  { id: 'pollito-1', w: 54, tipo: 'pollito', peso: 10 },
  { id: 'pollito-2', w: 58, tipo: 'pollito', peso: 10 },
  { id: 'pollito-3', w: 50, tipo: 'pollito', peso: 10 },
  { id: 'muslo', w: 54, tipo: 'pieza', peso: 7 },
  { id: 'ala', w: 52, tipo: 'pieza', peso: 7 },
  { id: 'pechuga', w: 54, tipo: 'pieza', peso: 7 },
  { id: 'papas-1', w: 42, tipo: 'pieza', peso: 5 },
  { id: 'papas-2', w: 42, tipo: 'pieza', peso: 5 },
  { id: 'moneda', w: 40, tipo: 'moneda', valor: 25, peso: 4 },
  { id: 'moneda-estrella', w: 42, tipo: 'estrella', valor: 50, peso: 3 },
]
const CORAZON = { id: 'corazon', w: 40, tipo: 'vida', peso: 5 }
const MALOS = [
  { id: 'esfera', w: 46, tipo: 'malo' },
  { id: 'pina', w: 46, tipo: 'malo' },
  { id: 'liston', w: 56, tipo: 'malo' },
]
const IMAGENES = ['canasta', ...BUENOS.map(b => b.id), CORAZON.id, ...MALOS.map(m => m.id)]

const COLORES_CHISPA = ['#FFE066', '#FFF3C4', '#F4B63E', '#FF9F43']
const COLORES_LUZ = ['#FFD36A', '#FF6A5A', '#7FE08A', '#FFD36A', '#FFF1C2']

const alea = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) }
const entre = (v, a, b) => Math.max(a, Math.min(b, v))

export function cargarImagenes(base) {
  return Promise.all(IMAGENES.map(n => new Promise((ok) => {
    const im = new Image()
    im.onload = () => ok([n, im])
    im.onerror = () => ok([n, null])
    im.src = `${base}pollitos/${n}.webp`
  }))).then(pares => Object.fromEntries(pares))
}

export function crearJuego(canvas, imgs, op) {
  const ctx = canvas.getContext('2d')
  let H = 800
  let esc = 1
  let fondo = null
  let luces = []
  const brillos = {}

  let estado = 'demo'          // demo | jugando | terminando
  let pausado = false
  let reloj = 0                // tiempo total (para animaciones)
  let t = 0                    // tiempo de la partida
  let finT = 0
  let items = []
  let particulas = []
  let textos = []
  let nieve = Array.from({ length: 34 }, (_, i) => ({ x: alea(i) * W, y: alea(i + 50) * 900, r: 0.8 + alea(i + 90) * 1.6, v: 14 + alea(i + 130) * 22, f: alea(i + 170) * 6 }))
  let x = W / 2
  let objetivo = W / 2
  let inclina = 0
  let puntos = 0, vidas = VIDAS, racha = 0, mejorRacha = 0, nPollitos = 0, nPiezas = 0
  let spawnT = 0.6
  let ultimoX = -999
  let ultimoSpawn = -9
  let sacudida = 0, destello = 0, rebote = 0
  let izq = false, der = false
  let raf = 0
  let ultimo = performance.now()

  const activo = () => estado === 'jugando' && op.sonidoActivo()
  const sonido = (nombre, extra) => sonar(activo, nombre, extra)
  const mult = () => Math.min(4, 1 + Math.floor(racha / 5))
  const avisarPuntos = () => { if (estado === 'jugando') op.onPuntos?.({ puntos, racha, mult: mult() }) }

  /* ---------- medidas y fondo ---------- */
  function medir() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
    const r = canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    canvas.width = Math.round(r.width * dpr)
    canvas.height = Math.round(r.height * dpr)
    esc = canvas.width / W
    H = canvas.height / esc
    fondo = pintarFondo()
    luces = calcularLuces()
  }

  const sueloY = () => H - MOSTRADOR

  function puesto(g, x0, ancho, suelo, semilla) {
    const top = suelo - 150
    g.fillStyle = '#2b1628'; g.fillRect(x0 + 6, top + 28, ancho - 12, 116)
    const brillo = g.createRadialGradient(x0 + ancho / 2, top + 88, 4, x0 + ancho / 2, top + 88, ancho * 0.64)
    brillo.addColorStop(0, 'rgba(255,214,130,.95)'); brillo.addColorStop(1, 'rgba(255,170,80,0)')
    g.fillStyle = brillo; g.fillRect(x0 + 6, top + 28, ancho - 12, 116)
    // clientes de espaldas
    g.fillStyle = '#2a1530'
    for (let k = 0; k < 2; k++) {
      const px = x0 + 34 + k * 56 + alea(semilla + k) * 12
      g.beginPath(); g.arc(px, suelo - 74, 7, 0, 6.283); g.fill()
      g.beginPath(); g.roundRect(px - 10, suelo - 66, 20, 34, 8); g.fill()
    }
    g.fillStyle = '#5b3520'; g.fillRect(x0 + 4, top + 20, 5, 130); g.fillRect(x0 + ancho - 9, top + 20, 5, 130)
    // toldo a rayas con festón
    const n = 8, sw = ancho / n, tope = ancho - 24
    for (let k = 0; k < n; k++) {
      g.fillStyle = k % 2 ? '#f8e8d1' : '#c44a3a'
      g.beginPath()
      g.moveTo(x0 + 12 + (tope / n) * k, top)
      g.lineTo(x0 + 12 + (tope / n) * (k + 1), top)
      g.lineTo(x0 + sw * (k + 1), top + 30)
      g.lineTo(x0 + sw * k, top + 30)
      g.closePath(); g.fill()
      g.beginPath(); g.arc(x0 + sw * k + sw / 2, top + 30, sw / 2, 0, Math.PI); g.fill()
    }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0 + 12, top, ancho - 24, 4)
    // mesita del puesto
    g.fillStyle = '#7a4b2e'; g.fillRect(x0 + 2, suelo - 34, ancho - 4, 34)
    g.fillStyle = '#a56a3d'; g.fillRect(x0 + 2, suelo - 34, ancho - 4, 4)
  }

  function siluetas(g, base, color, altoMax, semilla, ventanas) {
    let px = -10
    let i = semilla
    while (px < W + 10) {
      const w = 24 + alea(i++) * 34
      const h = 30 + alea(i++) * altoMax
      g.fillStyle = color
      g.fillRect(px, base - h, w, h + 50)
      if (alea(i++) > 0.4) {
        g.beginPath(); g.moveTo(px - 3, base - h); g.lineTo(px + w / 2, base - h - 14 - alea(i++) * 14); g.lineTo(px + w + 3, base - h); g.closePath(); g.fill()
      }
      if (ventanas) {
        g.fillStyle = 'rgba(255,210,122,.85)'
        for (let fy = base - h + 10; fy < base - 14; fy += 18) {
          for (let fx = px + 6; fx < px + w - 8; fx += 14) if (alea(i++) > 0.45) g.fillRect(fx, fy, 5, 7)
        }
      }
      px += w + 2 + alea(i++) * 6
    }
  }

  function pintarFondo() {
    const c = document.createElement('canvas')
    c.width = canvas.width; c.height = canvas.height
    const g = c.getContext('2d')
    g.scale(esc, esc)
    const suelo = sueloY()

    const cielo = g.createLinearGradient(0, 0, 0, suelo)
    cielo.addColorStop(0, '#231a52'); cielo.addColorStop(0.42, '#4b3478'); cielo.addColorStop(0.74, '#b85d6b'); cielo.addColorStop(1, '#f2a45c')
    g.fillStyle = cielo; g.fillRect(0, 0, W, H)
    g.fillStyle = 'rgba(255,255,255,.8)'
    for (let i = 0; i < 40; i++) {
      const sy = alea(i + 7) * suelo * 0.5
      g.globalAlpha = 0.25 + alea(i + 19) * 0.55
      g.beginPath(); g.arc(alea(i) * W, sy, 0.6 + alea(i + 31) * 1.1, 0, 6.283); g.fill()
    }
    g.globalAlpha = 1

    // pueblo de fondo: dos capas de casitas y la torre de la iglesia
    siluetas(g, suelo - 30, '#5a3f78', 90, 3, false)
    siluetas(g, suelo - 20, '#3a2a63', 70, 41, true)
    g.fillStyle = '#34265c'
    g.fillRect(292, suelo - 190, 30, 190)
    g.beginPath(); g.moveTo(288, suelo - 190); g.lineTo(307, suelo - 232); g.lineTo(326, suelo - 190); g.closePath(); g.fill()
    g.fillRect(305, suelo - 250, 3, 20); g.fillRect(300, suelo - 244, 13, 3)
    g.fillStyle = 'rgba(255,210,122,.9)'; g.fillRect(302, suelo - 172, 10, 16)

    // mercadito: tres puestos con toldo a rayas y dos faroles
    puesto(g, -6, 136, suelo, 11)
    puesto(g, 132, 136, suelo, 27)
    puesto(g, 270, 136, suelo, 53)
    for (const lx of [10, W - 10]) {
      g.fillStyle = '#2a1b18'; g.fillRect(lx - 2, suelo - 210, 4, 210)
      const f = g.createRadialGradient(lx, suelo - 214, 2, lx, suelo - 214, 34)
      f.addColorStop(0, 'rgba(255,224,150,1)'); f.addColorStop(1, 'rgba(255,190,100,0)')
      g.fillStyle = f; g.beginPath(); g.arc(lx, suelo - 214, 34, 0, 6.283); g.fill()
      g.fillStyle = '#FFE9A8'; g.fillRect(lx - 6, suelo - 222, 12, 16)
    }

    // guirnaldas de luces (el cable; los focos parpadean en cada cuadro)
    g.strokeStyle = '#2a1b18'; g.lineWidth = 1.6
    for (const [y0, y1, caida] of [[34, 40, 38], [92, 84, 30]]) {
      g.beginPath(); g.moveTo(-10, y0)
      g.quadraticCurveTo(W / 2, Math.max(y0, y1) + caida * 2, W + 10, y1)
      g.stroke()
    }
    // guirnalda de pino arriba, con esferas y bayas
    for (let px = -6; px < W + 8; px += 8) {
      const py = 6 + Math.sin(px * 0.18) * 3
      g.fillStyle = ['#1F4A3A', '#3F5F46', '#2c5a3c'][Math.round(px / 8) % 3]
      g.beginPath(); g.arc(px, py, 9, 0, 6.283); g.fill()
    }
    for (let px = 14; px < W; px += 27) {
      g.fillStyle = Math.round(px / 27) % 3 === 0 ? '#F4B63E' : '#D0382C'
      g.beginPath(); g.arc(px, 9 + Math.sin(px * 0.18) * 3, Math.round(px / 27) % 3 === 0 ? 4.4 : 3, 0, 6.283); g.fill()
    }

    // mostrador de madera con mantel de cuadros
    const madera = g.createLinearGradient(0, suelo, 0, H)
    madera.addColorStop(0, '#8a5632'); madera.addColorStop(1, '#4e2e1a')
    g.fillStyle = madera; g.fillRect(0, suelo, W, MOSTRADOR)
    g.fillStyle = 'rgba(40,20,10,.45)'
    for (let px = 40; px < W; px += 66) g.fillRect(px, suelo + 18, 2, MOSTRADOR)
    g.fillStyle = '#f8e8d1'; g.fillRect(0, suelo, W, 18)
    g.fillStyle = 'rgba(196,74,58,.55)'
    for (let px = 0; px < W; px += 12) g.fillRect(px, suelo, 6, 18)
    for (let py = 0; py < 18; py += 12) g.fillRect(0, suelo + py, W, 6)
    g.fillStyle = 'rgba(60,25,10,.55)'; g.fillRect(0, suelo + 18, W, 3)
    g.fillStyle = 'rgba(255,225,170,.25)'; g.fillRect(0, suelo + 21, W, 2)

    const vi = g.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.75)
    vi.addColorStop(0, 'rgba(20,8,30,0)'); vi.addColorStop(1, 'rgba(20,8,30,.42)')
    g.fillStyle = vi; g.fillRect(0, 0, W, H)
    return c
  }

  function calcularLuces() {
    const lista = []
    for (const [y0, y1, caida] of [[34, 40, 38], [92, 84, 30]]) {
      const ctrl = Math.max(y0, y1) + caida * 2
      for (let k = 0; k <= 13; k++) {
        const u = k / 13
        const px = -10 + (W + 20) * u
        const py = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * ctrl + u ** 2 * y1
        lista.push({ x: px, y: py + 5, c: COLORES_LUZ[(k + lista.length) % COLORES_LUZ.length], f: k * 1.7 + y0 })
      }
    }
    return lista
  }

  function brillo(color) {
    if (!brillos[color]) {
      const c = document.createElement('canvas'); c.width = c.height = 48
      const g = c.getContext('2d')
      const r = g.createRadialGradient(24, 24, 1, 24, 24, 24)
      r.addColorStop(0, '#fff'); r.addColorStop(0.2, color); r.addColorStop(0.45, color + '55'); r.addColorStop(1, color + '00')
      g.fillStyle = r; g.fillRect(0, 0, 48, 48)
      brillos[color] = c
    }
    return brillos[color]
  }

  /* ---------- reglas ---------- */
  const velocidad = () => (estado === 'demo' ? H * 0.2 : H * (0.27 + Math.min(0.3, t * 0.0042)))
  const intervalo = () => (estado === 'demo' ? 0.95 : Math.max(0.42, 0.95 - t * 0.009))
  const probMalo = () => (estado !== 'jugando' || t < 4 ? 0 : Math.min(0.36, 0.12 + t * 0.0035))

  function elegir() {
    if (Math.random() < probMalo()) return MALOS[Math.floor(Math.random() * MALOS.length)]
    const bolsa = estado === 'jugando' && vidas < VIDAS ? [...BUENOS, CORAZON] : BUENOS
    let r = Math.random() * bolsa.reduce((s, b) => s + b.peso, 0)
    for (const b of bolsa) { r -= b.peso; if (r <= 0) return b }
    return bolsa[0]
  }

  function generar() {
    const def = elegir()
    let px = 30
    for (let k = 0; k < 6; k++) {
      px = 30 + Math.random() * (W - 60)
      if (Math.abs(px - ultimoX) > 70 || reloj - ultimoSpawn > 0.5) break
    }
    ultimoX = px; ultimoSpawn = reloj
    const im = imgs[def.id]
    const h = im ? (def.w * im.naturalHeight) / im.naturalWidth : def.w
    items.push({ ...def, malo: def.tipo === 'malo', x: px, y: -h, h, vy: velocidad() * (0.92 + Math.random() * 0.16), rot0: (Math.random() - 0.5) * 0.5, fase: Math.random() * 6, rot: 0, dentro: -1 })
  }

  function chispas(px, py, colores, n, fuerza = 170) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283
      const v = fuerza * (0.4 + Math.random() * 0.8)
      particulas.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, vida: 0.5 + Math.random() * 0.4, max: 0.9, r: 2 + Math.random() * 2.6, c: colores[i % colores.length] })
    }
  }
  const texto = (px, py, txt, color = '#FFF3C4', tam = 24) => textos.push({ x: px, y: py, txt, c: color, tam, vida: 0.9 })

  function atrapar(it) {
    it.dentro = 0
    const bocaY = sueloY() + 12 - (CANASTA_W * 233) / 300 + 18
    if (it.malo) {
      if (estado === 'jugando') {
        vidas -= 1; racha = 0; sacudida = 0.5; destello = 0.55
        sonido('malo')
        op.onVidas?.(vidas); avisarPuntos()
        texto(it.x, bocaY - 10, '¡Ese no va!', '#FFB4A8', 22)
        if (vidas <= 0) { estado = 'terminando'; finT = 0.9 }
      }
      chispas(it.x, bocaY, ['#D0382C', '#8a2a1a', '#F4B63E'], 12)
      it.dentro = 1                      // el adorno rebota y desaparece
      return
    }
    rebote = 1
    chispas(it.x, bocaY, COLORES_CHISPA, 9)
    if (estado !== 'jugando') return
    if (it.tipo === 'vida') {
      vidas = Math.min(VIDAS, vidas + 1)
      sonido('vida'); op.onVidas?.(vidas)
      texto(it.x, bocaY - 12, '+1 ❤', '#FFB4B4', 26)
      return
    }
    racha += 1; mejorRacha = Math.max(mejorRacha, racha)
    const m = mult()
    const ganado = (it.valor || 10) * m
    puntos += ganado
    if (it.tipo === 'pollito') nPollitos += 1
    else if (it.tipo === 'pieza') nPiezas += 1
    sonido(it.tipo === 'moneda' || it.tipo === 'estrella' ? 'moneda' : 'atrapa', racha)
    texto(it.x, bocaY - 12, `+${ganado}`, m > 1 ? '#FFE066' : '#FFF3C4', 22 + m * 2)
    avisarPuntos()
  }

  function fallo(it) {
    chispas(it.x, sueloY() + 4, ['#F8E8D1', '#E9C98F'], 5, 70)
    if (estado === 'jugando' && it.tipo === 'pollito') {
      if (racha > 0) { racha = 0; avisarPuntos() }
      sonido('falla')
    }
  }

  function terminar() {
    const r = { puntos, pollitos: nPollitos, piezas: nPiezas, racha: mejorRacha, segundos: Math.round(t) }
    estado = 'demo'; items = []; spawnT = 0.5
    op.onFin?.(r)
  }

  function iniciar() {
    items = []; particulas = []; textos = []
    puntos = 0; vidas = VIDAS; racha = 0; mejorRacha = 0; nPollitos = 0; nPiezas = 0
    t = 0; spawnT = 0.7; sacudida = 0; destello = 0
    estado = 'jugando'; pausado = false
    op.onVidas?.(vidas); op.onPuntos?.({ puntos, racha, mult: 1 })
    sonar(op.sonidoActivo, 'inicio')
  }

  /* ---------- cuadro a cuadro ---------- */
  function actualizar(dtReal) {
    const dt = estado === 'terminando' ? dtReal * 0.35 : dtReal
    reloj += dtReal
    if (estado === 'jugando' || estado === 'terminando') t += dt

    if (estado === 'demo') {
      const objetivoItem = items.filter(i => !i.malo && i.dentro < 0 && i.y > 0).sort((a, b) => b.y - a.y)[0]
      objetivo = objetivoItem ? objetivoItem.x : W / 2 + Math.sin(reloj * 0.7) * 80
    } else if (izq || der) {
      objetivo = entre(objetivo + (der - izq) * 520 * dt, 0, W)
    }
    const lim = VEL_CANASTA * (estado === 'demo' ? 0.4 : 1) * dtReal
    const antes = x
    x = entre(x + entre(objetivo - x, -lim, lim), CANASTA_W / 2 - 8, W - CANASTA_W / 2 + 8)
    inclina += (entre((x - antes) / Math.max(dtReal, 0.001) / VEL_CANASTA * 0.5, -0.14, 0.14) - inclina) * Math.min(1, 9 * dtReal)

    if (estado !== 'terminando') {
      spawnT -= dtReal
      if (spawnT <= 0) { generar(); spawnT = intervalo() * (0.75 + Math.random() * 0.5) }
    } else {
      finT -= dtReal
      if (finT <= 0) terminar()
    }

    const suelo = sueloY()
    const bocaY = suelo + 12 - (CANASTA_W * 233) / 300 + 18
    for (const it of items) {
      if (it.dentro >= 0) {
        it.dentro += dt / 0.18
        continue
      }
      it.y += it.vy * dt
      it.rot = it.rot0 + Math.sin(reloj * (it.malo ? 5 : 3) + it.fase) * (it.malo ? 0.5 : 0.25)
      if (it.y + it.h * 0.3 >= bocaY && it.y <= bocaY + 34 && Math.abs(it.x - x) <= CANASTA_W * 0.4 + it.w * 0.1) atrapar(it)
      else if (it.y - it.h / 2 >= suelo - 6) { it.dentro = 99; fallo(it) }
    }
    items = items.filter(it => it.dentro < 1)

    for (const p of particulas) { p.vy += 420 * dtReal; p.x += p.vx * dtReal; p.y += p.vy * dtReal; p.vida -= dtReal }
    particulas = particulas.filter(p => p.vida > 0)
    for (const tx of textos) { tx.y -= 46 * dtReal; tx.vida -= dtReal }
    textos = textos.filter(tx => tx.vida > 0)
    for (const n of nieve) { n.y += n.v * dtReal; n.x += Math.sin(reloj * 0.8 + n.f) * 8 * dtReal; if (n.y > H) { n.y = -4; n.x = Math.random() * W } }
    rebote = Math.max(0, rebote - dtReal * 5)
    sacudida = Math.max(0, sacudida - dtReal * 1.8)
    destello = Math.max(0, destello - dtReal * 1.6)
  }

  function dibujar() {
    if (!fondo) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(fondo, 0, 0)
    ctx.setTransform(esc, 0, 0, esc, 0, 0)
    if (sacudida > 0) ctx.translate((Math.random() - 0.5) * sacudida * 14, (Math.random() - 0.5) * sacudida * 14)

    ctx.fillStyle = 'rgba(255,255,255,.4)'
    for (const n of nieve) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill() }

    for (const l of luces) {
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(reloj * 2.4 + l.f)
      ctx.drawImage(brillo(l.c), l.x - 11, l.y - 11, 22, 22)
    }
    ctx.globalAlpha = 1

    for (const it of items) {
      const im = imgs[it.id]
      if (!im) continue
      let w = it.w
      let py = it.y
      let alfa = 1
      if (it.dentro >= 0) {
        const k = Math.min(1, it.dentro)
        w = it.w * (1 - 0.45 * k)
        py = it.y + 22 * k
        alfa = 1 - k
      }
      const h = w * im.naturalHeight / im.naturalWidth
      ctx.save()
      ctx.translate(it.x, py); ctx.rotate(it.rot); ctx.globalAlpha = alfa
      ctx.drawImage(im, -w / 2, -h / 2, w, h)
      ctx.restore()
    }

    const cb = imgs.canasta
    const cw = CANASTA_W
    const ch = cb ? (cw * cb.naturalHeight) / cb.naturalWidth : 84
    if (cb) {
      ctx.save()
      ctx.translate(x, sueloY() + 12)
      ctx.rotate(inclina)
      ctx.scale(1 + rebote * 0.1, 1 - rebote * 0.12)
      ctx.drawImage(cb, -cw / 2, -ch, cw, ch)
      ctx.restore()
    }

    for (const p of particulas) {
      ctx.globalAlpha = Math.max(0, p.vida / p.max)
      ctx.fillStyle = p.c
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.textAlign = 'center'; ctx.lineJoin = 'round'
    for (const tx of textos) {
      ctx.globalAlpha = Math.min(1, tx.vida * 2.2)
      ctx.font = `800 ${tx.tam}px "Plus Jakarta Sans", system-ui, sans-serif`
      ctx.lineWidth = 5; ctx.strokeStyle = '#4b2012'; ctx.strokeText(tx.txt, tx.x, tx.y)
      ctx.fillStyle = tx.c; ctx.fillText(tx.txt, tx.x, tx.y)
    }
    ctx.globalAlpha = 1

    if (destello > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75)
      g.addColorStop(0, 'rgba(208,56,44,0)'); g.addColorStop(1, `rgba(208,56,44,${destello * 0.55})`)
      ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40)
    }
  }

  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000)
    ultimo = ahora
    if (!pausado) actualizar(dt)
    dibujar()
    raf = requestAnimationFrame(cuadro)
  }

  /* ---------- entradas ---------- */
  const mover = (ev) => {
    if (estado !== 'jugando' || pausado) return
    const r = canvas.getBoundingClientRect()
    objetivo = entre(((ev.clientX - r.left) / r.width) * W, 0, W)
  }
  const tecla = (ev, v) => {
    if (ev.key === 'ArrowLeft' || ev.key === 'a' || ev.key === 'A') { izq = v; ev.preventDefault() }
    else if (ev.key === 'ArrowRight' || ev.key === 'd' || ev.key === 'D') { der = v; ev.preventDefault() }
  }
  const alBajar = (ev) => tecla(ev, true)
  const alSubir = (ev) => tecla(ev, false)
  const alOcultar = () => { if (document.hidden && estado === 'jugando' && !pausado) { pausado = true; op.onPausa?.(true) } }

  canvas.addEventListener('pointerdown', mover)
  canvas.addEventListener('pointermove', mover)
  window.addEventListener('keydown', alBajar)
  window.addEventListener('keyup', alSubir)
  document.addEventListener('visibilitychange', alOcultar)
  const ro = new ResizeObserver(medir)
  ro.observe(canvas)
  medir()
  raf = requestAnimationFrame(cuadro)

  return {
    iniciar,
    pausar(v) { pausado = !!v },
    salir() { estado = 'demo'; pausado = false; items = []; spawnT = 0.5 },
    destruir() {
      cancelAnimationFrame(raf); ro.disconnect()
      canvas.removeEventListener('pointerdown', mover)
      canvas.removeEventListener('pointermove', mover)
      window.removeEventListener('keydown', alBajar)
      window.removeEventListener('keyup', alSubir)
      document.removeEventListener('visibilitychange', alOcultar)
    },
  }
}
