// Mensaje pre-redactado de un pedido para sucursales sin pedidos en línea
// (branches.pedidos_en_linea = false). Lo usa AppContext para abrir
// WhatsApp, y la V2 para mostrar cómo se habría visto en modo prueba.
export function armarMensajeWhatsapp({ carrito, sucursal, horaEntrega, datosCliente, asap = false }) {
  const esAlPesar = (item) => item.tipo === 'pieza' || item.tipo === 'preparado' || item.tipo === 'milanesa'

  // `resumen` ya trae el precio/kg o "(se pesa al entregar)" incluido en
  // el texto (mismo campo que usa registrarPedido como product_name) —
  // agregar el precio aparte lo duplicaría.
  const lineas = carrito.map(item => {
    const cantidad = item.cantidad || 1
    return `- ${cantidad}x ${item.resumen || item.nombre || 'Producto'}`
  })
  const total = carrito.reduce((sum, item) => {
    if (esAlPesar(item)) return sum
    return sum + parseFloat(item.precioTotal || item.precio || item.price || 0)
  }, 0)

  return [
    '🐔 *Nuevo pedido - Casa del Pollo*',
    `📍 Sucursal: ${sucursal?.name || ''}`,
    `👤 Cliente: ${datosCliente?.nombre || ''}`,
    `📱 Tel: ${datosCliente?.telefono || ''}`,
    `🕐 ${asap ? 'Lo antes posible' : `Recoger a las ${horaEntrega}`}`,
    '',
    '*Pedido:*',
    ...lineas,
    '',
    datosCliente?.notas ? `📝 Notas: ${datosCliente.notas}` : null,
    `Total estimado: $${total.toFixed(2)}`,
  ].filter(Boolean).join('\n')
}
