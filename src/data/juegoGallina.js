/* Motor del minijuego "El Salto del Pollo": carrera infinita de un solo botón. La gallina corre sola; un toque la
   hace saltar los obstáculos y recoge dulces en el aire. La velocidad sube con la distancia.

   El mundo se dibuja en un lienzo de ancho fijo (W unidades) y alto variable según la pantalla, así el tiempo
   de reacción es el mismo en cualquier teléfono. La ambientación sigue el póster oficial: tarde de otoño con luna,
   bosque, piso de tablones con paja y las gallinas con borde de sticker. Los dibujos viven en public/skins/muertos/
   (hoja de stickers) y public/juego/ (cerca, paca y letrero). */

const W = 400
const SUELO = 96             // alto de la franja de suelo
const X_JUGADOR = 78         // posición fija de la gallina en pantalla
const GRAV = 2000
const SALTO = 780            // altura máxima ≈ 152, tiempo en el aire ≈ 0.78 s
const PX_POR_M = 40
const J_ALTO = 70

export const PERSONAJES = [
  { id: 'bruja', nombre: 'Brujita', img: 'gallina-bruja' },
  { id: 'calabaza', nombre: 'Calabacita', img: 'gallina-calabaza' },
  { id: 'fantasma', nombre: 'Fantasmita', img: 'gallina-fantasma' },
  { id: 'esqueleto', nombre: 'Huesitos', img: 'gallina-esqueleto' },
  { id: 'catrina', nombre: 'Catrina', img: 'gallina-catrina' },
]

const OBSTACULOS = [
  { img: 'calabaza-blanca', h: 52 },
  { img: 'velas', h: 70 },
  { img: 'linterna', h: 74 },
  { img: 'calavera-1', h: 62 },
  { img: 'calavera-2', h: 62 },
  { img: 'calabazar', h: 58 },
  { img: 'cerca', h: 62 },
  { img: 'paca', h: 54 },
  { img: 'letrero', h: 74 },
]
const COLORES_DULCE = ['#FF8A1F', '#F5C518', '#B04CFF', '#E5383B', '#2EC4B6']
const ADORNOS_SUELO = [
  { img: 'hoja-3', x: 30, y: 6, w: 24 }, { img: 'cempasuchil', x: 150, y: 4, w: 22 },
  { img: 'hoja-2', x: 250, y: 8, w: 22 }, { img: 'hoja-3', x: 330, y: 2, w: 18 },
  { img: 'cempasuchil', x: 430, y: 6, w: 24 }, { img: 'hoja-2', x: 500, y: 4, w: 20 },
]
const PERIODO_SUELO = 560
const NUBES = [{ x: 40, y: 0.1, s: 1 }, { x: 250, y: 0.2, s: 0.7 }, { x: 480, y: 0.07, s: 1.2 }, { x: 650, y: 0.26, s: 0.8 }]
const COLORES_ARBOL = ['#2f5a3a', '#d9792a', '#c24a1e', '#e0a32e', '#3d6b3f', '#b5452a']
const ARBOLES = Array.from({ length: 13 }, (_, i) => ({ x: i * 44 + ((i * 17) % 20), h: 48 + ((i * 29) % 34), c: COLORES_ARBOL[(i * 5) % COLORES_ARBOL.length] }))
const PERIODO_BOSQUE = 13 * 44
const HOJAS_CAYENDO = Array.from({ length: 9 }, (_, i) => ({ img: i % 2 ? 'hoja-3' : 'hoja-2', w: 14 + (i % 3) * 5, vx: 24 + (i % 4) * 7, vy: 30 + (i % 5) * 6, f: i * 91 }))

// archivos que no están en la carpeta de la hoja de stickers
const EN_JUEGO = new Set(['cerca', 'paca', 'letrero'])
const IMAGENES = [
  ...PERSONAJES.map(p => p.img),
  ...OBSTACULOS.map(o => o.img),
  'hoja-2', 'hoja-3', 'hoja-grande', 'cempasuchil', 'murcielago-2', 'murcielago-1', 'fantasma-3',
]

