import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'
import { SECCIONES } from '../data/menu.js'

const TIEMPO_BOWL = 20

const BASES_BOWL = ['arroz-blanco', 'arroz-jardinera', 'pasta-poblana', 'pasta-tomate', 'ensalada']

function calcularLugares(numBowls) {
  return Math.ceil(numBowls / 2)
}

function BowlBuilder({ numero, onAgregar }) {
  const [base, setBase] = useState(null)
  const [marinado, setMarinado] = useState(null)
  const [agregado, setAgregado] = useState(false)

  const complementos = SECCIONES.find(s => s.id === 'complementos')
  const marinados = SECCIONES.find(s => s.id === 'marinados')
  const bases = complementos.productos.filter(p => BASES_BOWL.includes(p.id))
  const opcionesMarinado = marinados.productos
  const listo = base && marinado

  const handleAgregar = () => {
    if (!listo) return
    onAgregar({
      tipo: 'bowl',
      base: base.nombre,
      marinado: marinado.nombre,
      tiempoEstimado: TIEMPO_BOWL,
      necesitaHora: true,
      resumen: `Bowl #${numero}: ${base.nombre} + ${marinado.nombre} · ~${TIEMPO_BOWL} min`
    })
    setAgregado(true)
    setTimeout(() => {
      setAgregado(false)
      setBase(null)
      setMarinado(null)
    }, 1200)
  }

  return (
    <div className="configurador-card">
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--rojo)' }}>
        Bowl #{numero}
      </div>

      <div>
        <label className="config-label">Base (200g)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bases.map(b => (
            <button
              key={b.id}
              className={`recogida-opt ${base?.id === b.id ? 'recogida-activo' : ''}`}
              onClick={() => setBase(b)}
            >
              <span style={{ fontSize: 16 }}>🥗</span>
              <div className="recogida-titulo">{b.nombre}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="config-label">Marinado (200g)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {opcionesMarinado.map(m => (
            <button
              key={m.id}
              className={`recogida-opt ${marinado?.id === m.id ? 'recogida-activo' : ''}`}
              onClick={() => setMarinado(m)}
            >
              <span style={{ fontSize: 16 }}>🍯</span>
              <div className="recogida-titulo">{m.nombre}</div>
            </button>
          ))}
        </div>
      </div>

      {listo && (
        <div style={{ background: '#f0f9f4', border: '1.5px solid #2a7a4b33', borderRadius: 'var(--radio)', padding: '10px 14px', fontSize: 13, color: 'var(--verde)', fontWeight: 500 }}>
          {base.nombre} + {marinado.nombre} · listo en ~{TIEMPO_BOWL} min
        </div>
      )}

      <button
        className={`btn-primario ${agregado ? 'btn-agregado' : ''}`}
        onClick={handleAgregar}
        disabled={!listo}
        style={{ opacity: listo ? 1 : 0.4 }}
      >
        {agregado ? 'Bowl agregado' : 'Agregar bowl al pedido'}
      </button>
    </div>
  )
}

export default function SeccionBowls() {
  const { agregarAlCarrito } = useApp()
  const [bowls, setBowls] = useState([1])
  const lugares = calcularLugares(bowls.length)

  return (
    <div>
      <div className="seccion-titulo">🥣 Bowls</div>
      <p className="seccion-desc">200g de base + 200g de marinado cocinado · ~20 min</p>

      {bowls.length > 1 && (
        <div style={{ background: '#fff5eb', border: '1.5px solid #e85d0433', borderRadius: 'var(--radio)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--cafe-medio)' }}>
          {bowls.length} bowls · ocupa {lugares} lugar{lugares !== 1 ? 'es' : ''} en el horario
        </div>
      )}

      {bowls.map((num, i) => (
        <BowlBuilder key={i} numero={num} onAgregar={agregarAlCarrito} />
      ))}

      <button
        onClick={() => setBowls(prev => [...prev, prev.length + 1])}
        style={{ width: '100%', padding: 14, background: 'transparent', border: '2px dashed var(--gris)', borderRadius: 'var(--radio)', color: 'var(--texto-suave)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 }}
      >
        + Agregar otro bowl
      </button>
    </div>
  )
}