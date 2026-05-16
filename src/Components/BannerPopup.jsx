import { useState } from 'react'
import { useApp } from '../data/AppContext.jsx'

export default function BannerPopup() {
  const { bannersPopup } = useApp()
  const [cerrado, setCerrado] = useState(false)

  if (cerrado || bannersPopup.length === 0) return null

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
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: '50%',
            width: 32, height: 32,
            color: 'white', fontSize: 18, lineHeight: '32px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
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
