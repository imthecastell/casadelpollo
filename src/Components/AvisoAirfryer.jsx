import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'

const STORAGE_KEY = 'aviso_airfryer_visto'

const FALLBACK = {
  titulo: 'Cocinado en Air Fryer',
  descripcion: 'Nuestros marinados y preparados se cocinan en air fryer sin grasas añadidas. El tiempo estimado de cocción se agrega automáticamente a tu pedido.',
}

export default function AvisoAirfryer({ onCerrar }) {
  const { bannersAviso } = useApp()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const visto = sessionStorage.getItem(STORAGE_KEY)
    if (!visto) setVisible(true)
  }, [])

  const cerrar = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
    if (onCerrar) onCerrar()
  }

  if (!visible) return null

  const aviso = bannersAviso[0] || FALLBACK

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
          background: 'var(--cafe, #3d1c02)',
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

        {aviso.imagen_url && (
          <img
            src={aviso.imagen_url} alt=""
            style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 16 }}
          />
        )}

        {aviso.titulo && (
          <p style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 18, color: 'var(--crema, #fff)', marginBottom: 10,
          }}>
            {aviso.titulo}
          </p>
        )}

        <p style={{
          fontFamily: 'DM Sans, sans-serif', fontSize: 14,
          color: 'rgba(255,255,255,0.8)', lineHeight: 1.6,
        }}>
          {aviso.descripcion || 'Nuestros preparados y marinados se cocinan en air fryer sin grasas añadidas.'}
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
