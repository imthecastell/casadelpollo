/* Fotos crudo/cocinado de un producto (products.image_url / image_cooked_url).

   Conviven dos formatos en el catálogo:
   - Actual (el que arma el admin): una foto por lado — dos archivos
     distintos, o un mismo archivo con su recorte guardado en la URL
     (c_crop). Se usan tal cual; aquí solo se ajusta el tamaño.
   - Viejo: un solo archivo con la foto cruda a la izquierda y la cocinada a
     la derecha, sin recorte guardado (el mismo archivo en ambos campos, o
     solo image_url). Ese es el único caso que se parte a la mitad.

   Antes todo se partía a la mitad, y con fotos individuales se veía medio
   plato corrido. */

const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'

// Archivo en Cloudinary (v123/carpeta/nombre.ext), sin transformaciones.
// La versión se conserva para no servir una copia vieja si se resube.
function archivo(url) {
  if (!url || !url.includes('cloudinary.com')) return null
  const m = url.match(/\/upload\/(?:[^/]*,[^/]*\/|[a-z]{1,3}_[^/]*\/)*(.+)$/)
  return m ? m[1] : null
}

const mismoArchivo = (a, b) => archivo(a).replace(/^v\d+\//, '') === (archivo(b) || '').replace(/^v\d+\//, '')

function recorteGuardado(url) {
  const m = (url || '').match(/\/(c_crop,[^/]*)\//)
  return m ? m[1] : null
}

export function esFotoCompuesta(imageUrl, imageCookedUrl) {
  if (!imageUrl || recorteGuardado(imageUrl) || !archivo(imageUrl)) return false
  return !imageCookedUrl || mismoArchivo(imageUrl, imageCookedUrl)
}

function conTamano(url, ar, w) {
  const a = archivo(url)
  if (!a) return url
  const recorte = recorteGuardado(url)
  return `${CDN}/${recorte ? `${recorte}/` : ''}ar_${ar},c_fill,w_${w}/${a}`
}

function mitad(url, lado, ar, w) {
  const a = archivo(url)
  if (!a) return url
  const x = lado === 'cruda' ? '0.00' : '0.50'
  return `${CDN}/c_crop,fl_relative,x_${x},y_0.00,w_0.50,h_1.00/ar_${ar},c_fill,w_${w}/${a}`
}

export function fotoCruda(imageUrl, imageCookedUrl, { ar = '4:3', w = 320 } = {}) {
  if (!imageUrl) return null
  return esFotoCompuesta(imageUrl, imageCookedUrl) ? mitad(imageUrl, 'cruda', ar, w) : conTamano(imageUrl, ar, w)
}

export function fotoCocinada(imageUrl, imageCookedUrl, { ar = '4:3', w = 320 } = {}) {
  const url = imageCookedUrl || imageUrl
  if (!url) return null
  return esFotoCompuesta(imageUrl, imageCookedUrl) ? mitad(url, 'cocinada', ar, w) : conTamano(url, ar, w)
}
