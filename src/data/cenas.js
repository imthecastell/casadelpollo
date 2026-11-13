import { useState, useEffect } from 'react'
import { API_URL } from './vacantes.js'

/* Cenas de fin de año (página /cenas). Aquí vive TODO lo que se edita de la campaña: el texto,
   el menú, las medidas y los precios. Un campo vacío ('') simplemente no se muestra:
   - precio de cada platillo → tras tocar «Ver precio» (p. ej. precio: '$180 el ½ litro · $320 el litro').
     Si el platillo trae `catalogo` (una expresión que coincide con el nombre de un producto de la
     tienda), el precio se lee del catálogo (así sigue los cambios de precio del admin) y se muestra
     «$265 por kg». `precio` queda como respaldo por si el catálogo no responde.
   - fechaLimite, entrega, anticipo, minimo → filas de «Condiciones de la reserva»
   La reserva no se guarda en ningún servidor: el botón abre WhatsApp con la sucursal elegida. */

/* PRECIOS DE ESTE AÑO: los del cartel «Cena de Navidad» del año pasado con un incremento de
   alrededor de 10%, redondeados por el dueño. Están cargados en el campo `precio` de cada platillo
   de abajo. Pechugas, medallones y rollo no llevan precio aquí: se leen del catálogo de la tienda.
   Precios del año pasado, de referencia:
   - Pechugas rellenas: $250 por kg (aprox. 4-5 pz)   → este año se lee del catálogo ($265/kg)
   - Rosca de pan danés: $130 por pieza
   - Cremas (champiñones, piña con chipotle, poblana): $210 el litro · $110 el medio litro
   - Verduritas (desinfectadas, listas para cocinar): $90 la caja
   - Pasta poblana: $130 el litro · $65 el medio litro
   - Puré de papa: $130 el litro · $65 el medio litro
   Formato sugerido para `precio`: '$130 el litro · $65 el medio litro'. */
const LITROS = '½ litro y 1 litro'

