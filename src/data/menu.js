export const SUCURSALES = [
  {
    id: 'vinedos',
    nombre: 'Vinedos',
    direccion: 'Direccion Vinedos (prueba)',
    telefono: '000-000-0000',
    activa: true,
    tieneAirfryer: true,
    tieneMarinadosCocinados: true,
    horario: { apertura: '10:00', cierre: '16:00', cierreSabado: '15:00' },
  },
  {
    id: 'parque',
    nombre: 'El Parque',
    direccion: 'Direccion Parque (prueba)',
    telefono: '000-000-0000',
    activa: false,
    tieneAirfryer: false,
    tieneMarinadosCocinados: false,
    horario: { apertura: '10:00', cierre: '16:00', cierreSabado: '15:00' },
  },
  {
    id: 'country',
    nombre: 'Country',
    direccion: 'Direccion Country (prueba)',
    telefono: '000-000-0000',
    activa: false,
    tieneAirfryer: false,
    tieneMarinadosCocinados: false,
    horario: { apertura: '10:00', cierre: '16:00', cierreSabado: '15:00' },
  },
]

export const MILANESAS = {
  simples: [
    { id: 'natural', nombre: 'Natural / Aplanada', precioKg: 175, available: true },
    { id: 'empanizada', nombre: 'Empanizada', precioKg: 225, available: true },
    { id: 'parmesano', nombre: 'Al Parmesano (empanizada)', precioKg: 225, available: true },
  ],
  empapeladas: [
    { id: 'pimienta-limon', nombre: 'Pimienta limón', precioKg: 230, available: true },
    { id: 'bbq-coreano', nombre: 'BBQ coreano', precioKg: 230, available: true },
    { id: 'mantequilla-romero', nombre: 'Mantequilla romero y ajo', precioKg: 230, available: true },
    { id: 'chipotle', nombre: 'Chipotle', precioKg: 230, available: true },
    { id: 'habanero-mango', nombre: 'Habanero mango', precioKg: 230, available: true },
    { id: 'ajo-parmesano', nombre: 'Ajo parmesano', precioKg: 230, available: true },
    { id: 'finas-hierbas', nombre: 'Finas hierbas', precioKg: 230, available: true },
    { id: 'tamarindo', nombre: 'Tamarindo', precioKg: 230, available: true },
  ],
}

export const SECCIONES = [
  {
    id: 'nuevo',
    nombre: 'Nuevo',
    tabLabel: 'Nuevo',
    emoji: '✨',
    tipo: 'nuevo',
  },
  {
    id: 'fresco',
    nombre: 'Pollo Fresco',
    tabLabel: 'Fresco',
    emoji: '🍗',
    tipo: 'piezas',
    productos: [
      { id: 'entero', nombre: 'Pollo entero', precioKg: 85, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'pechuga', nombre: 'Pechuga c/hueso', precioKg: 125, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'filete', nombre: 'Filete', precioKg: 170, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'pierna-completa', nombre: 'Pierna completa', precioKg: 70, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'muslo', nombre: 'Muslo', precioKg: 100, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'piernita', nombre: 'Piernita', precioKg: 100, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'ala', nombre: 'Ala', precioKg: 100, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'higaditos', nombre: 'Higaditos', precioKg: 45, disponible: { vinedos: true, parque: true, country: true } },
      { id: 'molleja', nombre: 'Molleja', precioKg: 45, disponible: { vinedos: true, parque: true, country: true } },
    ]
  },
  {
    id: 'marinados',
    nombre: 'Marinados',
    tabLabel: 'Marinados',
    emoji: '🍯',
    tipo: 'gramos',
    productos: [
      { id: 'mexicana', nombre: 'A la mexicana', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pastor', nombre: 'Al pastor', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'adobado', nombre: 'Adobado', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'almendrado', nombre: 'Almendrado', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'hoisin', nombre: 'Hoisin', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'mostaza-miel', nombre: 'Mostaza miel', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'parmesano', nombre: 'Parmesano con cilantro', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'tailandes', nombre: 'Tailandes', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'teriyaki', nombre: 'Teriyaki', precioKg: 240, disponible: { vinedos: true, parque: false, country: true } },
    ]
  },
  {
    id: 'preparados',
    nombre: 'Preparados y Milanesas',
    tabLabel: 'Preparados',
    emoji: '🍳',
    tipo: 'piezas',
    productos: [
      { id: 'albondigas', nombre: 'Albondigas', precioKg: 225, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pechuga-verdura', nombre: 'Pechuga rellena de verdura', precioKg: 265, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pechuga-pesto', nombre: 'Pechuga rellena pesto mozzarella y espinacas', precioKg: 265, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pechuga-jamon', nombre: 'Pechuga rellena de jamon y queso', precioKg: 265, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'chiles', nombre: 'Chiles rellenos', precioKg: 180, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'empanada-jamon', nombre: 'Empanada de jamon y queso', precioKg: 140, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'empanada-brocoli', nombre: 'Empanada de brocoli coliflor y queso', precioKg: 140, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'nuggets', nombre: 'Nuggets tempura', precioKg: 205, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'trozos', nombre: 'Trozos de pollo', precioKg: 130, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'tenders', nombre: 'Tenders', precioKg: 145, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'hamburguesa', nombre: 'Hamburguesa', precioKg: 225, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'medallon', nombre: 'Medallon con tocino', precioKg: 160, disponible: { vinedos: true, parque: false, country: true } },
    ]
  },
  {
    id: 'complementos',
    nombre: 'Complementos',
    tabLabel: 'Extras',
    emoji: '🥗',
    tipo: 'complementos',
    productos: [
      { id: 'arroz-blanco', nombre: 'Arroz basmati blanco', precio: 35, unidad: 'porcion', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'arroz-jardinera', nombre: 'Arroz basmati a la jardinera', precio: 40, unidad: 'porcion', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pasta-poblana', nombre: 'Pasta poblana', precio: 40, unidad: 'porcion', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'pasta-tomate', nombre: 'Pasta de tomate', precio: 40, unidad: 'porcion', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'crema-coliflor', nombre: 'Crema de coliflor', precio: 45, unidad: '500ml', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'crema-brocoli', nombre: 'Crema de brocoli', precio: 45, unidad: '500ml', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'sopa-fideo', nombre: 'Sopa de fideo', precio: 35, unidad: '500ml', esSopa: true, disponible: { vinedos: true, parque: false, country: true } },
      { id: 'frijoles-guisados', nombre: 'Frijoles guisados', precio: 40, unidad: '500ml', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'frijoles-puercos', nombre: 'Frijoles puercos', precio: 45, unidad: '500ml', disponible: { vinedos: true, parque: false, country: true } },
      { id: 'ensalada', nombre: 'Ensalada', precio: 40, unidad: 'porcion', disponible: { vinedos: true, parque: false, country: true } },
    ]
  },
  {
    id: 'bowls',
    nombre: 'Bowls',
    tabLabel: 'Bowls',
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
