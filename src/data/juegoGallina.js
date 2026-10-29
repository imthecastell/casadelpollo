/* Motor del minijuego "Corre, Gallina": carrera infinita de un solo botón. La gallina corre sola; un toque la
   hace saltar los obstáculos y recoge dulces en el aire. La velocidad sube con la distancia.

   El mundo se dibuja en un lienzo de ancho fijo (W unidades) y alto variable según la pantalla, así el tiempo
   de reacción es el mismo en cualquier teléfono. Todo lo que se ve vive en public/skins/muertos/. */

const W = 400
const SUELO = 110            // alto de la franja de suelo
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
]
const COLORES_DULCE = ['#FF8A1F', '#F5C518', '#B04CFF', '#E5383B', '#2EC4B6']
const ESTRELLAS = Array.from({ length: 26 }, (_, i) => ({ x: (i * 0.618 * 997) % 1, y: ((i * 0.381 * 613) % 1) * 0.55, r: 0.8 + (i % 3) * 0.5, f: i * 1.7 }))
const ADORNOS_SUELO = [
  { img: 'hoja-3', x: 30, y: 26, w: 26 }, { img: 'cempasuchil', x: 120, y: 34, w: 24 },
  { img: 'hoja-2', x: 210, y: 22, w: 24 }, { img: 'hoja-3', x: 300, y: 48, w: 20 },
  { img: 'cempasuchil', x: 390, y: 28, w: 26 }, { img: 'hoja-2', x: 470, y: 52, w: 20 },
]
const PERIODO_SUELO = 540

const IMAGENES = [
  ...PERSONAJES.map(p => p.img),
  ...OBSTACULOS.map(o => o.img),
  'luna', 'papel-picado', 'hoja-2', 'hoja-3', 'cempasuchil', 'murcielago-2', 'murcielago-1', 'fantasma-1', 'fantasma-3',
]

