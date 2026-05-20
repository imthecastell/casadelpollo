import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'

export default function BannerPopup({ delay = 0 }) {
  const { bannersPopup } = useApp()
  const [cerrado, setCerrado] = useState(false)
  const [visible, setVisible] = useState(delay === 0)

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(t)
    }
  }, [delay])

  if (cerrado || bannersPopup.length === 0 || !visible) return null

  const banner = bannersPopup[0]

  return (
    <div
      onClick={setCerrado.bind(null, true)}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--cafe, #3d1c02)',
          borderRadius: 'var(--radio, 16px)',
          maxWidth: 360, width: '100%',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setCerrado(true)}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 10, right: 10,
            background: 'white',
            border: 'none', borderRadius: '50%',
            width: 32, height: 32,
            color: '#1a1a1a', fontSize: 20, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {banner.imagen_url && (
          <img
            src={banner.imagen_url}
            alt={banner.titulo || ''}
            style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }}
          />
        )}

        {(banner.titulo || banner.descripcion) && (
          <div style={{ padding: '20px 24px 24px' }}>
            {banner.titulo && (
              <p style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 22, color: 'var(--crema, #fff)',
                marginBottom: banner.descripcion ? 8 : 0,
              }}>
                {banner.titulo}
              </p>
            )}
            {banner.descripcion && (
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                color: 'rgba(255,255,255,0.75)', lineHeight: 1.5,
              }}>
                {banner.descripcion}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
