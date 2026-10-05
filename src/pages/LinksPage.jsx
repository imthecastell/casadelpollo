import { useState, useEffect } from 'react'
import Icono from '../Components/Icono.jsx'
import { estadoHorario } from '../data/horario.js'
import '../styles/homeV2.css'
import '../styles/links.css'

const API_URL = 'https://casadelpollo-backend.onrender.com'
const BASE = import.meta.env.BASE_URL

const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

/* Página de Links (la que va en la biografía de redes): logo, botón para pedir en línea y una
   tarjeta por sucursal con cómo llegar, llamar, WhatsApp y redes. El horario se toma del
   mismo horario de la tienda (se empata por nombre de sucursal). */
export default function LinksPage() {
  const [config, setConfig] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [horarios, setHorarios] = useState({}) // por nombre normalizado de sucursal

  useEffect(() => {
    let vigente = true
    fetch(`${API_URL}/api/links`)
      .then(r => r.json())
      .catch(() => ({}))
      .then(links => { if (vigente) setConfig(links) })
      .finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [])

  useEffect(() => {
    let vigente = true
    fetch(`${API_URL}/api/branches`)
      .then(r => r.json())
      .then(lista => Promise.all((Array.isArray(lista) ? lista : []).map(b =>
        fetch(`${API_URL}/api/schedule/${b.id}`).then(r => r.json())
          .then(d => [normalizar(b.name), d?.horarios]).catch(() => null))))
      .then(pares => { if (vigente) setHorarios(Object.fromEntries(pares.filter(p => p && p[1]))) })
      .catch(() => {})
    return () => { vigente = false }
  }, [])

  const { title = 'Casa del Pollo', subtitle = '', branches = [] } = config || {}
  const activas = branches.filter(b => b.active !== false)

  return (
    <div className="v2-shell-root lk-root">
      <header className="lk-cab">
        <div className="lk-logo"><img src={`${BASE}logo.png`} alt={title} /></div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        <a className="lk-pedir" href={BASE}>
          <Icono nombre="shopping-cart" tam="22px" />
          <span><b>Pedir en línea</b><small>Listo en minutos · pagas en la sucursal</small></span>
        </a>
      </header>

      <main className="lk-cuerpo">
        <h2 className="lk-titulo">Nuestras sucursales</h2>
        {cargando ? (
          <div className="lk-grid" aria-busy="true">
            {[0, 1, 2, 3].map(i => <div key={i} className="lk-tarjeta lk-esqueleto" />)}
          </div>
        ) : activas.length === 0 ? (
          <p className="lk-vacio">Pronto tendremos más información de nuestras sucursales.</p>
        ) : (
          <div className="lk-grid">
            {activas.map(s => <Sucursal key={s.id || s.name} suc={s} horario={horarios[normalizar(s.name)]} />)}
          </div>
        )}
      </main>

      <footer className="lk-pie">{title}</footer>
    </div>
  )
}

const TIPOS = { mayoreo: 'Mayoreo', menudeo: 'Menudeo', mayoreo_menudeo: 'Mayoreo y menudeo' }

function Sucursal({ suc, horario }) {
  const [aviso, setAviso] = useState(null) // 'tel:...' o 'whatsapp'
  const esVinedos = /vi[ñn]ed/i.test(suc.name || '')
  const tipo = TIPOS[suc.tipo] || suc.tipo || ''
  const telefonos = (Array.isArray(suc.telefonos) ? suc.telefonos : suc.telefonos ? [suc.telefonos] : []).filter(Boolean)
  const estado = estadoHorario(horario)
  const limpio = (t) => String(t).replace(/\s/g, '')

  return (
    <article className="lk-tarjeta">
      <div className="lk-tarjeta-cab">
        <h3>{suc.name}</h3>
        {tipo && <span className="lk-tipo">{tipo}</span>}
      </div>
      {estado && (
        <p className={'lk-estado ' + (estado.abierto ? 'abierto' : 'cerrado')}>
          <i aria-hidden="true" />{estado.texto}
        </p>
      )}
      {suc.direccion && (
        <p className="lk-direccion"><Icono nombre="map-pin" tam="18px" />{suc.direccion}</p>
      )}

      <div className="lk-acciones">
        {suc.googleMaps && (
          <a className="lk-btn principal" href={suc.googleMaps} target="_blank" rel="noopener noreferrer">
            <Icono nombre="navigation-arrow" tam="20px" />Cómo llegar
          </a>
        )}
        {suc.appleMaps && (
          <a className="lk-btn" href={suc.appleMaps} target="_blank" rel="noopener noreferrer">
            <Icono nombre="apple-logo" tam="20px" />Apple Maps
          </a>
        )}
        {telefonos.map((tel, i) => (esVinedos ? (
          <button key={tel + i} type="button" className="lk-btn" onClick={() => setAviso(limpio(tel))}>
            <TelefonoIcono />{tel}
          </button>
        ) : (
          <a key={tel + i} className="lk-btn" href={`tel:${limpio(tel)}`}><TelefonoIcono />{tel}</a>
        )))}
        {suc.whatsapp && (esVinedos ? (
          <button type="button" className="lk-btn wa" onClick={() => setAviso('whatsapp')}>
            <Icono nombre="whatsapp-logo" tam="20px" />WhatsApp
          </button>
        ) : (
          <a className="lk-btn wa" href={suc.whatsapp} target="_blank" rel="noopener noreferrer">
            <Icono nombre="whatsapp-logo" tam="20px" />WhatsApp
          </a>
        ))}
        {suc.instagram && (
          <a className="lk-btn" href={suc.instagram} target="_blank" rel="noopener noreferrer">
            <Icono nombre="instagram-logo" tam="20px" />Instagram
          </a>
        )}
        {suc.googleBusiness && (
          <a className="lk-btn" href={suc.googleBusiness} target="_blank" rel="noopener noreferrer">
            <Icono nombre="google-logo" tam="20px" />Reseñas
          </a>
        )}
      </div>

      {aviso && <AvisoIA esWhatsapp={aviso === 'whatsapp'} tel={aviso} href={suc.whatsapp} onCerrar={() => setAviso(null)} />}
    </article>
  )
}

/* Viñedos atiende por teléfono y WhatsApp con asistencia de IA: antes de salir se avisa que no
   sustituye al pedido en la app. */
function AvisoIA({ esWhatsapp, tel, href, onCerrar }) {
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [onCerrar])
  return (
    <div className="lk-fondo" onClick={onCerrar}>
      <div className="lk-hoja" role="dialog" aria-modal="true" aria-labelledby="lk-aviso-t" onClick={e => e.stopPropagation()}>
        <h2 id="lk-aviso-t">Aviso importante</h2>
        <p>Este medio de contacto es <b>meramente informativo</b> y está asistido por inteligencia artificial.</p>
        <p>Realizar un pedido por este canal <b>no garantiza que sea notificado en la tienda.</b> Para pedidos confirmados, usa la app.</p>
        <a className="lk-btn principal" href={esWhatsapp ? href : `tel:${tel}`} target={esWhatsapp ? '_blank' : undefined}
          rel={esWhatsapp ? 'noopener noreferrer' : undefined} onClick={onCerrar}>
          {esWhatsapp ? 'Entendido · Abrir WhatsApp' : 'Entendido · Llamar'}
        </a>
        <a className="lk-btn" href={BASE} onClick={onCerrar}>Continuar a la app</a>
        <button type="button" className="lk-btn texto" onClick={onCerrar}>Cancelar</button>
      </div>
    </div>
  )
}

// Teléfono (el set de iconos de la tienda no lo trae).
function TelefonoIcono() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
