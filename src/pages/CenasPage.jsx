import { useEffect, useRef, useState } from 'react'
import Icono from '../Components/Icono.jsx'
import { CENAS, CONDICIONES, useSucursalesCenas, usePreciosCatalogo, enlaceWhatsapp, mensajeReserva } from '../data/cenas.js'
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
  const [paquete, setPaquete] = useState(null) // paquete elegido para el mensaje de WhatsApp

  const elegirPaquete = (p) => {
    setPaquete(p)
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => { document.title = 'Cenas de fin de año · Casa del Pollo'; registrarVisitaUnaVez() }, [])

  return (
    <div className="v2-shell-root cn-root">
      <header className="cn-escena">
        <img
          className="cn-escena-img"
          src={`${BASE}cenas/plato-horizontal.webp`}
          width="1300" height="975"
          alt="Mesa de cena de fin de año: pechuga rellena con pasta poblana, verduras, puré de papa, copa de vino y pan danés"
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

        <section className="cn-paquetes" aria-labelledby="cn-paquetes-t">
          <h2 id="cn-paquetes-t" className="cn-titulo">Paquetes para tu cena</h2>
          <p className="cn-paquetes-sub">Todo lo que necesitas para la mesa, en un solo pedido.</p>
          <div className="cn-paquetes-grid">
            {CENAS.paquetes.map(p => (
              <article key={p.id} className="cn-paquete">
                <img className="cn-foto" src={`${BASE}cenas/${p.foto}`} width="800" height="600" loading="lazy"
                  style={p.fotoPos ? { objectPosition: p.fotoPos } : undefined} alt={p.fotoAlt || p.nombre} />
                <div className="cn-paquete-txt">
                  <h3>{p.nombre}</h3>
                  <p className="cn-rinde"><Icono nombre="fork-knife" tam="18px" /> {p.rinde}</p>
                  <ul className="cn-incluye">
                    {p.incluye.map(t => <li key={t}><Icono nombre="check-circle" tam="18px" /><span>{t}</span></li>)}
                  </ul>
                  {p.eliges && <p className="cn-eliges"><b>{p.eliges}</b></p>}
                  <div className="cn-paquete-pie">
                    <Precio id={p.id} texto={p.precio} />
                    {CENAS.notaPrecioPaquetes && <p className="cn-nota-precio">{CENAS.notaPrecioPaquetes}</p>}
                    <button type="button" className="cn-boton cn-boton-chico" onClick={() => elegirPaquete(p)}>
                      <Icono nombre="whatsapp-logo" tam="20px" /> Quiero este paquete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cn-menu" aria-labelledby="cn-ofrecemos">
          <h2 id="cn-ofrecemos" className="cn-titulo">Lo que ofrecemos</h2>
          {CENAS.grupos.map(g => (
            <div key={g.id} className="cn-grupo">
              <h3>{g.titulo}</h3>
              <ul className={'cn-lista' + (g.items.every(it => it.foto || it.fotos) ? (g.items.length === 1 ? ' cn-lista-unica' : ' cn-lista-fotos') : '')}>
                {g.items.map(it => (
                  <li key={it.id} className={'cn-platillo' + (it.foto || it.fotos ? ' cn-con-foto' : '') + (it.fotos ? ' cn-platillo-ancho' : '')}>
                    {it.fotos ? (
                      <div className="cn-trio">
                        {it.fotos.map(f => (
                          <figure key={f.archivo}>
                            <img className="cn-foto" src={`${BASE}cenas/${f.archivo}`} width="600" height="450" loading="lazy" alt={f.alt || f.nombre} />
                            <figcaption>{f.nombre}</figcaption>
                          </figure>
                        ))}
                      </div>
                    ) : it.foto ? (
                      <img className="cn-foto" src={`${BASE}cenas/${it.foto}`} width="800" height="600" loading="lazy" alt={it.fotoAlt || it.nombre} />
                    ) : (
                      <span className="cn-ico"><Icono nombre={it.icono} tam="26px" /></span>
                    )}
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

          {paquete && (
            <p className="cn-elegido" role="status">
              <Icono nombre="check-circle" tam="20px" />
              <span>Tu mensaje será para el <b>{paquete.nombre}</b>.</span>
              <button type="button" onClick={() => setPaquete(null)}>Quitar</button>
            </p>
          )}

          {cargando ? (
            <div className="cn-sucursales" aria-busy="true">
              {[0, 1, 2, 3].map(i => <div key={i} className="cn-sucursal lk-esqueleto" />)}
            </div>
          ) : sucursales.length === 0 ? (
            <p className="cn-vacio">No pudimos cargar las sucursales. Vuelve a intentarlo en un momento.</p>
          ) : (
            <div className="cn-sucursales">
              {sucursales.map(s => <Sucursal key={s.id || s.name} suc={s} mensaje={mensajeReserva(paquete)} />)}
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

/* El precio solo existe en la página MIENTRAS SE MANTIENE PRESIONADO el botón: al soltar, al cambiar de
   pestaña o de app, o al salir del botón con el dedo o el cursor, desaparece del documento (no está
   oculto con CSS: ni siquiera está en el HTML). Así una captura normal no lo trae, y capturarlo exige
   mantener el dedo en el botón mientras se aprietan los botones del teléfono. Es una barrera, no un
   candado: una web no puede impedir una captura del sistema ni una foto a la pantalla. Además el
   precio no se puede seleccionar ni copiar, lleva una marca de agua tenue y no sale al imprimir.
   Cada vez que se presiona se cuenta una consulta de precio del platillo. */
function Precio({ id, texto }) {
  const [visible, setVisible] = useState(false)
  const activo = useRef(false)

  const mostrar = () => {
    if (activo.current) return
    activo.current = true
    setVisible(true)
    registrarEvento('precio', id)
  }
  const ocultar = () => { activo.current = false; setVisible(false) }

  useEffect(() => {
    if (!visible) return
    const alCambiar = () => { if (document.hidden) ocultar() }
    document.addEventListener('visibilitychange', alCambiar)
    window.addEventListener('blur', ocultar)
    window.addEventListener('pointerup', ocultar)
    window.addEventListener('pointercancel', ocultar)
    return () => {
      document.removeEventListener('visibilitychange', alCambiar)
      window.removeEventListener('blur', ocultar)
      window.removeEventListener('pointerup', ocultar)
      window.removeEventListener('pointercancel', ocultar)
    }
  }, [visible])

  // Teclado: mantener Espacio o Enter. Lectores de pantalla (clic sin presión sostenida, detail 0):
  // se muestra 6 segundos.
  const alTeclear = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); mostrar() } }
  const alSoltarTecla = (e) => { if (e.key === ' ' || e.key === 'Enter') ocultar() }
  const alClicSinPuntero = (e) => { if (e.detail === 0 && !visible) { mostrar(); setTimeout(ocultar, 6000) } }

  return (
    <button
      type="button"
      className={'cn-ver-precio' + (visible ? ' cn-ver-precio-on' : '')}
      aria-label={visible ? `Precio: ${texto}` : 'Mantén presionado para ver el precio'}
      onPointerDown={(e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; mostrar() }}
      onPointerLeave={ocultar}
      onKeyDown={alTeclear}
      onKeyUp={alSoltarTecla}
      onBlur={ocultar}
      onClick={alClicSinPuntero}
      onContextMenu={e => e.preventDefault()}
      onCopy={e => e.preventDefault()}
      onDragStart={e => e.preventDefault()}
    >
      {/* La etiqueta siempre ocupa su lugar (invisible mientras se ve el precio) para que el botón no cambie de tamaño. */}
      <span className="cn-precio-etiqueta" style={visible ? { visibility: 'hidden' } : undefined}>
        <Icono nombre="money" tam="18px" /> Mantén presionado para ver el precio
      </span>
      {visible && <span className="cn-precio-valor">{texto}</span>}
    </button>
  )
}

function Sucursal({ suc, mensaje }) {
  // El WhatsApp de Viñedos está asistido por IA: no garantiza que la tienda se entere (igual que en /links).
  const esVinedos = /vi[ñn]ed/i.test(suc.name || '')
  return (
    <article className="cn-sucursal">
      <h3>{suc.name}</h3>
      {suc.direccion && <p className="cn-dir"><Icono nombre="map-pin" tam="16px" />{suc.direccion}</p>}
      <a className="lk-btn wa" href={enlaceWhatsapp(suc.whatsapp, mensaje)} target="_blank" rel="noopener noreferrer">
        <Icono nombre="whatsapp-logo" tam="20px" /> Reservar por WhatsApp
      </a>
      {esVinedos && (
        <p className="cn-aviso">Este WhatsApp está asistido por inteligencia artificial: tu reserva no queda confirmada hasta que la sucursal te responda.</p>
      )}
    </article>
  )
}
