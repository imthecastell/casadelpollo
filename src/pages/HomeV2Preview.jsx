import { useState, useEffect, useRef } from 'react'
import { useApp } from '../data/AppContext.jsx'
import '../styles/homeV2.css'

/* Preview oculto de la navegación V2 (Home + tab bar). Ruta secreta
   /preview-v2, fuera del flujo de `vista` normal — no afecta nada de
   producción. Usa datos reales (sucursales, catálogo, WhatsApp, /api/links)
   para que el comportamiento en el celular real sea representativo; los
   botones de agregar/pedido siguen siendo decorativos (toast) para no
   tocar el carrito real, pero Cómo-llegar/WhatsApp/Instagram en Sucursales
   ya usan los hipervínculos reales de /api/links. */

const API_URL = 'https://casadelpollo-backend.onrender.com'

const CATEGORIAS = [
  { key: 'marinados', label: 'Marinados', match: 'Marinados' },
  { key: 'preparados', label: 'Preparados', match: 'Preparados' },
  { key: 'fresco', label: 'Pollo fresco', match: 'Pollo Fresco' },
]

const FICHA_POR_CATEGORIA = {
  preparados: {
    nombre: 'Medallón con tocino',
    desc: 'Medallón de pechuga envuelto en tocino, dorado hasta quedar crujiente.',
    variantes: ['Clásico', 'Saludable (sin tocino)'],
    extras: ['Arroz basmati jardinera +$35', 'Ensalada +$75'],
  },
  marinados: {
    nombre: 'A la mexicana',
    desc: 'Fajitas marinadas con especias y toque cítrico, listas para la sartén.',
    variantes: ['250 g por persona', '350 g por persona'],
    extras: ['Arroz basmati jardinera +$35', 'Ensalada +$75'],
  },
}

const img = (p) => p?.image_cooked_url || p?.image_url || ''

// Normaliza a 10 dígitos locales (México) sin importar si venía con "+52",
// espacios o el "52" ya pegado — para que tel:/wa.me siempre reciban un
// número completo y bien formado, nunca un local de 10 dígitos a medias.
function digitosLocales(raw) {
  const digitos = (raw || '').replace(/\D/g, '')
  if (digitos.length === 12 && digitos.startsWith('52')) return digitos.slice(2)
  if (digitos.length === 10) return digitos
  return digitos.slice(-10)
}
function formatearTelefono(raw) {
  const d = digitosLocales(raw)
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : (raw || '')
}