export function cargarImagenes(base) {
  const unicas = [...new Set(IMAGENES)]
  return Promise.all(unicas.map(n => new Promise((ok) => {
    const im = new Image()
    im.onload = () => ok([n, im])
    im.onerror = () => ok([n, null])
    im.src = `${base}skins/muertos/${n}.png`
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

export function crearJuego(canvas, imgs, personajeId, { onFin, sonidoActivo }) {
  const ctx = canvas.getContext('2d')
  const pj = PERSONAJES.find(p => p.id === personajeId) || PERSONAJES[0]
  const sprite = imgs[pj.img]
  const spriteAlto = J_ALTO
  const spriteAncho = sprite ? J_ALTO * sprite.width / sprite.height : 64
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
        else if (!e.enSuelo) e.enSuelo = true
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
    ctx.fillStyle = 'rgba(255,230,180,.22)'
    ctx.beginPath(); ctx.arc(0, 0, r * 1.9, 0, 6.283); ctx.fill()
    ctx.fillStyle = color
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(s * r * 1.8, -r * 0.75); ctx.lineTo(s * r * 0.6, 0); ctx.lineTo(s * r * 1.8, r * 0.75); ctx.closePath(); ctx.fill()
    }
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.78, 0, 0, 6.283); ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'
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

  function dibujar() {
    ctx.setTransform(escala, 0, 0, escala, 0, 0)
    const sueloY = H - SUELO
    // cielo de noche con resplandor naranja en el horizonte
    const g = ctx.createLinearGradient(0, 0, 0, sueloY)
    g.addColorStop(0, '#1c0f2e'); g.addColorStop(0.55, '#4a1d3a'); g.addColorStop(1, '#e07a30')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    for (const s of ESTRELLAS) {
      ctx.globalAlpha = 0.35 + 0.45 * Math.abs(Math.sin(e.t * 1.5 + s.f))
      ctx.fillStyle = '#FFE9B8'
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283); ctx.fill()
    }
    ctx.globalAlpha = 1
    if (imgs.luna) ctx.drawImage(imgs.luna, W * 0.68, H * 0.13, 64, 64 * imgs.luna.height / imgs.luna.width)
    colina(sueloY, '#2b1230', e.dist * 0.12, 16, 46)
    colina(sueloY, '#3a1736', e.dist * 0.28, 12, 14)
    // murciélagos de fondo
    for (let i = 0; i < 2; i++) {
      const im = imgs[i ? 'murcielago-1' : 'murcielago-2']
      if (!im) continue
      const ancho = i ? 34 : 44
      const bx = ((e.t * (28 + i * 14) + i * 210) % (W + 120)) - 60
      const by = H * 0.3 + i * 46 + Math.sin(e.t * 2 + i) * 14
      ctx.save(); ctx.translate(bx, by); ctx.scale(1, 0.72 + 0.28 * Math.sin(e.t * 16 + i)); ctx.globalAlpha = 0.85
      ctx.drawImage(im, -ancho / 2, 0, ancho, ancho * im.height / im.width); ctx.restore()
    }
    // fantasma flotando
    if (imgs['fantasma-3']) {
      const fx = W * 0.3 + Math.sin(e.t * 0.7) * 30
      ctx.globalAlpha = 0.5
      ctx.drawImage(imgs['fantasma-3'], fx, H * 0.4 + Math.sin(e.t * 1.6) * 10, 40, 40 * imgs['fantasma-3'].height / imgs['fantasma-3'].width)
      ctx.globalAlpha = 1
    }
    // papel picado arriba
    const pp = imgs['papel-picado']
    if (pp) {
      const ph = 50; const pw = ph * pp.width / pp.height
      const off = -((e.t * 16 + e.dist * 0.05) % pw)
      for (let x = off; x < W; x += pw) ctx.drawImage(pp, x, 0, pw, ph)
    }
    // suelo
    ctx.fillStyle = '#3b2118'; ctx.fillRect(0, sueloY, W, SUELO)
    ctx.fillStyle = '#8a4b1f'; ctx.fillRect(0, sueloY, W, 9)
    ctx.fillStyle = '#c9772a'; ctx.fillRect(0, sueloY, W, 3)
    for (const a of ADORNOS_SUELO) {
      const im = imgs[a.img]
      if (!im) continue
      const h = a.w * im.height / im.width
      const base = (((a.x - e.dist) % PERIODO_SUELO) + PERIODO_SUELO) % PERIODO_SUELO - 60
      for (let x = base; x < W + 60; x += PERIODO_SUELO) ctx.drawImage(im, x, sueloY + a.y - h / 2, a.w, h)
    }
    // obstáculos
    for (const o of e.obstaculos) {
      const sx = o.x - e.dist
      if (sx > W) break
      const im = imgs[o.img]
      ctx.fillStyle = 'rgba(0,0,0,.28)'
      ctx.beginPath(); ctx.ellipse(sx + o.w / 2, sueloY + 3, o.w * 0.5, 5, 0, 0, 6.283); ctx.fill()
      if (im) ctx.drawImage(im, sx, sueloY - o.h, o.w, o.h)
    }
    // dulces
    for (const c of e.dulcesLista) {
      const sx = c.x - e.dist
      if (sx > W + 20) break
      dulce(sx, sueloY - c.h + Math.sin(e.t * 4 + c.f) * 3, 11, c.c, Math.sin(e.t * 3 + c.f) * 0.3)
    }
    // gallina
    const px = X_JUGADOR + spriteAncho / 2
    const alto = e.y
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0.08, 0.3 - alto / 500)})`
    ctx.beginPath(); ctx.ellipse(px, sueloY + 3, spriteAncho * 0.38 * (1 - alto / 400), 5, 0, 0, 6.283); ctx.fill()
    if (sprite) {
      ctx.save()
      const rebote = e.enSuelo && e.vivo ? Math.abs(Math.sin(e.t * 14)) * 5 : 0
      ctx.translate(px, sueloY - e.y - rebote)
      let ang
      if (!e.vivo) ang = e.giro
      else if (e.enSuelo) ang = Math.sin(e.t * 14) * 0.07
      else ang = Math.max(-0.3, Math.min(0.35, -e.vy / 1800))
      ctx.rotate(ang)
      if (e.enSuelo && e.vivo) ctx.scale(1 + Math.sin(e.t * 28) * 0.02, 1 - Math.sin(e.t * 28) * 0.03)
      ctx.drawImage(sprite, -spriteAncho / 2, -spriteAlto, spriteAncho, spriteAlto)
      ctx.restore()
    }
    for (const p of e.particulas) {
      ctx.globalAlpha = Math.max(0, p.vida / 0.45)
      ctx.fillStyle = p.c
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.283); ctx.fill()
    }
    ctx.globalAlpha = 1
    // marcador
    ctx.font = '800 20px "Plus Jakarta Sans", system-ui, sans-serif'
    ctx.textBaseline = 'middle'
    const metros = Math.floor(e.dist / PX_POR_M)
    const txtM = `${metros} m`
    const txtD = `${e.dulces}`
    const wM = ctx.measureText(txtM).width + 28
    const wD = ctx.measureText(txtD).width + 52
    ctx.fillStyle = 'rgba(20,8,24,.55)'
    ctx.beginPath(); ctx.roundRect(W - wM - 12, 58, wM, 34, 17); ctx.fill()
    ctx.beginPath(); ctx.roundRect(12, 58, wD, 34, 17); ctx.fill()
    ctx.fillStyle = '#FFE9B8'; ctx.textAlign = 'center'
    ctx.fillText(txtM, W - wM / 2 - 12, 76)
    dulce(33, 75, 7, '#FF8A1F')
    ctx.textAlign = 'left'; ctx.fillText(txtD, 50, 76)
    if (e.pista) {
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(e.t * 5)
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 22px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx.fillText('¡Toca abajo para saltar!', W / 2, sueloY - 190)
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
