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

const LITROS = '½ litro y 1 litro'

export const CENAS = {
  activa: true,
  // Después de esta fecha la tarjeta del inicio y la de /links dejan de mostrarse
  // (la página /cenas sigue existiendo). Para retirarlas antes, pon `activa: false`.
  visibleHasta: '2027-01-01T00:00:00-07:00', // hora de Los Mochis

  titulo: 'Cenas de fin de año',
  texto: [
    'Un año más estaremos cenando como en casa, con nuestro servicio de cenas de fin de año.',
    'Reserva tu cena para eventos, posadas, Navidad y Año Nuevo, lista para cocinar o lista para servir, y disfruta de la mesa sin pasar el día en la cocina.',
  ],
  mensajeWhatsapp: 'Hola, buen día. Quiero reservar mi cena de fin de año.',

  // Condiciones: texto libre, p. ej. fechaLimite: 'Hasta el 20 de diciembre'. Vacío = no se muestra.
  fechaLimite: '',
  entrega: '',
  anticipo: '',
  minimo: '',

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
        { id: 'verduritas', nombre: 'Verduritas', icono: 'basket', etiqueta: 'Listas para cocinar', medida: 'Por pack', precio: '',
          foto: 'verduritas.webp', fotoAlt: 'Verduritas en cuencos: brócoli, coliflor, calabacita y zanahoria',
          detalle: 'Verduras en corte especial, listas para cocinar.' },
        { id: 'pure', nombre: 'Puré de papa', icono: 'cooking-pot', etiqueta: 'Ya cocinado', medida: LITROS, precio: '',
          foto: 'pure.webp', fotoAlt: 'Tazón de puré de papa a la mantequilla',
          detalle: 'Cremoso y a la mantequilla, listo para servir.' },
        { id: 'pasta', nombre: 'Pasta poblana con elotes', icono: 'chef-hat', etiqueta: 'Ya cocinada', medida: LITROS, precio: '',
          foto: 'pasta.webp', fotoAlt: 'Tazón de pasta poblana con granos de elote',
          detalle: 'Pasta en salsa poblana con granos de elote, lista para servir.' },
        { id: 'crema', nombre: 'Crema a elegir', icono: 'bowl-food', etiqueta: 'Ya cocinada', medida: LITROS, precio: '',
          detalle: 'Elige tu sabor: piña con chipotle, champiñones o poblana.' },
      ],
    },
    {
      id: 'pan',
      titulo: 'Para compartir',
      items: [
        { id: 'rosca', nombre: 'Rosca de pan danés', icono: 'gift', medida: 'Por unidad · rinde unas 25 porciones', precio: '',
          detalle: 'Una rosca de pan danés para acompañar la cena y compartir en la mesa.' },
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

// Cambia el texto prellenado del enlace de WhatsApp de la sucursal por el de la reserva.
export function enlaceWhatsapp(urlSucursal, mensaje = CENAS.mensajeWhatsapp) {
  const base = String(urlSucursal).split('?')[0]
  return `${base}?text=${encodeURIComponent(mensaje)}`
}
