/**
 * LogoSlot
 * Muestra el logo real cuando existe, o el LogoPlaceholder cuando no.
 * Centraliza el filtro CSS para que ninguna página lo redefina.
 *
 * Props:
 *   type          — 'logotipo' | 'icon' | 'color'  (identifica qué slot es)
 *   src           — URL del logo (logo_url / logo_icon_url / logo_original_url)
 *   mode          — logo_color_mode: 'original' | 'blanco' | 'negro' | 'personalizado'
 *   customFilter  — logo_custom_filter (CSS filter string)
 *   width/height  — dimensiones del slot
 *   alt           — texto alternativo del <img>
 *   imgStyle      — estilos extra para el <img>
 *   placeholderStyle — estilos extra para el placeholder (ej. borde blanco en fondos oscuros)
 */
import LogoPlaceholder from './LogoPlaceholder.jsx'
import { cdn } from '../data/cdn.js'

function resolveFilter(mode, customFilter) {
  if (mode === 'blanco')        return 'brightness(0) invert(1)'
  if (mode === 'negro')         return 'brightness(0)'
  if (mode === 'personalizado') return customFilter || 'none'
  return 'none' // original
}

const anchoCdn = (w) => (typeof w === 'number' ? w * 2 : undefined)

export default function LogoSlot({
  type = 'logotipo',
  src,
  mode,
  customFilter,
  width,
  height,
  alt = '',
  imgStyle = {},
  placeholderStyle = {},
}) {
  if (src) {
    const url = cdn(src, anchoCdn(width))
    // modo "tema": usa CSS mask para que el icono tome el color var(--rojo)
    // exactamente igual que los botones de la interfaz
    if (mode === 'tema') {
      return (
        <div
          style={{
            width,
            height,
            flexShrink: 0,
            background: 'var(--rojo)',
            WebkitMask: `url(${url}) no-repeat center / contain`,
            mask:        `url(${url}) no-repeat center / contain`,
            ...imgStyle,
          }}
        />
      )
    }

    return (
      <img
        src={url}
        alt={alt}
        style={{
          width,
          height,
          maxWidth: width,
          objectFit: 'contain',
          filter: resolveFilter(mode, customFilter),
          display: 'block',
          flexShrink: 0,
          ...imgStyle,
        }}
      />
    )
  }

  return (
    <LogoPlaceholder
      type={type}
      width={width}
      height={height}
      style={placeholderStyle}
    />
  )
}
