import { useApp } from '../data/AppContext.jsx'
import { SUCURSALES } from '../data/menu.js'
import '../styles/selector.css'

export default function SelectorSucursal() {
  const { setSucursalActiva, setVista } = useApp()

  const elegirSucursal = (sucursal) => {
    if (!sucursal.activa) return
    setSucursalActiva(sucursal)
    setVista('menu')
  }

  return (
    <div className="selector-bg">
      <div className="selector-contenido">
        <div className="selector-logo">
          <div className="selector-logo-icono">🐔</div>
          <div className="selector-logo-nombre">Casa del Pollo</div>
          <div className="selector-logo-sub">Marinados artesanales</div>
        </div>

        <div className="selector-pregunta">¿En qué sucursal recoges tu pedido?</div>

        <div className="selector-lista">
          {SUCURSALES.map(s => (
            <button
              key={s.id}
              className={`sucursal-card ${!s.activa ? 'sucursal-inactiva' : ''}`}
              onClick={() => elegirSucursal(s)}
            >
              <div className="sucursal-info">
                <div className="sucursal-nombre">{s.nombre}</div>
                <div className="sucursal-direccion">{s.direccion}</div>
                {!s.activa && <div className="sucursal-pronto">Próximamente</div>}
              </div>
              {s.activa && <span className="sucursal-flecha">→</span>}
            </button>
          ))}
        </div>

        <div className="selector-footer">
          Solo recolección en local · Pago en persona
        </div>
      </div>
    </div>
  )
}