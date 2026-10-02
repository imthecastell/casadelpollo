import Icono from './Icono.jsx'
import { estadoHorario, hora12 } from '../data/horario.js'

/* Pie de la tienda V2: datos de la sucursal activa (dirección, horario y si está abierta,
   servicios), cómo se paga y redes. */

// Facebook: enlace genérico por ahora. Cuando haya página propia de la marca, solo se cambia aquí.
const FACEBOOK_URL = 'https://www.facebook.com/LaCasaDelPolloLM'
const INSTAGRAM_POR_DEFECTO = 'https://www.instagram.com/casadelpollolm/'

const PAGOS = [
  { icono: 'money', texto: 'Efectivo' },
  { icono: 'credit-card', texto: 'Tarjeta de crédito y débito' },
  { icono: 'credit-card', texto: 'American Express' },
  { icono: 'contactless-payment', texto: 'Sin contacto' },
  { icono: 'apple-logo', texto: 'Apple Pay' },
  { icono: 'google-logo', texto: 'Google Pay' },
]

const ORDEN_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const NOMBRE_DIA = { lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom' }

// Agrupa días seguidos con el mismo horario: "Lun a Vie · 10:00 AM a 8:00 PM".
function gruposHorario(schedule) {
  if (!Array.isArray(schedule) || schedule.length === 0) return []
  const porDia = Object.fromEntries(schedule.map(d => [d.dia, d]))
  const clave = d => (d?.activo ? `${d.apertura}-${d.cierre}` : 'cerrado')
  const grupos = []
  ORDEN_SEMANA.forEach(dia => {
    const d = porDia[dia]; if (!d) return
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.clave === clave(d)) ultimo.dias.push(dia)
    else grupos.push({ clave: clave(d), dias: [dia], d })
  })
  return grupos.map(g => ({
    dias: g.dias.length === 1 ? NOMBRE_DIA[g.dias[0]] : `${NOMBRE_DIA[g.dias[0]]} a ${NOMBRE_DIA[g.dias[g.dias.length - 1]]}`,
    horas: g.d?.activo ? `${hora12(g.d.apertura)} a ${hora12(g.d.cierre)}` : 'Cerrado',
    cerrado: !g.d?.activo,
  }))
}

export default function PieV2({ sucursal, enlaces, schedule, productos, bowlsActivo, clase = '' }) {
  if (!sucursal) return null
  const estado = estadoHorario(schedule)
  const grupos = gruposHorario(schedule)
  const disp = (productos || []).filter(p => p.available !== false && p.active !== false)
  const hay = cat => disp.some(p => p.category_name === cat)
  const servicios = [
    { icono: 'flame', texto: 'Cocinado en tienda', ok: disp.some(p => p.se_puede_cocinar) },
    { icono: 'bowl-food', texto: 'Arma tu Bowl', ok: !!bowlsActivo },
    { icono: 'cooking-pot', texto: 'Marinados', ok: hay('Marinados') },
    { icono: 'chef-hat', texto: 'Preparados', ok: hay('Preparados') },
    { icono: 'basket', texto: 'Pollo fresco', ok: hay('Pollo Fresco') },
    { icono: 'bag', texto: sucursal.pedidos_en_linea === false ? 'Pedidos por WhatsApp' : 'Pedidos en línea', ok: true },
  ]
  const direccion = enlaces?.direccion
  const mapa = enlaces?.googleMaps || enlaces?.appleMaps
  const wa = enlaces?.whatsapp
  const instagram = enlaces?.instagram || INSTAGRAM_POR_DEFECTO

  const disponibles = servicios.filter(s => s.ok).map(s => s.texto)
  const noDisponibles = servicios.filter(s => !s.ok).map(s => s.texto)

  return (
    <footer className={`v2-pie${clase ? ` ${clase}` : ''}`}>
      <div className="v2-pie-grid">
        <section className="v2-pie-bloque">
          <h3>{sucursal.name}</h3>
          {direccion && <p className="v2-pie-dir">{direccion}</p>}
          <div className="v2-pie-botones">
            {mapa && <a className="v2-pie-btn" href={mapa} target="_blank" rel="noopener noreferrer"><Icono nombre="navigation-arrow" /> Cómo llegar</a>}
            {wa && <a className="v2-pie-btn" href={wa} target="_blank" rel="noopener noreferrer"><Icono nombre="whatsapp-logo" /> WhatsApp</a>}
          </div>
        </section>

        <section className="v2-pie-bloque">
          <h3>Horario</h3>
          {estado && <p className={`v2-pie-estado${estado.abierto ? ' abierto' : ''}`}><i />{estado.texto}</p>}
          <ul className="v2-pie-horas">
            {grupos.map(g => (
              <li key={g.dias} className={g.cerrado ? 'cerrado' : ''}><span>{g.dias}</span><span>{g.horas}</span></li>
            ))}
          </ul>
        </section>
      </div>

      <dl className="v2-pie-lineas">
        <div>
          <dt>En {sucursal.name}</dt>
          <dd>{disponibles.join(' · ')}{noDisponibles.length > 0 && <span className="v2-pie-no"> · No disponible: {noDisponibles.join(', ')}</span>}</dd>
        </div>
        <div>
          <dt>Pago en el local</dt>
          <dd>{PAGOS.map(p => p.texto).join(' · ')}</dd>
        </div>
      </dl>

      <div className="v2-pie-final">
        <div className="v2-pie-redes">
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook de Casa del Pollo"><Icono nombre="facebook-logo" /></a>
          <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Casa del Pollo"><Icono nombre="instagram-logo" /></a>
        </div>
        <p>© Casa del Pollo</p>
      </div>
    </footer>
  )
}
