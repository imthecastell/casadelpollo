import { useState, useMemo } from 'react'
import { useApp } from '../data/AppContext.jsx'

const TIEMPO_BOWL = 20
const PRECIO_BASE_BOWL = 110
const GRAMOS_BASE = 200
const PASO_EXTRA = 50
const MAX_EXTRA = 400

/* ── Crop helpers para imágenes de bowl ── */
const CDN = 'https://res.cloudinary.com/do4juvxio/image/upload'

function getFilePath(url) {
  if (!url || !url.includes('cloudinary.com')) return null
  const m = url.match(/\/upload\/(?:v\d+\/)?(?:[^/]*,[^/]*\/)*(.+)$/)
  return m ? m[1] : null
}

/* Lado cocinado (derecho) en formato 16:9 para el hero */
function cookedHero(url, w = 900) {
  const path = getFilePath(url)
  if (!path) return url
  return `${CDN}/c_crop,fl_relative,x_0.50,y_0.00,w_0.50,h_1.00/ar_16:9,c_fill,w_${w}/${path}`
}

/* Imagen de portada de la sección bowls */
const BOWL_DEFAULT = `${CDN}/ar_16:9,c_fill,w_900/design/fqcs5srwvt8ksqezoqqu.png`

function calcularLugares(numBowls) {
  return Math.ceil(numBowls / 2)
}

function precioExtra(producto, gramosExtra) {
  const precioKg = parseFloat(producto?.price || 0)
  return (gramosExtra / 1000) * precioKg
}

/* ── Componente de imagen de base ── */
function BaseImg({ nombre, imageUrl }) {
  if (imageUrl) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
    )
  }
  const emojis = { 'Arroz': '🍚', 'Pasta': '🍝', 'Ensalada': '🥗' }
  const emoji = Object.entries(emojis).find(([k]) => nombre?.includes(k))?.[1] || '🥣'
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a2016 0%, #1a4030 60%, #2d6a4f 100%)' }}>
      <span style={{ fontSize: 72 }}>{emoji}</span>
    </div>
  )
}

