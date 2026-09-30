import { ICONOS } from '../data/iconosPhosphor.js'

/* Icono bicolor (Phosphor duotone). Toma el color del texto que lo rodea
   (currentColor): la capa clara sale sola al 20%. Con `relleno` usa la
   versión sólida, si existe (se usa para la pestaña activa). */
export default function Icono({ nombre, relleno = false, tam = '1em', className = '' }) {
  const dibujo = (relleno && ICONOS[`${nombre}-fill`]) || ICONOS[nombre]
  if (!dibujo) return null
  return (
    <svg
      className={`v2-ico${className ? ` ${className}` : ''}`}
      viewBox="0 0 256 256" width={tam} height={tam} fill="currentColor"
      aria-hidden="true" focusable="false"
      dangerouslySetInnerHTML={{ __html: dibujo }}
    />
  )
}
