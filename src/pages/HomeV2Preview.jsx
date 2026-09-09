import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'
import '../styles/homeV2.css'

/* Preview oculto de la navegación V2 (Home + tab bar). Ruta secreta
   /preview-v2, fuera del flujo de `vista` normal — no afecta nada de
   producción. Usa datos reales (sucursales, catálogo, WhatsApp) para que
   el comportamiento en el celular real sea representativo; los botones de
   agregar/contacto son decorativos (toast) para no tocar el carrito real
   ni mandar mensajes de WhatsApp reales por accidente durante la revisión. */

const CATEGORIAS = [
  { key: 'preparados', label: 'Preparados', match: 'Preparados' },
  { key: 'marinados', label: 'Marinados', match: 'Marinados' },
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

function cropUrl(url) {
  return url || ''
}

export default function HomeV2Preview() {
  const { sucursales, sucursalActiva, setSucursalActiva, productos, carrito, cargando } = useApp()
  const [tab, setTab] = useState('home')
  const [categoria, setCategoria] = useState('preparados')
  const [fichaAbierta, setFichaAbierta] = useState(false)
  const [varianteSel, setVarianteSel] = useState(0)
  const [extrasSel, setExtrasSel] = useState([])
  const [toast, setToast] = useState('')
  const [sheet, setSheet] = useState(null) // { nombre, whatsapp }

  useEffect(() => {
    if (!sucursalActiva && sucursales.length) {
      const vinedos = sucursales.find(s => s.name === 'Viñedos' && s.active) || sucursales.find(s => s.active)
      if (vinedos) setSucursalActiva(vinedos)
    }
  }, [sucursales, sucursalActiva, setSucursalActiva])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const mostrarToast = (msg) => setToast(msg)

  const abrirCategoria = (key) => {
    setCategoria(key)
    setFichaAbierta(false)
    setVarianteSel(0)
    setExtrasSel([])
  }

  const toggleExtra = (i) => {
    setExtrasSel(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

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
                  <img src={cropUrl(productoFicha.image_url)} alt={productoFicha.name} />
                  <div className="v2-ficha-info">
                    <div className="v2-ficha-nombre">{productoFicha.name}</div>
                    <div className="v2-ficha-desc">{ficha.desc}</div>
                    <div className="v2-ficha-precio">${Number(productoFicha.price)}</div>
                  </div>
                  <div className="v2-ficha-chevron">▾</div>
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
                  <img src={cropUrl(p.image_url)} alt={p.name} />
                  <div className="v2-ts-body">
                    <div className="v2-ts-nombre">{p.name}</div>
                    <div className="v2-ts-fila">
                      <div className="v2-ts-precio">${Number(p.price)}</div>
                      <button className="v2-ts-add" onClick={() => mostrarToast(`${p.name} agregado al carrito`)}>+</button>
                    </div>
                  </div>
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

            <div className="v2-seccion-titulo">Nuestras sucursales</div>
            <div className="v2-suc-strip">
              {sucursales.map(s => (
                <div key={s.id} className="v2-suc-card">
                  <div className="v2-sc-nombre">{s.name}</div>
                  <div className="v2-sc-dir">{s.address}</div>
                  <div className="v2-sc-btns">
                    <button className="v2-sc-pedido" onClick={() => s.id === sucursalActiva.id ? mostrarToast(`Ya estás pidiendo en ${s.name}`) : mostrarToast(`Esto llevaría al catálogo de ${s.name}`)}>🛒 Pedido</button>
                    <button className="v2-sc-wa" onClick={() => setSheet({ nombre: s.name, whatsapp: s.whatsapp || s.phone })}>💬</button>
                  </div>
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
            {productos.map(p => (
              <div key={p.id} className="v2-lista-producto">
                <img src={cropUrl(p.image_url)} alt={p.name} />
                <div><div className="v2-lp-nombre">{p.name}</div><div className="v2-lp-cat">{p.category_name}</div></div>
                <div className="v2-lp-precio">${Number(p.price)}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'sucursales' && (
          <div className="v2-pantalla">
            <div className="v2-saludo">Sucursales</div>
            <div className="v2-saludo-sub">Las {sucursales.length}, sin recortar</div>
            {sucursales.map(s => (
              <div key={s.id} className="v2-suc-full">
                <div className="v2-sc-nombre">{s.name}</div>
                <div className="v2-sc-dir">{s.address}</div>
                <div className="v2-sc-btns">
                  <button className="v2-sc-pedido" onClick={() => s.id === sucursalActiva.id ? mostrarToast(`Ya estás pidiendo en ${s.name}`) : mostrarToast(`Esto llevaría al catálogo de ${s.name}`)}>🛒 Pedido</button>
                  <button className="v2-sc-wa" onClick={() => setSheet({ nombre: s.name, whatsapp: s.whatsapp || s.phone })}>💬</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {toast && <div className="v2-toast on">{toast}</div>}

      {sheet && (
        <div className="v2-sheet-overlay on" onClick={(e) => { if (e.target === e.currentTarget) setSheet(null) }}>
          <div className="v2-sheet">
            <div className="v2-sheet-handle" />
            <div className="v2-sheet-titulo">{sheet.nombre}</div>
            <div className="v2-sheet-sub">Elige cómo comunicarte con esta sucursal</div>
            <div className="v2-sheet-opcion">
              <div className="v2-so-icono wa">💬</div>
              <div><div className="v2-so-nombre">WhatsApp</div><div className="v2-so-detalle">{sheet.whatsapp || 'No disponible'}</div></div>
            </div>
            <div className="v2-sheet-opcion">
              <div className="v2-so-icono tel">📞</div>
              <div><div className="v2-so-nombre">Llamar</div><div className="v2-so-detalle">Línea directa a la sucursal</div></div>
            </div>
            <div className="v2-sheet-opcion">
              <div className="v2-so-icono ig">📷</div>
              <div><div className="v2-so-nombre">Instagram</div><div className="v2-so-detalle">@casadelpollolm</div></div>
            </div>
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
        <button className="v2-tab" onClick={() => setSheet({ nombre: sucursalActiva.name, whatsapp: sucursalActiva.whatsapp || sucursalActiva.phone })}><span className="v2-ticono">☎️</span><span className="v2-tlabel">Contacto</span></button>
      </div>
    </div>
  )
}
