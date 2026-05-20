import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import AvisoAirfryer from './AvisoAirfryer.jsx'

/* ── extrae la ruta del archivo ignorando transformaciones previas ── */
function getFilePath(url) {
  if (!url || !url.includes('cloudinary.com')) return null
  // Elimina segmentos de transformación (contienen coma) y versión (v1234...)
  const m = url.match(/\/upload\/(?:v\d+\/)?(?:[^/]*,[^/]*\/)*(.+)$/)
  return m ? m[1] : null
}

const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'

function buildSideUrl(url, xStart, size = 320) {
  const path = getFilePath(url)
  if (!path) return url
  return `${CDN}/c_crop,fl_relative,x_${xStart.toFixed(2)},y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_${size}/${path}`
}

export function cookedCrop(url, size = 320) {
  return buildSideUrl(url, 0.5, size)
}

export function rawCrop(url, size = 320) {
  return buildSideUrl(url, 0.0, size)
}

function MarimadoImg({ imageUrl, imageCookedUrl, isSelected, recogida }) {
  const rawSrc    = imageUrl ? rawCrop(imageUrl) : null
  const cookedSrc = (imageCookedUrl || imageUrl) ? cookedCrop(imageCookedUrl || imageUrl) : null
  const showCooked = !!(isSelected && recogida === 'cocinado' && cookedSrc)
  const size = isSelected ? 90 : 72
  const dur  = '0.38s cubic-bezier(.34,1.56,.64,1)'

  const imgStyle = (visible) => ({
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', transition: 'opacity 0.4s ease',
    opacity: visible ? 1 : 0,
  })

  if (!rawSrc && !cookedSrc) return (
    <div style={{
      width: size, height: size, borderRadius: 14, flexShrink: 0, order: -1,
      background: 'var(--crema-oscura)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 28,
      transition: `width ${dur}, height ${dur}`,
    }}>🍯</div>
  )

  return (
    <div style={{
      position: 'relative', width: size, height: size, borderRadius: 14,
      flexShrink: 0, order: -1, overflow: 'hidden',
      transition: `width ${dur}, height ${dur}`,
      boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
    }}>
      {rawSrc    && <img src={rawSrc}    alt="" style={imgStyle(!showCooked)} />}
      {cookedSrc && <img src={cookedSrc} alt="" style={imgStyle(showCooked)}  />}
    </div>
  )
}

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
  const [mostrarAviso, setMostrarAviso] = useState(false)

  const productosSeccion = productos.filter(
    p => p.category_name === 'Marinados' && p.available !== false
  )

  const tiempoEstimado = calcularTiempo(gramos)
  const precioTotal = seleccion ? (gramos / 1000) * parseFloat(seleccion.price || 0) : 0

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
      precioTotal,
      imagen_url: recogida === 'cocinado'
        ? cookedCrop(seleccion.image_cooked_url || seleccion.image_url)
        : rawCrop(seleccion.image_url),
      resumen: `${seleccion.name} ${gramos}g · ${recogida === 'crudo' ? 'Crudo' : `Cocinado ~${tiempoEstimado} min`} · $${precioTotal.toFixed(2)}`
    })
    setAgregado(true)
    setTimeout(() => {
      setAgregado(false)
      setSeleccion(null)
      setGramos(300)
      setRecogida('crudo')
    }, 1200)
  }

  const elegirRecogida = (modo) => {
    setRecogida(modo)
    if (modo === 'cocinado' && seleccion?.se_puede_cocinar !== false) {
      setMostrarAviso(true)
    }
  }

  return (
    <div>
      {mostrarAviso && <AvisoAirfryer onCerrar={() => setMostrarAviso(false)} />}
      <div className="seccion-titulo">🍯 Marinados</div>
      <p className="seccion-desc">Elige tu marinado y la cantidad · precio por kg</p>

      {productosSeccion.map(p => (
        <div key={p.id}>
          <button
            className={`card-marinado ${seleccion?.id === p.id ? 'card-marinado-activo' : ''}`}
            onClick={() => setSeleccion(seleccion?.id === p.id ? null : p)}
          >
            <MarimadoImg
              imageUrl={p.image_url}
              imageCookedUrl={p.image_cooked_url}
              isSelected={seleccion?.id === p.id}
              recogida={recogida}
            />
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

              {seleccion?.se_puede_cocinar && (
                <div>
                  <label className="config-label">¿Cómo lo quieres?</label>
                  <div className="recogida-opts">
                    <button
                      className={`recogida-opt ${recogida === 'crudo' ? 'recogida-activo' : ''}`}
                      onClick={() => elegirRecogida('crudo')}
                    >
                      <span style={{ fontSize: 20 }}>📦</span>
                      <div>
                        <div className="recogida-titulo">Recoger crudo</div>
                        <div className="recogida-sub">Listo para llevar</div>
                      </div>
                    </button>
                    <button
                      className={`recogida-opt ${recogida === 'cocinado' ? 'recogida-activo' : ''}`}
                      onClick={() => elegirRecogida('cocinado')}
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
