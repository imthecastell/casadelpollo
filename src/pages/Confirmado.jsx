import { useApp } from '../data/AppContext.jsx'
import { useRef, useEffect, useState } from 'react'
import BannerPopup from '../Components/BannerPopup.jsx'

function getLogoFilter(mode, custom) {
  if (mode === 'blanco') return 'brightness(0) invert(1)'
  if (mode === 'negro')  return 'brightness(0)'
  if (mode === 'personalizado') return custom || 'none'
  return 'none'
}

export default function Confirmado() {
  const { setVista, sucursalActiva, ultimoNumeroOrden, ultimaHora, diseno } = useApp()
  const reciboRef = useRef(null)
  const [cuenta, setCuenta] = useState(12)

  /* Cuenta regresiva de 12 s → redirige a la encuesta */
  useEffect(() => {
    const t = setInterval(() => setCuenta(c => {
      if (c <= 1) { clearInterval(t); setVista('feedback'); return 0 }
      return c - 1
    }), 1000)
    return () => clearInterval(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const descargarRecibo = async () => {
    const elemento = reciboRef.current
    if (!elemento) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    script.onload = async () => {
      const canvas = await window.html2canvas(elemento, { backgroundColor: '#FFF8F0' })
      const link = document.createElement('a')
      link.download = `pedido-${ultimoNumeroOrden || 'recibo'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    document.head.appendChild(script)
  }

  /* Confirmado: fondo blanco/claro → usar logo horizontal completo sin filtro.
     Prioridad: logo_original_url (color) → logo_url → /logo.svg */
  const logoSrc    = diseno?.logo_original_url || diseno?.logo_url || '/logo.svg'
  /* Sin filtro si usamos logo_original_url o el SVG local (ya tienen color).
     Aplicar filtro solo si viene de logo_url con modo configurado. */
  const logoFilter = (diseno?.logo_original_url || !diseno?.logo_url)
    ? 'none'
    : getLogoFilter(diseno?.logo_color_mode, diseno?.logo_custom_filter)

  return (
    <>
    <BannerPopup delay={2500} />
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 20px 20px',
      gap: 10,
      background: '#FFF8F0',
      fontFamily: 'DM Sans, sans-serif',
      boxSizing: 'border-box',
    }}>

      {/* ── Logo + Confirmación ── */}
      <div style={{ textAlign: 'center' }}>
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Casa del Pollo"
            style={{ height: 36, maxWidth: 180, objectFit: 'contain', filter: logoFilter, marginBottom: 8, display: 'block', margin: '0 auto 8px' }}
          />
        )}
        <div style={{ fontSize: 40 }}>🎉</div>
        <div style={{
          fontFamily: 'var(--font-title), sans-serif', fontWeight: 800,
          fontSize: 22, color: '#1a1a1a', letterSpacing: '-0.5px', marginTop: 2,
        }}>
          ¡Pedido recibido!
        </div>
        <p style={{ fontSize: 13, color: '#888', margin: '2px 0 0' }}>
          {sucursalActiva?.name || sucursalActiva?.nombre}
        </p>
      </div>

      {/* ── BETA BANNER ── justo debajo de la confirmación ── */}
      <div style={{
        width: '100%', maxWidth: 340,
        background: '#FFFBEB',
        border: '1.5px solid #F59E0B44',
        borderRadius: 14, padding: '12px 16px',
        boxShadow: '0 2px 10px rgba(245,158,11,0.10)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🧪</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-title), sans-serif', fontWeight: 800, fontSize: 13, color: '#92400E', lineHeight: 1.2 }}>
              ¡Eres beta tester!
            </div>
            <div style={{ fontSize: 11, color: '#78350F', lineHeight: 1.4, marginTop: 1 }}>
              Encuesta anónima · menos de 1 min
            </div>
          </div>
          <button
            onClick={() => setVista('feedback')}
            style={{
              background: '#F59E0B', color: 'white',
              border: 'none', borderRadius: 999,
              padding: '7px 14px', fontWeight: 700, fontSize: 12,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 2px 6px rgba(245,158,11,0.35)',
            }}
          >
            ⭐ Calificar
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#B45309', textAlign: 'right', marginTop: 6, opacity: 0.7 }}>
          Redirigiendo en {cuenta}s…
        </div>
      </div>

      {/* ── Recibo ── */}
      <div ref={reciboRef} style={{
        background: 'white',
        borderRadius: 18, padding: '16px 20px',
        width: '100%', maxWidth: 320,
        border: '1.5px solid #F3E8DC',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        textAlign: 'center',
      }}>
        {/* Cabecera del recibo */}
        <div style={{ marginBottom: 12 }}>
          <img src={logoSrc} alt="Casa del Pollo"
            style={{ height: 26, maxWidth: 140, objectFit: 'contain', filter: logoFilter, display: 'block', margin: '0 auto 2px' }} />
          <div style={{ fontSize: 11, color: '#bbb' }}>
            Sucursal {sucursalActiva?.name || sucursalActiva?.nombre}
          </div>
        </div>

        {ultimoNumeroOrden && (
          <div style={{
            background: 'var(--rojo, #c1121f)', borderRadius: 12,
            padding: '10px 24px', marginBottom: 10,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '1.5px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 2,
            }}>
              Número de orden
            </p>
            <p style={{
              fontFamily: 'var(--font-title), sans-serif', fontWeight: 900,
              fontSize: 48, color: 'white', lineHeight: 1, letterSpacing: '-2px',
              margin: 0,
            }}>
              {ultimoNumeroOrden}
            </p>
          </div>
        )}

        {ultimaHora && (
          <div style={{
            background: '#FFF8F0', borderRadius: 8,
            padding: '8px 14px', marginBottom: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid #F3E8DC',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', margin: 0 }}>
              Hora de recogida
            </p>
            <p style={{ fontFamily: 'var(--font-title), sans-serif', fontWeight: 800, fontSize: 20, color: '#1a1a1a', margin: 0 }}>
              {ultimaHora}
            </p>
          </div>
        )}

        <p style={{ fontSize: 10, color: '#ccc', marginTop: 8, marginBottom: 0 }}>
          Pago en el local al recoger
        </p>
      </div>

      {/* ── Acciones ── */}
      <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 320 }}>
        <button
          onClick={descargarRecibo}
          style={{
            flex: 1,
            background: 'white', color: '#666',
            border: '1.5px solid #E8DDD5',
            padding: '11px 10px', borderRadius: 'var(--radio, 12px)',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13,
            cursor: 'pointer',
          }}
        >
          📥 Guardar
        </button>
        <button
          className="btn-primario"
          onClick={() => setVista('menu')}
          style={{ flex: 2 }}
        >
          Otro pedido
        </button>
      </div>

      <button
        onClick={() => setVista('sucursales')}
        style={{
          background: 'none', border: 'none',
          color: '#bbb', fontSize: 12, cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          marginTop: -2,
        }}
      >
        Cambiar sucursal
      </button>

    </div>
    </>
  )
}
