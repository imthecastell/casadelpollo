import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { SECCIONES } from '../data/menu.js'
import SeccionFresco from '../Components/SeccionFresco.jsx'
import SeccionMarinados from '../Components/SeccionMarinados.jsx'
import SeccionPreparados from '../Components/SeccionPreparados.jsx'
import SeccionMilanesas from '../Components/SeccionMilanesas.jsx'
import SeccionComplementos from "../Components/SeccionComplementos.jsx";
import SeccionBowls from '../Components/SeccionBowls.jsx'
import '../styles/menu.css'

const COMPONENTES = {
  fresco: SeccionFresco,
  marinados: SeccionMarinados,
  preparados: SeccionPreparados,
  milanesas: SeccionMilanesas,
  complementos: SeccionComplementos,
  bowls: SeccionBowls,
}

export default function MenuPrincipal() {
  const { sucursalActiva, setVista, totalItems } = useApp()
  const [tabActiva, setTabActiva] = useState('fresco')

  const SeccionActiva = COMPONENTES[tabActiva]

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="header-inner">
          <div>
            <div className="logo-nombre">Casa del Pollo</div>
            <div className="logo-sucursal">Sucursal {sucursalActiva?.nombre}</div>
          </div>
          <button className="carrito-btn" onClick={() => setVista('carrito')}>
            🛒
            {totalItems > 0 && <span className="carrito-badge">{totalItems}</span>}
            Mi pedido
          </button>
        </div>

        <div className="menu-tabs">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              className={`menu-tab ${tabActiva === s.id ? 'menu-tab-activo' : ''}`}
              onClick={() => setTabActiva(s.id)}
            >
              <span>{s.emoji}</span>
              <span>{s.nombre}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="pagina slide-up">
        {SeccionActiva && <SeccionActiva />}
      </main>
    </div>
  )
}