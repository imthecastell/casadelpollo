import { useState, useEffect } from 'react'
import { useApp } from '../data/AppContext.jsx'

const CLAVE_CERRADO = 'cdp_instalar_cerrado'

function detectarIOS() {
  const ua = window.navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function yaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function InstalarApp() {
  const { carrito } = useApp()
  const [promptEvento, setPromptEvento] = useState(null)
  const [cerrado, setCerrado] = useState(() => {
    try { return localStorage.getItem(CLAVE_CERRADO) === '1' } catch { return false }
  })
  const [mostrarPasosIOS, setMostrarPasosIOS] = useState(false)
  const esIOS = detectarIOS()

  useEffect(() => {
    function alAntesDeInstalar(e) {
      e.preventDefault()
      setPromptEvento(e)
    }
    window.addEventListener('beforeinstallprompt', alAntesDeInstalar)
    return () => window.removeEventListener('beforeinstallprompt', alAntesDeInstalar)
  }, [])

  const puedeMostrar = !cerrado && !yaInstalada() && carrito.length > 0 && (esIOS || promptEvento)
  if (!puedeMostrar) return null

  function cerrar() {
    setCerrado(true)
    setMostrarPasosIOS(false)
    try { localStorage.setItem(CLAVE_CERRADO, '1') } catch { /* modo privado */ }
  }

  async function instalar() {
    if (esIOS) {
      setMostrarPasosIOS(true)
      return
    }
    if (!promptEvento) return
    promptEvento.prompt()
    await promptEvento.userChoice
    setPromptEvento(null)
    cerrar()
  }

  return (
    <>
      <div
        style={{
          position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 900,
          background: 'var(--crema)', borderRadius: 'var(--radio)',
          boxShadow: 'var(--sombra-lg)', border: '1px solid var(--gris-claro)',
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 10px 12px',
        }}
      >
        <img src="/icon-192.png" alt="" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: 'var(--texto)' }}>
            Instala Casa del Pollo
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--texto-suave)' }}>
            Pide más rápido desde tu pantalla de inicio
          </p>
        </div>
        <button
          onClick={instalar}
          style={{
            flexShrink: 0, border: 'none', borderRadius: 10, padding: '9px 14px',
            background: 'var(--rojo)', color: '#fff', fontFamily: 'var(--font-title)',
            fontWeight: 800, fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Instalar
        </button>
        <button
          onClick={cerrar}
          aria-label="Cerrar"
          style={{
            flexShrink: 0, border: 'none', background: 'none', color: 'var(--texto-suave)',
            fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 4,
          }}
        >
          ×
        </button>
      </div>

      {mostrarPasosIOS && (
        <div
          onClick={() => setMostrarPasosIOS(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--crema)', width: '100%', borderRadius: '20px 20px 0 0',
              padding: '22px 22px 30px',
            }}
          >
            <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 17, color: 'var(--texto)' }}>
              Agregar a pantalla de inicio
            </p>
            <ol style={{ margin: '0 0 20px', padding: '0 0 0 20px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--texto)', lineHeight: 1.7 }}>
              <li>Toca el ícono <strong>Compartir</strong> (⬆️) en la barra de Safari</li>
              <li>Desliza hacia abajo y elige <strong>"Agregar a pantalla de inicio"</strong></li>
              <li>Toca <strong>"Agregar"</strong> arriba a la derecha</li>
            </ol>
            <button
              onClick={cerrar}
              style={{
                width: '100%', border: 'none', borderRadius: 12, padding: '13px',
                background: 'var(--rojo)', color: '#fff', fontFamily: 'var(--font-title)',
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
