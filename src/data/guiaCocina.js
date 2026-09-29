// Guías de "¿Cómo cocinar?": una plantilla por tipo de producto y, opcionalmente,
// una guía propia por producto (p.guia_cocina, se edita en el admin).
// Tiempos pensados para producto refrigerado, en una sola capa.

export const METODOS = [
  { id: 'sarten', nombre: 'Al sartén', icono: '🍳' },
  { id: 'horno', nombre: 'Horno eléctrico', icono: '♨️' },
  { id: 'airfryer', nombre: 'Airfryer', icono: '💨' },
]

const CATEGORIAS_CON_GUIA = ['Marinados', 'Preparados', 'Milanesas']

export const guiaDisponible = (p) => CATEGORIAS_CON_GUIA.includes(p?.category_name)

const TEMP = '74 °C'

const NOTA_BASE =
  `Tiempos para producto refrigerado; si está congelado, descongélalo antes en el refrigerador. ` +
  `Varían según el equipo y la cantidad: el pollo está listo cuando llega a ${TEMP} por dentro y no queda rosado.`

const NOTA_DULCE =
  'Este marinado lleva azúcar o miel y se oscurece rápido: si ves que se quema, baja un poco el fuego o la temperatura.'

const MARINADO_DULCE = /agridulce|hoisin|teriyaki|miel|tailand[eé]s|pastor/i

const PLANTILLAS = {
  marinado: {
    sarten: {
      resumen: '8–10 min · fuego medio-alto',
      pasos: [
        'Saca el marinado del refrigerador 10 minutos antes de cocinarlo.',
        'Calienta el sartén o la plancha a fuego medio-alto.',
        'Extiende el pollo en una sola capa, sin amontonar, y déjalo sellar 2–3 min antes de moverlo.',
        'Voltea cada 2–3 min hasta que dore por todos lados (8–10 min en total).',
        'Retíralo del fuego y deja reposar 2 min antes de servir.',
      ],
    },
    horno: {
      resumen: '15–18 min · 200 °C',
      pasos: [
        'Precalienta el horno a 200 °C.',
        'Cubre una charola con papel para hornear y extiende el pollo en una sola capa.',
        'Hornea 15–18 min y voltea a la mitad del tiempo.',
        'Deja reposar 2 min antes de servir.',
      ],
    },
    airfryer: {
      resumen: '10–12 min · 200 °C',
      pasos: [
        'Precalienta la airfryer 3 min a 200 °C.',
        'Coloca el pollo en la canasta en una sola capa; si es mucho, cocina en dos tandas.',
        'No necesita aceite. Cocina 10–12 min y sacude la canasta a la mitad.',
        'Deja reposar 2 min antes de servir.',
      ],
    },
  },

  empanizado: {
    sarten: {
      resumen: '3–4 min por lado · fuego medio',
      pasos: [
        'Calienta ½ cm de aceite en el sartén a fuego medio.',
        'Fríe las piezas sin amontonar, 3–4 min por lado, hasta que doren parejo.',
        'Escúrrelas sobre papel absorbente y deja reposar 1 min.',
      ],
    },
    horno: {
      resumen: '12–15 min · 200 °C',
      pasos: [
        'Precalienta el horno a 200 °C.',
        'Acomoda las piezas sobre una rejilla o una charola con papel, sin encimarlas.',
        'Hornea 12–15 min, volteando a la mitad, hasta que estén doradas y crujientes.',
      ],
    },
    airfryer: {
      resumen: '8–10 min · 190 °C',
      pasos: [
        'Precalienta la airfryer 3 min a 190 °C.',
        'Coloca las piezas en una sola capa. Para más dorado, rocía un poco de aceite.',
        'Cocina 8–10 min y voltea a la mitad.',
      ],
    },
  },

  empanada: {
    sarten: {
      resumen: '5–6 min por lado · fuego medio-bajo',
      pasos: [
        'Calienta ½ cm de aceite a fuego medio-bajo, para que se cocine por dentro sin quemarse por fuera.',
        'Fríe 5–6 min por lado, hasta que dore y el relleno esté caliente.',
        'Escúrrela sobre papel absorbente y deja reposar 2 min: el relleno sale muy caliente.',
      ],
    },
    horno: {
      resumen: '20–25 min · 190 °C',
      pasos: [
        'Precalienta el horno a 190 °C.',
        'Coloca las piezas sobre una rejilla o una charola con papel.',
        'Hornea 20–25 min y voltea a la mitad, hasta que doren y el relleno esté caliente.',
        'Deja reposar 2 min antes de servir.',
      ],
    },
    airfryer: {
      resumen: '12–15 min · 180 °C',
      pasos: [
        'Precalienta la airfryer 3 min a 180 °C.',
        'Acomoda las piezas en una sola capa, sin encimarlas.',
        'Cocina 12–15 min y voltea a la mitad.',
        'Deja reposar 2 min: el relleno sale muy caliente.',
      ],
    },
  },

  relleno: {
    sarten: {
      resumen: '20–25 min · fuego medio-bajo',
      pasos: [
        'Calienta un sartén con tapa a fuego medio y sella la pieza 3–4 min por lado.',
        'Baja a fuego bajo, tapa y cocina 15–20 min, volteando cada 5 min.',
        `Comprueba que el centro esté caliente (${TEMP}) antes de retirar.`,
        'Deja reposar 3 min antes de cortar para que no se escape el relleno.',
      ],
    },
    horno: {
      resumen: '30–35 min · 190 °C',
      pasos: [
        'Precalienta el horno a 190 °C.',
        'Coloca la pieza sobre una rejilla o en un refractario.',
        'Hornea 30–35 min, volteando a la mitad.',
        'Deja reposar 3 min antes de cortar.',
      ],
    },
    airfryer: {
      resumen: '20–25 min · 180 °C',
      pasos: [
        'Precalienta la airfryer 3 min a 180 °C.',
        'Coloca la pieza en la canasta, sin encimar.',
        'Cocina 20–25 min y voltea a la mitad. Si el tocino se dora muy rápido, baja a 170 °C.',
        'Deja reposar 3 min antes de cortar.',
      ],
    },
  },

  albondiga: {
    sarten: {
      resumen: '12–15 min · fuego medio',
      pasos: [
        'Calienta el sartén a fuego medio con un poco de aceite.',
        'Acomoda las albóndigas sin amontonar y tapa.',
        'Cocina 12–15 min girándolas cada 3 min, hasta que doren por todos lados.',
      ],
    },
    horno: {
      resumen: '18–20 min · 200 °C',
      pasos: [
        'Precalienta el horno a 200 °C.',
        'Colócalas en una charola con papel, separadas entre sí.',
        'Hornea 18–20 min y gíralas a la mitad del tiempo.',
      ],
    },
    airfryer: {
      resumen: '10–12 min · 190 °C',
      pasos: [
        'Precalienta la airfryer 3 min a 190 °C.',
        'Colócalas en la canasta en una sola capa.',
        'Cocina 10–12 min y sacude la canasta a la mitad.',
      ],
    },
  },

  hamburguesa: {
    sarten: {
      resumen: '5–6 min por lado · fuego medio-alto',
      pasos: [
        'Calienta el sartén o la plancha a fuego medio-alto.',
        'Cocina 5–6 min por lado, sin aplastar la pieza.',
        `Comprueba que el centro llegue a ${TEMP} y deja reposar 2 min.`,
      ],
    },
    horno: {
      resumen: '15–18 min · 200 °C',
      pasos: [
        'Precalienta el horno a 200 °C.',
        'Coloca la pieza sobre una rejilla o una charola con papel.',
        'Hornea 15–18 min y voltea a la mitad.',
      ],
    },
    airfryer: {
      resumen: '10–12 min · 190 °C',
      pasos: [
        'Precalienta la airfryer 3 min a 190 °C.',
        'Coloca la pieza en la canasta, sin encimar.',
        'Cocina 10–12 min y voltea a la mitad.',
      ],
    },
  },

  milanesa: {
    sarten: {
      resumen: '3–4 min por lado · fuego medio-alto',
      pasos: [
        'Calienta el sartén o la plancha a fuego medio-alto con una gota de aceite.',
        'Cocina la milanesa 3–4 min por lado, hasta que dore y no quede rosada.',
        'Deja reposar 1 min antes de servir.',
      ],
    },
    horno: {
      resumen: '12–15 min · 200 °C',
      pasos: [
        'Precalienta el horno a 200 °C.',
        'Colócala sobre una rejilla o una charola con papel.',
        'Hornea 12–15 min y voltea a la mitad.',
      ],
    },
    airfryer: {
      resumen: '8–10 min · 190 °C',
      pasos: [
        'Precalienta la airfryer 3 min a 190 °C.',
        'Colócala en la canasta en una sola capa (de una en una si son grandes).',
        'Cocina 8–10 min y voltea a la mitad.',
      ],
    },
  },
}

