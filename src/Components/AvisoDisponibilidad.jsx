export default function AvisoDisponibilidad({ onCerrar }) {
  const cerrar = () => {
    if (onCerrar) onCerrar()
  }

  return (
    <div
      onClick={cerrar}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a2f1a',
          borderRadius: 'var(--radio, 16px)',
          maxWidth: 340, width: '100%',
          padding: '28px 24px',
          position: 'relative',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          textAlign: 'center',
        }}
      >
        <button
          onClick={cerrar}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: '50%', width: 32, height: 32,
            color: 'white', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>

        <div style={{ fontSize: 44, marginBottom: 14 }}>⚠️</div>

        <p style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 17, color: '#fff', marginBottom: 10,
        }}>
          Alerta de disponibilidad
        </p>

        <p style={{
          fontFamily: 'DM Sans, sans-serif', fontSize: 14,
          color: 'rgba(255,255,255,0.82)', lineHeight: 1.65,
        }}>
          Ordenar tus productos cocinados <strong style={{ color: '#7fcf7f' }}>no tiene costo extra</strong>, pero nuestra disponibilidad es limitada. Te recomendamos confirmar con anticipación.
        </p>

        <button
          onClick={cerrar}
          className="btn-primario"
          style={{ marginTop: 20 }}
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
