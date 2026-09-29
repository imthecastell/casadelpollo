// Imagen descargable con los pasos de cocción (PNG 1080 px de ancho, alto según el contenido).
// Se dibuja en un canvas con los colores y tipografías de la app; sin dependencias.

const ANCHO = 1080
const MARGEN = 72
const ALTO_MINIMO = 1350
const FOTO = 300

const cssVar = (nombre, respaldo) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
  return v || respaldo
}

function cargarImagen(url) {
  return new Promise(resolve => {
    const img = new Image()
    const timer = setTimeout(() => resolve(null), 5000)
    img.crossOrigin = 'anonymous'
    img.onload = () => { clearTimeout(timer); resolve(img) }
    img.onerror = () => { clearTimeout(timer); resolve(null) }
    img.src = url
  })
}

function rectRedondeado(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Parte el texto en líneas que caben en anchoMax (solo corta en espacios normales,
// así "74 °C" con espacio duro no se separa).
function partirLineas(ctx, texto, anchoMax) {
  const palabras = String(texto).split(' ').filter(Boolean)
  const lineas = []
  let actual = ''
  for (const palabra of palabras) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (!actual || ctx.measureText(prueba).width <= anchoMax) actual = prueba
    else { lineas.push(actual); actual = palabra }
  }
  if (actual) lineas.push(actual)
  return lineas
}

function dibujarFotoCubierta(ctx, img, x, y, lado, radio) {
  ctx.save()
  rectRedondeado(ctx, x, y, lado, lado, radio)
  ctx.clip()
  const escala = Math.max(lado / img.width, lado / img.height)
  const w = img.width * escala
  const h = img.height * escala
  ctx.drawImage(img, x + (lado - w) / 2, y + (lado - h) / 2, w, h)
  ctx.restore()
}

// Dibuja todo y devuelve la altura que ocupa el contenido (sin el pie).
function componer(ctx, alto, datos, foto, estilo) {
  const { nombre, metodo, resumen, pasos, notas } = datos
  const { titulo, cuerpo, c } = estilo
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = c.crema
  ctx.fillRect(0, 0, ANCHO, alto)

  // Encabezado
  const anchoTexto = ANCHO - MARGEN * 2 - (foto ? FOTO + 40 : 0)
  ctx.font = `800 64px ${titulo}`
  const lineasNombre = partirLineas(ctx, nombre, anchoTexto)
  const altoContenido = 34 + 24 + lineasNombre.length * 76 + 20 + 46
  const altoEncabezado = MARGEN * 2 + Math.max(altoContenido, foto ? FOTO : 0)

  ctx.fillStyle = c.rojo
  ctx.fillRect(0, 0, ANCHO, altoEncabezado)

  let y = MARGEN
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `800 26px ${titulo}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = '5px'
  ctx.fillText('CASA DEL POLLO', MARGEN, y + 26)
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
  y += 26 + 24

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 64px ${titulo}`
  lineasNombre.forEach(l => { y += 76; ctx.fillText(l, MARGEN, y - 14) })
  y += 20

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = `600 36px ${titulo}`
  ctx.fillText(`Cómo cocinar · ${metodo}`, MARGEN, y + 34)

  if (foto) dibujarFotoCubierta(ctx, foto, ANCHO - MARGEN - FOTO, MARGEN, FOTO, 36)

  y = altoEncabezado + 56

  // Resumen (tiempo · temperatura)
  if (resumen) {
    ctx.font = `800 44px ${titulo}`
    const w = Math.min(ctx.measureText(resumen).width + 72, ANCHO - MARGEN * 2)
    ctx.fillStyle = c.pastilla
    rectRedondeado(ctx, MARGEN, y, w, 88, 44)
    ctx.fill()
    ctx.fillStyle = c.rojo
    ctx.fillText(resumen, MARGEN + 36, y + 58, ANCHO - MARGEN * 2 - 72)
    y += 88 + 52
  }

  // Pasos
  const anchoPaso = ANCHO - MARGEN * 2 - 92
  pasos.forEach((paso, i) => {
    ctx.font = `500 40px ${cuerpo}`
    const lineas = partirLineas(ctx, paso, anchoPaso)

    ctx.fillStyle = c.rojo
    ctx.beginPath()
    ctx.arc(MARGEN + 30, y + 30, 30, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = `800 32px ${titulo}`
    ctx.textAlign = 'center'
    ctx.fillText(String(i + 1), MARGEN + 30, y + 41)
    ctx.textAlign = 'left'

    ctx.fillStyle = c.texto
    ctx.font = `500 40px ${cuerpo}`
    lineas.forEach((l, k) => ctx.fillText(l, MARGEN + 92, y + 40 + k * 56))
    y += Math.max(60, lineas.length * 56 + 4) + 32
  })

  // Notas
  y += 8
  ctx.font = `400 30px ${cuerpo}`
  const lineasNotas = notas.flatMap(n => partirLineas(ctx, n, ANCHO - MARGEN * 2 - 72).concat(['']))
  lineasNotas.pop()
  const altoNotas = lineasNotas.length * 42 + 64
  ctx.fillStyle = c.crema2
  rectRedondeado(ctx, MARGEN, y, ANCHO - MARGEN * 2, altoNotas, 28)
  ctx.fill()
  ctx.fillStyle = c.suave
  lineasNotas.forEach((l, k) => ctx.fillText(l, MARGEN + 36, y + 32 + 30 + k * 42))
  y += altoNotas

  return y
}

function pie(ctx, alto, estilo) {
  const { titulo, cuerpo, c } = estilo
  ctx.fillStyle = c.rojo
  ctx.font = `800 40px ${titulo}`
  ctx.fillText('Casa del Pollo', MARGEN, alto - 82)
  ctx.fillStyle = c.suave
  ctx.font = `500 28px ${cuerpo}`
  ctx.fillText('Todos nuestros productos salen listos para cocinar', MARGEN, alto - 42)
}

async function esperarFuentes(titulo, cuerpo) {
  if (!document.fonts?.load) return
  try {
    await Promise.all([
      document.fonts.load(`800 40px ${titulo}`),
      document.fonts.load(`600 40px ${titulo}`),
      document.fonts.load(`500 40px ${cuerpo}`),
      document.fonts.load(`400 30px ${cuerpo}`),
    ])
  } catch { /* si falla se usa la fuente de respaldo */ }
}

function crearBlob(datos, foto, estilo) {
  const medida = document.createElement('canvas')
  medida.width = ANCHO
  medida.height = 10
  const finContenido = componer(medida.getContext('2d'), 10, datos, foto, estilo)

  const alto = Math.max(ALTO_MINIMO, finContenido + 56 + 150)
  const canvas = document.createElement('canvas')
  canvas.width = ANCHO
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  componer(ctx, alto, datos, foto, estilo)
  pie(ctx, alto, estilo)

  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('canvas vacío'))), 'image/png')
    } catch (e) {
      reject(e)
    }
  })
}

