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

const ENTRADAS = [
  {
    id: 'pollo',
    titulo: 'Pollo fresco y marinados',
    descripcion: 'Piezas frescas, marinados, preparados, milanesas y complementos.',
    accion: 'Ver pollo',
    tabs: ['fresco', 'marinados', 'preparados', 'milanesas', 'complementos'],
  },
  {
    id: 'bowls',
    titulo: 'Bowls',
    descripcion: 'Arma tu bowl con base y marinado listo para recoger.',
    accion: 'Armar bowls',
    tabs: ['bowls'],
  },
]

const COMPONENTES = {
  fresco: SeccionFresco,
  marinados: SeccionMarinados,
  preparados: SeccionPreparados,
  milanesas: SeccionMilanesas,
  complementos: SeccionComplementos,
  bowls: SeccionBowls,
}

export default function MenuPrincipal() {
  const { sucursalActiva, setVista, totalItems, diseno, promociones } = useApp()
  const [entradaActiva, setEntradaActiva] = useState(null)
  const [tabActiva, setTabActiva] = useState(null)

  const SeccionActiva = COMPONENTES[tabActiva]
  const banner = promociones.find(p => p.type === 'banner')
  const tabsVisibles = entradaActiva
    ? SECCIONES.filter(seccion => entradaActiva.tabs.includes(seccion.id))
    : []

  const elegirEntrada = (entrada) => {
    setEntradaActiva(entrada)
    setTabActiva(entrada.tabs[0])
  }

  return (
    <div
      className="app-wrapper"
      style={diseno?.background_image ? { backgroundImage: `linear-gradient(rgba(253,248,240,0.88), rgba(253,248,240,0.96)), url(${diseno.background_image})` } : undefined}
    >
      <header className="header">
        <div className="header-inner">
          <div>
            <div className="logo-nombre">Casa del Pollo</div>
            <div className="logo-sucursal">Sucursal {sucursalActiva?.name}</div>
          </div>
          <button className="carrito-btn" onClick={() => setVista('carrito')}>
            🛒
            {totalItems > 0 && <span className="carrito-badge">{totalItems}</span>}
            Mi pedido
          </button>
        </div>

        {entradaActiva && (
          <div className="menu-tabs">
            <button className="menu-tab menu-tab-volver" onClick={() => { setEntradaActiva(null); setTabActiva(null) }}>
              <span>&lt;</span>
              <span>Inicio</span>
            </button>
            {tabsVisibles.map(s => (
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
        )}
      </header>

      <main className="pagina slide-up">
        {diseno?.header_image && <img className="menu-hero-img" src={diseno.header_image} alt="" />}
        {banner && (
          <section className="menu-promo">
            <strong>{banner.title}</strong>
            {banner.description && <span>{banner.description}</span>}
          </section>
        )}
        {!entradaActiva ? (
          <section className="menu-entrada-grid">
            <div>
              <div className="seccion-titulo">Menu</div>
              <p className="seccion-desc">Elige como quieres empezar tu pedido.</p>
            </div>

            {ENTRADAS.map(entrada => (
              <button key={entrada.id} className={`menu-entrada-card menu-entrada-${entrada.id}`} onClick={() => elegirEntrada(entrada)}>
                <span className="menu-entrada-label">{entrada.id === 'pollo' ? 'Mostrador' : 'Cocina'}</span>
                <strong>{entrada.titulo}</strong>
                <span>{entrada.descripcion}</span>
                <em>{entrada.accion} -&gt;</em>
              </button>
            ))}
          </section>
        ) : (
          SeccionActiva && <SeccionActiva />
        )}
      </main>
    </div>
  )
}
