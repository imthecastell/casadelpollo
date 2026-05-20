import { useApp } from '../data/AppContext.jsx'
import { useRef, useEffect, useState } from 'react'
import BannerPopup from '../Components/BannerPopup.jsx'

export default function Confirmado() {
  const { setVista, sucursalActiva, ultimoNumeroOrden, ultimaHora } = useApp()
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

  return (
    <>
    <BannerPopup delay={2500} />
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 20px 48px',
      background: '#FFF8F0',
      fontFamily: 'DM Sans, sans-serif',
    }}>

      {/* ── BETA BANNER — va primero ── */}
      <div style={{
        width: '100%', maxWidth: 340,
        background: '#FFFBEB',
        border: '1.5px solid #F59E0B44',
        borderRadius: 16, padding: '16px 18px',
        textAlign: 'center', marginBottom: 24,
        boxShadow: '0 2px 12px rgba(245,158,11,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>🧪</span>
          <span style={{
            fontFamily: 'var(--font-title), sans-serif', fontWeight: 800,
            fontSize: 15, color: '#92400E',
          }}>¡Eres beta tester!</span>
        </div>
        <p style={{ fontSize: 12, color: '#78350F', lineHeight: 1.5, marginBottom: 12 }}>
          Tu opinión nos ayuda a mejorar la app. La encuesta es anónima y toma menos de 1 minuto.
        </p>
        <button
          onClick={() => setVista('feedback')}
          style={{
            background: '#F59E0B', color: 'white',
            border: 'none', borderRadius: 999,
            padding: '9px 20px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', width: '100%',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
          }}
        >
          ⭐ Calificar mi experiencia
        </button>
        <p style={{ fontSize: 11, color: '#B45309', marginTop: 8, opacity: 0.7 }}>
          Redirigiendo en {cuenta}s…
        </p>
      </div>

      {/* ── Confirmación ── */}
      <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
      <div style={{
        fontFamily: 'var(--font-title), sans-serif', fontWeight: 800,
        fontSize: 26, color: '#1a1a1a', marginBottom: 4, letterSpacing: '-0.5px',
        textAlign: 'center',
      }}>
        ¡Pedido recibido!
      </div>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 24, textAlign: 'center' }}>
        Te esperamos en sucursal {sucursalActiva?.name || sucursalActiva?.nombre}
      </p>

      {/* ── Recibo ── */}
      <div ref={reciboRef} style={{
        background: 'white',
        borderRadius: 20, padding: '24px',
        marginBottom: 20, width: '100%', maxWidth: 320,
        border: '1.5px solid #F3E8DC',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '1px',
          textTransform: 'uppercase', color: '#aaa', marginBottom: 4,
        }}>
          Casa del Pollo
        </div>
        <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
          Sucursal {sucursalActiva?.name || sucursalActiva?.nombre}
        </div>

        {ultimoNumeroOrden && (
          <div style={{
            background: 'var(--rojo, #c1121f)', borderRadius: 14,
            padding: '14px 24px', marginBottom: 16,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '1.5px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 4,
            }}>
              Número de orden
            </p>
            <p style={{
              fontFamily: 'var(--font-title), sans-serif', fontWeight: 900,
              fontSize: 56, color: 'white', lineHeight: 1, letterSpacing: '-2px',
            }}>
              {ultimoNumeroOrden}
            </p>
          </div>
        )}

        {ultimaHora && (
          <div style={{
            background: '#FFF8F0', borderRadius: 10,
            padding: '12px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid #F3E8DC',
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', color: '#aaa',
            }}>
              Hora de recogida
            </p>
            <p style={{
              fontFamily: 'var(--font-title), sans-serif', fontWeight: 800,
              fontSize: 22, color: '#1a1a1a', letterSpacing: '-0.5px',
            }}>
              {ultimaHora}
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, color: '#bbb', marginTop: 14 }}>
          Pago en el local al recoger
        </p>
      </div>

      {/* ── Acciones ── */}
      <button
        onClick={descargarRecibo}
        style={{
          background: 'white', color: '#555',
          border: '1.5px solid #E8DDD5',
          padding: '11px 20px', borderRadius: 'var(--radio, 12px)',
          fontFamily: 'DM Sans, sans-serif', fontSize: 14,
          cursor: 'pointer', marginBottom: 10,
          width: '100%', maxWidth: 320,
        }}
      >
        📥 Guardar recibo
      </button>

      <button
        className="btn-primario"
        onClick={() => setVista('menu')}
        style={{ maxWidth: 320 }}
      >
        Hacer otro pedido
      </button>

      <button
        onClick={() => setVista('sucursales')}
        style={{
          marginTop: 10, background: 'none', border: 'none',
          color: '#aaa', fontSize: 13, cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        Cambiar sucursal
      </button>

    </div>
    </>
  )
}
