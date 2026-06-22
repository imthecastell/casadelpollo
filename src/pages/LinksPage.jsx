import { useState, useEffect } from 'react'

const API_URL = 'https://casadelpollo-backend.onrender.com'

export default function LinksPage() {
  const [config,  setConfig]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/links`)
      .then(r => r.json())
      .catch(() => ({}))
      .then(links => setConfig(links))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={s.root}>
        <div style={s.loaderWrap}><div style={s.loaderChicken}>🐔</div></div>
      </div>
    )
  }

  const { title = 'Casa del Pollo', subtitle = '', branches = [] } = config || {}
  const activas  = branches.filter(b => b.active !== false)
  const primary  = '#c1121f'
  const bg1      = primary + '18'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#f2ede8}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .lp-action:hover{opacity:.75}
        .lp-action:active{opacity:.55}
      `}</style>

      <div style={{ ...s.root, background: `linear-gradient(160deg, ${bg1} 0%, #f2ede8 55%)` }}>
        <div style={s.blob(primary)} />

        <div style={s.wrap}>

          {/* Cabecera */}
          <div style={s.header}>
            <div style={s.avatarBox}>
              <img src="/logo.png" alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 style={{ ...s.h1, color: '#1a1a1a' }}>{title}</h1>
            {subtitle && <p style={s.subtitle}>{subtitle}</p>}
          </div>

          {/* Tarjetas de sucursales */}
          {activas.length === 0 ? (
            <div style={s.empty}>Sin sucursales configuradas</div>
          ) : (
            activas.map((suc, idx) => (
              <SucursalCard key={suc.id || idx} suc={suc} primary={primary} idx={idx} />
            ))
          )}

          <div style={s.footer}>
            <span style={{ color: primary, fontWeight: 700 }}>{title}</span>
          </div>

        </div>
      </div>
    </>
  )
}