export const CENAS = {
  activa: true,
  // Después de esta fecha la tarjeta del inicio y la de /links dejan de mostrarse
  // (la página /cenas sigue existiendo). Es el final del 21 de diciembre, último día para reservar.
  // Para retirarlas antes, pon `activa: false`.
  visibleHasta: '2026-12-22T00:00:00-07:00', // hora de Los Mochis

  titulo: 'Cenas de fin de año',
  texto: [
    'Un año más estaremos cenando como en casa, con nuestro servicio de cenas de fin de año.',
    'Reserva tu cena para eventos, posadas, Navidad y Año Nuevo, lista para cocinar o lista para servir, y disfruta de la mesa sin pasar el día en la cocina.',
  ],
  mensajeWhatsapp: 'Hola, buen día. Quiero reservar mi cena de fin de año.',

  // Condiciones: texto libre, p. ej. fechaLimite: 'Hasta el 20 de diciembre'. Vacío = no se muestra.
  fechaLimite: 'Hasta el 21 de diciembre',
  entrega: '',
  anticipo: '',
  minimo: '',

  // Paquetes completos. El precio es aproximado (se muestra «Aprox.»): se calculó con los precios de los
  // platillos sueltos y varía un poco porque las pechugas se pesan y se cobra el excedente sobre el kilo.
  // Para cambiarlo, edita `precio`. La nota de abajo se muestra en ambos paquetes.
  notaPrecioPaquetes: 'Precio aproximado: las pechugas se pesan y se cobra el excedente.',
  paquetes: [
    {
      id: 'paquete-grande', nombre: 'Paquete grande', rinde: 'Alcanza para 10 a 12 personas, según cómo se sirva',
      foto: 'plato-horizontal.webp', fotoAlt: 'Mesa de cena con pechugas rellenas, pasta, verduras, puré y pan danés',
      incluye: [
        '10 pechugas rellenas (jamón y queso, o mozzarella con espinacas)',
        '1 litro de puré de papa',
        '1 litro de pasta poblana con elotes',
        '1 litro de crema, del sabor que elijas',
        '1 paquete de verduritas',
        '2 panes danés (rosca de pan)',
        'Charola para hornear incluida',
      ],
      eliges: 'Tú eliges el tipo de pechuga rellena y el sabor de la crema.',
      precio: 'Aprox. $1,500',
    },
    {
      id: 'paquete-chico', nombre: 'Paquete chico', rinde: 'Alcanza para 5 a 6 personas',
      foto: 'linterna.webp', fotoPos: '50% 62%', fotoAlt: 'Plato de cena con pechuga rellena, pasta poblana, verduritas y puré',
      incluye: [
        '5 pechugas rellenas (jamón y queso, o mozzarella con espinacas)',
        '½ litro de puré de papa',
        '½ litro de pasta poblana con elotes',
        '½ litro de crema, del sabor que elijas',
        '1 paquete de verduritas',
        '1 pan danés (rosca de pan)',
        'Charola para hornear incluida',
      ],
      eliges: 'Tú eliges el tipo de pechuga rellena y el sabor de la crema.',
      precio: 'Aprox. $800',
    },
  ],

  grupos: [
    {
      id: 'fuertes',
      titulo: 'Platos fuertes',
      items: [
        { id: 'pechugas', nombre: 'Pechugas rellenas', icono: 'flame', medida: 'Por kg', precio: '', catalogo: /^pechuga rellena/i,
          foto: 'pechugas.webp', fotoAlt: 'Pechuga rellena de mozzarella y espinacas, envuelta en tocino',
          detalle: 'Rellenas de jamón y queso, o de mozzarella con espinacas. Tú eliges el relleno.' },
        { id: 'medallones', nombre: 'Medallones con tocino', icono: 'flame', medida: 'Por kg', precio: '', catalogo: /medall[oó]n/i,
          foto: 'medallones.webp', fotoAlt: 'Medallón con tocino sobre puré de papa y espárragos',
          detalle: 'Medallones envueltos en tocino, para llevar al horno.' },
        { id: 'rollo', nombre: 'Rollo relleno de jamón y queso', icono: 'flame', medida: 'Por kg', precio: '', catalogo: /^rollo relleno/i,
          foto: 'rollo.webp', fotoAlt: 'Rollo relleno de jamón y queso, rebanado',
          detalle: 'Un rollo para rebanar y compartir, relleno de jamón y queso.' },
      ],
    },
    {
      id: 'complementos',
      titulo: 'Complementos',
      items: [
        { id: 'verduritas', nombre: 'Verduritas', icono: 'basket', etiqueta: 'Listas para cocinar', medida: 'Por paquete (cajita)', precio: '$100 por paquete',
          foto: 'verduritas.webp', fotoAlt: 'Verduritas en cuencos: brócoli, coliflor, calabacita y zanahoria',
          detalle: 'Verduras en corte especial, listas para cocinar.' },
        { id: 'pure', nombre: 'Puré de papa', icono: 'cooking-pot', etiqueta: 'Ya cocinado', medida: LITROS, precio: '$145 el litro · $75 el medio litro',
          foto: 'pure.webp', fotoAlt: 'Tazón de puré de papa a la mantequilla',
          detalle: 'Cremoso y a la mantequilla, listo para servir.' },
        { id: 'pasta', nombre: 'Pasta poblana con elotes', icono: 'chef-hat', etiqueta: 'Ya cocinada', medida: LITROS, precio: '$140 el litro · $70 el medio litro',
          foto: 'pasta.webp', fotoAlt: 'Tazón de pasta poblana con granos de elote',
          detalle: 'Pasta en salsa poblana con granos de elote, lista para servir.' },
        { id: 'crema', nombre: 'Crema a elegir', icono: 'bowl-food', etiqueta: 'Ya cocinada', medida: LITROS, precio: '$230 el litro · $120 el medio litro',
          fotos: [
            { archivo: 'crema-pina.webp', nombre: 'Piña con chipotle', alt: 'Crema de piña con chipotle, con trozos de piña y chiles chipotle' },
            { archivo: 'crema-poblana.webp', nombre: 'Poblana', alt: 'Crema poblana, con chile poblano y cilantro' },
            { archivo: 'crema-champinones.webp', nombre: 'Champiñones', alt: 'Crema de champiñones, con champiñones frescos y tomillo' },
          ],
          detalle: 'Elige tu sabor: piña con chipotle, champiñones o poblana.' },
      ],
    },
    {
      id: 'pan',
      titulo: 'Para compartir',
      items: [
        { id: 'rosca', nombre: 'Pan danés', icono: 'gift', etiqueta: 'La rosca de pan', medida: 'Por pieza · rinde unas 25 porciones', precio: '$145 por pieza',
          foto: 'pan.webp', fotoAlt: 'Pan danés: la rosca de pan con ajonjolí, dorada y lista para compartir',
          detalle: 'Nuestro pan danés, el que muchos conocen como «rosca de pan», para acompañar la cena y compartir en la mesa.' },
      ],
    },
  ],
}

