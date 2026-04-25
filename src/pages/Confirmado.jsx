import { useApp } from '../data/AppContext.jsx'
import { useRef } from 'react'

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
    <div className="app-wrapper" style={{
      minHeight: '100vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
      background: 'var(--cafe)', textAlign: 'center'
    }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>

      <div style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800,
        fontSize: 28, color: 'var(--crema)', marginBottom: 12
      }}>
        ¡Pedido recibido!
      </div>

      {/* Recibo descargable */}
      <div ref={reciboRef} style={{
        background: '#3d1c02', borderRadius: 16,
        padding: '24px', marginBottom: 24,
        width: '100%', maxWidth: 320,
        border: '2px solid rgba(255,255,255,0.15)'
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
          Casa del Pollo
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
          Sucursal {sucursalActiva?.name || sucursalActiva?.nombre}
        </div>

        {ultimoNumeroOrden && (
          <div style={{
            background: '#E63946', borderRadius: 12,
            padding: '12px 24px', marginBottom: 16
          }}>
            <p style={{ fontSize: 11, color: 'white', marginBottom: 4, opacity: 0.8 }}>
              NÚMERO DE ORDEN
            </p>
            <p style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 900,
              fontSize: 52, color: 'white', lineHeight: 1
            }}>
              {ultimoNumeroOrden}
            </p>
          </div>
        )}

        {ultimaHora && (
          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: 8,
            padding: '10px 16px', marginBottom: 8
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
              HORA DE RECOGIDA
            </p>
            <p style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: 24, color: 'white'
            }}>
              🕐 {ultimaHora}
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
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
  )
}