export function cargarImagenes(base) {
  const unicas = [...new Set(IMAGENES)]
  return Promise.all(unicas.map(n => new Promise((ok) => {
    const im = new Image()
    im.onload = () => ok([n, im])
    im.onerror = () => ok([n, null])
    im.src = EN_JUEGO.has(n) ? `${base}juego/${n}.png` : `${base}skins/muertos/${n}.png`
  }))).then(pares => Object.fromEntries(pares))
}

let audio = null
function tono(activo, f1, f2, dur, tipo = 'square', vol = 0.05) {
  if (!activo()) return
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)()
    if (audio.state === 'suspended') audio.resume()
    const o = audio.createOscillator()
    const g = audio.createGain()
    const t = audio.currentTime
    o.type = tipo
    o.frequency.setValueAtTime(f1, t)
    o.frequency.exponentialRampToValueAtTime(f2, t + dur)
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g); g.connect(audio.destination)
    o.start(t); o.stop(t + dur)
  } catch { /* sin audio */ }
}

const azar = (i) => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s) }

// la gallina con borde blanco, como los stickers del póster (se arma una sola vez en un lienzo aparte)
function pegatina(im, ancho, alto) {
  const k = 2
  const borde = 3
  const c = document.createElement('canvas')
  c.width = Math.ceil((ancho + borde * 2) * k); c.height = Math.ceil((alto + borde * 2) * k)
  const x = c.getContext('2d')
  const t = document.createElement('canvas')
  t.width = c.width; t.height = c.height
  const tx = t.getContext('2d')
  tx.drawImage(im, borde * k, borde * k, ancho * k, alto * k)
  tx.globalCompositeOperation = 'source-in'
  tx.fillStyle = '#fff'; tx.fillRect(0, 0, t.width, t.height)
  for (let a = 0; a < 16; a++) {
    const ang = (a / 16) * 6.283
    x.drawImage(t, Math.cos(ang) * borde * k, Math.sin(ang) * borde * k)
  }
  x.drawImage(im, borde * k, borde * k, ancho * k, alto * k)
  return { lienzo: c, borde }
}

