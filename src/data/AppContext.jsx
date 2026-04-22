import { createContext, useContext, useState, useEffect } from 'react'
import { generarSlots, reservarSlot } from './slots.js'
import { getBranches, getProductsByBranch, createOrder } from './api.js'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [vista, setVista] = useState('sucursales')
  const [slots, setSlots] = useState(() => generarSlots(new Date()))
  const [sucursales, setSucursales] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  // Cargar sucursales al inicio
  useEffect(() => {
    getBranches()
      .then(data => setSucursales(data))
      .catch(() => setSucursales([]))
      .finally(() => setCargando(false))
  }, [])

  // Cargar productos cuando se selecciona sucursal
  useEffect(() => {
    if (sucursalActiva) {
      getProductsByBranch(sucursalActiva.id)
        .then(data => setProductos(data))
        .catch(() => setProductos([]))
    }
  }, [sucursalActiva])

  const agregarAlCarrito = (item) => {
    setCarrito(prev => [...prev, { ...item, id: Date.now() + Math.random() }])
  }

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id))
  }

  const limpiarCarrito = () => setCarrito([])

  const confirmarPedido = async (horaEntrega) => {
  if (horaEntrega) {
    setSlots(prev => reservarSlot(prev, horaEntrega))
  }

  try {
    const items = carrito.map(item => ({
      product_name: item.resumen || item.nombre || item.name || 'Producto',
      quantity: item.cantidad || 1,
      price: item.precioTotal || item.precio || item.price || 0
    }))

    const total = carrito.reduce((sum, item) => {
      return sum + (item.precioTotal || item.precio || item.price || 0)
    }, 0)

    await createOrder({
      branch_id: sucursalActiva.id,
      customer_name: 'Cliente',
      customer_phone: '',
      items,
      total
    })
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
      sucursalActiva,
      setSucursalActiva,
      carrito,
      agregarAlCarrito,
      eliminarDelCarrito,
      limpiarCarrito,
      confirmarPedido,
      vista,
      setVista,
      slots,
      totalItems,
      sucursales,
      productos,
      cargando,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}