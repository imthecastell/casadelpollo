// Guía de "¿Cómo cocinar?".
// Guía oficial "Guía de cocinado Casa del Pollo" (marinados de 200 a 600 g). Por ahora se usa
// igual en Preparados y Milanesas, con el texto adaptado, hasta tener guías propias.
// Cualquier producto puede tener guía propia (p.guia_cocina, se llena en el admin) y esa manda.

export const METODOS = [
  { id: 'sarten', nombre: 'Al sartén', icono: '🍳' },
  { id: 'horno', nombre: 'Horno eléctrico', icono: '♨️' },
  { id: 'airfryer', nombre: 'Airfryer', icono: '💨' },
]

const MARINADOS = {
  sarten: {
    resumen: 'Fuego medio',
    intro: 'Primero se cocina al vapor y después se saltea para que la salsa quede en su punto. No necesitas agregar aceite ni condimentos extra.',
    pasos: [
      'Pon el marinado en el sartén a fuego medio y tápalo, para que se cocine primero al vapor.',
      'Cuando el pollo cambie de color y se ponga blanco, destápalo.',
      'Saltea para reducir los líquidos hasta que la salsa del marinado tenga la consistencia deseada.',
    ],
  },
  horno: {
    resumen: '180 °C · unos 15 min*',
    pasos: [
      'Coloca el marinado en un recipiente apto para horno.',
      'Hornea a 180 °C por unos 15 minutos.',
      'Revisa y remueve el pollo.',
      'Si aún le falta, déjalo 5 minutos más.',
    ],
    nota: '*Los tiempos pueden variar según cómo caliente o distribuya el calor tu horno.',
  },
  airfryer: {
    resumen: '365 °F (aprox. 185 °C) · 12 a 15 min*',
    pasos: [
      'Coloca el marinado en la airfryer y programa 365 °F (aprox. 185 °C).',
      'Cocina 12 a 15 minutos.',
      'A los 10 minutos, haz una pausa y revuelve o voltea el pollo.',
      'Si aún le falta, agrega de 3 a 5 minutos más.',
    ],
    nota: '*Depende de cómo caliente o distribuya el calor tu airfryer.',
  },
}

const NOTAS_MARINADOS = [
  'Para marinados de 200 a 600 g. Los tiempos son de referencia: cada equipo calienta y distribuye el calor distinto, y cada método indica cuándo ajustar.',
]

const NOTAS_GENERALES = [
  'Guía de referencia: los tiempos cambian según el producto, su grosor y tu equipo. Antes de servir, revisa que el centro esté bien cocido.',
]

const CATEGORIAS_CON_GUIA = ['Marinados', 'Preparados', 'Milanesas']
const esMarinado = (p) => p?.category_name === 'Marinados'

const tienePasos = (m) => Array.isArray(m?.pasos) && m.pasos.length > 0

// Fuera de Marinados es el mismo texto, sin decir "marinado" ni hablar de su salsa.
function adaptar(metodo, p) {
  if (esMarinado(p)) return metodo
  const t = (s) => s
    .replace(' para que la salsa quede en su punto', '')
    .replace('salsa del marinado', 'salsa')
    .replace(/\bel marinado/g, 'el producto')
  return { ...metodo, intro: metodo.intro && t(metodo.intro), pasos: metodo.pasos.map(t) }
}

// Marinados, Preparados y Milanesas siempre; el resto solo si tiene al menos un método propio.
export const guiaDisponible = (p) =>
  CATEGORIAS_CON_GUIA.includes(p?.category_name) || METODOS.some(m => tienePasos(p?.guia_cocina?.[m.id]))

// { metodos: [{ id, nombre, icono, resumen, intro?, pasos, nota?, propia }], notas: [] }
export function guiaDe(p) {
  const plantilla = CATEGORIAS_CON_GUIA.includes(p?.category_name) ? MARINADOS : {}

  const metodos = METODOS.map(m => {
    const propia = p?.guia_cocina?.[m.id]
    if (tienePasos(propia)) {
      return { ...m, resumen: propia.resumen || '', pasos: propia.pasos, propia: true }
    }
    return tienePasos(plantilla[m.id]) ? { ...m, ...adaptar(plantilla[m.id], p), propia: false } : null
  }).filter(Boolean)

  const usaEstandar = metodos.some(m => !m.propia)
  return { metodos, notas: usaEstandar ? (esMarinado(p) ? NOTAS_MARINADOS : NOTAS_GENERALES) : [] }
}
