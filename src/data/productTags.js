// Tags visuales por producto — ingredientes perceptibles en la foto.
// Usados para búsqueda y como chips en el modal de detalle.
export const PRODUCT_TAGS = {
  // ── Marinados ────────────────────────────────────────────────
  8:  ['jitomate', 'cebolla', 'chile jalapeño', 'salsa roja'],
  9:  ['piña', 'cebolla', 'achiote', 'salsa roja'],
  10: ['adobo', 'cebolla', 'salsa roja'],
  11: ['almendra', 'pimiento', 'calabacita', 'cebolla'],
  12: ['cebollita', 'ejote', 'chile seco', 'ajonjolí'],
  13: ['mostaza', 'miel', 'ajonjolí'],
  14: ['parmesano', 'cilantro'],
  15: ['cacahuate', 'ajonjolí', 'salsa oscura'],
  16: ['brócoli', 'zanahoria', 'pimiento', 'cebolla'],
  72: ['zanahoria', 'cebolla', 'naranja', 'agridulce'],
  77: ['albahaca', 'jitomate cherry', 'pesto', 'verde'],
  78: ['hierbas', 'ajo', 'chile en hojuelas', 'naranja'],
  // ── Preparados ─────────────────────────────────────────
  17: ['albóndiga', 'zanahoria', 'hierbas'],
  18: ['pechuga', 'tocino', 'verdura', 'enrollado'],
  19: ['pechuga', 'tocino', 'pesto', 'mozzarella', 'espinaca'],
  20: ['pechuga', 'tocino', 'jamón', 'queso'],
  21: ['chile poblano', 'tocino', 'queso'],
  22: ['empanada', 'jamón', 'queso', 'empanizado'],
  23: ['empanada', 'brócoli', 'coliflor', 'queso'],
  24: ['empanizado', 'pan molido', 'crujiente'],
  25: ['empanizado', 'pan molido', 'crujiente'],
  26: ['empanizado', 'pan molido', 'crujiente'],
  27: ['tocino', 'maíz', 'molida'],
  28: ['tocino', 'maíz', 'molida'],
  48: ['empanizado', 'pan molido', 'crujiente'],
  51: ['empanizado', 'pan molido', 'crujiente'],
  71: ['queso', 'achiote', 'enrollado', 'molida'],
}

// Tags del backend (editables en el admin); si el producto aun no los trae, usa el mapa fijo.
export const tagsDe = (p) =>
  (Array.isArray(p?.tags) && p.tags.length ? p.tags : PRODUCT_TAGS[p?.id]) || []
