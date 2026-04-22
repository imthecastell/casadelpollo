import { useApp } from '../data/AppContext.jsx'
import '../styles/selector.css'

export default function SelectorSucursal() {
  const { setSucursalActiva, setVista, sucursales, cargando } = useApp()

  const elegirSucursal = (sucursal) => {
    if (!sucursal.active) return
    setSucursalActiva(sucursal)
    setVista('menu')
  }

  if (cargando) return (
    <div className="selector-bg">
      <div className="selector-contenido">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>Cargando...</div>
      </div>
    </div>
  )

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
          {sucursales.map(s => (
            <button
              key={s.id}
              className={`sucursal-card ${!s.active ? 'sucursal-inactiva' : ''}`}
              onClick={() => elegirSucursal(s)}
            >
              <div className="sucursal-info">
                <div className="sucursal-nombre">{s.name}</div>
                <div className="sucursal-direccion">{s.address}</div>
                {!s.active && <div className="sucursal-pronto">Próximamente</div>}
              </div>
              {s.active && <span className="sucursal-flecha">→</span>}
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