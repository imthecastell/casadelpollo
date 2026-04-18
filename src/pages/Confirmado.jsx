import { useApp } from '../data/AppContext.jsx'

export default function Confirmado() {
  const { setVista, sucursalActiva } = useApp()

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

      <p style={{ fontSize: 15, color: 'var(--gris)', marginBottom: 8, lineHeight: 1.6 }}>
        Tu pedido fue enviado a la sucursal
      </p>

      <p style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: 18, color: 'var(--dorado-claro)', marginBottom: 32
      }}>
        {sucursalActiva?.nombre}
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 'var(--radio-lg)', padding: '20px 24px',
        marginBottom: 32, width: '100%', maxWidth: 320
      }}>
        <p style={{ fontSize: 13, color: 'var(--gris)', lineHeight: 1.7 }}>
          Preséntate en el local a la hora indicada.
          El pago se realiza al recoger tu pedido.
        </p>
      </div>

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