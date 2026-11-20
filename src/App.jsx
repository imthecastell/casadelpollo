import { AppProvider, useApp } from './data/AppContext.jsx'
import SelectorSucursal from './pages/SelectorSucursal.jsx'
import MenuPrincipal from './pages/MenuPrincipal.jsx'
import Carrito from './pages/Carrito.jsx'
import Confirmado from './pages/Confirmado.jsx'
import Feedback from './pages/Feedback.jsx'
import LinksPage from './pages/LinksPage.jsx'
import JuegoPollitos from './pages/JuegoPollitos.jsx'
import VacantesPage from './pages/VacantesPage.jsx'
import CenasPage from './pages/CenasPage.jsx'
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

// /juego: "Atrapa los pollitos" (temporada navideña). "El Salto del Pollo" (Día de Muertos) quedó archivado en
// pages/JuegoGallina.jsx: para reactivarlo, importarlo de nuevo y devolverlo en esta misma ruta.
export default function App() {
  if (/\/links\/?$/.test(window.location.pathname)) return <LinksPage />
  if (/\/juego\/?$/.test(window.location.pathname)) return <JuegoPollitos />
  if (/\/vacantes\/?$/.test(window.location.pathname)) return <VacantesPage />
  if (/\/cenas\/?$/.test(window.location.pathname)) return <CenasPage />

  return (
    <AppProvider>
      <HomeV2Preview />
      <InstalarApp />
    </AppProvider>
  )
}