export default function HomeV2Preview() {
  const { sucursales, sucursalActiva, setSucursalActiva, productos, carrito, cargando } = useApp()
  const [tab, setTab] = useState('home')
  const [categoria, setCategoria] = useState('marinados')
  const [fichaAbierta, setFichaAbierta] = useState(false)
  const [varianteSel, setVarianteSel] = useState(0)
  const [extrasSel, setExtrasSel] = useState([])
  const [toast, setToast] = useState('')
  const [waPopover, setWaPopover] = useState(null) // { branchName, telefono, whatsappHref }
  const [links, setLinks] = useState(null)
  const [heroIdx, setHeroIdx] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!sucursalActiva && sucursales.length) {
      const vinedos = sucursales.find(s => s.name === 'Viñedos' && s.active) || sucursales.find(s => s.active)
      if (vinedos) setSucursalActiva(vinedos)
    }
  }, [sucursales, sucursalActiva, setSucursalActiva])

  useEffect(() => {
    fetch(`${API_URL}/api/links`)
      .then(r => r.json())
      .then(data => setLinks(data))
      .catch(() => setLinks({ branches: [] }))
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const mostrarToast = (msg) => setToast(msg)

  const carrusel = productos.filter(p => ['Marinados', 'Preparados'].includes(p.category_name) && img(p)).slice(0, 6)
  useEffect(() => {
    clearInterval(timerRef.current)
    if (carrusel.length < 2) return
    timerRef.current = setInterval(() => setHeroIdx(i => (i + 1) % carrusel.length), 3800)
    return () => clearInterval(timerRef.current)
  }, [carrusel.length])

  const abrirCategoria = (key) => {
    setCategoria(key)
    setFichaAbierta(false)
    setVarianteSel(0)
    setExtrasSel([])
  }

  const toggleExtra = (i) => {
    setExtrasSel(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  const linkDe = (nombre) => links?.branches?.find(b => b.name === nombre)

  if (cargando || !sucursalActiva) {
    return <div className="v2-cargando">Cargando catálogo real de Viñedos…</div>
  }

  const catDef = CATEGORIAS.find(c => c.key === categoria)
  const productosCategoria = productos.filter(p => p.category_name === catDef.match && p.active !== false)
  const ficha = FICHA_POR_CATEGORIA[categoria]
  const productoFicha = ficha ? productosCategoria.find(p => p.name === ficha.nombre) : null
  const productosSimples = productoFicha
    ? productosCategoria.filter(p => p.id !== productoFicha.id)
    : productosCategoria

  const destacados = productos.filter(p => ['Marinados', 'Preparados'].includes(p.category_name) && img(p)).slice(2, 8)

  return (
    <div className="v2-shell">

      <div className="v2-topbar">
        <button className="v2-tb-btn" onClick={() => mostrarToast('Menú con Ayuda, Recetas (próximamente) y Ajustes')}>☰</button>
        <div className="v2-tb-logo">Casa del Pollo</div>
        <button className="v2-tb-btn" onClick={() => mostrarToast(`${carrito.length} producto${carrito.length === 1 ? '' : 's'} en tu carrito`)}>
          🛒{carrito.length > 0 && <span className="v2-tb-badge">{carrito.length}</span>}
        </button>
      </div>

      <div className="v2-contenido">

        {tab === 'home' && (
          <div className="v2-pantalla">
            <div className="v2-saludo">Hola 👋</div>
            <div className="v2-saludo-sub">Pidiendo en {sucursalActiva.name} hoy</div>

            {carrusel.length > 0 && (
              <div className="v2-carrusel">
                {carrusel.map((p, i) => (
                  <div key={p.id} className={`v2-carrusel-slide${i === heroIdx ? ' on' : ''}`}>
                    <img src={img(p)} alt={p.name} />
                  </div>
                ))}
                <div className="v2-carrusel-scrim" />
                <div className="v2-carrusel-chip">{carrusel[heroIdx]?.name}</div>
                <div className="v2-carrusel-dots">
                  {carrusel.map((_, i) => <div key={i} className={`v2-cdot${i === heroIdx ? ' on' : ''}`} />)}
                </div>
              </div>
            )}

            <div className="v2-bowls-cta" onClick={() => mostrarToast('Esto abriría el flujo de Bowls: base → marinado → carrito')}>
              <div className="v2-bowls-emoji">🥗</div>
              <div className="v2-bowls-txt">
                <strong>Arma tu Bowl</strong>
                <span>Base + marinado + tu toque, listo en minutos</span>
              </div>
              <div className="v2-bowls-precio">Desde ${Number(sucursalActiva.bowl_price || 120)}</div>
            </div>

            <div className="v2-seccion-titulo">Destacados</div>
            <div className="v2-suc-strip">
              {destacados.map(p => (
                <div key={p.id} className="v2-tarjeta-destacada">
                  <img src={img(p)} alt={p.name} />
                  <div className="v2-ts-scrim" />
                  <div className="v2-ts-overlay">
                    <div className="v2-ts-nombre">{p.name}</div>
                    <div className="v2-ts-precio-pill">${Number(p.price)}</div>
                  </div>
                  <button className="v2-ts-add" onClick={(e) => { e.stopPropagation(); mostrarToast(`${p.name} agregado al carrito`) }}>+</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'productos' && (
          <div className="v2-pantalla">
            <div className="v2-saludo">Catálogo completo</div>
            <div className="v2-saludo-sub">{productos.length} productos en {sucursalActiva.name}</div>
            <div className="v2-buscador">🔍 <input placeholder="Buscar producto..." /></div>

            <div className="v2-pills">
              <div className="v2-pill-fondo" style={{ transform: `translateX(${CATEGORIAS.findIndex(c => c.key === categoria) * 100}%)` }} />
              {CATEGORIAS.map(c => (
                <div key={c.key} className={`v2-pill${categoria === c.key ? ' on' : ''}`} onClick={() => abrirCategoria(c.key)}>
                  {c.label}
                </div>
              ))}
            </div>

            {productoFicha && (
              <div className={`v2-ficha${fichaAbierta ? ' abierta' : ''}`}>
                <div className="v2-ficha-top" onClick={() => setFichaAbierta(v => !v)}>
                  <img src={img(productoFicha)} alt={productoFicha.name} />
                  <div className="v2-ts-scrim" />
                  <div className="v2-ficha-chevron">▾</div>
                  <div className="v2-ficha-overlay">
                    <div className="v2-ficha-nombre">{productoFicha.name}</div>
                    <div className="v2-ficha-desc">{ficha.desc}</div>
                    <div className="v2-ts-precio-pill">${Number(productoFicha.price)}</div>
                  </div>
                </div>
                <div className="v2-ficha-detalle">
                  <div className="v2-ficha-detalle-inner">
                    <div className="v2-fd-label">{categoria === 'marinados' ? 'Cantidad' : 'Variante'}</div>
                    <div className="v2-fd-chips">
                      {ficha.variantes.map((v, i) => (
                        <div key={i} className={`v2-fd-chip${varianteSel === i ? ' on' : ''}`} onClick={() => setVarianteSel(i)}>{v}</div>
                      ))}
                    </div>
                    <div className="v2-fd-label">Guarnición sugerida</div>
                    <div className="v2-fd-chips">
                      {ficha.extras.map((e, i) => (
                        <div key={i} className={`v2-fd-chip extra${extrasSel.includes(i) ? ' on' : ''}`} onClick={() => toggleExtra(i)}>{e}</div>
                      ))}
                    </div>
                    <div className="v2-fd-cta">
                      <button className="v2-secundario" onClick={() => mostrarToast('Esto abriría el Asistente para personalizar más')}>Personalizar</button>
                      <button className="v2-primario" onClick={() => mostrarToast(`${productoFicha.name} agregado al carrito`)}>Agregar ${Number(productoFicha.price)}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="v2-grid-simple">
              {productosSimples.map(p => (
                <div key={p.id} className="v2-tarjeta-simple">
                  <img src={img(p)} alt={p.name} />
                  <div className="v2-ts-scrim" />
                  <div className="v2-ts-overlay">
                    <div className="v2-ts-nombre">{p.name}</div>
                    <div className="v2-ts-precio-pill">${Number(p.price)}</div>
                  </div>
                  <button className="v2-ts-add" onClick={() => mostrarToast(`${p.name} agregado al carrito`)}>+</button>
                </div>
              ))}
            </div>

            {categoria === 'fresco' && (
              <div className="v2-idea-card">
                <div className="v2-emoji">💡</div>
                <div className="v2-ic-txt"><b>Ideas para cocinarlo</b><span>Recetas y sugerencias de la semana</span></div>
                <div className="v2-badge-pronto">PRÓXIMAMENTE</div>
              </div>
            )}
          </div>
        )}

        {tab === 'sucursales' && (
          <div className="v2-pantalla">
            <div className="v2-saludo">Sucursales</div>
            <div className="v2-saludo-sub">Las {sucursales.length}, sin recortar</div>

            <a className="v2-ig-cta" href={links?.branches?.[0]?.instagram || 'https://www.instagram.com/casadelpollolm/'} target="_blank" rel="noopener noreferrer">
              <div className="v2-ig-icono">📷</div>
              <div>
                <div className="v2-sc-nombre" style={{ fontSize: 13 }}>Síguenos en Instagram</div>
                <div className="v2-so-detalle">@casadelpollolm · la misma cuenta en las 4 sucursales</div>
              </div>
              <div className="v2-ig-flecha">→</div>
            </a>

            {sucursales.map(s => {
              const l = linkDe(s.name)
              const telefono = digitosLocales(l?.telefonos?.[0] || s.phone)
              const whatsappHref = l?.whatsapp || (s.whatsapp ? `https://wa.me/52${s.whatsapp}` : null)
              const mapaHref = l?.googleMaps || l?.appleMaps
              return (
                <div key={s.id} className="v2-suc-full">
                  <div className="v2-sc-nombre">{s.name}</div>
                  <div className="v2-sc-dir">{s.address}</div>
                  <div className="v2-sc-btns3">
                    <button className="v2-sc-btn v2-sc-btn-pedido" onClick={() => s.id === sucursalActiva.id ? mostrarToast(`Ya estás pidiendo en ${s.name}`) : mostrarToast(`Esto llevaría al catálogo de ${s.name}`)}>
                      <span>🛒</span>Pedido
                    </button>
                    {mapaHref
                      ? <a className="v2-sc-btn v2-sc-btn-mapa" href={mapaHref} target="_blank" rel="noopener noreferrer"><span>📍</span>Cómo llegar</a>
                      : <button className="v2-sc-btn v2-sc-btn-mapa" disabled><span>📍</span>Cómo llegar</button>}
                    <button className="v2-sc-btn v2-sc-btn-wa" onClick={() => setWaPopover({ nombre: s.name, telefono, whatsappHref })}>
                      <span>💬</span>WhatsApp
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {toast && <div className="v2-toast on">{toast}</div>}

      {waPopover && (
        <div className="v2-sheet-overlay on" onClick={(e) => { if (e.target === e.currentTarget) setWaPopover(null) }}>
          <div className="v2-sheet">
            <div className="v2-sheet-handle" />
            <div className="v2-sheet-titulo">{waPopover.nombre}</div>
            <div className="v2-sheet-sub">¿Cómo prefieres comunicarte?</div>
            <a className="v2-sheet-opcion" href={waPopover.telefono ? `tel:+52${waPopover.telefono}` : undefined} onClick={e => !waPopover.telefono && e.preventDefault()}>
              <div className="v2-so-icono tel">📞</div>
              <div><div className="v2-so-nombre">Llamar</div><div className="v2-so-detalle">{waPopover.telefono ? formatearTelefono(waPopover.telefono) : 'No disponible'}</div></div>
            </a>
            <a className="v2-sheet-opcion" href={waPopover.whatsappHref || undefined} target="_blank" rel="noopener noreferrer" onClick={e => !waPopover.whatsappHref && e.preventDefault()}>
              <div className="v2-so-icono wa">💬</div>
              <div><div className="v2-so-nombre">Mensaje (WhatsApp)</div><div className="v2-so-detalle">Abre un chat prellenado</div></div>
            </a>
          </div>
        </div>
      )}

      <div className="v2-tabbar">
        <button className={`v2-tab${tab === 'home' ? ' on' : ''}`} onClick={() => setTab('home')}><span className="v2-ticono">🏠</span><span className="v2-tlabel">Home</span></button>
        <button className={`v2-tab${tab === 'productos' ? ' on' : ''}`} onClick={() => setTab('productos')}><span className="v2-ticono">📋</span><span className="v2-tlabel">Productos</span></button>
        <div className="v2-tab-central-wrap">
          <div className="v2-tab-central" onClick={() => mostrarToast('Esto abriría el Asistente de pedido paso a paso')}>🍗</div>
          <div className="v2-tab-central-label">Crear pedido</div>
        </div>
        <button className={`v2-tab${tab === 'sucursales' ? ' on' : ''}`} onClick={() => setTab('sucursales')}><span className="v2-ticono">📍</span><span className="v2-tlabel">Sucursales</span></button>
      </div>
    </div>
  )
}
