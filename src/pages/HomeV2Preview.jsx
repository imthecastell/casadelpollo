import { useState, useEffect, useRef } from 'react'
import { useApp } from '../data/AppContext.jsx'
import LogoSlot from '../Components/LogoSlot.jsx'
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

// image_cooked_url solo es una foto real cuando el producto se puede cocinar
// (se_puede_cocinar) — en productos que no, el campo trae un recorte basura
// (ej. Ensalada/Arroz: un 10% sobrante de la imagen) que no debe usarse.
const img = (p) => (p?.se_puede_cocinar && p?.image_cooked_url) || p?.image_url || ''

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
  const { sucursales, sucursalActiva, setSucursalActiva, productos, carrito, cargando, diseno } = useApp()
  const [tab, setTab] = useState('home')
  const [categoria, setCategoria] = useState('marinados')
  const [toast, setToast] = useState('')
  const [waPopover, setWaPopover] = useState(null) // { branchName, telefono, whatsappHref }
  const [selectorSucursalAbierto, setSelectorSucursalAbierto] = useState(false)
  const [links, setLinks] = useState(null)
  const [heroIdx, setHeroIdx] = useState(0)
  const [colorTopbar, setColorTopbar] = useState(null)
  const timerRef = useRef(null)
  const topbarRef = useRef(null)
  const contenidoRef = useRef(null)

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

  // La barra superior "absorbe" el color de la banda que queda justo
  // detrás de ella al hacer scroll, como si fuera transparente sobre
  // el contenido — solo aplica en Home, que es lo único con bandas.
  const actualizarColorTopbar = () => {
    if (tab !== 'home' || !contenidoRef.current || !topbarRef.current) {
      setColorTopbar(null)
      return
    }
    const limite = topbarRef.current.getBoundingClientRect().bottom
    const bandas = contenidoRef.current.querySelectorAll('.v2-banda')
    let color = null
    bandas.forEach(b => {
      const r = b.getBoundingClientRect()
      if (r.top <= limite && r.bottom > limite) color = b.dataset.color
    })
    setColorTopbar(color)
  }

  useEffect(() => {
    actualizarColorTopbar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const linkDe = (nombre) => links?.branches?.find(b => b.name === nombre)

  const marinadosImg = productos.filter(p => p.category_name === 'Marinados' && img(p))
  const preparadosImg = productos.filter(p => p.category_name === 'Preparados' && img(p))
  const nuevoProducto = productos.find(p => p.is_nuevo && img(p))
  const ensalada = productos.find(p => p.name === 'Ensalada')
  const bowlImg = img(ensalada) || img(marinadosImg[0])
  const bowlGrande = marinadosImg[1] || marinadosImg[0]

  const promos = [
    nuevoProducto && {
      badge: 'NUEVO', titulo: nuevoProducto.name, desc: 'Recién agregado al menú — pruébalo hoy.',
      cta: 'Ver marinados', imagen: img(nuevoProducto),
      accion: () => { setTab('productos'); setCategoria('marinados') },
    },
    {
      badge: 'BOWLS', titulo: 'Arma tu Bowl', desc: 'Base + marinado + tu toque, listo en minutos.',
      cta: 'Empezar', imagen: bowlImg,
      accion: () => mostrarToast('Esto abriría el flujo de Bowls: base → marinado → carrito'),
    },
    marinadosImg[2] && {
      badge: 'TEMPORADA', titulo: 'Marinados listos para la sartén', desc: 'Sazonados en casa, cocina en minutos.',
      cta: 'Ver todos', imagen: img(marinadosImg[2]),
      accion: () => { setTab('productos'); setCategoria('marinados') },
    },
  ].filter(Boolean)

  useEffect(() => {
    clearInterval(timerRef.current)
    if (promos.length < 2) return
    timerRef.current = setInterval(() => setHeroIdx(i => (i + 1) % promos.length), 4500)
    return () => clearInterval(timerRef.current)
  }, [promos.length])

  if (cargando || !sucursalActiva) {
    return <div className="v2-cargando">Cargando catálogo real de Viñedos…</div>
  }

  const catDef = CATEGORIAS.find(c => c.key === categoria)
  const productosCategoria = productos.filter(p => p.category_name === catDef.match && p.active !== false)

  return (
    <div className="v2-shell">

      <div className="v2-topbar" ref={topbarRef} style={colorTopbar ? { background: colorTopbar } : undefined}>
        <div className="v2-tb-pill">
          <button className="v2-tb-pill-icono" onClick={() => mostrarToast('Menú con Ayuda, Recetas (próximamente) y Ajustes')}>☰</button>
          <button className="v2-tb-pill-nombre" onClick={() => setSelectorSucursalAbierto(true)}>{sucursalActiva.name}</button>
        </div>
        <div className="v2-tb-logo-wrap">
          <div className="v2-tb-logo-crop">
            <LogoSlot
              type="logotipo"
              src={diseno?.logo_original_url || diseno?.logo_url}
              mode="original"
              alt="Casa del Pollo"
              imgStyle={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        </div>
        <div className="v2-tb-derecha">
          <button className="v2-tb-btn" onClick={() => { setTab('productos'); mostrarToast('Buscador enfocado') }}>🔍</button>
          <button className="v2-tb-btn" onClick={() => mostrarToast(`${carrito.length} producto${carrito.length === 1 ? '' : 's'} en tu carrito`)}>
            🛒{carrito.length > 0 && <span className="v2-tb-badge">{carrito.length}</span>}
          </button>
        </div>
      </div>

      <div className="v2-contenido" ref={contenidoRef} onScroll={tab === 'home' ? actualizarColorTopbar : undefined}>

        {tab === 'home' && (
          <div className="v2-pantalla v2-pantalla-home">
            {promos.length > 0 && (
              <div className="v2-carrusel v2-carrusel-promo">
                {promos.map((p, i) => (
                  <div key={p.titulo} className={`v2-promo-slide${i === heroIdx ? ' on' : ''}`} onClick={p.accion}>
                    <img className="v2-promo-foto-completa" src={p.imagen} alt={p.titulo} />
                    <div className="v2-promo-tarjeta">
                      <div className="v2-promo-texto">
                        <div className="v2-promo-badge">{p.badge}</div>
                        <h3>{p.titulo}</h3>
                        <p>{p.desc}</p>
                      </div>
                      <button className="v2-promo-cta" onClick={(e) => { e.stopPropagation(); p.accion() }}>{p.cta}</button>
                    </div>
                  </div>
                ))}
                <div className="v2-carrusel-dots">
                  {promos.map((_, i) => <div key={i} className={`v2-cdot${i === heroIdx ? ' on' : ''}`} />)}
                </div>
              </div>
            )}

            {marinadosImg.length > 0 && (
              <div className="v2-banda v2-banda-dorado" data-color="#C8841A">
                <div className="v2-seccion-titulo">Marinados más pedidos</div>
                <div className="v2-grid-2filas">
                  {marinadosImg.slice(0, 6).map(p => (
                    <div key={p.id} className="v2-tile-mini2" onClick={() => mostrarToast(`${p.name} agregado al carrito`)}>
                      <div className="v2-card-foto">
                        <img src={img(p)} alt={p.name} />
                        <div className="v2-card-badge-precio">Desde $230/kg</div>
                      </div>
                      <div className="v2-card-barra">
                        <div className="v2-card-barra-nombre">{p.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bowlGrande && (
              <div className="v2-banda v2-banda-verde" data-color="#2a7a4b">
                <div className="v2-seccion-titulo">Arma tu Bowl</div>
                <div className="v2-bowl-hibrido" onClick={() => mostrarToast('Esto abriría el flujo de Bowls: base → marinado → carrito')}>
                  <div className="v2-bowl-hibrido-foto"><img src={img(bowlGrande)} alt={bowlGrande.name} /></div>
                  <div className="v2-bowl-hibrido-panel">
                    <div className="v2-promo-badge">BOWLS</div>
                    <h3>Arma tu Bowl</h3>
                    <div className="v2-promo-fila">
                      <button className="v2-promo-cta" onClick={(e) => { e.stopPropagation(); mostrarToast('Esto abriría el flujo de Bowls: base → marinado → carrito') }}>Empezar</button>
                      <span className="v2-ts-precio-pill">Desde ${Number(sucursalActiva.bowl_price || 120)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {preparadosImg.length > 0 && (
              <div className="v2-banda v2-banda-rojo" data-color="#922B21">
                <div className="v2-seccion-titulo">Preparados para lucirte</div>
                <div className="v2-strip-grandes">
                  {preparadosImg.slice(0, 6).map(p => (
                    <div key={p.id} className="v2-tarjeta-grande-strip">
                      <div className="v2-card-foto"><img src={img(p)} alt={p.name} /></div>
                      <div className="v2-card-barra">
                        <div className="v2-card-barra-nombre">{p.name}</div>
                        <div className="v2-ts-precio-pill">${Number(p.price)}</div>
                      </div>
                      <button className="v2-ts-add" onClick={(e) => { e.stopPropagation(); mostrarToast(`${p.name} agregado al carrito`) }}>+</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'productos' && (
          <div className="v2-pantalla">
            <div className="v2-pills">
              <div className="v2-pill-fondo" style={{ transform: `translateX(${CATEGORIAS.findIndex(c => c.key === categoria) * 100}%)` }} />
              {CATEGORIAS.map(c => (
                <div key={c.key} className={`v2-pill${categoria === c.key ? ' on' : ''}`} onClick={() => setCategoria(c.key)}>
                  {c.label}
                </div>
              ))}
            </div>

            <div className="v2-bowls-cta" onClick={() => mostrarToast('Esto abriría el flujo de Bowls: base → marinado → carrito')}>
              <div className="v2-bowls-emoji">🥗</div>
              <div className="v2-bowls-txt">
                <strong>¿Poco tiempo? Pide un Bowl</strong>
                <span>Base + marinado + tu toque, listo en minutos</span>
              </div>
              <div className="v2-bowls-precio">Desde ${Number(sucursalActiva.bowl_price || 120)}</div>
            </div>

            <div className="v2-grid-simple">
              {productosCategoria.map(p => (
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
              <div className="v2-sc-nombre" style={{ fontSize: 13 }}>Síguenos en Instagram</div>
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

      {selectorSucursalAbierto && (
        <div className="v2-sheet-overlay on" onClick={(e) => { if (e.target === e.currentTarget) setSelectorSucursalAbierto(false) }}>
          <div className="v2-sheet">
            <div className="v2-sheet-handle" />
            <div className="v2-sheet-titulo">Cambiar de sucursal</div>
            <div className="v2-sheet-sub">Vas a ver el catálogo y precios de la sucursal que elijas</div>
            {sucursales.map(s => (
              <button key={s.id} className="v2-sheet-opcion v2-sheet-opcion-btn" onClick={() => { setSucursalActiva(s); setSelectorSucursalAbierto(false); mostrarToast(`Ahora pidiendo en ${s.name}`) }}>
                <div className="v2-so-icono tel">📍</div>
                <div><div className="v2-so-nombre">{s.name}</div><div className="v2-so-detalle">{s.address}</div></div>
                {s.id === sucursalActiva.id && <span className="v2-sheet-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

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