function SucursalCard({ suc, primary, idx }) {
  const tipo = {
    mayoreo:          'Mayoreo',
    menudeo:          'Menudeo',
    mayoreo_menudeo:  'Mayoreo y Menudeo',
  }[suc.tipo] || suc.tipo || ''

  const telefonos = Array.isArray(suc.telefonos)
    ? suc.telefonos.filter(Boolean)
    : suc.telefonos ? [suc.telefonos] : []

  return (
    <div style={{ ...s.card, animationDelay: `${idx * 0.08}s` }}>

      {/* Header de la tarjeta */}
      <div style={s.cardHead}>
        <div>
          <div style={s.cardName}>{suc.name}</div>
          {tipo && (
            <div style={{ ...s.tipoBadge, background: primary + '18', color: primary }}>
              {tipo}
            </div>
          )}
        </div>
        {/* Redes sociales en el header */}
        <div style={{ display: 'flex', gap: 8 }}>
          {suc.instagram && (
            <a href={suc.instagram} target="_blank" rel="noopener noreferrer"
              className="lp-action"
              style={{ ...s.socialIcon, background: '#E1306C' }}>
              <InstagramIcon />
            </a>
          )}
        </div>
      </div>

      <div style={s.divider} />

      {/* Dirección */}
      {suc.direccion && (
        <div style={s.row}>
          <div style={s.rowIcon}><PinIcon color={primary} /></div>
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Dirección</div>
            <div style={s.rowVal}>{suc.direccion}</div>
          </div>
        </div>
      )}

      {/* Cómo llegar */}
      {(suc.googleMaps || suc.appleMaps) && (
        <div style={s.row}>
          <div style={s.rowIcon}><MapIcon color={primary} /></div>
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Cómo llegar</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
              {suc.googleMaps && (
                <a href={suc.googleMaps} target="_blank" rel="noopener noreferrer"
                  className="lp-action"
                  style={{ ...s.mapBtn, borderColor: '#4285F4', color: '#4285F4' }}>
                  <GoogleMapsIcon size={14} /> Google Maps
                </a>
              )}
              {suc.appleMaps && (
                <a href={suc.appleMaps} target="_blank" rel="noopener noreferrer"
                  className="lp-action"
                  style={{ ...s.mapBtn, borderColor: '#555', color: '#555' }}>
                  <AppleMapsIcon size={14} /> Apple Maps
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Business */}
      {suc.googleBusiness && (
        <div style={s.row}>
          <div style={s.rowIcon}><GoogleIcon color="#4285F4" /></div>
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Google Business</div>
            <a href={suc.googleBusiness} target="_blank" rel="noopener noreferrer"
              className="lp-action"
              style={{ fontSize: 13, color: '#4285F4', textDecoration: 'none', fontWeight: 600 }}>
              Ver en Google →
            </a>
          </div>
        </div>
      )}

      {/* Teléfonos + WhatsApp */}
      {telefonos.length > 0 && (
        <div style={s.row}>
          <div style={s.rowIcon}><PhoneIcon color={primary} /></div>
          <div style={{ flex: 1 }}>
            <div style={s.rowLabel}>Contacto</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {telefonos.map((tel, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a href={`tel:${tel.replace(/\s/g,'')}`}
                    className="lp-action"
                    style={{ fontSize: 14, color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>
                    {tel}
                  </a>
                  {suc.whatsapp && i === 0 && (
                    <a href={suc.whatsapp} target="_blank" rel="noopener noreferrer"
                      className="lp-action"
                      style={{ ...s.waBtn }}>
                      <WhatsAppIcon size={13} />
                      WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

/* ─── Estilos ─── */
const s = {
  root: {
    minHeight: '100dvh',
    padding: '44px 16px 64px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob: (c) => ({
    position: 'fixed', top: -140, right: -140,
    width: 360, height: 360, borderRadius: '50%',
    background: c + '20', filter: 'blur(72px)',
    pointerEvents: 'none', zIndex: 0,
  }),
  loaderWrap: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '100dvh',
  },
  loaderChicken: { fontSize: 52, animation: 'spin 1s linear infinite' },
  wrap: {
    position: 'relative', zIndex: 1,
    maxWidth: 480, margin: '0 auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
  },
  header: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 8, marginBottom: 8, animation: 'fadeUp .4s ease both',
  },
  avatarBox: {
    width: 80, height: 80, borderRadius: 22,
    background: 'white', boxShadow: '0 4px 18px rgba(0,0,0,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  h1: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 1.5 },
  empty: { color: '#bbb', fontSize: 14, textAlign: 'center', padding: '32px 0' },
  card: {
    width: '100%',
    background: 'white',
    borderRadius: 20,
    padding: '18px 20px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    animation: 'fadeUp .4s ease both',
  },
  cardHead: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 8, marginBottom: 12,
  },
  cardName: { fontSize: 18, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 },
  tipoBadge: {
    display: 'inline-block', marginTop: 4,
    fontSize: 11, fontWeight: 700,
    padding: '3px 9px', borderRadius: 99,
  },
  socialIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', textDecoration: 'none',
    transition: 'opacity .15s',
  },
  divider: { height: 1, background: '#f0ebe5', margin: '0 0 12px' },
  row: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    padding: '9px 0', borderBottom: '1px solid #f5f0ea',
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 9,
    background: '#f5f0ea',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  rowLabel: { fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 2 },
  rowVal: { fontSize: 14, color: '#333', lineHeight: 1.4 },
  mapBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 12, fontWeight: 700,
    padding: '5px 11px', borderRadius: 99,
    border: '1.5px solid', textDecoration: 'none',
    transition: 'opacity .15s',
  },
  waBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 700, color: 'white',
    background: '#25D366', padding: '4px 10px',
    borderRadius: 99, textDecoration: 'none',
    transition: 'opacity .15s',
  },
  footer: { fontSize: 12, color: '#ccc', marginTop: 8 },
}

/* ─── Íconos ─── */
function PinIcon({ color }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function MapIcon({ color }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
}
function PhoneIcon({ color }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
}
function GoogleIcon({ color }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill={color}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
}
function GoogleMapsIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#4285F4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
}
function AppleMapsIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#555"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
}
function InstagramIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
}
function WhatsAppIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
}
