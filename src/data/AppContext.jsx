import { createContext, useContext, useState, useEffect } from 'react'
import { generarSlots, reservarSlot } from './slots.js'
import { getBranches, getProductsByBranch, createOrder, getDesign, getPromotions, getBanners } from './api.js'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [vista, setVista] = useState('sucursales')
  const [slots, setSlots] = useState(() => generarSlots(new Date()))
  const [sucursales, setSucursales] = useState([])
  const [productos, setProductos] = useState([])
  const [promociones, setPromociones] = useState([])
  const [banners, setBanners] = useState([])
  const [diseno, setDiseno] = useState({})
  const [cargando, setCargando] = useState(true)
  const [ultimoNumeroOrden, setUltimoNumeroOrden] = useState(null)
  const [ultimaHora, setUltimaHora] = useState(null)
  const [bannersMenu, setBannersMenu] = useState([])

  useEffect(() => {
    getBranches()
      .then(data => setSucursales(data))
      .catch(() => setSucursales([]))
      .finally(() => setCargando(false))

    getPromotions()
      .then(data => setPromociones(Array.isArray(data) ? data : []))
      .catch(() => setPromociones([]))

    getBanners('bienvenida')
  .then(data => setBanners(Array.isArray(data) ? data : []))
  .catch(() => setBanners([]))

getBanners('menu')
  .then(data => setBannersMenu(Array.isArray(data) ? data : []))
  .catch(() => setBannersMenu([]))
  }, [])

  useEffect(() => {
    if (sucursalActiva) {
      getProductsByBranch(sucursalActiva.id)
        .then(data => setProductos(data))
        .catch(() => setProductos([]))

      getDesign(sucursalActiva.id)
        .then(data => setDiseno(data || {}))
        .catch(() => setDiseno({}))

      getPromotions(sucursalActiva.id)
        .then(data => setPromociones(Array.isArray(data) ? data : []))
        .catch(() => setPromociones([]))
    }
  }, [sucursalActiva])

  useEffect(() => {
    const root = document.documentElement
    const themeMap = {
      primary_color: '--rojo',
      secondary_color: '--crema',
      accent_color: '--dorado',
      background_color: '--app-bg',
      card_color: '--card-bg',
      button_color: '--button-bg',
      button_text_color: '--button-text',
      navbar_color: '--navbar-bg',
      text_color: '--texto',
      secondary_text_color: '--navbar-text',
      border_radius: '--radio',
      font_title: '--font-title',
      font_body: '--font-body',
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

  const confirmarPedido = async (horaEntrega, datosCliente) => {
    if (horaEntrega) {
      setSlots(prev => reservarSlot(prev, horaEntrega))
    }
    try {
      const items = carrito.map(item => ({
        product_name: item.resumen || item.nombre || 'Producto',
        quantity: item.cantidad || 1,
        price: parseFloat(item.precioTotal || item.precio || item.price || 0)
      }))
      const total = carrito.reduce((sum, item) => {
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
        pickup_time: horaEntrega,
        items,
        total
      })
      setUltimoNumeroOrden(orden.order_number)
      setUltimaHora(horaEntrega)
    } catch (e) {
      console.error('Error al crear pedido:', e)
    }
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
  vista, setVista,
  slots, totalItems,
  ultimoNumeroOrden, ultimaHora,
  sucursales,
  productos,
  promociones,
  banners,
  bannersMenu,
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