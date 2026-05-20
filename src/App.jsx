import { AppProvider, useApp } from './data/AppContext.jsx'
import SelectorSucursal from './pages/SelectorSucursal.jsx'
import MenuPrincipal from './pages/MenuPrincipal.jsx'
import Carrito from './pages/Carrito.jsx'
import Confirmado from './pages/Confirmado.jsx'
import Feedback from './pages/Feedback.jsx'
import './styles/global.css'

function Contenido() {
  const { vista } = useApp()

  if (vista === 'sucursales') return <SelectorSucursal />
  if (vista === 'menu') return <MenuPrincipal />
  if (vista === 'carrito') return <Carrito />
  if (vista === 'confirmado') return <Confirmado />
  if (vista === 'feedback') return <Feedback />
  return null
}

export default function App() {
  return (
    <AppProvider>
      <Contenido />
    </AppProvider>
  )
}