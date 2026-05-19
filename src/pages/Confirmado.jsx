import { useApp } from '../data/AppContext.jsx'
import { useRef } from 'react'
import BannerPopup from '../Components/BannerPopup.jsx'

export default function Confirmado() {
  const { setVista, sucursalActiva, ultimoNumeroOrden, ultimaHora } = useApp()
  const reciboRef = useRef(null)

  const descargarRecibo = async () => {
    const elemento = reciboRef.current
    if (!elemento) return

    // Usar html2canvas para capturar el recibo
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    script.onload = async () => {
      const canvas = await window.html2canvas(elemento, { backgroundColor: '#3d1c02' })
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
    <div className="app-wrapper" style={{
      minHeight: '100vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
      background: 'var(--cafe)', textAlign: 'center'
    }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>

      <div style={{
        fontFamily: 'var(--font-title), sans-serif', fontWeight: 800,
        fontSize: 28, color: 'var(--crema)', marginBottom: 12, letterSpacing: '-0.5px'
      }}>
        ¡Pedido recibido!
      </div>

      {/* Recibo descargable */}
      <div ref={reciboRef} style={{
        background: 'rgba(255,255,255,0.06)', borderRadius: 20,
        padding: '24px', marginBottom: 24,
        width: '100%', maxWidth: 320,
        border: '1.5px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
          Casa del Pollo
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>
          Sucursal {sucursalActiva?.name || sucursalActiva?.nombre}
        </div>

        {ultimoNumeroOrden && (
          <div style={{
            background: 'var(--rojo)', borderRadius: 14,
            padding: '14px 24px', marginBottom: 16
          }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
              Número de orden
            </p>
            <p style={{
              fontFamily: 'var(--font-title), sans-serif', fontWeight: 900,
              fontSize: 56, color: 'white', lineHeight: 1, letterSpacing: '-2px'
            }}>
              {ultimoNumeroOrden}
            </p>
          </div>
        )}

        {ultimaHora && (
          <div style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: 10,
            padding: '12px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
              Hora de recogida
            </p>
            <p style={{
              fontFamily: 'var(--font-title), sans-serif', fontWeight: 800,
              fontSize: 22, color: 'white', letterSpacing: '-0.5px'
            }}>
              {ultimaHora}
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 14, textAlign: 'center' }}>
          Pago en el local al recoger
        </p>
      </div>

      <button
        onClick={descargarRecibo}
        style={{
          background: 'rgba(255,255,255,0.15)', color: 'var(--crema)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          padding: '12px 24px', borderRadius: 'var(--radio)',
          fontFamily: 'DM Sans, sans-serif', fontSize: 14,
          cursor: 'pointer', marginBottom: 12, width: '100%', maxWidth: 280
        }}
      >
        📥 Guardar recibo
      </button>

      <button
        className="btn-primario"
        onClick={() => setVista('menu')}
        style={{ maxWidth: 280 }}
      >
        Hacer otro pedido
      </button>

      <button
        onClick={() => setVista('sucursales')}
        style={{
          marginTop: 12, background: 'none', border: 'none',
          color: 'var(--gris)', fontSize: 13, cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif'
        }}
      >
        Cambiar sucursal
      </button>
    </div>
    </>
  )
}