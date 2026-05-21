/**
 * LogoPlaceholder
 * Área reservada visible mientras no hay logo cargado.
 * type:
 *   "logotipo"  — wordmark horizontal completo (header ancho, selector, recibo)
 *   "icon"      — ícono cuadrado compacto (navbar de sección, carrito)
 *   "color"     — versión a color para fondos claros (recibo, confirmado)
 */

const CONFIGS = {
  logotipo: { label: 'Logotipo', defaultW: 160, defaultH: 38, radius: 6 },
  icon:     { label: 'Icon',     defaultW: 34,  defaultH: 34, radius: 8 },
  color:    { label: 'Logo color', defaultW: 130, defaultH: 28, radius: 6 },
}

export default function LogoPlaceholder({ type = 'logotipo', width, height, style = {} }) {
  const cfg = CONFIGS[type] || CONFIGS.logotipo
  const w = width  ?? cfg.defaultW
  const h = height ?? cfg.defaultH

  return (
    <div
      style={{
        width: w,
        height: h,
        border: '1.5px dashed #C0C0C0',
        borderRadius: cfg.radius,
        background: 'rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <span style={{
        fontSize: 9,
        fontWeight: 700,
        color: 'inherit',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        userSelect: 'none',
      }}>
        {cfg.label}
      </span>
    </div>
  )
}
