export const SUCURSALES = [
  {
    id: 'vinedos',
    nombre: 'Viñedos',
    direccion: 'Dirección Viñedos (prueba)',
    telefono: '000-000-0000',
    activa: true,
    tieneAirfryer: true,
    tieneMarinadosCocinados: true,
    horario: { apertura: '10:00', cierre: '16:00', cierreSabado: '15:00' },
  },
  {
    id: 'parque',
    nombre: 'El Parque',
    direccion: 'Dirección Parque (prueba)',
    telefono: '000-000-0000',
    activa: false,
    tieneAirfryer: false,
    tieneMarinadosCocinados: false,
    horario: { apertura: '10:00', cierre: '16:00', cierreSabado: '15:00' },
  },
  {
    id: 'country',
    nombre: 'Country',
    direccion: 'Dirección Country (prueba)',
    telefono: '000-000-0000',
    activa: false,
    tieneAirfryer: false,
    tieneMarinadosCocinados: false,
    horario: { apertura: '10:00', cierre: '16:00', cierreSabado: '15:00' },
  },
]

export const SECCIONES = [
  {
    id: 'fresco',
    nombre: 'Pollo Fresco',
    emoji: '🐔',
    tipo: 'piezas',
    productos: [
      { id: 'entero', nombre: 'Pollo entero', precioKg: 95, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'pechuga', nombre: 'Pechuga', precioKg: 120, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'filete', nombre: 'Filete', precioKg: 135, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'pierna-completa', nombre: 'Pierna completa', precioKg: 105, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'muslo', nombre: 'Muslo', precioKg: 100, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'piernita', nombre: 'Piernita', precioKg: 95, disponible: { vinedos: true, parque: true, country: true } },
    ]
  },
  {
    id: 'marinados',
    nombre: 'Marinados',
    emoji: '🍯',
    tipo: 'gramos',
    productos: [
      { id: 'mexicana', nombre: 'A la mexicana', precioKg: 130, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pastor', nombre: 'Al pastor', precioKg: 130, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'adobado', nombre: 'Adobado', precioKg: 130, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'almendrado', nombre: 'Almendrado', precioKg: 140, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'hoisin', nombre: 'Hoisin', precioKg: 135, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'mostaza-miel', nombre: 'Mostaza miel', precioKg: 130, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'parmesano', nombre: 'Parmesano con cilantro', precioKg: 140, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'tailandes', nombre: 'Tailandés', precioKg: 135, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'teriyaki', nombre: 'Teriyaki', precioKg: 130, disponible: { vinedos: true, parque: false, country: true } },
    ]
  },
  {
    id: 'preparados',
    nombre: 'Preparados',
    emoji: '🍽️',
    tipo: 'piezas',
    productos: [
      { id: 'albondigas', nombre: 'Albóndigas', precioKg: 145, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pechuga-verdura', nombre: 'Pechuga rellena de verdura', precioKg: 160, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pechuga-pesto', nombre: 'Pechuga rellena pesto mozzarella y espinacas', precioKg: 170, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pechuga-jamon', nombre: 'Pechuga rellena de jamón y queso', precioKg: 165, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'chiles', nombre: 'Chiles rellenos', precioKg: 150, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'empanada-jamon', nombre: 'Empanada de jamón y queso', precioKg: 140, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'empanada-brocoli', nombre: 'Empanada de brócoli coliflor y queso', precioKg: 140, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'nuggets', nombre: 'Nuggets tempura', precioKg: 150, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'trozos', nombre: 'Trozos de pollo', precioKg: 130, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'tenders', nombre: 'Tenders', precioKg: 145, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'hamburguesa', nombre: 'Hamburguesa', precioKg: 150, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'medallon', nombre: 'Medallón con tocino', precioKg: 160, disponible: { vinedos: true, parque: false, country: true } },
    ]
  },
  {
    id: 'milanesas',
    nombre: 'Milanesas',
    emoji: '🥩',
    tipo: 'milanesas',
    subcategorias: [
      { id: 'natural', nombre: 'Natural / Aplanada', precioKg: 125 },
      { id: 'empanizada', nombre: 'Empanizada', precioKg: 130 },
    ],
    empapeladas: [
      { id: 'pimienta-limon', nombre: 'Pimienta limón', precioKg: 135 },
      { id: 'bbq-coreano', nombre: 'BBQ coreano', precioKg: 135 },
      { id: 'mantequilla-romero', nombre: 'Mantequilla romero y ajo', precioKg: 135 },
    ],
    disponible: { vinedos: true, parque: false, country: true }
  },
  {
    id: 'complementos',
    nombre: 'Complementos',
    emoji: '🥗',
    tipo: 'complementos',
    productos: [
      { id: 'arroz-blanco', nombre: 'Arroz basmati blanco', precio: 35, unidad: 'porción', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'arroz-jardinera', nombre: 'Arroz basmati a la jardinera', precio: 40, unidad: 'porción', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pasta-poblana', nombre: 'Pasta poblana', precio: 40, unidad: 'porción', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pasta-tomate', nombre: 'Pasta de tomate', precio: 40, unidad: 'porción', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'crema-coliflor', nombre: 'Crema de coliflor', precio: 45, unidad: '500ml', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'crema-brocoli', nombre: 'Crema de brócoli', precio: 45, unidad: '500ml', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'sopa-fideo', nombre: 'Sopa de fideo', precio: 35, unidad: '500ml', esSopa: true, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'frijoles-guisados', nombre: 'Frijoles guisados', precio: 40, unidad: '500ml', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'frijoles-puercos', nombre: 'Frijoles puercos', precio: 45, unidad: '500ml', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'ensalada', nombre: 'Ensalada', precio: 40, unidad: 'porción', disponible: { vinedos: true, parque: false, country: true } },
    ]
  },
  {
    id: 'bowls',
    nombre: 'Bowls',
    emoji: '🥣',
    tipo: 'bowls',
  },
]
export const AIRFRYER_CONFIG = {
  slotsCapacidad: 3,
  intervaloMinutos: 30,
  tiempoCoccionMinutos: 20,
  airfryers: [
    { id: 'ninja-doble', nombre: 'Ninja doble cajon', capacidad: 2 },
    { id: 'ninja-xl', nombre: 'Ninja XL', capacidad: 1, esApoyo: true }
  ]
}