export function crearJuego(canvas, imgs, personajeId, { onFin, sonidoActivo }) {
  const ctx = canvas.getContext('2d')
  const pj = PERSONAJES.find(p => p.id === personajeId) || PERSONAJES[0]
  const sprite = imgs[pj.img]
  const spriteAlto = J_ALTO
  const spriteAncho = sprite ? J_ALTO * sprite.width / sprite.height : 64
  const sticker = sprite ? pegatina(sprite, spriteAncho, spriteAlto) : null
  let H = 600
  let escala = 1

  const e = {
    t: 0, dist: 0, vel: 230, y: 0, vy: 0, enSuelo: true, dulces: 0, vivo: true, finT: 0, giro: 0,
    obstaculos: [], dulcesLista: [], particulas: [], siguiente: W + 260, buffer: 0, pista: true, terminado: false,
  }

  function ajustar() {
    const r = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
    canvas.width = Math.max(1, Math.round(r.width * dpr))
    canvas.height = Math.max(1, Math.round(r.height * dpr))
    escala = canvas.width / W
    H = canvas.height / escala
  }

  function saltar() {
    if (!e.vivo) return
    if (e.enSuelo) {
      e.vy = SALTO; e.enSuelo = false; e.pista = false
      tono(sonidoActivo, 380, 760, 0.16)
    } else {
      e.buffer = 0.12   // si toca justo antes de aterrizar, salta al caer
    }
  }

  function generar() {
    while (e.siguiente < e.dist + W + 120) {
      const tipo = OBSTACULOS[Math.floor(Math.random() * OBSTACULOS.length)]
      const im = imgs[tipo.img]
      const w = im ? tipo.h * im.width / im.height : 50
      const x = e.siguiente
      e.obstaculos.push({ x, w, h: tipo.h, img: tipo.img })
      // arco de dulces sobre el obstáculo: premia saltar
      if (Math.random() < 0.8) {
        for (let i = -2; i <= 2; i++) {
          e.dulcesLista.push({ x: x + w / 2 + i * 34, h: Math.min(140, tipo.h + 30 + 34 * (1 - (i / 2) ** 2)), c: COLORES_DULCE[(i + 2 + e.dulcesLista.length) % 5], f: Math.random() * 6 })
        }
      }
      // hueco hasta el siguiente: siempre alcanza para aterrizar y volver a saltar
      const hueco = e.vel * (0.85 + Math.random() * 0.8) + 170
      if (Math.random() < 0.5) {
        for (let i = 0; i < 3; i++) e.dulcesLista.push({ x: x + w + hueco * 0.35 + i * 32, h: 26, c: COLORES_DULCE[(i + e.dulcesLista.length) % 5], f: Math.random() * 6 })
      }
      e.siguiente = x + w + hueco
    }
    const corte = e.dist - 120
    e.obstaculos = e.obstaculos.filter(o => o.x + o.w > corte)
    e.dulcesLista = e.dulcesLista.filter(c => c.x > corte)
  }

  function morir() {
    e.vivo = false; e.vy = 430; e.enSuelo = false
    tono(sonidoActivo, 300, 60, 0.45, 'sawtooth', 0.07)
  }

  function paso(dt) {
    e.t += dt
    const sueloY = H - SUELO
    if (e.vivo) {
      const metros = e.dist / PX_POR_M
      e.vel = Math.min(540, 230 + metros * 1.1)
      e.dist += e.vel * dt
      if (e.buffer > 0) e.buffer -= dt
      generar()
    } else {
      e.finT += dt
      e.giro += dt * 9
    }
    // física de la gallina
    if (!e.enSuelo) {
      e.vy -= GRAV * dt
      e.y += e.vy * dt
      if (e.y <= 0) {
        e.y = 0; e.vy = 0
        if (e.vivo) { e.enSuelo = true; if (e.buffer > 0) { e.buffer = 0; saltar() } }
        else e.enSuelo = true
      }
    }
    if (e.vivo) {
      const izq = X_JUGADOR + 22
      const der = X_JUGADOR + spriteAncho - 22
      const abajo = sueloY - e.y
      const arriba = abajo - (J_ALTO - 14)
      for (const o of e.obstaculos) {
        const sx = o.x - e.dist
        if (sx > W) break
        if (der > sx + 10 && izq < sx + o.w - 10 && abajo > sueloY - o.h + 8 && arriba < sueloY) { morir(); break }
      }
      const cx = X_JUGADOR + spriteAncho / 2
      const cy = abajo - J_ALTO / 2
      for (let i = e.dulcesLista.length - 1; i >= 0; i--) {
        const c = e.dulcesLista[i]
        const sx = c.x - e.dist
        if (Math.abs(sx - cx) < 34 && Math.abs(sueloY - c.h - cy) < 40) {
          e.dulcesLista.splice(i, 1)
          e.dulces++
          tono(sonidoActivo, 880, 1500, 0.12, 'sine', 0.07)
          for (let k = 0; k < 7; k++) {
            const a = Math.random() * 6.283
            e.particulas.push({ x: sx, y: sueloY - c.h, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, vida: 0.45, c: c.c })
          }
        }
      }
    } else if (e.finT > 0.9 && !e.terminado) {
      e.terminado = true
      onFin({ metros: Math.floor(e.dist / PX_POR_M), dulces: e.dulces })
    }
    for (const p of e.particulas) { p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt }
    e.particulas = e.particulas.filter(p => p.vida > 0)
  }

  function dulce(x, y, r, color, rot = 0) {
    ctx.save()
    ctx.translate(x, y); ctx.rotate(rot)
    ctx.fillStyle = 'rgba(255,245,220,.35)'
    ctx.beginPath(); ctx.arc(0, 0, r * 1.9, 0, 6.283); ctx.fill()
    ctx.fillStyle = color
    ctx.strokeStyle = 'rgba(90,42,26,.6)'; ctx.lineWidth = 1.5
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(s * r * 1.8, -r * 0.75); ctx.lineTo(s * r * 0.6, 0); ctx.lineTo(s * r * 1.8, r * 0.75); ctx.closePath(); ctx.fill(); ctx.stroke()
    }
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.78, 0, 0, 6.283); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 0.4); ctx.lineTo(r * 0.1, r * 0.45); ctx.stroke()
    ctx.restore()
  }

  function colina(sueloY, color, desp, amp, base) {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.moveTo(0, sueloY)
    for (let x = 0; x <= W; x += 8) {
      const u = x + desp
      ctx.lineTo(x, sueloY - base - amp * Math.sin(u / 90) - amp * 0.55 * Math.sin(u / 37 + 1))
    }
    ctx.lineTo(W, sueloY); ctx.closePath(); ctx.fill()
  }

  function nube(x, y, s) {
    ctx.fillStyle = 'rgba(255,255,255,.93)'
    for (const [dx, dy, r] of [[0, 0, 20], [24, -9, 26], [54, 0, 22], [30, 6, 24]]) {
      ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); ctx.fill()
    }
  }

  function pino(x, base, h, color) {
    ctx.fillStyle = '#4a2a18'; ctx.fillRect(x - 2, base - 8, 4, 8)
    ctx.fillStyle = color
    for (let k = 0; k < 3; k++) {
      const ancho = h * (0.32 - k * 0.07)
      const y1 = base - 8 - k * h * 0.27
      ctx.beginPath(); ctx.moveTo(x - ancho, y1); ctx.lineTo(x + ancho, y1); ctx.lineTo(x, y1 - h * 0.42); ctx.closePath(); ctx.fill()
    }
  }

  function torre(x, base) {
    ctx.fillStyle = '#9a6a5c'; ctx.fillRect(x - 13, base - 78, 26, 78)
    ctx.fillStyle = '#7b2f2f'
    ctx.beginPath(); ctx.moveTo(x - 18, base - 78); ctx.lineTo(x + 18, base - 78); ctx.lineTo(x, base - 112); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - 3, base - 62, 6, 10); ctx.fillRect(x - 3, base - 36, 6, 10)
  }

  function fondo(sueloY) {
    // cielo de tarde: azul arriba, durazno en el horizonte
    const g = ctx.createLinearGradient(0, 0, 0, sueloY)
    g.addColorStop(0, '#6fb1dc'); g.addColorStop(0.55, '#b9dbe9'); g.addColorStop(0.85, '#f7dcae'); g.addColorStop(1, '#f4b878')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    // luna grande, como en el póster
    const lx = W * 0.76; const ly = H * 0.13
    const halo = ctx.createRadialGradient(lx, ly, 20, lx, ly, 90)
    halo.addColorStop(0, 'rgba(255,243,208,.55)'); halo.addColorStop(1, 'rgba(255,243,208,0)')
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(lx, ly, 90, 0, 6.283); ctx.fill()
    ctx.fillStyle = '#FFF3D0'; ctx.beginPath(); ctx.arc(lx, ly, 42, 0, 6.283); ctx.fill()
    ctx.fillStyle = 'rgba(226,203,150,.55)'
    for (const [dx, dy, r] of [[-14, -10, 8], [12, 6, 11], [-6, 18, 6], [16, -18, 5]]) { ctx.beginPath(); ctx.arc(lx + dx, ly + dy, r, 0, 6.283); ctx.fill() }
    // nubes
    for (const n of NUBES) {
      const px = ((n.x - e.t * 6 - e.dist * 0.04) % (W + 260) + (W + 260)) % (W + 260) - 130
      nube(px, n.y * H + 30, n.s)
    }
    // colinas, torre y bosque otoñal
    colina(sueloY, '#d6a07a', e.dist * 0.1, 14, 70)
    const tx = ((240 - e.dist * 0.16) % 900 + 900) % 900 - 60
    torre(tx, sueloY - 62)
    colina(sueloY, '#b9764a', e.dist * 0.2, 12, 38)
    const desp = e.dist * 0.34
    for (let b = -1; b <= 1; b++) {
      for (const a of ARBOLES) {
        const x = a.x + b * PERIODO_BOSQUE - (desp % PERIODO_BOSQUE)
        if (x > -30 && x < W + 30) pino(x, sueloY - 4, a.h, a.c)
      }
    }
    // murciélagos y fantasma de fondo
    for (let i = 0; i < 2; i++) {
      const im = imgs[i ? 'murcielago-1' : 'murcielago-2']
      if (!im) continue
      const ancho = i ? 34 : 44
      const bx = ((e.t * (28 + i * 14) + i * 210) % (W + 120)) - 60
      const by = H * 0.3 + i * 46 + Math.sin(e.t * 2 + i) * 14
      ctx.save(); ctx.translate(bx, by); ctx.scale(1, 0.72 + 0.28 * Math.sin(e.t * 16 + i)); ctx.globalAlpha = 0.9
      ctx.drawImage(im, -ancho / 2, 0, ancho, ancho * im.height / im.width); ctx.restore()
    }
    const fa = imgs['fantasma-3']
    if (fa) {
      ctx.globalAlpha = 0.7
      ctx.drawImage(fa, W * 0.28 + Math.sin(e.t * 0.7) * 30, H * 0.4 + Math.sin(e.t * 1.6) * 10, 40, 40 * fa.height / fa.width)
      ctx.globalAlpha = 1
    }
    // rama de otoño en la esquina, como el árbol del póster
    const hg = imgs['hoja-grande']; const h2 = imgs['hoja-2']
    if (hg) { ctx.save(); ctx.translate(-8, -6); ctx.rotate(0.35 + Math.sin(e.t * 0.8) * 0.03); ctx.drawImage(hg, 0, 0, 82, 82 * hg.height / hg.width); ctx.restore() }
    if (h2) { ctx.save(); ctx.translate(54, -4); ctx.rotate(-0.4 + Math.sin(e.t * 0.9) * 0.04); ctx.drawImage(h2, 0, 0, 40, 40 * h2.height / h2.width); ctx.restore() }
  }

  function suelo(sueloY) {
    // piso de tablones de madera con paja encima
    ctx.fillStyle = '#7a4524'; ctx.fillRect(0, sueloY, W, SUELO)
    ctx.fillStyle = '#b87333'; ctx.fillRect(0, sueloY, W, 16)
    ctx.fillStyle = '#d9954f'; ctx.fillRect(0, sueloY, W, 3)
    ctx.fillStyle = '#5a3119'; ctx.fillRect(0, sueloY + 56, W, 6)
    ctx.strokeStyle = 'rgba(60,30,14,.55)'; ctx.lineWidth = 2
    const base = Math.floor(e.dist / 64) * 64
    for (let x = base - e.dist; x < W + 64; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, sueloY + 16); ctx.lineTo(x, H); ctx.stroke()
    }
    ctx.strokeStyle = '#e9b94a'; ctx.lineWidth = 2; ctx.lineCap = 'round'
    const paso = 14
    for (let x = Math.floor(e.dist / paso) * paso - e.dist; x < W + paso; x += paso) {
      const i = Math.round((x + e.dist) / paso)
      const largo = 6 + azar(i) * 8; const inc = (azar(i + 7) - 0.5) * 8
      ctx.beginPath(); ctx.moveTo(x, sueloY + 2); ctx.lineTo(x + inc, sueloY - largo); ctx.stroke()
    }
    for (const a of ADORNOS_SUELO) {
      const im = imgs[a.img]
      if (!im) continue
      const h = a.w * im.height / im.width
      const b = (((a.x - e.dist) % PERIODO_SUELO) + PERIODO_SUELO) % PERIODO_SUELO - 60
      for (let x = b; x < W + 60; x += PERIODO_SUELO) ctx.drawImage(im, x, sueloY + a.y + 8 - h / 2, a.w, h)
    }
  }

  function dibujar() {
    ctx.setTransform(escala, 0, 0, escala, 0, 0)
    const sueloY = H - SUELO
    fondo(sueloY)
    suelo(sueloY)
    // obstáculos
    for (const o of e.obstaculos) {
      const sx = o.x - e.dist
      if (sx > W) break
      const im = imgs[o.img]
      ctx.fillStyle = 'rgba(0,0,0,.22)'
      ctx.beginPath(); ctx.ellipse(sx + o.w / 2, sueloY + 3, o.w * 0.5, 5, 0, 0, 6.283); ctx.fill()
      if (im) ctx.drawImage(im, sx, sueloY - o.h, o.w, o.h)
    }
    // dulces
    for (const c of e.dulcesLista) {
      const sx = c.x - e.dist
      if (sx > W + 20) break
      dulce(sx, sueloY - c.h + Math.sin(e.t * 4 + c.f) * 3, 11, c.c, Math.sin(e.t * 3 + c.f) * 0.3)
    }
    // gallina (con su borde blanco de sticker)
    const px = X_JUGADOR + spriteAncho / 2
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0.08, 0.28 - e.y / 500)})`
    ctx.beginPath(); ctx.ellipse(px, sueloY + 3, spriteAncho * 0.38 * (1 - e.y / 400), 5, 0, 0, 6.283); ctx.fill()
    if (sticker) {
      ctx.save()
      const rebote = e.enSuelo && e.vivo ? Math.abs(Math.sin(e.t * 14)) * 5 : 0
      ctx.translate(px, sueloY - e.y - rebote)
      let ang
      if (!e.vivo) ang = e.giro
      else if (e.enSuelo) ang = Math.sin(e.t * 14) * 0.07
      else ang = Math.max(-0.3, Math.min(0.35, -e.vy / 1800))
      ctx.rotate(ang)
      if (e.enSuelo && e.vivo) ctx.scale(1 + Math.sin(e.t * 28) * 0.02, 1 - Math.sin(e.t * 28) * 0.03)
      const b = sticker.borde
      ctx.drawImage(sticker.lienzo, -spriteAncho / 2 - b, -spriteAlto - b, spriteAncho + b * 2, spriteAlto + b * 2)
      ctx.restore()
    }
    // hojas cayendo
    for (const h of HOJAS_CAYENDO) {
      const im = imgs[h.img]
      if (!im) continue
      const x = W + 30 - ((e.t * h.vx + e.dist * 0.05 + h.f) % (W + 60))
      const y = ((e.t * h.vy + h.f * 2.3) % (H * 0.85)) - 10
      ctx.save(); ctx.translate(x, y); ctx.rotate(e.t * (1 + h.vx / 30) + h.f)
      ctx.drawImage(im, -h.w / 2, -h.w / 2, h.w, h.w * im.height / im.width); ctx.restore()
    }
    for (const p of e.particulas) {
      ctx.globalAlpha = Math.max(0, p.vida / 0.45)
      ctx.fillStyle = p.c
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.283); ctx.fill()
    }
    ctx.globalAlpha = 1
    // marcador en madera
    ctx.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif'
    ctx.textBaseline = 'middle'
    const txtM = `${Math.floor(e.dist / PX_POR_M)} m`
    const txtD = `${e.dulces}`
    const wM = ctx.measureText(txtM).width + 28
    const wD = ctx.measureText(txtD).width + 52
    for (const [x, ancho] of [[W - wM - 12, wM], [12, wD]]) {
      ctx.fillStyle = '#4b2012'; ctx.beginPath(); ctx.roundRect(x, 14, ancho, 34, 17); ctx.fill()
      ctx.strokeStyle = '#d9954f'; ctx.lineWidth = 2; ctx.stroke()
    }
    ctx.fillStyle = '#FFE9B8'; ctx.textAlign = 'center'
    ctx.fillText(txtM, W - wM / 2 - 12, 32)
    dulce(33, 31, 7, '#FF8A1F')
    ctx.textAlign = 'left'; ctx.fillText(txtD, 50, 32)
    if (e.pista) {
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(e.t * 5)
      ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = '#5a2a1a'
      ctx.strokeText('¡Toca abajo para saltar!', W / 2, sueloY - 190)
      ctx.fillStyle = '#FFF3D0'; ctx.fillText('¡Toca abajo para saltar!', W / 2, sueloY - 190)
      ctx.globalAlpha = 1
    }
  }

  ajustar()
  const ro = new ResizeObserver(ajustar)
  ro.observe(canvas)
  const alTocar = (ev) => { ev.preventDefault(); saltar() }
  const alTeclear = (ev) => {
    if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.code === 'KeyW') { ev.preventDefault(); saltar() }
  }
  canvas.addEventListener('pointerdown', alTocar)
  window.addEventListener('keydown', alTeclear)

  let raf = 0
  let ultimo = performance.now()
  const cuadro = (ahora) => {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000)
    ultimo = ahora
    paso(dt)
    dibujar()
    raf = requestAnimationFrame(cuadro)
  }
  raf = requestAnimationFrame(cuadro)

  return {
    saltar,
    destruir() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', alTocar)
      window.removeEventListener('keydown', alTeclear)
    },
  }
}