// datos: { nombre, metodo, resumen, pasos[], notas[], imagenUrl? } → Blob PNG
export async function generarImagenGuia(datos) {
  const titulo = `${cssVar('--font-title', "'Plus Jakarta Sans'")}, sans-serif`
  const cuerpo = `${cssVar('--font-body', "'DM Sans'")}, sans-serif`
  const estilo = {
    titulo,
    cuerpo,
    c: {
      rojo: cssVar('--rojo', '#922B21'),
      crema: cssVar('--crema', '#FBF6EF'),
      crema2: cssVar('--crema-oscura', '#EDE3D6'),
      texto: cssVar('--texto', '#1A0806'),
      suave: cssVar('--texto-suave', '#7B5850'),
      pastilla: '#FBE9C6',
    },
  }
  await esperarFuentes(estilo.titulo.replace(', sans-serif', ''), estilo.cuerpo.replace(', sans-serif', ''))

  const foto = datos.imagenUrl ? await cargarImagen(datos.imagenUrl) : null
  try {
    return await crearBlob(datos, foto, estilo)
  } catch (e) {
    if (!foto) throw e
    return crearBlob(datos, null, estilo)
  }
}

export function nombreArchivoGuia(nombre, metodoId) {
  const slug = String(nombre)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `como-cocinar-${slug}-${metodoId}.png`
}

// En el celular abre el menú de compartir (ahí está "Guardar imagen"); en escritorio descarga.
export async function guardarImagen(blob, nombreArchivo, titulo) {
  const archivo = new File([blob], nombreArchivo, { type: 'image/png' })
  const tactil = window.matchMedia?.('(pointer: coarse)').matches
  if (tactil && navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: titulo })
      return 'compartida'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelada'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  return 'descargada'
}