/* ── Hero image del bowl ── */
function BowlHero({ marinado, base, defaultImg }) {
  const heroImg = useMemo(() => {
    if (marinado?.image_cooked_url || marinado?.image_url)
      return cookedHero(marinado.image_cooked_url || marinado.image_url)
    return null
  }, [marinado])

  const showBase = !heroImg && !!base

  return (
    <div style={{ position: 'relative', height: 'clamp(160px,42vw,240px)', borderRadius: 20, overflow: 'hidden', marginBottom: 0, flexShrink: 0 }}>
      {/* Fondo default */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${defaultImg || BOWL_DEFAULT})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: heroImg || showBase ? 0 : 1,
        transition: 'opacity 0.9s ease',
      }} />

      {/* Overlay base (imagen real o emoji) */}
      {showBase && (
        <div style={{ position: 'absolute', inset: 0, opacity: showBase ? 1 : 0, transition: 'opacity 0.7s ease' }}>
          <BaseImg nombre={base?.name} imageUrl={base?.image_url} />
        </div>
      )}

      {/* Foto del marinado cocinado */}
      {heroImg && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 1, transition: 'opacity 0.9s ease',
        }} />
      )}

      {/* Gradiente */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />

      {/* Caption */}
      <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 2 }}>
        {marinado ? (
          <>
            <div style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1.1 }}>
              {marinado.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontWeight: 600 }}>
              🔥 Cocinado · listo en ~{TIEMPO_BOWL} min
            </div>
          </>
        ) : base ? (
          <div style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.1 }}>
            {base.name}
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-title),sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1.1 }}>
              Bowls
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>
              Elige tu base y marinado
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function BowlBuilder({ numero, onAgregar, productos, defaultImg }) {
  const [baseId, setBaseId] = useState('')
  const [marinadoId, setMarinadoId] = useState('')
  const [marinadoCat, setMarinadoCat] = useState('')
  const [extraBase, setExtraBase] = useState(0)
  const [extraMarinado, setExtraMarinado] = useState(0)
  const [agregado, setAgregado] = useState(false)

  const bases = productos.filter(p =>
    p.is_bowl_base &&
    (p.category_name?.toLowerCase().includes('complement') || p.category_name?.toLowerCase().includes('extra')) &&
    p.available !== false
  )
  const marinados = productos.filter(p =>
    p.is_bowl_base &&
    (p.category_name?.toLowerCase().includes('marinado') ||
     p.category_name?.toLowerCase().includes('preparado') ||
     p.category_name?.toLowerCase().includes('milanesa')) &&
    p.available !== false
  )
  // Agrupar marinados por categoría
  const marinadoGroups = {}
  marinados.forEach(p => {
    const cat = p.category_name || 'Otros'
    if (!marinadoGroups[cat]) marinadoGroups[cat] = []
    marinadoGroups[cat].push(p)
  })

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
    setMarinadoCat('')
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
      imagen_referencia: marinado.image_cooked_url || marinado.image_url || null,
      resumen: `Bowl #${numero}: ${base.name} ${gramosBaseTotal}g + ${marinado.name} ${gramosMarinadoTotal}g · $${precioTotal.toFixed(2)} · ~${TIEMPO_BOWL} min`
    })
    setAgregado(true)
    setTimeout(() => {
      setAgregado(false)
      limpiar()
    }, 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Hero dinámico */}
      <BowlHero marinado={marinado} base={base} defaultImg={defaultImg} />

      {/* Card de configuración */}
      <div className="configurador-card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: 0 }}>
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

          {marinado ? (
            /* ── Marinado seleccionado ── */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f0f4ff', borderRadius: 8, border: '1.5px solid #4a7fd4', marginBottom: 8 }}>
                {(marinado.image_cooked_url || marinado.image_url)
                  ? <img src={marinado.image_cooked_url || marinado.image_url} alt="" style={{ width: 38, height: 30, borderRadius: 5, objectFit: 'cover', flexShrink: 0, border: '1px solid #dde' }} />
                  : <div style={{ width: 38, height: 30, borderRadius: 5, background: '#e8eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🥩</div>
                }
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#1a3a6b' }}>{marinado.name}</span>
                <button
                  onClick={() => { setMarinadoId(''); setMarinadoCat(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 12, padding: '4px 6px', borderRadius: 4 }}>
                  cambiar ✕
                </button>
              </div>
              <div className="bowl-extra-row">
                <span>{gramosMarinadoTotal}g</span>
                <div className="cantidad-ctrl">
                  <button className="cantidad-btn" onClick={() => cambiarExtra('marinado', -PASO_EXTRA)} disabled={extraMarinado <= 0}>-</button>
                  <span className="cantidad-num">{extraMarinado ? `+${extraMarinado}` : '200'}</span>
                  <button className="cantidad-btn" onClick={() => cambiarExtra('marinado', PASO_EXTRA)} disabled={extraMarinado >= MAX_EXTRA}>+</button>
                </div>
              </div>
              {extraMarinado > 0 && (
                <div className="bowl-extra-precio">Extra marinado: +${precioExtra(marinado, extraMarinado).toFixed(2)}</div>
              )}
            </div>
          ) : (
            /* ── Selector por categorías ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Object.entries(marinadoGroups).map(([catName, items]) => {
                const isOpen = marinadoCat === catName
                return (
                  <div key={catName}>
                    {/* Cabecera de categoría */}
                    <button
                      style={{
                        width: '100%', textAlign: 'left', padding: '10px 14px',
                        background: isOpen ? 'var(--crema-oscuro, #f5ede3)' : '#f7f7f7',
                        border: `1.5px solid ${isOpen ? 'var(--rojo, #c1121f)' : '#e0e0e0'}`,
                        borderRadius: isOpen ? '8px 8px 0 0' : 8,
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', color: '#1a1a1a',
                      }}
                      onClick={() => setMarinadoCat(isOpen ? '' : catName)}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{catName}</span>
                      <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>
                        {items.length} opciones {isOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {/* Lista de productos */}
                    {isOpen && (
                      <div style={{ border: '1.5px solid var(--rojo, #c1121f)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden', background: 'white' }}>
                        {items.map((item, idx) => (
                          <button
                            key={item.id}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '9px 12px', background: 'white', border: 'none',
                              borderBottom: idx < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                              cursor: 'pointer', textAlign: 'left',
                            }}
                            onClick={() => { setMarinadoId(String(item.id)); setMarinadoCat(''); }}>
                            {(item.image_cooked_url || item.image_url)
                              ? <img src={item.image_cooked_url || item.image_url} alt="" style={{ width: 38, height: 30, borderRadius: 5, objectFit: 'cover', flexShrink: 0, border: '1px solid #eee' }} />
                              : <div style={{ width: 38, height: 30, borderRadius: 5, background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🥩</div>
                            }
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#222' }}>{item.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
          {agregado ? '✓ Bowl agregado' : 'Agregar bowl al pedido'}
        </button>
      </div>
    </div>
  )
}

export default function SeccionBowls() {
  const { agregarAlCarrito, productos, diseno } = useApp()
  const [bowls, setBowls] = useState([1])
  const lugares = calcularLugares(bowls.length)

  /* Imagen hero por defecto — editable desde admin en Design > bowl_hero_url */
  const defaultImg = diseno?.bowl_hero_url || BOWL_DEFAULT

  return (
    <div>
      <div className="seccion-titulo">🥣 Bowls</div>
      <p className="seccion-desc">200g de base + 200g de marinado cocinado · extras en intervalos de 50g</p>

      {bowls.length > 1 && (
        <div style={{ background: '#fff5eb', border: '1.5px solid #e85d0433', borderRadius: 'var(--radio)', padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--cafe-medio)' }}>
          {bowls.length} bowls · ocupa {lugares} lugar{lugares !== 1 ? 'es' : ''} en el horario
        </div>
      )}

      {bowls.map((num, i) => (
        <BowlBuilder key={i} numero={num} onAgregar={agregarAlCarrito} productos={productos} defaultImg={defaultImg} />
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
