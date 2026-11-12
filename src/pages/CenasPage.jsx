import { useEffect, useState } from 'react'
import Icono from '../Components/Icono.jsx'
import { CENAS, CONDICIONES, useSucursalesCenas, usePreciosCatalogo, enlaceWhatsapp } from '../data/cenas.js'
import { registrarEvento, registrarVisitaUnaVez } from '../data/medicion.js'
import '../styles/homeV2.css'
import '../styles/links.css'
import '../styles/cenas.css'

const BASE = import.meta.env.BASE_URL

/* Cenas de fin de año: la escena de la cena arriba, un texto de bienvenida, lo que ofrecemos
   (con su medida) y las sucursales donde se reserva por WhatsApp. Todo el contenido editable
   está en data/cenas.js. */
export default function CenasPage() {
  const { sucursales, cargando } = useSucursalesCenas()
  const preciosCatalogo = usePreciosCatalogo()

  useEffect(() => { document.title = 'Cenas de fin de año · Casa del Pollo'; registrarVisitaUnaVez() }, [])

  return (
    <div className="v2-shell-root cn-root">
      <header className="cn-escena">
        <img
          className="cn-escena-img"
          src={`${BASE}cenas/plato-horizontal.webp`}
          width="1300" height="975"
          alt="Mesa de cena de fin de año: pechuga rellena con pasta poblana, verduras, puré de papa, copa de vino y rosca de pan danés"
          fetchPriority="high"
        />
        <a className="cn-volver" href={BASE}>← Ir a la tienda</a>
      </header>

      <main className="cn-cuerpo">
        <section className="cn-intro">
          <p className="cn-sobre">Casa del Pollo · El pollo de casa</p>
          <h1>{CENAS.titulo}</h1>
          {CENAS.texto.map((t, i) => <p key={i}>{t}</p>)}
          <a className="cn-boton" href="#reservar"><Icono nombre="whatsapp-logo" tam="20px" /> Reservar mi cena</a>
        </section>

        <section className="cn-menu" aria-labelledby="cn-ofrecemos">
          <h2 id="cn-ofrecemos" className="cn-titulo">Lo que ofrecemos</h2>
          {CENAS.grupos.map(g => (
            <div key={g.id} className="cn-grupo">
              <h3>{g.titulo}</h3>
              <ul className={'cn-lista' + (g.items.every(it => it.foto) ? ' cn-lista-fotos' : '')}>
                {g.items.map(it => (
                  <li key={it.id} className={'cn-platillo' + (it.foto ? ' cn-con-foto' : '')}>
                    {it.foto
                      ? <img className="cn-foto" src={`${BASE}cenas/${it.foto}`} width="800" height="600" loading="lazy" alt={it.fotoAlt || it.nombre} />
                      : <span className="cn-ico"><Icono nombre={it.icono} tam="26px" /></span>}
                    <div className="cn-platillo-txt">
                      <h4>{it.nombre}{it.etiqueta && <small>{it.etiqueta}</small>}</h4>
                      <p>{it.detalle}</p>
                      <p className="cn-medida"><b>{it.medida}</b></p>
                      {(preciosCatalogo[it.id] || it.precio) && <Precio id={it.id} texto={preciosCatalogo[it.id] || it.precio} />}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="cn-reservar" id="reservar" aria-labelledby="cn-reserva-t">
          <h2 id="cn-reserva-t" className="cn-titulo">Reserva en tu sucursal</h2>
          <p className="cn-reserva-sub">
            Disponible en todas nuestras sucursales. Elige la tuya y te abrimos WhatsApp con tu mensaje listo.
          </p>

          {CONDICIONES.length > 0 && (
            <dl className="cn-condiciones">
              {CONDICIONES.map(c => (
                <div key={c.clave}><dt><Icono nombre={c.icono} tam="18px" /> {c.etiqueta}</dt><dd>{CENAS[c.clave]}</dd></div>
              ))}
            </dl>
          )}

          {cargando ? (
            <div className="cn-sucursales" aria-busy="true">
              {[0, 1, 2, 3].map(i => <div key={i} className="cn-sucursal lk-esqueleto" />)}
            </div>
          ) : sucursales.length === 0 ? (
            <p className="cn-vacio">No pudimos cargar las sucursales. Vuelve a intentarlo en un momento.</p>
          ) : (
            <div className="cn-sucursales">
              {sucursales.map(s => <Sucursal key={s.id || s.name} suc={s} />)}
            </div>
          )}
        </section>

        <a className="cn-cartel" href={`${BASE}cenas/menu-cartel.webp`} target="_blank" rel="noopener noreferrer">
          <img src={`${BASE}cenas/menu-cartel.webp`} width="900" height="1731" loading="lazy" alt="Cartel del menú de cenas de fin de año" />
          <span>Ver el cartel del menú</span>
        </a>
      </main>

      <footer className="cn-pie">Casa del Pollo · <a href={BASE}>Ir a la tienda</a></footer>
    </div>
  )
}

/* El precio se ve al tocar «Ver precio»: así se cuenta cada consulta por platillo. Para dificultar las
   capturas de pantalla (no se pueden bloquear en una página web) el precio no se puede seleccionar ni
   copiar, lleva una marca de agua, no sale al imprimir y vuelve a ocultarse si la página pasa a segundo
   plano o pasan 20 segundos. */
function Precio({ id, texto }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    const ocultar = () => setVisible(false)
    const alCambiar = () => { if (document.hidden) ocultar() }
    document.addEventListener('visibilitychange', alCambiar)
    window.addEventListener('blur', ocultar)
    const t = setTimeout(ocultar, 20000)
    return () => {
      document.removeEventListener('visibilitychange', alCambiar)
      window.removeEventListener('blur', ocultar)
      clearTimeout(t)
    }
  }, [visible])

  if (!visible) {
    return (
      <button type="button" className="cn-ver-precio" onClick={() => { setVisible(true); registrarEvento('precio', id) }}>
        <Icono nombre="money" tam="18px" /> Ver precio
      </button>
    )
  }
  return (
    <p className="cn-precio" role="status" onContextMenu={e => e.preventDefault()} onCopy={e => e.preventDefault()} onDragStart={e => e.preventDefault()}>
      <span>{texto}</span>
    </p>
  )
}

function Sucursal({ suc }) {
  // El WhatsApp de Viñedos está asistido por IA: no garantiza que la tienda se entere (igual que en /links).
  const esVinedos = /vi[ñn]ed/i.test(suc.name || '')
  return (
    <article className="cn-sucursal">
      <h3>{suc.name}</h3>
      {suc.direccion && <p className="cn-dir"><Icono nombre="map-pin" tam="16px" />{suc.direccion}</p>}
      <a className="lk-btn wa" href={enlaceWhatsapp(suc.whatsapp)} target="_blank" rel="noopener noreferrer">
        <Icono nombre="whatsapp-logo" tam="20px" /> Reservar por WhatsApp
      </a>
      {esVinedos && (
        <p className="cn-aviso">Este WhatsApp está asistido por inteligencia artificial: tu reserva no queda confirmada hasta que la sucursal te responda.</p>
      )}
    </article>
  )
}
