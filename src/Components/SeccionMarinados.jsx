import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

const MIN = 200
const MAX = 2000
const PASO = 50

function calcularTiempo(gramos) {
  const base = 20
  const extra = Math.ceil((gramos - 300) / 100) * 5
  return gramos <= 300 ? base : base + extra
}

export default function SeccionMarinados() {
  const { agregarAlCarrito, sucursalActiva, productos } = useApp()
  const [seleccion, setSeleccion] = useState(null)
  const [gramos, setGramos] = useState(300)
  const [recogida, setRecogida] = useState('crudo')
  const [agregado, setAgregado] = useState(false)

  const productosSeccion = productos.filter(
    p => p.category_name === 'Marinados' && p.available !== false
  )

  const tiempoEstimado = calcularTiempo(gramos)

  const cambiarGramos = (delta) => {
    setGramos(prev => {
      const nuevo = prev + delta
      if (nuevo < MIN) return MIN
      if (nuevo > MAX) return MAX
      return nuevo
    })
  }

  const handleAgregar = () => {
    if (!seleccion) return
    agregarAlCarrito({
      tipo: 'marinado',
      nombre: seleccion.name,
      gramos,
      recogida,
      tiempoEstimado: recogida === 'cocinado' ? tiempoEstimado : null,
      necesitaHora: true,
      precio: seleccion.price,
      resumen: `${seleccion.name} ${gramos}g · ${recogida === 'crudo' ? 'Crudo' : `Cocinado ~${tiempoEstimado} min`}`
    })
    setAgregado(true)
    setTimeout(() => {
      setAgregado(false)
      setSeleccion(null)
      setGramos(300)
      setRecogida('crudo')
    }, 1200)
  }

  return (
    <div>
      <div className="seccion-titulo">🍯 Marinados</div>
      <p className="seccion-desc">Elige tu marinado y la cantidad · precio por kg</p>

      {productosSeccion.map(p => (
        <div key={p.id}>
          <button
            className={`card-marinado ${seleccion?.id === p.id ? 'card-marinado-activo' : ''}`}
            onClick={() => setSeleccion(seleccion?.id === p.id ? null : p)}
          >
            <div>
              <div className="producto-nombre">{p.name}</div>
              <div className="producto-precio">${p.price}/kg</div>
            </div>
            {seleccion?.id === p.id && <div className="card-check">✓</div>}
          </button>

          {seleccion?.id === p.id && (
            <div className="configurador-card slide-up" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <div>
                <label className="config-label">Cantidad</label>
                <div className="cantidad-ctrl">
                  <button className="cantidad-btn" onClick={() => cambiarGramos(-PASO)} disabled={gramos <= MIN}>−</button>
                  <span className="cantidad-num" style={{ fontSize: 20, minWidth: 60, textAlign: 'center' }}>
                    {gramos}g
                  </span>
                  <button className="cantidad-btn" onClick={() => cambiarGramos(PASO)} disabled={gramos >= MAX}>+</button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 6 }}>
                  {MIN}g — {MAX}g · intervalos de {PASO}g
                </div>
              </div>

              {sucursalActiva?.tieneMarinadosCocinados && (
                <div>
                  <label className="config-label">Como lo quieres?</label>
                  <div className="recogida-opts">
                    <button
                      className={`recogida-opt ${recogida === 'crudo' ? 'recogida-activo' : ''}`}
                      onClick={() => setRecogida('crudo')}
                    >
                      <span style={{ fontSize: 20 }}>📦</span>
                      <div>
                        <div className="recogida-titulo">Recoger crudo</div>
                        <div className="recogida-sub">Listo para llevar</div>
                      </div>
                    </button>
                    <button
                      className={`recogida-opt ${recogida === 'cocinado' ? 'recogida-activo' : ''}`}
                      onClick={() => setRecogida('cocinado')}
                    >
                      <span style={{ fontSize: 20 }}>🔥</span>
                      <div>
                        <div className="recogida-titulo">Recoger cocinado</div>
                        <div className="recogida-sub">Listo en ~{tiempoEstimado} min</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <button
                className={`btn-primario ${agregado ? 'btn-agregado' : ''}`}
                onClick={handleAgregar}
              >
                {agregado ? '✓ Agregado' : `Agregar ${gramos}g de ${seleccion.name}`}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}