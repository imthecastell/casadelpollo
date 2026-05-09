import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

const TIEMPO_BOWL = 20
const PRECIO_BASE_BOWL = 110
const GRAMOS_BASE = 200
const PASO_EXTRA = 50
const MAX_EXTRA = 400
const BASES_NOMBRES = ['Arroz basmati blanco', 'Arroz basmati a la jardinera', 'Pasta poblana', 'Pasta de tomate', 'Ensalada']

function calcularLugares(numBowls) {
  return Math.ceil(numBowls / 2)
}

function precioExtra(producto, gramosExtra) {
  const precioKg = parseFloat(producto?.price || 0)
  return (gramosExtra / 1000) * precioKg
}

function BowlBuilder({ numero, onAgregar, productos }) {
  const [baseId, setBaseId] = useState('')
  const [marinadoId, setMarinadoId] = useState('')
  const [extraBase, setExtraBase] = useState(0)
  const [extraMarinado, setExtraMarinado] = useState(0)
  const [agregado, setAgregado] = useState(false)

  const bases = productos.filter(p => BASES_NOMBRES.includes(p.name) && p.available !== false)
  const marinados = productos.filter(p => p.category_name === 'Marinados' && p.available !== false)
  const base = bases.find(p => String(p.id) === baseId)
  const marinado = marinados.find(p => String(p.id) === marinadoId)
  const listo = base && marinado
  const gramosBaseTotal = GRAMOS_BASE + extraBase
  const gramosMarinadoTotal = GRAMOS_BASE + extraMarinado
  const extrasTotal = precioExtra(base, extraBase) + precioExtra(marinado, extraMarinado)
  const precioTotal = PRECIO_BASE_BOWL + extrasTotal

  const cambiarExtra = (tipo, delta) => {
    const setter = tipo === 'base' ? setExtraBase : setExtraMarinado
    setter(prev => {
      const siguiente = prev + delta
      if (siguiente < 0) return 0
      if (siguiente > MAX_EXTRA) return MAX_EXTRA
      return siguiente
    })
  }

  const limpiar = () => {
    setBaseId('')
    setMarinadoId('')
    setExtraBase(0)
    setExtraMarinado(0)
  }

  const handleAgregar = () => {
    if (!listo) return
    onAgregar({
      tipo: 'bowl',
      base: base.name,
      marinado: marinado.name,
      gramosBase: gramosBaseTotal,
      gramosMarinado: gramosMarinadoTotal,
      extraBase,
      extraMarinado,
      tiempoEstimado: TIEMPO_BOWL,
      necesitaHora: true,
      precio: precioTotal,
      precioTotal,
      resumen: `Bowl #${numero}: ${base.name} ${gramosBaseTotal}g + ${marinado.name} ${gramosMarinadoTotal}g · $${precioTotal.toFixed(2)} · ~${TIEMPO_BOWL} min`
    })
    setAgregado(true)
    setTimeout(() => {
      setAgregado(false)
      limpiar()
    }, 1200)
  }

  return (
    <div className="configurador-card">
      <div className="bowl-card-head">
        <div>
          <div className="bowl-numero">Bowl #{numero}</div>
          <div className="bowl-precio-base">$110 base</div>
        </div>
        <div className="bowl-total">${precioTotal.toFixed(2)}</div>
      </div>

      <div className="bowl-field">
        <label className="config-label">Base</label>
        <select className="bowl-select" value={baseId} onChange={e => setBaseId(e.target.value)}>
          <option value="">Elige la base</option>
          {bases.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <div className="bowl-extra-row">
          <span>{gramosBaseTotal}g</span>
          <div className="cantidad-ctrl">
            <button className="cantidad-btn" onClick={() => cambiarExtra('base', -PASO_EXTRA)} disabled={extraBase <= 0}>-</button>
            <span className="cantidad-num">{extraBase ? `+${extraBase}` : '200'}</span>
            <button className="cantidad-btn" onClick={() => cambiarExtra('base', PASO_EXTRA)} disabled={extraBase >= MAX_EXTRA}>+</button>
          </div>
        </div>
        {base && extraBase > 0 && (
          <div className="bowl-extra-precio">Extra base: +${precioExtra(base, extraBase).toFixed(2)}</div>
        )}
      </div>

      <div className="bowl-field">
        <label className="config-label">Marinado</label>
        <select className="bowl-select" value={marinadoId} onChange={e => setMarinadoId(e.target.value)}>
          <option value="">Elige el marinado</option>
          {marinados.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <div className="bowl-extra-row">
          <span>{gramosMarinadoTotal}g</span>
          <div className="cantidad-ctrl">
            <button className="cantidad-btn" onClick={() => cambiarExtra('marinado', -PASO_EXTRA)} disabled={extraMarinado <= 0}>-</button>
            <span className="cantidad-num">{extraMarinado ? `+${extraMarinado}` : '200'}</span>
            <button className="cantidad-btn" onClick={() => cambiarExtra('marinado', PASO_EXTRA)} disabled={extraMarinado >= MAX_EXTRA}>+</button>
          </div>
        </div>
        {marinado && extraMarinado > 0 && (
          <div className="bowl-extra-precio">Extra marinado: +${precioExtra(marinado, extraMarinado).toFixed(2)}</div>
        )}
      </div>

      {listo && (
        <div className="bowl-resumen">
          {base.name} {gramosBaseTotal}g + {marinado.name} {gramosMarinadoTotal}g · listo en ~{TIEMPO_BOWL} min
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
  const { agregarAlCarrito, productos } = useApp()
  const [bowls, setBowls] = useState([1])
  const lugares = calcularLugares(bowls.length)

  return (
    <div>
      <div className="seccion-titulo">Bowls</div>
      <p className="seccion-desc">200g de base + 200g de marinado cocinado · extras en intervalos de 50g</p>

      {bowls.length > 1 && (
        <div style={{ background: '#fff5eb', border: '1.5px solid #e85d0433', borderRadius: 'var(--radio)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--cafe-medio)' }}>
          {bowls.length} bowls · ocupa {lugares} lugar{lugares !== 1 ? 'es' : ''} en el horario
        </div>
      )}

      {bowls.map((num, i) => (
        <BowlBuilder key={i} numero={num} onAgregar={agregarAlCarrito} productos={productos} />
      ))}

      <button
        onClick={() => setBowls(prev => [...prev, prev.length + 1])}
        style={{ width: '100%', padding: 14, background: 'transparent', border: '2px dashed var(--gris)', borderRadius: 'var(--radio)', color: 'var(--texto-suave)', fontFamily: 'var(--font-title), sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 }}
      >
        + Agregar otro bowl
      </button>
    </div>
  )
}
