import { useApp } from '../data/AppContext.jsx'
import '../styles/selector.css'

export default function SelectorSucursal() {
  const { setSucursalActiva, setVista, sucursales, cargando, promociones } = useApp()
  const banner = promociones.find(p => p.type === 'banner') || promociones[0]

  const elegirSucursal = (sucursal) => {
    if (!sucursal.active) return
    setSucursalActiva(sucursal)
    setVista('menu')
  }

  if (cargando) return (
    <div className="selector-bg">
      <div className="selector-overlay" />
      <div className="selector-contenido">
        <div className="selector-cargando">Cargando...</div>
      </div>
    </div>
  )

  return (
    <div className="selector-bg">
      {banner?.image_url && <img className="selector-bg-img" src={banner.image_url} alt="" />}
      <div className="selector-overlay" />

      <div className="selector-contenido">
        <div className="selector-logo">
          <div className="selector-logo-icono">Casa del Pollo</div>
          <div className="selector-logo-nombre">Casa del Pollo</div>
          <div className="selector-logo-sub">Marinados artesanales</div>
        </div>

        {banner && (
          <section className="promo-bienvenida">
            <span className="promo-etiqueta">Promocion activa</span>
            <h1>{banner.title}</h1>
            {banner.description && <p>{banner.description}</p>}
          </section>
        )}

        <div className="selector-pregunta">Elige donde recoges tu pedido</div>

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
                {!s.active && <div className="sucursal-pronto">Proximamente</div>}
              </div>
              {s.active && <span className="sucursal-flecha">-&gt;</span>}
            </button>
          ))}
        </div>

        <div className="selector-footer">
          Solo recoleccion en local · Pago en persona
        </div>
      </div>
    </div>
  )
}
