import { createContext, useContext, useState } from 'react'
import { generarSlots, reservarSlot } from './slots.js'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [sucursalActiva, setSucursalActiva] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [vista, setVista] = useState('sucursales')
  const [slots, setSlots] = useState(() => generarSlots(new Date()))

  const agregarAlCarrito = (item) => {
    setCarrito(prev => [...prev, { ...item, id: Date.now() + Math.random() }])
  }

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id))
  }

  const limpiarCarrito = () => setCarrito([])

  const confirmarPedido = (horaEntrega) => {
    if (horaEntrega) {
      setSlots(prev => reservarSlot(prev, horaEntrega))
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
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}