// Qué plantilla le toca a cada producto. El orden importa: "empanada" va antes
// que "empanizad…" y ambos antes de la categoría Milanesas.
export function tipoGuia(p) {
  const n = (p?.name || '').toLowerCase()
  if (p?.category_name === 'Marinados') return 'marinado'
  if (/alb[oó]ndiga/.test(n)) return 'albondiga'
  if (/hamburguesa|medall[oó]n/.test(n)) return 'hamburguesa'
  if (/empanada/.test(n)) return 'empanada'
  if (/rellen[oa]|rollo/.test(n)) return 'relleno'
  if (/nugget|tender|trozo|bocadillo|empanizad/.test(n)) return 'empanizado'
  if (p?.category_name === 'Milanesas') return 'milanesa'
  return 'relleno'
}

// { tipo, metodos: [{ id, nombre, icono, resumen, pasos, propia }], notas: [] }
export function guiaDe(p) {
  const tipo = tipoGuia(p)
  const plantilla = PLANTILLAS[tipo]
  const propia = p?.guia_cocina && typeof p.guia_cocina === 'object' ? p.guia_cocina : {}

  const metodos = METODOS.map(m => {
    const o = propia[m.id]
    if (Array.isArray(o?.pasos) && o.pasos.length > 0) {
      return { ...m, resumen: o.resumen || '', pasos: o.pasos, propia: true }
    }
    return { ...m, ...plantilla[m.id], propia: false }
  })

  const notas = [NOTA_BASE]
  if (tipo === 'marinado' && MARINADO_DULCE.test(p.name || '')) notas.push(NOTA_DULCE)

  return { tipo, metodos, notas }
}
