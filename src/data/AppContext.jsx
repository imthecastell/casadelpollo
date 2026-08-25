import { createContext, useContext, useState, useEffect } from 'react'
import { getBranches, getProductsByBranch, createOrder, getDesign, getBanners, getSchedule } from './api.js'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [vista, setVista] = useState('sucursales')
  const [schedule, setSchedule] = useState(null)
  const [cocInicio, setCocInicio] = useState(null)
  const [cocFin, setCocFin] = useState(null)
  const [cocFinSabado, setCocFinSabado] = useState(null)
  const [sucursales, setSucursales] = useState([])
  const [productos, setProductos] = useState([])
  const [banners, setBanners] = useState([])
  const [diseno, setDiseno] = useState({})
  const [cargando, setCargando] = useState(true)
  const [ultimoNumeroOrden, setUltimoNumeroOrden] = useState(null)
  const [ultimaHora, setUltimaHora] = useState(null)
  const [modoWhatsapp, setModoWhatsapp] = useState(false)
  const [bannersMenu, setBannersMenu] = useState([])
  const [bannersPopup, setBannersPopup] = useState([])
  const [bannersAviso, setBannersAviso] = useState([])

  useEffect(() => {
    // Carga el diseño del primer branch activo con reintento automático.
    // Render free tier puede tardar ~50s en arrancar; si getDesign falla o devuelve
    // vacío en el primer intento, reintentamos en background a los 3 segundos (hasta 2 veces).
    // Devuelve la promesa del primer intento para que `cargando` espere ese resultado.
    const cargarDiseno = (branchId) => {
      const intentar = (intento) =>
        getDesign(branchId)
          .then(d => {
            if (d && !d.error && (d.logo_url || d.primary_color)) {
              setDiseno(d)
            } else if (intento < 2) {
              // Respuesta vacía/inválida → reintento en background
              setTimeout(() => intentar(intento + 1), 3000)
            }
          })
          .catch(() => {
            if (intento < 2) setTimeout(() => intentar(intento + 1), 3000)
          })
      return intentar(0) // retorna la promesa del primer intento
    }

    getBranches()
      .then(data => {
        const lista = Array.isArray(data) ? data : []
        setSucursales(lista)
        // Precarga el diseño del primer branch activo para que SelectorSucursal
        // tenga acceso al logo dinámico antes de que el usuario elija sucursal
        const primerActivo = lista.find(b => b.active)
        if (primerActivo) {
          return cargarDiseno(primerActivo.id)
        }
      })
      .catch(() => setSucursales([]))
      .finally(() => setCargando(false))

    getBanners('bienvenida')
      .then(data => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]))

    getBanners('menu')
      .then(data => setBannersMenu(Array.isArray(data) ? data : []))
      .catch(() => setBannersMenu([]))

    getBanners('popup')
      .then(data => setBannersPopup(Array.isArray(data) ? data : []))
      .catch(() => setBannersPopup([]))

    getBanners('aviso')
      .then(data => setBannersAviso(Array.isArray(data) ? data : []))
      .catch(() => setBannersAviso([]))

    // Horario global de fallback (sin sucursal aún)
    getSchedule()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSchedule(data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (sucursalActiva) {
      getProductsByBranch(sucursalActiva.id)
        .then(data => setProductos(Array.isArray(data) ? data : []))
        .catch(() => setProductos([]))

      getDesign(sucursalActiva.id)
        .then(data => setDiseno(data || {}))
        .catch(() => setDiseno({}))

      // Horario específico de la sucursal
      getSchedule(sucursalActiva.id)
        .then(data => {
          // El endpoint por sucursal devuelve { horarios, cocinados_inicio, cocinados_fin, cocinados_fin_sabado }
          const horarios = data?.horarios
          const ci = data?.cocinados_inicio
          const cf = data?.cocinados_fin
          const cfs = data?.cocinados_fin_sabado
          if (Array.isArray(horarios) && horarios.length > 0) {
            setSchedule(horarios)
          }
          setCocInicio(ci || null)
          setCocFin(cf || null)
          setCocFinSabado(cfs || null)
        })
        .catch(() => {})
    }
  }, [sucursalActiva])

  useEffect(() => {
    const root = document.documentElement

    // Primero restaurar los defaults de la app, para que una sucursal
    // sin tema guardado no herede los colores de la anterior
    const defaults = {
      '--rojo':         '#c1121f',
      '--crema':        '#FAF8F4',
      '--dorado':       '#D4A017',
      '--app-bg':       '#FAF8F4',
      '--card-bg':      '#FFFFFF',
      '--button-bg':    '#c1121f',
      '--button-text':  '#FFFFFF',
      '--navbar-bg':    '#c1121f',
      '--texto':        '#111111',
      '--navbar-text':  '#FFFFFF',
      '--radio':        '12px',
      '--font-title':   'Plus Jakarta Sans',
      '--font-body':    'DM Sans',
    }
    Object.entries(defaults).forEach(([variable, value]) =>
      root.style.setProperty(variable, value)
    )

    const themeMap = {
      primary_color:        '--rojo',
      secondary_color:      '--crema',
      accent_color:         '--dorado',
      background_color:     '--app-bg',
      card_color:           '--card-bg',
      button_color:         '--button-bg',
      button_text_color:    '--button-text',
      navbar_color:         '--navbar-bg',
      text_color:           '--texto',
      secondary_text_color: '--navbar-text',
      border_radius:        '--radio',
      font_title:           '--font-title',
      font_body:            '--font-body',
    }
    Object.entries(themeMap).forEach(([field, variable]) => {
      if (diseno[field]) root.style.setProperty(variable, diseno[field])
    })
  }, [diseno])

  const agregarAlCarrito = (item) => {
    setCarrito(prev => [...prev, { ...item, id: Date.now() + Math.random() }])
  }

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id))
  }

  const limpiarCarrito = () => setCarrito([])

  const confirmarPedido = async (horaEntrega, datosCliente, asap = false) => {
    // Capturar carrito antes de limpiar
    const carritoSnapshot = [...carrito]
    try {
      const items = carritoSnapshot.map(item => ({
        product_name: item.resumen || item.nombre || 'Producto',
        quantity: item.cantidad || 1,
        price: parseFloat(item.precioTotal || item.precio || item.price || 0),
        tipo: item.tipo || null
      }))
      const total = carritoSnapshot.reduce((sum, item) => {
        if (item.tipo === 'pieza' || item.tipo === 'preparado' || item.tipo === 'milanesa') return sum
        if (item.precioTotal !== undefined) return sum + parseFloat(item.precioTotal || 0)
        const precio = parseFloat(item.precioTotal || item.precio || item.price || 0)
        const cantidad = parseInt(item.cantidad || 1)
        return sum + (precio * cantidad)
      }, 0)
      const orden = await createOrder({
        branch_id: sucursalActiva.id,
        customer_name: datosCliente?.nombre || 'Cliente',
        customer_phone: datosCliente?.telefono || '',
        customer_notes: datosCliente?.notas || '',
        pickup_time: asap ? null : horaEntrega,
        asap,
        items,
        total
      })
      setUltimoNumeroOrden(orden.order_number)
      setUltimaHora(asap ? 'Lo antes posible' : horaEntrega)
      setModoWhatsapp(false)

      // La impresión se dispara desde el admin (Orders.jsx) para funcionar
      // tanto con pedidos de celular como de PC.
      limpiarCarrito()
      setVista('confirmado')
    } catch (e) {
      console.error('Error al crear pedido:', e)
      alert('Hubo un problema al registrar tu pedido. Por favor intenta de nuevo.')
    }
  }

  // Sucursales sin infraestructura de pedidos en línea todavía
  // (branches.pedidos_en_linea = false): en vez de registrar el pedido en
  // el sistema, se arma como mensaje de WhatsApp pre-redactado al teléfono
  // de la sucursal — el cliente solo tiene que darle "Enviar" en WhatsApp.
  const enviarPedidoPorWhatsapp = (horaEntrega, datosCliente, asap = false) => {
    const carritoSnapshot = [...carrito]
    const esAlPesar = (item) => item.tipo === 'pieza' || item.tipo === 'preparado' || item.tipo === 'milanesa'

    // `resumen` ya trae el precio/kg o "(se pesa al entregar)" incluido en
    // el texto (mismo campo que usa confirmarPedido como product_name) —
    // agregar el precio aparte lo duplicaría.
    const lineas = carritoSnapshot.map(item => {
      const cantidad = item.cantidad || 1
      return `- ${cantidad}x ${item.resumen || item.nombre || 'Producto'}`
    })
    const total = carritoSnapshot.reduce((sum, item) => {
      if (esAlPesar(item)) return sum
      return sum + parseFloat(item.precioTotal || item.precio || item.price || 0)
    }, 0)

    const mensaje = [
      '🐔 *Nuevo pedido - Casa del Pollo*',
      `📍 Sucursal: ${sucursalActiva?.name || ''}`,
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

    // El WhatsApp real de la sucursal puede ser distinto al teléfono local
    // (ej. El Parque) — se prefiere branches.whatsapp y solo se cae a
    // branches.phone si esa sucursal no tiene un número de WhatsApp propio.
    const telefonoSucursal = (sucursalActiva?.whatsapp || sucursalActiva?.phone || '').replace(/\D/g, '')
    const url = `https://wa.me/${telefonoSucursal ? `52${telefonoSucursal}` : ''}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')

    setUltimoNumeroOrden(null)
    setUltimaHora(asap ? 'Lo antes posible' : horaEntrega)
    setModoWhatsapp(true)
    limpiarCarrito()
    setVista('confirmado')
  }

  const totalItems = carrito.reduce((sum, item) => {
    if (item.tipo === 'milanesa' || item.tipo === 'pieza' || item.tipo === 'complemento') {
      return sum + item.cantidad
    }
    return sum + 1
  }, 0)

  return (
    <AppContext.Provider value={{
  sucursalActiva, setSucursalActiva,
  carrito, agregarAlCarrito, eliminarDelCarrito, limpiarCarrito, confirmarPedido,
  enviarPedidoPorWhatsapp,
  vista, setVista,
  totalItems,
  ultimoNumeroOrden, ultimaHora, modoWhatsapp,
  sucursales,
  productos,
  schedule,
  cocInicio, cocFin, cocFinSabado,
  banners,
  bannersMenu,
  bannersPopup,
  bannersAviso,
  diseno,
  cargando,
}}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}