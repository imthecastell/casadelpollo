/* Imágenes de Cloudinary: un solo lugar para nombrar la nube y pedir las fotos ligeras.

   Cloudinary cobra por ancho de banda, y las fotos de producto son PNG de
   varios cientos de KB (los pósters originales, de 2–3 MB). Con `f_auto` el
   navegador recibe WebP/AVIF en vez de PNG y con `q_auto` se comprime sin que se
   note; con `c_limit,w_N` las fotos originales (sin tamaño) se reducen al ancho
   con el que realmente se ven en pantalla.

   NUBE: nombre de la cuenta de Cloudinary vigente. La anterior (do4juvxio) se
   desactivó por exceso de ancho de banda; mientras la base de datos conserve URLs
   viejas, cdn() las reescribe a la nube nueva al mostrarlas.

   cdn(url, ancho?) devuelve la misma imagen, ya optimizada:
   - Respeta las transformaciones que traiga la URL (c_crop, fl_relative,
     ar_, c_fill…): solo añade `f_auto,q_auto` como último paso.
   - Si la URL no trae ancho de salida y se pasa `ancho`, añade `c_limit,w_<ancho>`
     (nunca agranda). Si trae uno mayor que `ancho` (p. ej. w_800 en una miniatura),
     lo baja a `ancho`; no toca el recorte ni la proporción.
   - Si ya trae f_ o q_, no los repite.
   - URLs que no son de Cloudinary (ni /image/upload/), SVG y cualquier otra
     cosa (null, blob:, data:) se devuelven tal cual (salvo la nube vieja → nueva). */

export const NUBE = 'hfg4vgan'
export const NUBE_VIEJA = 'do4juvxio'
export const CDN = `https://res.cloudinary.com/${NUBE}/image/upload`

const RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\/(.+)$/
const RE_VIEJA = new RegExp(`^(https?://res[.]cloudinary[.]com/)${NUBE_VIEJA}/`)
const esTransformacion = (seg) => /,/.test(seg) || /^[a-z]{1,3}_[^/]*$/.test(seg)
// w_800 entero = ancho de salida; los recortes relativos usan decimales (w_0.50)
const RE_ANCHO = /(^|,)w_(\d+)(?=,|$)/

// Cualquier URL (también SVG, video o de la API) con la nube vieja pasa a la nueva.
export function nubeNueva(url) {
  return typeof url === 'string' ? url.replace(RE_VIEJA, `$1${NUBE}/`) : url
}

export function cdn(url, ancho) {
  if (typeof url !== 'string') return url
  url = nubeNueva(url)
  const m = url.match(RE)
  if (!m) return url
  const [, base, resto] = m
  const [ruta] = resto.split(/[?#]/)
  if (/\.svg$/i.test(ruta) || /\/video\/upload\//.test(base)) return url

  const partes = resto.split('/')
  let i = 0
  while (i < partes.length - 1 && esTransformacion(partes[i])) i++
  const pasos = partes.slice(0, i)
  const id = partes.slice(i).join('/')

  const todos = pasos.join('/')
  const yaTieneF = /(^|[,/])f_/.test(todos)
  const yaTieneQ = /(^|[,/])q_/.test(todos)

  if (ancho) {
    const k = pasos.findIndex(p => !/c_crop/.test(p) && RE_ANCHO.test(p))
    if (k >= 0) {
      const actual = Number(pasos[k].match(RE_ANCHO)[2])
      if (actual > ancho && !/(^|,)h_\d/.test(pasos[k])) pasos[k] = pasos[k].replace(RE_ANCHO, `$1w_${ancho}`)
    } else if (!pasos.some(p => /(^|,)c_(fill|limit|scale|fit|thumb|pad|lfill|mfit|mpad)(,|$)/.test(p))) {
      pasos.push(`c_limit,w_${ancho}`)
    }
  }

  const final = [!yaTieneF && 'f_auto', !yaTieneQ && 'q_auto'].filter(Boolean).join(',')
  if (final) pasos.push(final)
  return `${base}/${pasos.length ? `${pasos.join('/')}/` : ''}${id}`
}

// Atributos para <img> fuera de la primera pantalla.
export const PEREZOSA = { loading: 'lazy', decoding: 'async' }