// Precio por kg leído del catálogo de la primera sucursal activa (los preparados se venden por kg).
// { [idPlatillo]: '$265 por kg' }; vacío mientras carga o si el catálogo no responde.
export function usePreciosCatalogo() {
  const [precios, setPrecios] = useState({})
  useEffect(() => {
    let vigente = true
    const conCatalogo = CENAS.grupos.flatMap(g => g.items).filter(i => i.catalogo)
    ;(async () => {
      try {
        const ramas = await (await fetch(`${API_URL}/api/branches`)).json()
        const rama = (Array.isArray(ramas) ? ramas : []).find(b => b.active !== false)
        if (!rama) return
        const productos = await (await fetch(`${API_URL}/api/products/branch/${rama.id}`)).json()
        if (!Array.isArray(productos)) return
        const nuevos = {}
        conCatalogo.forEach(it => {
          const montos = productos.filter(p => p.active !== false && it.catalogo.test(p.name)).map(p => Number(p.price)).filter(n => n > 0)
          if (montos.length) nuevos[it.id] = `$${Math.min(...montos).toLocaleString('es-MX')} por kg`
        })
        if (vigente) setPrecios(nuevos)
      } catch { /* sin catálogo se usa el `precio` de respaldo */ }
    })()
    return () => { vigente = false }
  }, [])
  return precios
}

// ¿Se muestran la tarjeta del inicio y la de /links?
export function cenasVisibles(ahora = Date.now()) {
  if (!CENAS.activa) return false
  const hasta = Date.parse(CENAS.visibleHasta)
  return Number.isNaN(hasta) || ahora < hasta
}

export const CONDICIONES = [
  { clave: 'fechaLimite', etiqueta: 'Reserva hasta', icono: 'clock' },
  { clave: 'entrega', etiqueta: 'Entrega o recolección', icono: 'bag' },
  { clave: 'anticipo', etiqueta: 'Anticipo', icono: 'money' },
  { clave: 'minimo', etiqueta: 'Mínimo', icono: 'check-circle' },
].filter(c => CENAS[c.clave])

// Sucursales activas con su WhatsApp (las mismas de /links). { sucursales, cargando }
export function useSucursalesCenas() {
  const [estado, setEstado] = useState({ sucursales: [], cargando: true })
  useEffect(() => {
    let vigente = true
    fetch(`${API_URL}/api/links`)
      .then(r => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then(d => {
        const lista = (Array.isArray(d?.branches) ? d.branches : []).filter(b => b.active !== false && b.whatsapp)
        if (vigente) setEstado({ sucursales: lista, cargando: false })
      })
    return () => { vigente = false }
  }, [])
  return estado
}

// Mensaje de WhatsApp: el general, o el del paquete elegido.
export function mensajeReserva(paquete) {
  if (!paquete) return CENAS.mensajeWhatsapp
  return `Hola, buen día. Quiero reservar el ${paquete.nombre} de cenas de fin de año. `
    + 'Les indico el relleno de las pechugas y el sabor de la crema. ¿Me confirman disponibilidad? Gracias.'
}

// Cambia el texto prellenado del enlace de WhatsApp de la sucursal por el de la reserva.
export function enlaceWhatsapp(urlSucursal, mensaje = CENAS.mensajeWhatsapp) {
  const base = String(urlSucursal).split('?')[0]
  return `${base}?text=${encodeURIComponent(mensaje)}`
}
