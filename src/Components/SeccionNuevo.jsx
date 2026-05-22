/**
 * SeccionNuevo — pestaña de prueba/sandbox, completamente aislada.
 * Los productos son hardcoded (no vienen de la API).
 * Solo modifica ESTE archivo para iterar en el diseño de la card.
 */
import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { rawCrop, cookedCrop } from './SeccionMarinados.jsx'

const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'

const PRODUCTOS = [
  {
    id: 'nuevo-1',
    name: 'Pollo al Pastor',
    price: 240,
    unidad: '/kg',
    se_puede_cocinar: true,
    emoji: '🍯',
    image_url:        `${CDN}/c_crop,fl_relative,x_0.00,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/marinados/pollo%20al%20pastor.png`,
    image_cooked_url: `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/marinados/pollo%20al%20pastor.png`,
  },
  {
    id: 'nuevo-2',
    name: 'Pechuga Rellena',
    price: 265,
    unidad: '/kg',
    se_puede_cocinar: true,
    emoji: '🍗',
    image_url:        `${CDN}/c_crop,fl_relative,x_0.00,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/preparados/pechuga_rellena.png`,
    image_cooked_url: `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/preparados/pechuga_rellena.png`,
  },
  {
    id: 'nuevo-3',
    name: 'Milanesa Natural',
    price: 175,
    unidad: '/kg',
    se_puede_cocinar: true,
    emoji: '🥩',
    image_url:        `${CDN}/c_crop,fl_relative,x_0.00,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/milanesas/milanesa_natural.png`,
    image_cooked_url: `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_4:3,c_fill,w_600/milanesas/milanesa_natural.png`,
  },
]

const MIN = 200, MAX = 2000, PASO = 50

/* ── Imagen con transición crudo ↔ cocinado ── */
function ProductoImg({ p, isSelected, recogida }) {
  const showCooked = isSelected && recogida === 'cocinado'
  const size = isSelected ? 90 : 72
  const dur = '0.38s cubic-bezier(.34,1.56,.64,1)'

  if (!p.image_url && !p.image_cooked_url) return (
    <div style={{
      width: size, height: size, borderRadius: 14, flexShrink: 0,
      background: 'var(--crema-oscura)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 28,
      transition: `width ${dur}, height ${dur}`,
    }}>{p.emoji}</div>
  )

  return (
    <div style={{
      position: 'relative', width: size, height: size, borderRadius: 14,
      flexShrink: 0, overflow: 'hidden',
      transition: `width ${dur}, height ${dur}`,
      boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
    }}>
      <img src={p.image_url} alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', transition: 'opacity 0.4s ease',
        opacity: showCooked ? 0 : 1,
      }} />
      <img src={p.image_cooked_url} alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', transition: 'opacity 0.4s ease',
        opacity: showCooked ? 1 : 0,
      }} />
    </div>
  )
}

export default function SeccionNuevo() {
  const { agregarAlCarrito } = useApp()
  const [seleccion, setSeleccion] = useState(null)
  const [gramos, setGramos] = useState(300)
  const [recogida, setRecogida] = useState('crudo')
  const [agregado, setAgregado] = useState(false)

  const seleccionar = (p) => {
    if (seleccion?.id === p.id) {
      setSeleccion(null)
      setGramos(300)
      setRecogida('crudo')
    } else {
      setSeleccion(p)
      setGramos(300)
      setRecogida('crudo')
    }
  }

  const cambiarGramos = (delta) => {
    setGramos(prev => Math.min(MAX, Math.max(MIN, prev + delta)))
  }

  const handleAgregar = () => {
    if (!seleccion) return
    const precioTotal = (gramos / 1000) * seleccion.price
    agregarAlCarrito({
      tipo: 'marinado',
      nombre: seleccion.name,
      gramos,
      recogida,
      tiempoEstimado: recogida === 'cocinado' ? 25 : null,
      precio: seleccion.price,
      precioTotal,
      imagen_url: recogida === 'cocinado' ? seleccion.image_cooked_url : seleccion.image_url,
      resumen: `${seleccion.name} ${gramos}g · ${recogida === 'crudo' ? 'Crudo' : 'Cocinado ~25 min'} · $${precioTotal.toFixed(2)}`,
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
      <div className="seccion-titulo">✨ Nuevo</div>
      <p className="seccion-desc">Selecciona · elige cantidad · crudo o cocinado</p>

      {PRODUCTOS.map(p => {
        const isActive = seleccion?.id === p.id
        const precioTotal = isActive ? ((gramos / 1000) * p.price) : 0

        return (
          <div key={p.id}>
            {/* ── Card ── */}
            <button
              className={`card-marinado ${isActive ? 'card-marinado-activo' : ''}`}
              onClick={() => seleccionar(p)}
            >
              <ProductoImg p={p} isSelected={isActive} recogida={recogida} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="producto-nombre">{p.name}</div>
                <div className="producto-precio">${p.price}{p.unidad}</div>
              </div>
              {isActive
                ? <div className="card-check">✓</div>
                : <div className="card-add">+</div>
              }
            </button>

            {/* ── Configurador ── */}
            {isActive && (
              <div className="configurador-card slide-up" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>

                {/* Cantidad */}
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
                    {MIN}g — {MAX}g · cada {PASO}g
                  </div>
                </div>

                {/* Crudo / Cocinado */}
                <div>
                  <label className="config-label">¿Cómo lo quieres?</label>
                  <div className="recogida-opts">
                    <button
                      className={`recogida-opt ${recogida === 'crudo' ? 'recogida-activo' : ''}`}
                      onClick={() => setRecogida('crudo')}
                    >
                      <span style={{ fontSize: 20 }}>📦</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Crudo</span>
                      <span style={{ fontSize: 11, color: 'var(--texto-suave)' }}>Lo llevas en frío</span>
                    </button>
                    <button
                      className={`recogida-opt ${recogida === 'cocinado' ? 'recogida-activo' : ''}`}
                      onClick={() => setRecogida('cocinado')}
                    >
                      <span style={{ fontSize: 20 }}>🔥</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Cocinado</span>
                      <span style={{ fontSize: 11, color: 'var(--texto-suave)' }}>Listo para comer</span>
                    </button>
                  </div>
                </div>

                {/* Total + Agregar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginBottom: 1 }}>Total estimado</div>
                    <div style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--rojo)' }}>
                      ${precioTotal.toFixed(2)}
                    </div>
                  </div>
                  <button
                    className={`btn-confirm ${agregado ? 'confirmado' : ''}`}
                    style={{ flex: 1, maxWidth: 160 }}
                    onClick={handleAgregar}
                  >
                    {agregado ? '✓ Agregado' : 'Agregar al pedido'}
                  </button>
                </div>

              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
