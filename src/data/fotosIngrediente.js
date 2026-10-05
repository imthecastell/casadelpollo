// Fotos de ingrediente (galería, categoría productos) para distinguir los sabores de empanadas y
// pechugas rellenas, que comparten la misma foto de producto.
const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'

const FOTOS = [
  { sabor: /jam[oó]n y queso/i, id: 'v1790722344/r8fdr9qxsiznm9cvy7nz.jpg' },
  { sabor: /br[oó]coli/i, id: 'v1790722343/q4sl92mguwejwslaemcc.jpg' },
  { sabor: /verdura/i, id: 'v1790722344/wzn42b8p3qsppvl9oemm.jpg' },
  { sabor: /pesto/i, id: 'v1790722343/ekv2xydvpccyijihb6lt.jpg' },
]

export function fotoIngrediente(p, w = 240) {
  if (p?.category_name !== 'Preparados' || !/empanada|pechuga rellena/i.test(p.name)) return null
  const f = FOTOS.find(x => x.sabor.test(p.name))
  return f ? `${CDN}/c_fill,ar_1:1,w_${w},f_auto,q_auto/${f.id}` : null
}
