import { AppProvider, useApp } from './data/AppContext.jsx'
import SelectorSucursal from './pages/SelectorSucursal.jsx'
import MenuPrincipal from './pages/MenuPrincipal.jsx'
import Carrito from './pages/Carrito.jsx'
import Confirmado from './pages/Confirmado.jsx'
import Feedback from './pages/Feedback.jsx'
import LinksPage from './pages/LinksPage.jsx'
import HomeV2Preview from './pages/HomeV2Preview.jsx'
import InstalarApp from './Components/InstalarApp.jsx'
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
  if (window.location.pathname === '/links') return <LinksPage />

  // Preview oculto de la navegación V2 — no es parte del flujo real,
  // solo para ver el diseño en un celular de verdad. Nadie llega aquí
  // navegando la app normal.
  if (window.location.pathname === '/preview-v2') {
    return (
      <AppProvider>
        <HomeV2Preview />
        <InstalarApp />
      </AppProvider>
    )
  }

  return (
    <AppProvider>
      <Contenido />
      <InstalarApp />
    </AppProvider>
  )
}