import { useState, useEffect } from 'react'

const API_URL = 'https://casadelpollo-backend.onrender.com'

const TIPOS = {
  sucursal:  { label: 'Sucursal',    color: '#c1121f', icon: MapPinIcon   },
  telefono:  { label: 'Teléfono',    color: '#2DC653', icon: PhoneIcon    },
  whatsapp:  { label: 'WhatsApp',    color: '#25D366', icon: WhatsAppIcon },
  instagram: { label: 'Instagram',   color: '#E1306C', icon: InstagramIcon},
  facebook:  { label: 'Facebook',    color: '#1877F2', icon: FacebookIcon },
  tiktok:    { label: 'TikTok',      color: '#010101', icon: TikTokIcon   },
  youtube:   { label: 'YouTube',     color: '#FF0000', icon: YoutubeIcon  },
  maps:      { label: 'Maps',        color: '#4285F4', icon: MapIcon      },
  web:       { label: 'Sitio Web',   color: '#457B9D', icon: GlobeIcon    },
  custom:    { label: 'Enlace',      color: '#555555', icon: LinkIcon     },
}

function buildHref(item) {
  if (!item.url) return null
  if (item.type === 'telefono' && !item.url.startsWith('tel:'))
    return `tel:${item.url.replace(/\s/g, '')}`
  return item.url
}

// Separa redes sociales de links principales
const SOCIALES = new Set(['instagram', 'facebook', 'tiktok', 'youtube'])

export default function LinksPage() {
  const [config,  setConfig]  = useState(null)
  const [diseno,  setDiseno]  = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/links`).then(r => r.json()).catch(() => ({})),
      fetch(`${API_URL}/api/branches`).then(r => r.json())
        .then(branches => {
          const first = Array.isArray(branches) ? branches.find(b => b.active) : null
          return first
            ? fetch(`${API_URL}/api/design/${first.id}`).then(r => r.json()).catch(() => ({}))
            : {}
        })
        .catch(() => ({})),
    ]).then(([links, design]) => {
      setConfig(links)
      setDiseno(design || {})
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.loaderWrap}>
          <div style={s.loaderChicken}>🐔</div>
        </div>
      </div>
    )
  }

  const { title = 'Casa del Pollo', subtitle = '', items = [] } = config || {}
  const visibles  = items.filter(it => it.active !== false)
  const primarios = visibles.filter(it => !SOCIALES.has(it.type))
  const sociales  = visibles.filter(it => SOCIALES.has(it.type))
  const primary   = diseno.primary_color || diseno.navbar_color || '#c1121f'
  const logo      = diseno.logo_original_url || diseno.logo_url

  // Colores del gradiente de fondo
  const bg1 = primary + '22'
  const bg2 = primary + '08'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#f7f4f0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .lp-btn:hover{transform:translateY(-3px)!important;box-shadow:0 8px 24px rgba(0,0,0,0.13)!important}
        .lp-btn:active{transform:translateY(-1px)!important}
        .lp-social:hover{transform:scale(1.12)!important}
      `}</style>

      <div style={{ ...s.root, background: `linear-gradient(160deg, ${bg1} 0%, #f7f4f0 50%)` }}>

        {/* Blob decorativo */}
        <div style={{ ...s.blob, background: primary + '18' }} />

        <div style={s.card}>

          {/* Avatar / Logo */}
          <div style={s.avatarWrap}>
            {logo ? (
              <img src={logo} alt={title}
                style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 20 }} />
            ) : (
              <div style={{ ...s.avatarFallback, background: primary }}>
                🐔
              </div>
            )}
          </div>

          {/* Título */}
          <h1 style={{ ...s.title, color: '#1a1a1a' }}>{title}</h1>
          {subtitle && <p style={s.subtitle}>{subtitle}</p>}

          {/* Links principales */}
          <div style={s.linksWrap}>
            {primarios.length === 0 && (
              <p style={{ color: '#bbb', textAlign: 'center', fontSize: 14, padding: '24px 0' }}>
                Sin enlaces configurados
              </p>
            )}
            {primarios.map((item, idx) => {
              const meta = TIPOS[item.type] || TIPOS.custom
              const href = buildHref(item)
              const Icon = meta.icon
              const El   = href ? 'a' : 'div'
              return (
                <El
                  key={item.id || idx}
                  href={href || undefined}
                  target={href && !href.startsWith('tel:') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="lp-btn"
                  style={{
                    ...s.btn,
                    animationDelay: `${idx * 0.06}s`,
                    textDecoration: 'none',
                    cursor: href ? 'pointer' : 'default',
                  }}
                >
                  {/* Ícono izquierdo */}
                  <div style={{ ...s.btnIcon, background: meta.color }}>
                    <Icon size={18} color="white" />
                  </div>

                  {/* Texto central */}
                  <div style={s.btnText}>
                    <span style={s.btnLabel}>{item.label}</span>
                    {item.value && <span style={s.btnValue}>{item.value}</span>}
                  </div>

                  {/* Flecha derecha */}
                  {href && (
                    <div style={{ ...s.btnArrow, color: meta.color }}>›</div>
                  )}
                </El>
              )
            })}
          </div>

          {/* Redes sociales (iconos pequeños) */}
          {sociales.length > 0 && (
            <div style={s.socialesWrap}>
              {sociales.map((item, idx) => {
                const meta = TIPOS[item.type] || TIPOS.custom
                const href = buildHref(item)
                const Icon = meta.icon
                return (
                  <a
                    key={item.id || idx}
                    href={href || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-social"
                    title={item.label}
                    style={{ ...s.socialBtn, background: meta.color }}
                  >
                    <Icon size={20} color="white" />
                  </a>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div style={s.footer}>
            <span style={{ color: primary, fontWeight: 700 }}>{title}</span>
          </div>

        </div>
      </div>
    </>
  )
}

/* ─── Estilos ─── */
const s = {
  root: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '48px 16px 64px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'fixed',
    top: -160,
    right: -160,
    width: 400,
    height: 400,
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  loaderWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
  },
  loaderChicken: {
    fontSize: 52,
    animation: 'spin 1s linear infinite',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 440,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 24,
    background: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    animation: 'fadeUp 0.4s ease both',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: '-0.5px',
    textAlign: 'center',
    lineHeight: 1.2,
    marginBottom: 6,
    animation: 'fadeUp 0.4s ease 0.05s both',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 28,
    maxWidth: 300,
    animation: 'fadeUp 0.4s ease 0.1s both',
  },
  linksWrap: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 24,
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'white',
    borderRadius: 16,
    padding: '13px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    animation: 'fadeUp 0.4s ease both',
    color: 'inherit',
  },
  btnIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  btnText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  btnLabel: {
    fontWeight: 700,
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 1.3,
  },
  btnValue: {
    fontSize: 12,
    color: '#999',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  btnArrow: {
    fontSize: 22,
    fontWeight: 300,
    flexShrink: 0,
    lineHeight: 1,
  },
  socialesWrap: {
    display: 'flex',
    gap: 12,
    marginBottom: 28,
    animation: 'fadeUp 0.4s ease 0.3s both',
  },
  socialBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.18s ease',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  footer: {
    fontSize: 13,
    color: '#ccc',
    animation: 'fadeUp 0.4s ease 0.35s both',
  },
}

/* ─── Íconos SVG inline ─── */
function MapPinIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function PhoneIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}
function WhatsAppIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
}
function InstagramIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
}
function FacebookIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
}
function TikTokIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
}
function YoutubeIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
}
function MapIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
}
function GlobeIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
}
function LinkIcon({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
}
