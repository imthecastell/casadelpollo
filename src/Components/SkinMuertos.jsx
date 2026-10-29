import { useEffect, useRef } from 'react'
import '../styles/skinMuertos.css'

/* Capa decorativa del skin "Día de Muertos / Halloween". Va dentro de .v2-shell, encima del contenido y debajo de
   la barra superior y la inferior; no recibe toques (pointer-events: none), así que no estorba a ningún botón.
   El papel picado, las gallinas de las bandas y los colores se resuelven solo con CSS (skinMuertos.css). */
const img = (n) => `${import.meta.env.BASE_URL}skins/muertos/${n}.png`

const ADORNOS = [
  { n: 'hoja-grande', clase: 'skin-adorno skin-hoja-izq' },
  { n: 'rama-roja', clase: 'skin-adorno skin-rama-der' },
  { n: 'cempasuchil', clase: 'skin-adorno skin-flor-der' },
  { n: 'hoja-2', clase: 'skin-adorno skin-hoja-medio' },
  { n: 'calabazas', clase: 'skin-adorno skin-calabazas' },
  { n: 'fantasma-2', clase: 'skin-adorno skin-fantasma' },
  { n: 'murcielago-1', clase: 'skin-adorno skin-murcielago' },
  { n: 'murcielago-3', clase: 'skin-adorno skin-murcielago skin-murcielago-2' },
]

export default function SkinMuertos() {
  const capa = useRef(null)

  // Los adornos de abajo se apoyan en el borde superior de la barra inferior, que cambia con el teléfono.
  useEffect(() => {
    const barra = capa.current?.parentElement?.querySelector('.v2-tabbar')
    if (!barra) return
    const medir = () => capa.current?.style.setProperty('--skin-tabbar', `${barra.offsetHeight}px`)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(barra)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="skin-capa" ref={capa} aria-hidden="true">
      {ADORNOS.map(a => <img key={a.n} className={a.clase} src={img(a.n)} alt="" draggable="false" />)}
    </div>
  )
}
