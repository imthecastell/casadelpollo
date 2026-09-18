import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { useApp } from '../data/AppContext.jsx'
import LogoSlot from '../Components/LogoSlot.jsx'
import AvisoAirfryer from '../Components/AvisoAirfryer.jsx'
import { MarimadoImg } from '../Components/SeccionMarinados.jsx'
import { generarHorariosDisponibles, ventanaPreparacion, obtenerCocFinEfectivo } from '../data/slots.js'
import '../styles/homeV2.css'
import '../styles/menu.css'

const MARINADO_MIN = 200
const MARINADO_MAX = 2000
const MARINADO_PASO = 50

function calcularTiempoMarinado(gramos) {
  const base = 20
  const extra = Math.ceil((gramos - 300) / 100) * 5
  return gramos <= 300 ? base : base + extra
}

// Elige `cantidad` productos "al azar" pero estables durante todo el día:
// la semilla sale de la fecha (YYYY-MM-DD), así que todos ven los mismos
// destacados hasta la medianoche, y al día siguiente cambian solos.
function semillaDesdeTexto(texto) {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return h
}
function aleatorioConSemilla(semilla) {
  let estado = semilla
  return function () {
    estado |= 0; estado = (estado + 0x6D2B79F5) | 0
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function destacadosDelDia(lista, cantidad) {
  if (lista.length <= cantidad) return lista
  const hoy = new Date().toISOString().slice(0, 10)
  const azar = aleatorioConSemilla(semillaDesdeTexto(hoy))
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia.slice(0, cantidad)
}

// Mismos valores que SeccionBowls.jsx (la página real de Bowls).
const TIEMPO_BOWL_ASISTENTE = 20
const PRECIO_BASE_BOWL_ASISTENTE = 110
const GRAMOS_BASE_BOWL_ASISTENTE = 200
const BOWL_MAX_EXTRA = 400

function precioExtraBowlAsistente(producto, gramosExtra) {
  const precioKg = parseFloat(producto?.price || 0)
  return (gramosExtra / 1000) * precioKg
}

// ── Programa de lealtad (preview) ──────────────────────────────────────
// La tarjeta vive solo en este dispositivo (localStorage) — no hay
// backend real todavía. El plan acordado: 2 visitas de regalo al crear
// la tarjeta y 1 por cada visita real (la registraría el admin al
// escanear, cuando exista esa pieza); de la visita 10 a la 14 se puede
// canjear 10% una vez, de la 15 en adelante 15% una vez; canjear
// cualquiera de los dos reinicia el contador a 0.
const LEALTAD_CLAVE = 'cdp_lealtad'
const LEALTAD_VISITAS_REGALO = 2
const LEALTAD_META_10 = 10
const LEALTAD_META_15 = 15
// Simula lo que sabría el backend real una vez que exista el lector del
// admin: solo {codigoCliente, telefono, visitas} — nunca nombre/apellido,
// que quedan solo en el dispositivo que creó la tarjeta. Se llena la
// primera vez que se "escanea" (por ahora, el botón de prueba), y NO se
// borra con "Borrar tarjeta" (que solo simula perder la copia local) —
// así se puede probar de verdad el flujo de recuperar por teléfono.
const LEALTAD_BACKEND_SIM_CLAVE = 'cdp_lealtad_backend_sim'

function leerRegistroBackendSim() {
  try {
    const guardado = localStorage.getItem(LEALTAD_BACKEND_SIM_CLAVE)
    return guardado ? JSON.parse(guardado) : null
  } catch { return null }
}
function guardarRegistroBackendSim(registro) {
  try { localStorage.setItem(LEALTAD_BACKEND_SIM_CLAVE, JSON.stringify(registro)) } catch { /* modo privado */ }
}

function descuentoLealtad(visitas) {
  if (visitas >= LEALTAD_META_15) return 15
  if (visitas >= LEALTAD_META_10) return 10
  return 0
}

function generarCodigoCliente() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// El QR no muestra el teléfono en claro — codifica un payload simple que
// el lector del admin (cuando se construya) podrá decodificar para
// buscar/crear el registro. Esto es solo una ofuscación básica (base64),
// no cifrado real; cuando se conecte al backend de verdad se define el
// esquema definitivo ahí. base64 vía TextEncoder para que nombres con
// acentos/ñ no rompan btoa (que solo acepta Latin-1).
function payloadQRLealtad({ codigoCliente, nombre, apellido, telefono }) {
  const contenido = JSON.stringify({ c: codigoCliente, n: nombre, a: apellido, t: telefono })
  const binario = String.fromCharCode(...new TextEncoder().encode(contenido))
  return `CDP1:${btoa(binario)}`
}

/* Preview oculto de la navegación V2 (Home + tab bar). Ruta secreta
   /preview-v2, fuera del flujo de `vista` normal — no afecta nada de
   producción. Usa datos reales (sucursales, catálogo, WhatsApp, /api/links)
   para que el comportamiento en el celular real sea representativo; los
   botones de agregar/pedido siguen siendo decorativos (toast) para no
   tocar el carrito real, pero Cómo-llegar/WhatsApp/Instagram en Sucursales
   ya usan los hipervínculos reales de /api/links. */

const API_URL = 'https://casadelpollo-backend.onrender.com'

// A diferencia del flujo real (que siempre pide elegir sucursal al entrar),
// aquí se recuerda en este dispositivo — se pide una sola vez y las
// siguientes visitas entran directo a Home con la misma sucursal.
const SUCURSAL_CLAVE = 'cdp_v2_sucursal'

const CATEGORIAS = [
  { key: 'marinados', label: 'Marinados', match: 'Marinados', emoji: '⚡', antojo: 'Algo rápido', desc: 'Ya sazonado, listo para cocinar en minutos' },
  { key: 'preparados', label: 'Preparados', match: 'Preparados', emoji: '😋', antojo: 'Algo delicioso', desc: 'Nuggets, empanizadas, milanesas y más' },
  { key: 'fresco', label: 'Pollo fresco', match: 'Pollo Fresco', emoji: '🕐', antojo: 'Hoy tengo tiempo', desc: 'Piezas frescas para cocinar a tu manera' },
]

// Descripciones de prueba para poder armar y probar el buscador ya
// mismo — en el catálogo real este texto vendría del backend (campo
// description, todavía no existe) y se cargaría desde el admin. Punto
// de partida genérico y apetitoso: "deliciosos trozos de pollo
// [bañados/acompañados] en/de nuestra salsa/marinada X con sus
// ingredientes", igual para todos — se puede afinar producto por
// producto más adelante.
const DESCRIPCIONES_PRUEBA = {
  'A la mexicana': 'Deliciosos trozos de pollo bañados en nuestra salsa a la mexicana con jitomate, cebolla y chile.',
  'Adobado': 'Deliciosos trozos de pollo bañados en nuestro adobo de chiles secos y especias.',
  'Agridulce (a la naranja)': 'Deliciosos trozos de pollo bañados en nuestra salsa agridulce de naranja.',
  'Al pastor': 'Deliciosos trozos de pollo bañados en nuestra marinada al pastor con achiote y piña.',
  'Al pesto': 'Deliciosos trozos de pollo bañados en nuestra salsa pesto con albahaca, ajo y aceite de oliva.',
  'Almendrado': 'Deliciosos trozos de pollo bañados en nuestra salsa almendrada con especias suaves.',
  'Hoisin': 'Deliciosos trozos de pollo bañados en nuestra salsa hoisin con ajonjolí.',
  'Mostaza miel': 'Deliciosos trozos de pollo bañados en nuestra salsa de mostaza y miel.',
  'Parmesano con cilantro': 'Deliciosos trozos de pollo bañados en nuestra salsa cremosa de parmesano y cilantro fresco.',
  'Tailandés': 'Deliciosos trozos de pollo bañados en nuestra salsa tailandesa con especias y un toque de coco.',
  'Teriyaki': 'Deliciosos trozos de pollo acompañados de nuestra salsa teriyaki con morrón, cebolla y zanahoria.',
  'Albóndigas': 'Deliciosas albóndigas de pollo sazonadas, listas para preparar en air fryer.',
  'Chiles rellenos': 'Delicioso chile relleno de queso, empanizado y listo para hornear o air fryer.',
  'Empanada de brócoli coliflor y queso': 'Deliciosa empanada rellena de brócoli, coliflor y queso.',
  'Empanada de jamón y queso': 'Deliciosa empanada rellena de jamón y queso.',
  'Hamburguesa': 'Deliciosa hamburguesa de pollo, lista para preparar en air fryer o sartén.',
  'Medallón con tocino': 'Delicioso medallón de pollo envuelto en tocino.',
  'Nuggets caseros': 'Deliciosos nuggets de pollo empanizados estilo casero.',
  'Nuggets de Dinosaurio': 'Deliciosos nuggets de pollo con forma de dinosaurio, empanizados.',
  'Nuggets tempura': 'Deliciosos nuggets de pollo con empanizado estilo tempura, más crujiente.',
  'Pechuga rellena de Verdura': 'Deliciosa pechuga de pollo rellena de verduras.',
  'pechuga rellena Jamón y queso': 'Deliciosa pechuga de pollo rellena de jamón y queso.',
  'Pechuga rellena Pesto, mozzarella y espinacas': 'Deliciosa pechuga de pollo rellena de pesto, mozzarella y espinacas.',
  'Rollo Relleno': 'Delicioso rollo de pollo relleno, listo para hornear o air fryer.',
  'Tenders': 'Deliciosas tiras de pollo empanizadas y crujientes.',
  'Trozos de pollo': 'Deliciosos trozos de pollo empanizados estilo boneless.',
}
function descripcionProducto(p) {
  return DESCRIPCIONES_PRUEBA[p.name] || ''
}

// Índice de búsqueda: nombre + descripción + categoría, sin acentos ni
// mayúsculas, para que "jalapeno" encuentre "jalapeño" y viceversa.
// Cuando exista el campo real en el backend, esto solo cambia de dónde
// saca la descripción — la lógica de indexado/coincidencia queda igual.
function normalizarTexto(txt) {
  return (txt || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}
function coincideBusqueda(producto, consulta) {
  const palabras = normalizarTexto(consulta).split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return false
  const indice = normalizarTexto(`${producto.name} ${descripcionProducto(producto)} ${producto.category_name || ''}`)
  return palabras.every(palabra => indice.includes(palabra))
}

// Tip del asistente en el paso de acompañamiento — recomendación fija por
// categoría (nada de IA/chat: son rutas guiadas), resalta un complemento
// real de esa sucursal si está disponible.
const TIPS_ASISTENTE = {
  marinados: { texto: 'Los marinados se lucen con algo fresco al lado.', sugerido: 'Ensalada' },
  preparados: { texto: 'Para acompañar algo delicioso, nada como un arroz bien hecho.', sugerido: 'Arroz del día' },
  fresco: { texto: 'Si cocinas desde cero, un arroz blanco es el comodín perfecto.', sugerido: 'Arroz del día' },
  bowls: { texto: 'Tu bowl ya trae base y marinado, pero una sopa nunca sobra.', sugerido: 'Sopa Fan Si' },
}

// image_cooked_url solo es una foto real cuando el producto se puede cocinar
// (se_puede_cocinar) — en productos que no, el campo trae un recorte basura
// (ej. Ensalada/Arroz: un 10% sobrante de la imagen) que no debe usarse.
const img = (p) => (p?.se_puede_cocinar && p?.image_cooked_url) || p?.image_url || ''

// Normaliza a 10 dígitos locales (México) sin importar si venía con "+52",
// espacios o el "52" ya pegado — para que tel:/wa.me siempre reciban un
// número completo y bien formado, nunca un local de 10 dígitos a medias.
function digitosLocales(raw) {
  const digitos = (raw || '').replace(/\D/g, '')
  if (digitos.length === 12 && digitos.startsWith('52')) return digitos.slice(2)
  if (digitos.length === 10) return digitos
  return digitos.slice(-10)
}
function formatearTelefono(raw) {
  const d = digitosLocales(raw)
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : (raw || '')
}

// El dato interno sigue en 24h ("HH:MM", el formato que produce
// generarHorariosDisponibles) — esto solo formatea lo que se muestra.
function formatearHora12(hhmm) {
  if (!hhmm) return hhmm
  const [h, m] = hhmm.split(':').map(Number)
  const periodo = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${periodo}`
}

// Ruleta de horarios: un solo carrusel con las horas realmente válidas
// (calculadas por generarHorariosDisponibles) en vez de un grid de botones.
// No son dos ruletas independientes de hora/minuto porque eso permitiría
// combinaciones inválidas (fuera de horario o antes del tiempo de
// preparación) — aquí solo se puede llegar a una hora que sí existe.
const RULETA_ITEM_ALTO = 44
const RULETA_FILAS_VISIBLES = 3
function RuletaHoras({ horas, valor, onCambiar }) {
  const contRef = useRef(null)
  const timeoutRef = useRef(null)
  const padding = RULETA_ITEM_ALTO * Math.floor(RULETA_FILAS_VISIBLES / 2)

  useEffect(() => {
    const idx = horas.indexOf(valor)
    if (idx >= 0 && contRef.current) contRef.current.scrollTop = idx * RULETA_ITEM_ALTO
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function manejarScroll() {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const el = contRef.current
      if (!el) return
      const idx = Math.round(el.scrollTop / RULETA_ITEM_ALTO)
      const hora = horas[Math.max(0, Math.min(horas.length - 1, idx))]
      if (hora) onCambiar(hora)
    }, 120)
  }

  function elegir(hora) {
    const idx = horas.indexOf(hora)
    contRef.current?.scrollTo({ top: idx * RULETA_ITEM_ALTO, behavior: 'smooth' })
    onCambiar(hora)
  }

  return (
    <div className="v2-asistente-ruleta-wrap">
      <div className="v2-asistente-ruleta-marco" />
      <div className="v2-asistente-ruleta" ref={contRef} onScroll={manejarScroll} style={{ paddingTop: padding, paddingBottom: padding }}>
        {horas.map(h => (
          <div key={h} className={`v2-asistente-ruleta-item${h === valor ? ' on' : ''}`} onClick={() => elegir(h)}>
            {formatearHora12(h)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomeV2Preview() {
  const { sucursales, sucursalActiva, setSucursalActiva, productos, carrito, agregarAlCarrito, eliminarDelCarrito, cargando, diseno, schedule, cocInicio, cocFin, cocFinSabado } = useApp()
  const [tab, setTab] = useState('home')
  const [categoria, setCategoria] = useState('marinados')
  const [seleccionProducto, setSeleccionProducto] = useState(null)
  const [gramosSel, setGramosSel] = useState(300)
  const [recogidaSel, setRecogidaSel] = useState('crudo')
  const [agregadoSel, setAgregadoSel] = useState(false)
  const [mostrarAvisoSel, setMostrarAvisoSel] = useState(false)
  const [mostrarCarrito, setMostrarCarrito] = useState(false)
  const [lealtad, setLealtad] = useState(() => {
    try {
      const guardado = localStorage.getItem(LEALTAD_CLAVE)
      return guardado ? JSON.parse(guardado) : null
    } catch { return null }
  })
  const [nombreLealtad, setNombreLealtad] = useState('')
  const [apellidoLealtad, setApellidoLealtad] = useState('')
  const [telefonoLealtad, setTelefonoLealtad] = useState('')
  const [qrLealtad, setQrLealtad] = useState('')
  const [mostrarRecuperarLealtad, setMostrarRecuperarLealtad] = useState(false)
  const [telefonoRecuperar, setTelefonoRecuperar] = useState('')
  const canvasLealtadRef = useRef(null)
  const [mostrarBuscador, setMostrarBuscador] = useState(false)
  const [consultaBusqueda, setConsultaBusqueda] = useState('')
  const [asistente, setAsistente] = useState({
    abierto: false, paso: 1, personas: 2, categoria: null, producto: null,
    gramos: 300, cantidad: 1, recogida: 'crudo', complementos: {},
    bowlBaseId: '', bowlMarinadoId: '', bowlMarinadoCat: '', bowlExtraBase: 0, bowlExtraMarinado: 0,
    hora: null, asap: false, nombre: '', telefono: '', numeroOrden: null,
    agregado: false, mostrarAviso: false, confirmado: false,
  })
  const [toast, setToast] = useState('')
  const [waPopover, setWaPopover] = useState(null) // { branchName, telefono, whatsappHref }
  const [selectorSucursalAbierto, setSelectorSucursalAbierto] = useState(false)
  const [links, setLinks] = useState(null)
  const [heroIdx, setHeroIdx] = useState(0)
  const [colorTopbar, setColorTopbar] = useState(null)
  const timerRef = useRef(null)
  const topbarRef = useRef(null)
  const contenidoRef = useRef(null)

  // Restaura la sucursal guardada de una visita anterior. Si no hay
  // ninguna (o ya no existe/está activa), sucursalActiva se queda en null
  // y el render de abajo muestra la pantalla de "elige tu sucursal".
  useEffect(() => {
    if (sucursalActiva || !sucursales.length) return
    let guardadaId = null
    try { guardadaId = localStorage.getItem(SUCURSAL_CLAVE) } catch { /* modo privado */ }
    const guardada = guardadaId && sucursales.find(s => String(s.id) === guardadaId && s.active)
    if (guardada) setSucursalActiva(guardada)
  }, [sucursales, sucursalActiva, setSucursalActiva])

  useEffect(() => {
    fetch(`${API_URL}/api/links`)
      .then(r => r.json())
      .then(data => setLinks(data))
      .catch(() => setLinks({ branches: [] }))
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const mostrarToast = (msg) => setToast(msg)

  // Sin rama para "sin tarjeta": el JSX ya deja de mostrar el QR en
  // cuanto lealtad es null, así que no hace falta limpiar qrLealtad acá.
  useEffect(() => {
    if (!lealtad) return
    let vivo = true
    QRCode.toDataURL(payloadQRLealtad(lealtad), { margin: 1, width: 220 })
      .then(url => { if (vivo) setQrLealtad(url) })
      .catch(() => { if (vivo) setQrLealtad('') })
    return () => { vivo = false }
  }, [lealtad])

  function guardarLealtad(siguiente) {
    setLealtad(siguiente)
    try { localStorage.setItem(LEALTAD_CLAVE, JSON.stringify(siguiente)) } catch { /* modo privado */ }
  }

  function crearTarjetaLealtad() {
    const telefono = digitosLocales(telefonoLealtad)
    const nombre = nombreLealtad.trim()
    const apellido = apellidoLealtad.trim()
    if (!nombre || !apellido || telefono.length !== 10) return
    guardarLealtad({ codigoCliente: generarCodigoCliente(), nombre, apellido, telefono, visitas: LEALTAD_VISITAS_REGALO })
    setNombreLealtad('')
    setApellidoLealtad('')
    setTelefonoLealtad('')
  }

  function canjearDescuentoLealtad() {
    const descuento = descuentoLealtad(lealtad?.visitas || 0)
    if (!descuento) return
    guardarLealtad({ ...lealtad, visitas: 0 })
    // El canje pasaría por el admin en la vida real, así que también
    // actualiza lo que "sabe" el backend simulado.
    guardarRegistroBackendSim({ codigoCliente: lealtad.codigoCliente, telefono: lealtad.telefono, visitas: 0 })
    mostrarToast(`🎉 ${descuento}% de descuento aplicado a tu próxima orden`)
  }

  // Compone la tarjeta (QR + nombre + datos) como una sola imagen PNG en
  // un canvas oculto, y dispara la descarga — así el cliente la guarda
  // en su galería en vez de depender de un screenshot manual.
  function descargarTarjetaLealtad() {
    const canvas = canvasLealtadRef.current
    if (!lealtad || !qrLealtad || !canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height

    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#922B21')
    grad.addColorStop(1, '#5E1515')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    ctx.font = '700 40px sans-serif'
    ctx.fillText('Casa del Pollo', w / 2, 90)
    ctx.font = '600 24px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText('Programa de Lealtad', w / 2, 128)

    const qrImg = new Image()
    qrImg.onload = () => {
      const qrSize = 480
      const qrX = (w - qrSize) / 2
      const qrY = 170
      const pad = 24
      ctx.fillStyle = '#fff'
      if (ctx.roundRect) {
        ctx.beginPath()
        ctx.roundRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 20)
        ctx.fill()
      } else {
        ctx.fillRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2)
      }
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      let y = qrY + qrSize + pad * 2 + 60
      ctx.fillStyle = '#fff'
      if (lealtad.nombre) {
        ctx.font = '700 34px sans-serif'
        ctx.fillText(`${lealtad.nombre} ${lealtad.apellido}`, w / 2, y)
        y += 42
      }
      ctx.font = '600 22px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(`Cliente #${lealtad.codigoCliente}`, w / 2, y)
      y += 32
      ctx.fillText(formatearTelefono(lealtad.telefono), w / 2, y)

      const enlace = document.createElement('a')
      enlace.href = canvas.toDataURL('image/png')
      enlace.download = `tarjeta-lealtad-casadelpollo-${lealtad.codigoCliente}.png`
      enlace.click()
    }
    qrImg.src = qrLealtad
  }

  // Controles solo para probar el flujo mientras no existe el lector del
  // admin — simulan lo que haría un escaneo real en la sucursal: suma
  // una visita Y, como sería la primera vez que el admin ve esa tarjeta,
  // deja constancia en el "backend simulado" (buscable luego por teléfono).
  function simularVisitaLealtad() {
    const visitas = (lealtad?.visitas || 0) + 1
    guardarLealtad({ ...lealtad, visitas })
    guardarRegistroBackendSim({ codigoCliente: lealtad.codigoCliente, telefono: lealtad.telefono, visitas })
  }
  // Solo borra la copia local — simula perder el celular o borrar datos
  // del navegador. El registro simulado del "backend" sigue existiendo,
  // así se puede probar de verdad "Recuperar mi tarjeta" por teléfono.
  function reiniciarTarjetaLealtad() {
    guardarLealtad(null)
    try { localStorage.removeItem(LEALTAD_CLAVE) } catch { /* modo privado */ }
  }

  function recuperarTarjetaLealtad() {
    const telefono = digitosLocales(telefonoRecuperar)
    if (telefono.length !== 10) return
    const registro = leerRegistroBackendSim()
    if (!registro || registro.telefono !== telefono) {
      mostrarToast('❌ No encontramos ninguna tarjeta escaneada con ese teléfono')
      return
    }
    guardarLealtad({ codigoCliente: registro.codigoCliente, telefono: registro.telefono, visitas: registro.visitas, nombre: '', apellido: '' })
    setTelefonoRecuperar('')
    mostrarToast(`✅ Tarjeta recuperada — ${registro.visitas} visitas`)
  }

  // La barra superior "absorbe" el color de la banda que queda justo
  // detrás de ella al hacer scroll, como si fuera transparente sobre
  // el contenido — solo aplica en Home, que es lo único con bandas.
  const actualizarColorTopbar = () => {
    if (tab !== 'home' || !contenidoRef.current || !topbarRef.current) {
      setColorTopbar(null)
      return
    }
    const limite = topbarRef.current.getBoundingClientRect().bottom
    const bandas = contenidoRef.current.querySelectorAll('.v2-banda')
    let color = null
    bandas.forEach(b => {
      const r = b.getBoundingClientRect()
      if (r.top <= limite && r.bottom > limite) color = b.dataset.color
    })
    setColorTopbar(color)
  }

  useEffect(() => {
    actualizarColorTopbar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // El popup de "agregar" (Home) y la tarjeta expandida (Productos) usan
  // el mismo estado de selección — cambiar de pestaña cierra cualquiera
  // de los dos en vez de dejarlo colgado.
  function cambiarTab(t) {
    setSeleccionProducto(null)
    setGramosSel(300)
    setRecogidaSel('crudo')
    setAgregadoSel(false)
    setTab(t)
  }

  function elegirSucursal(s) {
    setSucursalActiva(s)
    try { localStorage.setItem(SUCURSAL_CLAVE, String(s.id)) } catch { /* modo privado */ }
  }

  const linkDe = (nombre) => links?.branches?.find(b => b.name === nombre)

  const marinadosImg = productos.filter(p => p.category_name === 'Marinados' && img(p))
  const preparadosImg = productos.filter(p => p.category_name === 'Preparados' && img(p))
  const nuevoProducto = productos.find(p => p.is_nuevo && img(p))
  const ensalada = productos.find(p => p.name === 'Ensalada')
  const bowlImg = img(ensalada) || img(marinadosImg[0])
  const bowlGrande = marinadosImg[1] || marinadosImg[0]
  // "Más pedidos" del Home: 6 productos al azar (marinados o preparados)
  // que cambian una vez al día, para no mostrar siempre los mismos.
  const destacadosHoy = destacadosDelDia([...marinadosImg, ...preparadosImg], 6)

  const productosBuscables = productos.filter(p => CATEGORIAS.some(c => c.match === p.category_name) && img(p))
  const resultadosBusqueda = consultaBusqueda.trim()
    ? productosBuscables.filter(p => coincideBusqueda(p, consultaBusqueda))
    : []

  const promos = [
    nuevoProducto && {
      badge: 'NUEVO', titulo: nuevoProducto.name, desc: 'Recién agregado al menú — pruébalo hoy.',
      cta: 'Ver marinados', imagen: img(nuevoProducto),
      accion: () => { cambiarTab('productos'); setCategoria('marinados') },
    },
    {
      badge: 'BOWLS', titulo: 'Arma tu Bowl', desc: 'Base + marinado + tu toque, listo en minutos.',
      cta: 'Empezar', imagen: bowlImg,
      accion: () => abrirBowlDirecto(),
    },
    marinadosImg[2] && {
      badge: 'TEMPORADA', titulo: 'Marinados listos para la sartén', desc: 'Sazonados en casa, cocina en minutos.',
      cta: 'Ver todos', imagen: img(marinadosImg[2]),
      accion: () => { cambiarTab('productos'); setCategoria('marinados') },
    },
  ].filter(Boolean)

  useEffect(() => {
    clearInterval(timerRef.current)
    if (promos.length < 2) return
    timerRef.current = setInterval(() => setHeroIdx(i => (i + 1) % promos.length), 4500)
    return () => clearInterval(timerRef.current)
  }, [promos.length])

  if (cargando) {
    return (
      <div className="v2-shell-root">
        <div className="v2-cargando">Cargando…</div>
      </div>
    )
  }

  if (!sucursalActiva) {
    const activas = sucursales.filter(s => s.active)
    const inactivas = sucursales.filter(s => !s.active)
    return (
      <div className="v2-shell-root">
        <div className="v2-selector-inicial">
          <div className="v2-selector-inicial-logo">
            <LogoSlot
              type="logotipo"
              src={diseno?.logo_original_url || diseno?.logo_url}
              mode="original"
              alt="Casa del Pollo"
              width={220} height={60}
            />
          </div>
          <div className="v2-selector-inicial-titulo">¿Dónde vas a pedir?</div>
          <div className="v2-selector-inicial-sub">Elige tu sucursal — lo recordamos para tu próxima visita</div>
          <div className="v2-selector-inicial-lista">
            {activas.length === 0 && inactivas.length === 0 && (
              <div className="v2-selector-inicial-vacio">No pudimos cargar las sucursales. Intenta de nuevo en un momento.</div>
            )}
            {activas.map(s => (
              <button key={s.id} className="v2-sheet-opcion v2-sheet-opcion-btn" onClick={() => elegirSucursal(s)}>
                <div className="v2-so-icono tel">📍</div>
                <div><div className="v2-so-nombre">{s.name}</div><div className="v2-so-detalle">{s.address}</div></div>
              </button>
            ))}
            {inactivas.map(s => (
              <div key={s.id} className="v2-sheet-opcion v2-selector-inicial-inactiva">
                <div className="v2-so-icono tel">📍</div>
                <div><div className="v2-so-nombre">{s.name}</div><div className="v2-so-detalle">Próximamente</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const catDef = CATEGORIAS.find(c => c.key === categoria)
  const productosCategoria = productos.filter(p => p.category_name === catDef.match && p.active !== false)

  // Solo Marinados escala el tiempo de cocción con el peso — Preparados
  // usa el mismo estimado fijo que ya usa el asistente para esa categoría.
  const tiempoEstimadoSel = seleccionProducto?.category_name === 'Marinados' ? calcularTiempoMarinado(gramosSel) : 20
  const precioTotalSel = seleccionProducto ? (gramosSel / 1000) * parseFloat(seleccionProducto.price || 0) : 0

  function abrirSeleccion(p) {
    setSeleccionProducto(p)
    setGramosSel(300)
    setRecogidaSel('crudo')
    setAgregadoSel(false)
  }

  function cambiarGramosSel(delta) {
    setGramosSel(prev => Math.min(MARINADO_MAX, Math.max(MARINADO_MIN, prev + delta)))
  }

  function elegirRecogidaSel(modo) {
    setRecogidaSel(modo)
    if (modo === 'cocinado' && seleccionProducto?.se_puede_cocinar !== false) {
      setMostrarAvisoSel(true)
    }
  }

  function handleAgregarSel() {
    if (!seleccionProducto) return
    agregarAlCarrito({
      tipo: 'marinado',
      nombre: seleccionProducto.name,
      gramos: gramosSel,
      recogida: recogidaSel,
      tiempoEstimado: recogidaSel === 'cocinado' ? tiempoEstimadoSel : null,
      necesitaHora: true,
      precio: seleccionProducto.price,
      precioTotal: precioTotalSel,
      imagen_url: img(seleccionProducto),
      resumen: `${seleccionProducto.name} ${gramosSel}g · ${recogidaSel === 'crudo' ? 'Crudo' : `Cocinado ~${tiempoEstimadoSel} min`} · $${precioTotalSel.toFixed(2)}`,
    })
    setAgregadoSel(true)
    setTimeout(() => {
      setAgregadoSel(false)
      setSeleccionProducto(null)
      setGramosSel(300)
      setRecogidaSel('crudo')
    }, 1200)
  }

  // ───────────────── Asistente de pedido (botón central "Crear pedido") ─────────────────
  // Wizard de pantalla completa, amigable y guiado por recomendaciones:
  // 1) ¿para cuántas personas? (calcula 250-300g/persona) → 2) ¿qué se te
  // antoja? (rápido=Marinados, delicioso=Preparados, tengo tiempo=Fresco)
  // → 3) producto → 4) configuración (pre-llenada con la recomendación) →
  // 5) sugerencia de acompañamiento (arroz/pasta/ensalada) → 6) horario →
  // 7) confirmar. Agrega al carrito real en cada paso que corresponde; el
  // paso final de "confirmar" es decorativo a propósito (no llama al
  // confirmarPedido real) para no crear pedidos de verdad desde este
  // preview oculto — solo muestra el mismo resumen que vería el cliente.
  const GRAMOS_POR_PERSONA_MIN = 250
  const GRAMOS_POR_PERSONA_MAX = 300

  function patchAsistente(patch) {
    setAsistente(prev => ({ ...prev, ...patch }))
  }

  function abrirAsistente() {
    setAsistente({
      abierto: true, paso: 0, personas: 2, categoria: null, producto: null,
      gramos: 300, cantidad: 1, recogida: 'crudo', complementos: {},
      bowlBaseId: '', bowlMarinadoId: '', bowlMarinadoCat: '', bowlExtraBase: 0, bowlExtraMarinado: 0,
      hora: null, asap: false, nombre: '', telefono: '', numeroOrden: null,
      agregado: false, mostrarAviso: false, confirmado: false,
    })
  }

  function cerrarAsistente() {
    patchAsistente({ abierto: false })
  }

  // Bowl arranca con 200g de arroz + 200g del primer marinado ya
  // preseleccionados (el usuario puede cambiarlos), en vez de forzarlo a
  // elegir ambos antes de poder agregar. bowlBasesAsistente/
  // bowlMarinadosAsistente se calculan más abajo en el render, pero para
  // cuando se llega a invocar esto (un click, después del render
  // completo) ya están listos — el orden de declaración no importa aquí.
  function idsBowlPorDefecto() {
    const base = bowlBasesAsistente.find(x => x.etiqueta === 'Arroz del día')?.producto || bowlBasesAsistente[0]?.producto
    const marinado = bowlMarinadosAsistente.find(p => p.category_name === 'Marinados') || bowlMarinadosAsistente[0]
    return { bowlBaseId: base ? String(base.id) : '', bowlMarinadoId: marinado ? String(marinado.id) : '' }
  }

  // Accesos directos a "Arma tu Bowl" fuera del asistente (Home, banda
  // verde, CTA de Productos) abren el asistente ya posicionado en el
  // paso 3 de bowls, igual que si el usuario hubiera entrado por
  // "Crear pedido" → "Arma tu Bowl".
  function abrirBowlDirecto() {
    setAsistente({
      abierto: true, paso: 3, personas: 2, categoria: 'bowls', producto: null,
      gramos: 300, cantidad: 1, recogida: 'crudo', complementos: {},
      bowlMarinadoCat: '', bowlExtraBase: 0, bowlExtraMarinado: 0,
      hora: null, asap: false, nombre: '', telefono: '', numeroOrden: null,
      agregado: false, mostrarAviso: false, confirmado: false,
      ...idsBowlPorDefecto(),
    })
  }

  // Bowl tiene su propia sección desde el arranque (paso 0): arma todo
  // en un solo paso (base+marinado+extras), sin pasar por personas/antojo.
  function elegirBowlAsistente() {
    patchAsistente({ categoria: 'bowls', paso: 3, ...idsBowlPorDefecto() })
  }
  function elegirAsistenteGuiadoAsistente() {
    patchAsistente({ paso: 1 })
  }

  function pasoAtrasAsistente() {
    if (asistente.paso <= 0) { cerrarAsistente(); return }
    if (asistente.paso === 1) { patchAsistente({ paso: 0 }); return }
    // Bowl entra directo al paso 3 desde el paso 0 (sin personas/antojo) y
    // salta el 5 (acompañamiento, redundante con su propia base) yendo del
    // 3 directo al 6 — así que de regreso también salta esos pasos.
    if (asistente.categoria === 'bowls' && (asistente.paso === 3 || asistente.paso === 6)) { patchAsistente({ paso: asistente.paso === 3 ? 0 : 3 }); return }
    patchAsistente({ paso: asistente.paso - 1 })
  }

  function cambiarPersonasAsistente(delta) {
    patchAsistente({ personas: Math.max(1, Math.min(20, asistente.personas + delta)) })
  }

  function elegirCategoriaAsistente(catKey) {
    patchAsistente({ categoria: catKey, paso: 3 })
  }

  const productosAsistente = asistente.categoria
    ? productos.filter(p => p.category_name === CATEGORIAS.find(c => c.key === asistente.categoria)?.match && p.active !== false)
    : []

  function elegirProductoAsistente(p) {
    // Precarga la config con la recomendación de 275g/persona (redondeada
    // a pasos de 50g) o 1 pieza por persona, según la categoría.
    const gramosRecomendados = Math.min(MARINADO_MAX, Math.max(MARINADO_MIN, Math.round((asistente.personas * 275) / MARINADO_PASO) * MARINADO_PASO))
    patchAsistente({ producto: p, gramos: gramosRecomendados, cantidad: asistente.personas, recogida: 'crudo', paso: 4 })
  }

  const productoAsistente = asistente.producto
  const tiempoEstimadoAsistente = calcularTiempoMarinado(asistente.gramos)
  const precioTotalAsistenteMarinado = productoAsistente ? (asistente.gramos / 1000) * parseFloat(productoAsistente.price || 0) : 0

  function cambiarGramosAsistente(delta) {
    patchAsistente({ gramos: Math.min(MARINADO_MAX, Math.max(MARINADO_MIN, asistente.gramos + delta)) })
  }

  function cambiarCantidadAsistente(delta) {
    patchAsistente({ cantidad: Math.max(1, Math.min(20, asistente.cantidad + delta)) })
  }

  function elegirRecogidaAsistente(modo) {
    patchAsistente({ recogida: modo, mostrarAviso: modo === 'cocinado' && productoAsistente?.se_puede_cocinar !== false })
  }

  // ── Bowls: mismas reglas/filtros que SeccionBowls.jsx real ──
  // Base curada a 3 opciones simples (igual que el acompañamiento del
  // asistente) en vez de mostrar todas las variantes reales de arroz/pasta.
  const bowlBasesReales = productos.filter(p =>
    p.is_bowl_base &&
    (p.category_name?.toLowerCase().includes('complement') || p.category_name?.toLowerCase().includes('extra')) &&
    p.available !== false
  )
  const bowlBasesAsistente = [
    { etiqueta: 'Arroz del día', match: (n) => n.toLowerCase().includes('arroz') },
    { etiqueta: 'Pasta', match: (n) => n.toLowerCase().includes('pasta') },
    { etiqueta: 'Ensalada', match: (n) => n.toLowerCase().includes('ensalada') },
  ]
    .map(def => ({ ...def, producto: bowlBasesReales.find(p => def.match(p.name)) }))
    .filter(x => x.producto)
  // De Preparados solo se ofrecen estas 3 (tempura, tenders, boneless sin
  // salsa) — el resto de Preparados no aplica para bowl, a diferencia de
  // Marinados y Milanesas que sí se ofrecen completos.
  const PREPARADOS_BOWL_ASISTENTE = ['Nuggets tempura', 'Tenders', 'Trozos de pollo']
  const bowlMarinadosAsistente = productos.filter(p =>
    p.is_bowl_base && p.available !== false &&
    (p.category_name?.toLowerCase().includes('marinado') ||
     p.category_name?.toLowerCase().includes('milanesa') ||
     (p.category_name?.toLowerCase().includes('preparado') && PREPARADOS_BOWL_ASISTENTE.includes(p.name)))
  )
  const bowlMarinadoGroupsAsistente = {}
  bowlMarinadosAsistente.forEach(p => {
    const cat = p.category_name || 'Otros'
    if (!bowlMarinadoGroupsAsistente[cat]) bowlMarinadoGroupsAsistente[cat] = []
    bowlMarinadoGroupsAsistente[cat].push(p)
  })

  const bowlBaseAsistente = bowlBasesAsistente.find(x => String(x.producto.id) === asistente.bowlBaseId)?.producto
  const bowlMarinadoAsistente = bowlMarinadosAsistente.find(p => String(p.id) === asistente.bowlMarinadoId)
  const bowlListoAsistente = !!(bowlBaseAsistente && bowlMarinadoAsistente)
  const gramosBaseBowlAsistente = GRAMOS_BASE_BOWL_ASISTENTE + asistente.bowlExtraBase
  const gramosMarinadoBowlAsistente = GRAMOS_BASE_BOWL_ASISTENTE + asistente.bowlExtraMarinado
  const precioBaseBowlAsistente = parseFloat(sucursalActiva?.bowl_price) || PRECIO_BASE_BOWL_ASISTENTE
  const precioTotalBowlAsistente = precioBaseBowlAsistente
    + precioExtraBowlAsistente(bowlBaseAsistente, asistente.bowlExtraBase)
    + precioExtraBowlAsistente(bowlMarinadoAsistente, asistente.bowlExtraMarinado)

  function cambiarExtraBowlAsistente(tipo, delta) {
    const campo = tipo === 'base' ? 'bowlExtraBase' : 'bowlExtraMarinado'
    const siguiente = Math.max(0, Math.min(BOWL_MAX_EXTRA, asistente[campo] + delta))
    patchAsistente({ [campo]: siguiente })
  }

  function confirmarBowlAsistente() {
    if (!bowlListoAsistente) return
    agregarAlCarrito({
      tipo: 'bowl',
      base: bowlBaseAsistente.name,
      marinado: bowlMarinadoAsistente.name,
      gramosBase: gramosBaseBowlAsistente,
      gramosMarinado: gramosMarinadoBowlAsistente,
      extraBase: asistente.bowlExtraBase,
      extraMarinado: asistente.bowlExtraMarinado,
      tiempoEstimado: TIEMPO_BOWL_ASISTENTE,
      necesitaHora: true,
      precio: precioTotalBowlAsistente,
      precioTotal: precioTotalBowlAsistente,
      imagen_referencia: bowlMarinadoAsistente.image_cooked_url || bowlMarinadoAsistente.image_url || null,
      resumen: `Bowl: ${bowlBaseAsistente.name} ${gramosBaseBowlAsistente}g + ${bowlMarinadoAsistente.name} ${gramosMarinadoBowlAsistente}g · $${precioTotalBowlAsistente.toFixed(2)} · ~${TIEMPO_BOWL_ASISTENTE} min`,
    })
    // El bowl ya trae su propia base (arroz/pasta/ensalada) — se salta el
    // paso de acompañamiento para no ofrecer lo mismo dos veces.
    patchAsistente({ paso: 6 })
  }

  function confirmarConfigAsistente() {
    if (!productoAsistente) return
    if (asistente.categoria === 'marinados') {
      agregarAlCarrito({
        tipo: 'marinado',
        nombre: productoAsistente.name,
        gramos: asistente.gramos,
        recogida: asistente.recogida,
        tiempoEstimado: asistente.recogida === 'cocinado' ? tiempoEstimadoAsistente : null,
        necesitaHora: true,
        precio: productoAsistente.price,
        precioTotal: precioTotalAsistenteMarinado,
        imagen_url: img(productoAsistente),
        resumen: `${productoAsistente.name} ${asistente.gramos}g · ${asistente.recogida === 'crudo' ? 'Crudo' : `Cocinado ~${tiempoEstimadoAsistente} min`} · $${precioTotalAsistenteMarinado.toFixed(2)}`,
      })
    } else if (asistente.categoria === 'preparados') {
      const cocina = productoAsistente.se_puede_cocinar && asistente.recogida === 'cocinado'
      agregarAlCarrito({
        tipo: 'preparado',
        nombre: productoAsistente.name,
        cantidad: asistente.cantidad,
        precioKg: productoAsistente.price,
        precio: productoAsistente.price,
        recogida: productoAsistente.se_puede_cocinar ? asistente.recogida : undefined,
        tiempoEstimado: cocina ? 20 : null,
        necesitaHora: true,
        imagen_url: img(productoAsistente),
        resumen: `${productoAsistente.name} × ${asistente.cantidad} pz${cocina ? ' · Cocinado ~20 min' : ''} · $${productoAsistente.price}/kg`,
      })
    } else {
      agregarAlCarrito({
        tipo: 'pieza',
        nombre: productoAsistente.name,
        cantidad: asistente.cantidad,
        precioKg: productoAsistente.price,
        precio: productoAsistente.price,
        imagen_url: productoAsistente.image_url,
        resumen: `${productoAsistente.name} × ${asistente.cantidad} pz · $${productoAsistente.price}/kg (se pesa al entregar)`,
      })
    }
    patchAsistente({ paso: 5 })
  }

  // Acompañamiento resumido a 4 opciones fijas (no todo Complementos) —
  // cada una se resuelve al producto real disponible en esta sucursal.
  const ACOMPANAMIENTOS_ASISTENTE = [
    { etiqueta: 'Arroz del día', match: (n) => n.toLowerCase().includes('arroz') },
    { etiqueta: 'Pasta del día', match: (n) => n.toLowerCase().includes('pasta') },
    { etiqueta: 'Ensalada', match: (n) => n.toLowerCase().includes('ensalada') },
    { etiqueta: 'Sopa Fan Si', match: (n) => n.toLowerCase().includes('fan si') },
  ]
  const complementosAsistente = ACOMPANAMIENTOS_ASISTENTE
    .map(def => ({ ...def, producto: productos.find(p => p.category_name === 'Complementos' && p.active !== false && def.match(p.name)) }))
    .filter(x => x.producto)

  function cambiarComplementoAsistente(p, delta) {
    const actual = asistente.complementos[p.id]
    const nuevaCantidad = Math.max(0, (actual?.cantidad || 0) + delta)
    if (actual?.cartId) eliminarDelCarrito(actual.cartId)

    const nuevosComplementos = { ...asistente.complementos }
    if (nuevaCantidad === 0) {
      delete nuevosComplementos[p.id]
    } else {
      const precioTotal = parseFloat(p.price || 0) * nuevaCantidad
      const cartId = agregarAlCarrito({
        tipo: 'complemento',
        nombre: p.name,
        cantidad: nuevaCantidad,
        precio: p.price,
        precioTotal,
        unidad: p.description || 'porción',
        resumen: `${p.name} × ${nuevaCantidad} ${p.description || 'porción'} · $${precioTotal.toFixed(2)}`,
      })
      nuevosComplementos[p.id] = { cantidad: nuevaCantidad, cartId }
    }
    patchAsistente({ complementos: nuevosComplementos })
  }

  // Reglas del negocio para hoy: el último turno de recogida es a las
  // 3:40pm y a partir de las 3:30pm ya no se toman más pedidos (aunque
  // técnicamente quedaran huecos de preparación antes de esa hora).
  const HORA_MAXIMA_PEDIDO_ASISTENTE = '15:30'
  const ULTIMO_HORARIO_ASISTENTE = '15:40'
  const ahoraPasadoElLimiteAsistente = (() => {
    const ahora = new Date()
    const [h, m] = HORA_MAXIMA_PEDIDO_ASISTENTE.split(':').map(Number)
    return ahora.getHours() * 60 + ahora.getMinutes() >= h * 60 + m
  })()
  const horariosAsistente = ahoraPasadoElLimiteAsistente
    ? []
    : generarHorariosDisponibles(carrito, schedule, cocInicio, cocFin, cocFinSabado).filter(h => h <= ULTIMO_HORARIO_ASISTENTE)
  const tieneCocinadosAsistente = ventanaPreparacion(carrito) === 40
  const cocFinMostradoAsistente = obtenerCocFinEfectivo(cocFin, cocFinSabado)

  function elegirHoraAsistente(hora) {
    patchAsistente({ hora, asap: false })
  }
  function elegirAsapAsistente() {
    patchAsistente({ asap: true, hora: null })
  }

  const puedeConfirmarAsistente = asistente.nombre.trim().length > 0 && (asistente.hora || asistente.asap)

  function confirmarAsistente() {
    if (!puedeConfirmarAsistente) return
    // Decorativo a propósito: genera un número de orden simulado en vez de
    // llamar al confirmarPedido real, para no crear pedidos de verdad desde
    // este preview oculto.
    const numeroOrden = Math.floor(1000 + Math.random() * 9000)
    patchAsistente({ confirmado: true, numeroOrden, paso: 8 })
  }

  return (
    // v2-shell-root en vez de un Fragment: envuelve tanto .v2-shell (el
    // shell con position:fixed) como los overlays que son sus hermanos
    // (asistente, popups, buscador — movidos fuera de .v2-shell antes por
    // el bug de z-index del banner de "Instalar app"). Solo declara los
    // tokens de marca reescalados de la Propuesta 3 (paleta intensificada);
    // al no tener position/opacity/transform no crea un stacking context
    // nuevo, así que no reintroduce ese bug.
    <div className="v2-shell-root">
    <div className="v2-shell">

      <div className="v2-topbar" ref={topbarRef} style={colorTopbar ? { background: colorTopbar } : undefined}>
        <div className="v2-tb-pill">
          <button className="v2-tb-pill-icono" onClick={() => mostrarToast('Menú con Ayuda, Recetas (próximamente) y Ajustes')}>☰</button>
          <button className="v2-tb-pill-nombre" onClick={() => setSelectorSucursalAbierto(true)}>{sucursalActiva.name}</button>
        </div>
        <div className="v2-tb-logo-wrap">
          <div className="v2-tb-logo-crop">
            <LogoSlot
              type="logotipo"
              src={diseno?.logo_original_url || diseno?.logo_url}
              mode="original"
              alt="Casa del Pollo"
              imgStyle={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        </div>
        <div className="v2-tb-derecha">
          <button className="v2-tb-btn" onClick={() => setMostrarBuscador(true)}>🔍</button>
          <button className="v2-tb-btn" onClick={() => setMostrarCarrito(true)}>
            🛒{carrito.length > 0 && <span className="v2-tb-badge">{carrito.length}</span>}
          </button>
        </div>
      </div>

      <div className="v2-contenido" ref={contenidoRef} onScroll={tab === 'home' ? actualizarColorTopbar : undefined}>

        {tab === 'home' && (
          <div className="v2-pantalla v2-pantalla-home">
            {promos.length > 0 && (
              <div className="v2-carrusel v2-carrusel-promo">
                {promos.map((p, i) => (
                  <div key={p.titulo} className={`v2-promo-slide${i === heroIdx ? ' on' : ''}`} onClick={p.accion}>
                    <img className="v2-promo-foto-completa" src={p.imagen} alt={p.titulo} />
                    <div className="v2-promo-tarjeta">
                      <div className="v2-promo-texto">
                        <div className="v2-promo-badge">{p.badge}</div>
                        <h3>{p.titulo}</h3>
                        <p>{p.desc}</p>
                      </div>
                      <button className="v2-promo-cta" onClick={(e) => { e.stopPropagation(); p.accion() }}>{p.cta}</button>
                    </div>
                  </div>
                ))}
                <div className="v2-carrusel-dots">
                  {promos.map((_, i) => <div key={i} className={`v2-cdot${i === heroIdx ? ' on' : ''}`} />)}
                </div>
              </div>
            )}

            {destacadosHoy.length > 0 && (
              <div className="v2-banda v2-banda-dorado" data-color="#C8841A">
                <div className="v2-titulo-fila">
                  <div className="v2-seccion-titulo" style={{ margin: 0 }}>Marinados más pedidos</div>
                  <div className="v2-promo-badge" style={{ margin: 0 }}>Desde $230/kg</div>
                </div>
                <div className="v2-grid-2filas">
                  {destacadosHoy.map(p => (
                    <div key={p.id} className="v2-tile-mini2" onClick={() => abrirSeleccion(p)}>
                      <div className="v2-card-foto">
                        <img src={img(p)} alt={p.name} />
                      </div>
                      <div className="v2-card-barra">
                        <div className="v2-card-barra-nombre">{p.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bowlGrande && (
              <div className="v2-banda v2-banda-verde" data-color="#2a7a4b">
                <div className="v2-seccion-titulo">Arma tu Bowl</div>
                <div className="v2-bowl-hibrido" onClick={() => abrirBowlDirecto()}>
                  <div className="v2-bowl-hibrido-foto"><img src={img(bowlGrande)} alt={bowlGrande.name} /></div>
                  <div className="v2-bowl-hibrido-panel">
                    <div className="v2-promo-badge">BOWLS</div>
                    <h3>Arma tu Bowl</h3>
                    <div className="v2-promo-fila">
                      <button className="v2-promo-cta" onClick={(e) => { e.stopPropagation(); abrirBowlDirecto() }}>Empezar</button>
                      <span className="v2-ts-precio-pill">Desde ${Number(sucursalActiva.bowl_price || 120)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {preparadosImg.length > 0 && (
              <div className="v2-banda v2-banda-rojo" data-color="#922B21">
                <div className="v2-seccion-titulo">Preparados para lucirte</div>
                <div className="v2-strip-grandes">
                  {preparadosImg.slice(0, 6).map(p => (
                    <div key={p.id} className="v2-tarjeta-grande-strip" onClick={() => abrirSeleccion(p)}>
                      <div className="v2-card-foto"><img src={img(p)} alt={p.name} /></div>
                      <div className="v2-card-barra">
                        <div className="v2-card-barra-nombre">{p.name}</div>
                        <div className="v2-ts-precio-pill">${Number(p.price)}</div>
                      </div>
                      <button className="v2-ts-add" onClick={(e) => { e.stopPropagation(); abrirSeleccion(p) }}>+</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'productos' && (
          <div className="v2-pantalla">
            <div className="v2-pills">
              <div className="v2-pill-fondo" style={{ transform: `translateX(${CATEGORIAS.findIndex(c => c.key === categoria) * 100}%)` }} />
              {CATEGORIAS.map(c => (
                <div key={c.key} className={`v2-pill${categoria === c.key ? ' on' : ''}`} onClick={() => { setCategoria(c.key); setSeleccionProducto(null) }}>
                  {c.label}
                </div>
              ))}
            </div>

            <div className="v2-bowls-cta" onClick={() => abrirBowlDirecto()}>
              <div className="v2-bowls-emoji">🥗</div>
              <div className="v2-bowls-txt">
                <strong>¿Poco tiempo? Pide un Bowl</strong>
                <span>Base + marinado + tu toque, listo en minutos</span>
              </div>
              <div className="v2-bowls-precio">Desde ${Number(sucursalActiva.bowl_price || 120)}</div>
            </div>

            <div className="v2-grid-simple">
              {productosCategoria.map(p => (
                <div key={p.id} className="v2-tarjeta-simple" onClick={() => abrirSeleccion(p)}>
                  <img src={img(p)} alt={p.name} />
                  <div className="v2-ts-scrim" />
                  <div className="v2-ts-precio-top">${Number(p.price)}{categoria === 'marinados' ? '/kg' : ''}</div>
                  <div className="v2-ts-overlay">
                    <div className="v2-ts-nombre">{p.name}</div>
                  </div>
                </div>
              ))}
            </div>

            {categoria === 'fresco' && (
              <div className="v2-idea-card">
                <div className="v2-emoji">💡</div>
                <div className="v2-ic-txt"><b>Ideas para cocinarlo</b><span>Recetas y sugerencias de la semana</span></div>
                <div className="v2-badge-pronto">PRÓXIMAMENTE</div>
              </div>
            )}
          </div>
        )}

        {tab === 'sucursales' && (
          <div className="v2-pantalla">
            <div className="v2-saludo">Sucursales</div>
            <div className="v2-saludo-sub">Las {sucursales.length}, sin recortar</div>

            <a className="v2-ig-cta" href={links?.branches?.[0]?.instagram || 'https://www.instagram.com/casadelpollolm/'} target="_blank" rel="noopener noreferrer">
              <div className="v2-ig-icono">📷</div>
              <div className="v2-sc-nombre" style={{ fontSize: 13 }}>Síguenos en Instagram</div>
              <div className="v2-ig-flecha">→</div>
            </a>

            {sucursales.map(s => {
              const l = linkDe(s.name)
              const telefono = digitosLocales(l?.telefonos?.[0] || s.phone)
              const whatsappHref = l?.whatsapp || (s.whatsapp ? `https://wa.me/52${s.whatsapp}` : null)
              const mapaHref = l?.googleMaps || l?.appleMaps
              return (
                <div key={s.id} className="v2-suc-full">
                  <div className="v2-sc-nombre">{s.name}</div>
                  <div className="v2-sc-dir">{s.address}</div>
                  <div className="v2-sc-btns3">
                    <button
                      className="v2-sc-btn v2-sc-btn-pedido"
                      onClick={() => {
                        if (s.id !== sucursalActiva.id) { setSucursalActiva(s); mostrarToast(`Ahora pidiendo en ${s.name}`) }
                        cambiarTab('productos')
                      }}
                    >
                      <span>🛒</span>Pedido
                    </button>
                    {mapaHref
                      ? <a className="v2-sc-btn v2-sc-btn-mapa" href={mapaHref} target="_blank" rel="noopener noreferrer"><span>📍</span>Cómo llegar</a>
                      : <button className="v2-sc-btn v2-sc-btn-mapa" disabled><span>📍</span>Cómo llegar</button>}
                    <button className="v2-sc-btn v2-sc-btn-wa" onClick={() => setWaPopover({ nombre: s.name, telefono, whatsappHref })}>
                      <span>💬</span>WhatsApp
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'lealtad' && (
          <div className="v2-pantalla">
            <div className="v2-saludo">Lealtad</div>

            {!lealtad ? (
              <>
                <div className="v2-lealtad-intro">
                  <div className="v2-lealtad-intro-emoji">🎁</div>
                  <h3>Únete al programa de lealtad</h3>
                  <p>Recibe 2 visitas de regalo al crear tu tarjeta y 1 visita más por cada pedido en sucursal.</p>
                  <div className="v2-lealtad-metas">
                    <div><b>10 visitas</b><span>10% de descuento</span></div>
                    <div><b>15 visitas</b><span>15% de descuento</span></div>
                  </div>
                </div>
                <div className="v2-lealtad-fila2">
                  <div>
                    <label className="config-label">Nombre</label>
                    <input
                      className="v2-lealtad-input"
                      type="text"
                      placeholder="Tu nombre"
                      value={nombreLealtad}
                      onChange={e => setNombreLealtad(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="config-label">Apellido</label>
                    <input
                      className="v2-lealtad-input"
                      type="text"
                      placeholder="Tu apellido"
                      value={apellidoLealtad}
                      onChange={e => setApellidoLealtad(e.target.value)}
                    />
                  </div>
                </div>
                <label className="config-label">Tu número de celular</label>
                <input
                  className="v2-lealtad-input"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10 dígitos"
                  value={telefonoLealtad}
                  onChange={e => setTelefonoLealtad(e.target.value)}
                />
                <p className="v2-lealtad-nota">Estos datos no se guardan en ningún servidor — solo se usan para generar la imagen de tu tarjeta, que tú mismo guardas en tu celular.</p>
                <button
                  className="btn-primario"
                  style={{ marginTop: 6 }}
                  disabled={!nombreLealtad.trim() || !apellidoLealtad.trim() || digitosLocales(telefonoLealtad).length !== 10}
                  onClick={crearTarjetaLealtad}
                >
                  Crear mi tarjeta
                </button>

                <button className="v2-lealtad-link" onClick={() => setMostrarRecuperarLealtad(v => !v)}>
                  ¿Ya tienes una tarjeta? Recuperarla con tu teléfono
                </button>
                {mostrarRecuperarLealtad && (
                  <div className="v2-lealtad-recuperar">
                    <input
                      className="v2-lealtad-input"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Tu teléfono (10 dígitos)"
                      value={telefonoRecuperar}
                      onChange={e => setTelefonoRecuperar(e.target.value)}
                    />
                    <p className="v2-lealtad-nota">Solo se puede recuperar una tarjeta que ya haya sido escaneada al menos una vez en sucursal. Si nunca la escanearon, no hay forma de validarla — tendrás que crear una nueva.</p>
                    <button
                      className="btn-primario"
                      disabled={digitosLocales(telefonoRecuperar).length !== 10}
                      onClick={recuperarTarjetaLealtad}
                    >
                      Buscar mi tarjeta
                    </button>
                  </div>
                )}
              </>
            ) : (() => {
              const descuento = descuentoLealtad(lealtad.visitas)
              const meta = lealtad.visitas < LEALTAD_META_10 ? LEALTAD_META_10 : LEALTAD_META_15
              const progreso = Math.min(100, Math.round((lealtad.visitas / meta) * 100))
              return (
                <>
                  <div className="v2-lealtad-tarjeta">
                    {qrLealtad && <img src={qrLealtad} alt="Código de tu tarjeta de lealtad" className="v2-lealtad-qr" />}
                    {lealtad.nombre && <div className="v2-lealtad-nombre">{lealtad.nombre} {lealtad.apellido}</div>}
                    <div className="v2-lealtad-codigo">Cliente #{lealtad.codigoCliente}</div>
                    <div className="v2-lealtad-tel">{formatearTelefono(lealtad.telefono)}</div>
                  </div>
                  <button className="v2-sc-btn v2-sc-btn-mapa" style={{ width: '100%', flexDirection: 'row', gap: 8, marginBottom: 14 }} onClick={descargarTarjetaLealtad}>
                    <span>⬇️</span>Guardar tarjeta como imagen
                  </button>
                  <canvas ref={canvasLealtadRef} width={720} height={960} style={{ display: 'none' }} />

                  <div className="v2-lealtad-progreso-card">
                    <div className="v2-lealtad-visitas">
                      <b>{lealtad.visitas}</b> {lealtad.visitas === 1 ? 'visita' : 'visitas'}
                    </div>
                    {descuento > 0 ? (
                      <>
                        <p className="v2-lealtad-msg">🎉 Tienes <b>{descuento}%</b> de descuento disponible</p>
                        <button className="btn-primario" onClick={canjearDescuentoLealtad}>Canjear {descuento}%</button>
                      </>
                    ) : (
                      <>
                        <div className="v2-lealtad-barra"><div style={{ width: `${progreso}%` }} /></div>
                        <p className="v2-lealtad-msg">Te faltan <b>{meta - lealtad.visitas}</b> {meta - lealtad.visitas === 1 ? 'visita' : 'visitas'} para tu {meta === LEALTAD_META_10 ? '10%' : '15%'} de descuento</p>
                      </>
                    )}
                  </div>

                  <div className="v2-lealtad-dev">
                    <p>🧪 Pruebas — todavía no existe el lector del admin</p>
                    <div className="v2-lealtad-dev-btns">
                      <button className="v2-sc-btn v2-sc-btn-mapa" onClick={simularVisitaLealtad}>+1 visita (simular escaneo)</button>
                      <button className="v2-sc-btn v2-sc-btn-mapa" onClick={reiniciarTarjetaLealtad}>Borrar tarjeta</button>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}

      </div>

      {toast && <div className="v2-toast on">{toast}</div>}

      {selectorSucursalAbierto && (
        <div className="v2-sheet-overlay on" onClick={(e) => { if (e.target === e.currentTarget) setSelectorSucursalAbierto(false) }}>
          <div className="v2-sheet">
            <div className="v2-sheet-handle" />
            <div className="v2-sheet-titulo">Cambiar de sucursal</div>
            <div className="v2-sheet-sub">Vas a ver el catálogo y precios de la sucursal que elijas</div>
            {sucursales.map(s => (
              <button key={s.id} className="v2-sheet-opcion v2-sheet-opcion-btn" onClick={() => { elegirSucursal(s); setSelectorSucursalAbierto(false); mostrarToast(`Ahora pidiendo en ${s.name}`) }}>
                <div className="v2-so-icono tel">📍</div>
                <div><div className="v2-so-nombre">{s.name}</div><div className="v2-so-detalle">{s.address}</div></div>
                {s.id === sucursalActiva.id && <span className="v2-sheet-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {waPopover && (
        <div className="v2-sheet-overlay on" onClick={(e) => { if (e.target === e.currentTarget) setWaPopover(null) }}>
          <div className="v2-sheet">
            <div className="v2-sheet-handle" />
            <div className="v2-sheet-titulo">{waPopover.nombre}</div>
            <div className="v2-sheet-sub">¿Cómo prefieres comunicarte?</div>
            <a className="v2-sheet-opcion" href={waPopover.telefono ? `tel:+52${waPopover.telefono}` : undefined} onClick={e => !waPopover.telefono && e.preventDefault()}>
              <div className="v2-so-icono tel">📞</div>
              <div><div className="v2-so-nombre">Llamar</div><div className="v2-so-detalle">{waPopover.telefono ? formatearTelefono(waPopover.telefono) : 'No disponible'}</div></div>
            </a>
            <a className="v2-sheet-opcion" href={waPopover.whatsappHref || undefined} target="_blank" rel="noopener noreferrer" onClick={e => !waPopover.whatsappHref && e.preventDefault()}>
              <div className="v2-so-icono wa">💬</div>
              <div><div className="v2-so-nombre">Mensaje (WhatsApp)</div><div className="v2-so-detalle">Abre un chat prellenado</div></div>
            </a>
          </div>
        </div>
      )}

      {/* Buscador: indexa nombre + descripción (de prueba, ver
          DESCRIPCIONES_PRUEBA) + categoría de los 3 tipos de producto.
          z-index más bajo que el popup de agregar, para que seleccionar
          un resultado abra el popup por encima del buscador. */}
      {mostrarBuscador && (
        <div className="v2-buscador-overlay">
          <div className="v2-asistente-header">
            <div className="v2-buscador-campo">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Busca por sabor, ingrediente o antojo…"
                value={consultaBusqueda}
                onChange={e => setConsultaBusqueda(e.target.value)}
                autoFocus
              />
            </div>
            <button className="v2-asistente-cerrar" onClick={() => { setMostrarBuscador(false); setConsultaBusqueda('') }}>✕</button>
          </div>
          <div className="v2-asistente-contenido">
            {!consultaBusqueda.trim() ? (
              <p className="v2-sheet-sub">Prueba con algo como "picante", "para niños", "dulce" o "sin salsa".</p>
            ) : resultadosBusqueda.length === 0 ? (
              <p className="v2-sheet-sub">No encontramos productos con esas palabras.</p>
            ) : (
              <div className="v2-grid-simple">
                {resultadosBusqueda.map(p => (
                  <div key={p.id} className="v2-tarjeta-simple" onClick={() => { abrirSeleccion(p); setMostrarBuscador(false) }}>
                    <img src={img(p)} alt={p.name} />
                    <div className="v2-ts-scrim" />
                    <div className="v2-ts-precio-top">${Number(p.price)}{p.category_name === 'Marinados' ? '/kg' : ''}</div>
                    <div className="v2-ts-overlay">
                      <div className="v2-ts-nombre">{p.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popup de "agregar al carrito" (gramos + crudo/cocinado):
          único camino para agregar, tanto en Home como en cualquier
          categoría de Productos — se probó la tarjeta expandida con
          foto grande en línea para Marinados y este popup se ve mejor,
          así que se unificó todo aquí. */}
      {seleccionProducto && (
        <div className="v2-sheet-overlay on" onClick={(e) => { if (e.target === e.currentTarget) setSeleccionProducto(null) }}>
          <div className="v2-sheet">
            <div className="v2-sheet-handle" />
            <div className="v2-asistente-bowl-seleccionado" style={{ marginBottom: 16 }}>
              <MarimadoImg imageUrl={seleccionProducto.image_url} imageCookedUrl={seleccionProducto.image_cooked_url} isSelected recogida={recogidaSel} />
              <span>{seleccionProducto.name}</span>
              <button onClick={() => setSeleccionProducto(null)}>cerrar ✕</button>
            </div>

            <label className="config-label">Cantidad</label>
            <div className="cantidad-ctrl">
              <button className="cantidad-btn" onClick={() => cambiarGramosSel(-MARINADO_PASO)} disabled={gramosSel <= MARINADO_MIN}>−</button>
              <span className="cantidad-num" style={{ fontSize: 20, minWidth: 60, textAlign: 'center' }}>{gramosSel}g</span>
              <button className="cantidad-btn" onClick={() => cambiarGramosSel(MARINADO_PASO)} disabled={gramosSel >= MARINADO_MAX}>+</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--texto-suave)', margin: '6px 0 16px' }}>
              {MARINADO_MIN}g — {MARINADO_MAX}g · intervalos de {MARINADO_PASO}g
            </div>

            {seleccionProducto.se_puede_cocinar && sucursalActiva?.servicio_cocinado !== false && (
              <>
                <label className="config-label">¿Cómo lo quieres?</label>
                <div className="recogida-opts" style={{ marginBottom: 16 }}>
                  <button
                    className={`recogida-opt ${recogidaSel === 'crudo' ? 'recogida-activo' : ''}`}
                    onClick={() => elegirRecogidaSel('crudo')}
                  >
                    <span style={{ fontSize: 20 }}>📦</span>
                    <div>
                      <div className="recogida-titulo">Recoger crudo</div>
                      <div className="recogida-sub">Listo para llevar</div>
                    </div>
                  </button>
                  <button
                    className={`recogida-opt ${recogidaSel === 'cocinado' ? 'recogida-activo' : ''}`}
                    onClick={() => elegirRecogidaSel('cocinado')}
                  >
                    <span style={{ fontSize: 20 }}>🔥</span>
                    <div>
                      <div className="recogida-titulo">Recoger cocinado</div>
                      <div className="recogida-sub">Listo en ~{tiempoEstimadoSel} min</div>
                    </div>
                  </button>
                </div>
              </>
            )}

            <button
              className={`btn-primario ${agregadoSel ? 'btn-agregado' : ''}`}
              onClick={handleAgregarSel}
            >
              {agregadoSel ? '✓ Agregado' : `Agregar ${gramosSel}g · $${precioTotalSel.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}

      {mostrarCarrito && (
        <div className="v2-sheet-overlay on" onClick={(e) => { if (e.target === e.currentTarget) setMostrarCarrito(false) }}>
          <div className="v2-sheet">
            <div className="v2-sheet-handle" />
            <div className="v2-sheet-titulo">Tu carrito</div>

            {carrito.length === 0 ? (
              <p className="v2-sheet-sub">Todavía no agregas nada.</p>
            ) : (
              <>
                <div className="v2-carrito-lista">
                  {carrito.map(item => {
                    const alPesar = item.tipo === 'pieza' || item.tipo === 'preparado' || item.tipo === 'milanesa'
                    const precio = parseFloat(item.precioTotal || item.precio || 0)
                    return (
                      <div key={item.id} className="v2-carrito-item">
                        {item.imagen_url && <img src={item.imagen_url} alt="" />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="v2-carrito-item-nombre">{item.nombre}</div>
                          {item.resumen && <div className="v2-carrito-item-detalle">{item.resumen}</div>}
                        </div>
                        <div className="v2-carrito-item-precio">{alPesar ? 'Al pesar' : `$${precio.toFixed(2)}`}</div>
                        <button className="v2-carrito-item-quitar" onClick={() => eliminarDelCarrito(item.id)} aria-label={`Quitar ${item.nombre}`}>✕</button>
                      </div>
                    )
                  })}
                </div>
                <div className="v2-carrito-total">
                  <span>Total estimado</span>
                  <b>
                    ${carrito.reduce((sum, item) => {
                      if (item.tipo === 'pieza' || item.tipo === 'preparado' || item.tipo === 'milanesa') return sum
                      return sum + parseFloat(item.precioTotal || item.precio || 0)
                    }, 0).toFixed(2)}
                  </b>
                </div>
              </>
            )}

            <button className="btn-primario" style={{ marginTop: 16 }} onClick={() => setMostrarCarrito(false)}>
              {carrito.length === 0 ? 'Ver el menú' : 'Seguir pidiendo'}
            </button>
          </div>
        </div>
      )}

      {mostrarAvisoSel && <AvisoAirfryer onCerrar={() => setMostrarAvisoSel(false)} />}

      <div className="v2-tabbar">
        <button className={`v2-tab${tab === 'home' ? ' on' : ''}`} onClick={() => cambiarTab('home')}><span className="v2-ticono">🏠</span><span className="v2-tlabel">Home</span></button>
        <button className={`v2-tab${tab === 'productos' ? ' on' : ''}`} onClick={() => cambiarTab('productos')}><span className="v2-ticono">📋</span><span className="v2-tlabel">Productos</span></button>
        <div className="v2-tab-central-wrap">
          <div className="v2-tab-central" onClick={abrirAsistente}>🍗</div>
          <div className="v2-tab-central-label">Crear pedido</div>
        </div>
        <button className={`v2-tab${tab === 'sucursales' ? ' on' : ''}`} onClick={() => cambiarTab('sucursales')}><span className="v2-ticono">📍</span><span className="v2-tlabel">Sucursales</span></button>
        <button className={`v2-tab${tab === 'lealtad' ? ' on' : ''}`} onClick={() => cambiarTab('lealtad')}><span className="v2-ticono">🎁</span><span className="v2-tlabel">Lealtad</span></button>
      </div>
    </div>

      {asistente.abierto && asistente.paso === 0 && (
        <div className="v2-asistente">
          <div className="v2-asistente-header">
            <div className="v2-asistente-atras" style={{ visibility: 'hidden' }} />
            <div className="v2-asistente-progreso" />
            <button className="v2-asistente-cerrar" onClick={cerrarAsistente}>✕</button>
          </div>
          <div className="v2-asistente-contenido">
            <div className="v2-asistente-titulo">¿Qué quieres pedir hoy?</div>
            <div className="v2-asistente-cats">
              <button className="v2-asistente-cat" onClick={elegirBowlAsistente}>
                <span className="v2-asistente-cat-emoji">🥗</span>
                <div>
                  <div className="v2-asistente-cat-nombre">Arma tu Bowl</div>
                  <div className="v2-asistente-cat-desc">Base + marinado cocinado, es individual — listo en minutos</div>
                </div>
                <span className="v2-asistente-cat-flecha">›</span>
              </button>
              <button className="v2-asistente-cat" onClick={elegirAsistenteGuiadoAsistente}>
                <span className="v2-asistente-cat-emoji">🍗</span>
                <div>
                  <div className="v2-asistente-cat-nombre">Continuar al asistente</div>
                  <div className="v2-asistente-cat-desc">Te ayudamos a elegir según cuántos son y qué se te antoja</div>
                </div>
                <span className="v2-asistente-cat-flecha">›</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {asistente.abierto && asistente.paso === 8 && (
        <div className="v2-asistente">
          <div className="v2-asistente-confirmado">
            <LogoSlot type="logotipo" src={diseno?.logo_original_url || diseno?.logo_url} mode="original" width={150} height={35} />
            <div className="v2-asistente-confirmado-emoji">🎉</div>
            <div className="v2-asistente-confirmado-titulo">¡Pedido recibido!</div>
            <p className="v2-asistente-confirmado-suc">{sucursalActiva?.name}</p>

            <div className="v2-asistente-recibo">
              <div className="v2-asistente-recibo-orden">
                <p>Número de orden</p>
                <p>{asistente.numeroOrden}</p>
              </div>
              <div className="v2-asistente-recibo-hora">
                <span>Hora de recogida</span>
                <span>{asistente.asap ? '⚡ Lo antes posible' : formatearHora12(asistente.hora)}</span>
              </div>
              <p className="v2-asistente-recibo-pago">Pago en el local al recoger</p>
            </div>

            <p className="v2-asistente-confirmado-nota">
              Vista previa — esto llamaría a confirmarPedido en producción y generaría un número de orden real.
            </p>

            <button className="btn-primario" onClick={cerrarAsistente}>Cerrar</button>
          </div>
        </div>
      )}

      {asistente.abierto && asistente.paso > 0 && asistente.paso < 8 && (
        <div className="v2-asistente">
          <div className="v2-asistente-header">
            <button className="v2-asistente-atras" onClick={pasoAtrasAsistente}>‹</button>
            <div className="v2-asistente-progreso">
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <div key={n} className={`v2-asistente-punto${asistente.paso >= n ? ' on' : ''}`} />
              ))}
            </div>
            <button className="v2-asistente-cerrar" onClick={cerrarAsistente}>✕</button>
          </div>

          <div className="v2-asistente-contenido">
            {asistente.paso === 1 && (
              <>
                <div className="v2-asistente-titulo">¿Para cuántas personas cocinamos hoy?</div>
                <p className="v2-asistente-sub">Con eso te recomendamos la cantidad justa, ni de más ni de menos.</p>
                <div className="v2-asistente-personas">
                  <button className="cantidad-btn" onClick={() => cambiarPersonasAsistente(-1)} disabled={asistente.personas <= 1}>−</button>
                  <div className="v2-asistente-personas-num">
                    <span>{asistente.personas}</span>
                    <span className="v2-asistente-personas-label">{asistente.personas === 1 ? 'persona' : 'personas'}</span>
                  </div>
                  <button className="cantidad-btn" onClick={() => cambiarPersonasAsistente(1)} disabled={asistente.personas >= 20}>+</button>
                </div>
                <div className="v2-asistente-recomendacion">
                  🍗 Recomendado: <b>{asistente.personas * GRAMOS_POR_PERSONA_MIN}g – {asistente.personas * GRAMOS_POR_PERSONA_MAX}g</b> de pollo (250-300g por persona)
                </div>
                <button className="btn-primario" onClick={() => patchAsistente({ paso: 2 })}>Continuar →</button>
              </>
            )}

            {asistente.paso === 2 && (
              <>
                <div className="v2-asistente-titulo">¿Qué se te antoja?</div>
                <p className="v2-asistente-sub">Para {asistente.personas} {asistente.personas === 1 ? 'persona' : 'personas'}</p>
                <div className="v2-asistente-cats">
                  {CATEGORIAS.map(c => (
                    <button key={c.key} className="v2-asistente-cat" onClick={() => elegirCategoriaAsistente(c.key)}>
                      <span className="v2-asistente-cat-emoji">{c.emoji}</span>
                      <div>
                        <div className="v2-asistente-cat-nombre">{c.antojo}</div>
                        <div className="v2-asistente-cat-desc">{c.desc}</div>
                      </div>
                      <span className="v2-asistente-cat-flecha">›</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {asistente.paso === 3 && asistente.categoria === 'bowls' && (
              <>
                <div className="v2-asistente-titulo">Arma tu bowl</div>
                <p className="v2-asistente-sub">200g de base + 200g de marinado cocinado · extras en intervalos de 50g</p>

                <div className="v2-asistente-bowl-card">
                  <div className="v2-asistente-bowl-head">
                    <span>Base</span>
                    <span>{gramosBaseBowlAsistente}g</span>
                  </div>
                  <div className="v2-asistente-bowl-opciones">
                    {bowlBasesAsistente.map(({ etiqueta, producto }) => (
                      <button
                        key={producto.id}
                        className={`v2-asistente-bowl-opcion${asistente.bowlBaseId === String(producto.id) ? ' on' : ''}`}
                        onClick={() => patchAsistente({ bowlBaseId: String(producto.id) })}
                      >
                        <img src={img(producto)} alt="" />
                        {etiqueta}
                      </button>
                    ))}
                  </div>
                  {bowlBaseAsistente && (
                    <div className="cantidad-ctrl" style={{ marginTop: 8 }}>
                      <button className="cantidad-btn" onClick={() => cambiarExtraBowlAsistente('base', -MARINADO_PASO)} disabled={asistente.bowlExtraBase <= 0}>−</button>
                      <span className="cantidad-num">{asistente.bowlExtraBase > 0 ? `+${asistente.bowlExtraBase}g` : 'sin extra'}</span>
                      <button className="cantidad-btn" onClick={() => cambiarExtraBowlAsistente('base', MARINADO_PASO)} disabled={asistente.bowlExtraBase >= BOWL_MAX_EXTRA}>+</button>
                    </div>
                  )}
                </div>

                <div className="v2-asistente-bowl-card">
                  <div className="v2-asistente-bowl-head">
                    <span>Marinado (cocinado)</span>
                    <span>{gramosMarinadoBowlAsistente}g</span>
                  </div>

                  {bowlMarinadoAsistente ? (
                    <div className="v2-asistente-bowl-seleccionado">
                      <img src={bowlMarinadoAsistente.image_cooked_url || bowlMarinadoAsistente.image_url} alt="" />
                      <span>{bowlMarinadoAsistente.name}{bowlMarinadoAsistente.category_name === 'Milanesas' ? ' · 1 pz' : ''}</span>
                      <button onClick={() => patchAsistente({ bowlMarinadoId: '' })}>cambiar ✕</button>
                    </div>
                  ) : (
                    Object.entries(bowlMarinadoGroupsAsistente).map(([catName, items]) => {
                      const abierto = asistente.bowlMarinadoCat === catName
                      return (
                        <div key={catName} className="v2-asistente-bowl-grupo">
                          <button className={`v2-asistente-bowl-grupo-head${abierto ? ' on' : ''}`} onClick={() => patchAsistente({ bowlMarinadoCat: abierto ? '' : catName })}>
                            <span>{catName}</span>
                            <span>{items.length} opciones {abierto ? '▲' : '▼'}</span>
                          </button>
                          {/* Marinados: cada sabor se ve muy distinto en foto (adobado,
                              pesto, teriyaki...), así que vale la pena una cuadrícula de
                              fotos grandes. Milanesas y Preparados son variantes de un
                              mismo corte/producto (solo cambia el sazonado o la salsa) y
                              comparten prácticamente la misma foto — mostrar 19 fotos
                              casi idénticas de milanesas no aporta nada, así que ahí se
                              deja una sola foto grande representativa y se listan los
                              sabores como texto. */}
                          {abierto && (
                            catName === 'Marinados' ? (
                              <div className="v2-grid-simple" style={{ marginTop: 8 }}>
                                {items.map(item => (
                                  <button
                                    key={item.id}
                                    className="v2-tarjeta-simple v2-asistente-producto"
                                    onClick={() => patchAsistente({ bowlMarinadoId: String(item.id), bowlMarinadoCat: '' })}
                                  >
                                    <img src={img(item)} alt={item.name} />
                                    <div className="v2-ts-scrim" />
                                    <div className="v2-ts-overlay">
                                      <div className="v2-ts-nombre">{item.name}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div style={{ marginTop: 8 }}>
                                <div className="v2-asistente-bowl-grupo-foto">
                                  <img src={img(items[0])} alt={catName} />
                                </div>
                                <div className="v2-asistente-bowl-grupo-sabores">
                                  {items.map(item => (
                                    <button key={item.id} onClick={() => patchAsistente({ bowlMarinadoId: String(item.id), bowlMarinadoCat: '' })}>
                                      {item.name}{catName === 'Milanesas' ? ' · 1 pz' : ''}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )
                    })
                  )}

                  {bowlMarinadoAsistente && (
                    <div className="cantidad-ctrl" style={{ marginTop: 8 }}>
                      <button className="cantidad-btn" onClick={() => cambiarExtraBowlAsistente('marinado', -MARINADO_PASO)} disabled={asistente.bowlExtraMarinado <= 0}>−</button>
                      <span className="cantidad-num">{asistente.bowlExtraMarinado > 0 ? `+${asistente.bowlExtraMarinado}g` : 'sin extra'}</span>
                      <button className="cantidad-btn" onClick={() => cambiarExtraBowlAsistente('marinado', MARINADO_PASO)} disabled={asistente.bowlExtraMarinado >= BOWL_MAX_EXTRA}>+</button>
                    </div>
                  )}
                </div>

                <div className="v2-asistente-recomendacion">
                  💲 Total del bowl: <b>${precioTotalBowlAsistente.toFixed(2)}</b> · listo en ~{TIEMPO_BOWL_ASISTENTE} min
                </div>

                <button className="btn-primario" disabled={!bowlListoAsistente} onClick={confirmarBowlAsistente}>
                  Agregar bowl y continuar →
                </button>
              </>
            )}

            {asistente.paso === 3 && asistente.categoria !== 'bowls' && (
              <>
                <div className="v2-asistente-titulo">Elige tu {CATEGORIAS.find(c => c.key === asistente.categoria)?.label.toLowerCase()}</div>
                <div className="v2-grid-simple">
                  {productosAsistente.map(p => (
                    <button key={p.id} className="v2-tarjeta-simple v2-asistente-producto" onClick={() => elegirProductoAsistente(p)}>
                      <img src={img(p)} alt={p.name} />
                      <div className="v2-ts-scrim" />
                      <div className="v2-ts-precio-top">${Number(p.price)}{asistente.categoria === 'marinados' ? '/kg' : ''}</div>
                      <div className="v2-ts-overlay">
                        <div className="v2-ts-nombre">{p.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {asistente.paso === 4 && productoAsistente && (
              <>
                <div className="v2-asistente-titulo">Configura tu pedido</div>

                {asistente.categoria === 'marinados' ? (
                  // Misma foto grande conectada al detalle que en la pestaña
                  // Productos, para que seleccionar un marinado se vea igual
                  // sin importar si viene del asistente o del catálogo. Aquí
                  // no hace falta "península" porque no hay hueco de grid que
                  // tapar: la foto y la tarjeta ya quedan pegadas en el flujo
                  // normal de la pantalla. flexShrink:0 evita que el flex
                  // column de .v2-asistente-contenido aplaste esta tarjeta
                  // (su overflow:hidden la vuelve encogible a 0 por defecto)
                  // en vez de simplemente hacer scroll.
                  <div style={{ flexShrink: 0 }}>
                    <div className="v2-tarjeta-simple v2-tarjeta-relleno v2-tarjeta-relleno-ancha">
                      <div className="v2-tarjeta-relleno-foto">
                        <img src={img(productoAsistente)} alt={productoAsistente.name} />
                        <div className="v2-ts-scrim" />
                      </div>
                    </div>
                    <div className="card-marinado card-marinado-activo" style={{ cursor: 'default', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                      <MarimadoImg imageUrl={productoAsistente.image_url} imageCookedUrl={productoAsistente.image_cooked_url} isSelected recogida={asistente.recogida} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="producto-nombre">{productoAsistente.name}</div>
                        <div className="producto-precio">${productoAsistente.price}/kg</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card-marinado card-marinado-activo" style={{ cursor: 'default' }}>
                    <img src={img(productoAsistente)} alt={productoAsistente.name} style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="producto-nombre">{productoAsistente.name}</div>
                      <div className="producto-precio">
                        ${productoAsistente.price}{asistente.categoria === 'fresco' ? '/kg (se pesa al entregar)' : '/kg (por pieza)'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="configurador-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                  {asistente.categoria === 'marinados' ? (
                    <div>
                      <label className="config-label">Cantidad</label>
                      <div className="cantidad-ctrl">
                        <button className="cantidad-btn" onClick={() => cambiarGramosAsistente(-MARINADO_PASO)} disabled={asistente.gramos <= MARINADO_MIN}>−</button>
                        <span className="cantidad-num" style={{ fontSize: 20, minWidth: 60, textAlign: 'center' }}>{asistente.gramos}g</span>
                        <button className="cantidad-btn" onClick={() => cambiarGramosAsistente(MARINADO_PASO)} disabled={asistente.gramos >= MARINADO_MAX}>+</button>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 6 }}>
                        {MARINADO_MIN}g — {MARINADO_MAX}g · intervalos de {MARINADO_PASO}g
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="config-label">Piezas</label>
                      <div className="cantidad-ctrl">
                        <button className="cantidad-btn" onClick={() => cambiarCantidadAsistente(-1)} disabled={asistente.cantidad <= 1}>−</button>
                        <span className="cantidad-num" style={{ fontSize: 20, minWidth: 40, textAlign: 'center' }}>{asistente.cantidad}</span>
                        <button className="cantidad-btn" onClick={() => cambiarCantidadAsistente(1)} disabled={asistente.cantidad >= 20}>+</button>
                      </div>
                    </div>
                  )}

                  {asistente.categoria !== 'fresco' && productoAsistente.se_puede_cocinar && sucursalActiva?.servicio_cocinado !== false && (
                    <div>
                      <label className="config-label">¿Cómo lo quieres?</label>
                      <div className="recogida-opts">
                        <button
                          className={`recogida-opt ${asistente.recogida === 'crudo' ? 'recogida-activo' : ''}`}
                          onClick={() => elegirRecogidaAsistente('crudo')}
                        >
                          <span style={{ fontSize: 20 }}>📦</span>
                          <div>
                            <div className="recogida-titulo">Recoger crudo</div>
                            <div className="recogida-sub">Listo para llevar</div>
                          </div>
                        </button>
                        <button
                          className={`recogida-opt ${asistente.recogida === 'cocinado' ? 'recogida-activo' : ''}`}
                          onClick={() => elegirRecogidaAsistente('cocinado')}
                        >
                          <span style={{ fontSize: 20 }}>🔥</span>
                          <div>
                            <div className="recogida-titulo">Recoger cocinado</div>
                            <div className="recogida-sub">
                              Listo en ~{asistente.categoria === 'marinados' ? tiempoEstimadoAsistente : 20} min
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <button className="btn-primario" onClick={confirmarConfigAsistente}>
                    Agregar y continuar →
                  </button>
                </div>

                {asistente.mostrarAviso && <AvisoAirfryer onCerrar={() => patchAsistente({ mostrarAviso: false })} />}
              </>
            )}

            {asistente.paso === 5 && (
              <>
                <div className="v2-asistente-titulo">¿Le entra un acompañamiento?</div>
                <p className="v2-asistente-sub">Arroz, pasta o ensalada — se agregan directo a tu pedido</p>
                {TIPS_ASISTENTE[asistente.categoria] && (
                  <div className="v2-asistente-tip">
                    💡 {TIPS_ASISTENTE[asistente.categoria].texto} Te recomendamos <b>{TIPS_ASISTENTE[asistente.categoria].sugerido}</b>.
                  </div>
                )}
                <div className="v2-asistente-complementos">
                  {complementosAsistente.map(({ etiqueta, producto: p }) => {
                    const cantidad = asistente.complementos[p.id]?.cantidad || 0
                    const sugerido = etiqueta === TIPS_ASISTENTE[asistente.categoria]?.sugerido
                    return (
                      <div key={p.id} className={`v2-asistente-complemento${cantidad > 0 ? ' on' : ''}${sugerido ? ' sugerido' : ''}`}>
                        {sugerido && <div className="v2-asistente-complemento-badge">Sugerido</div>}
                        <img src={p.image_url || img(p)} alt={etiqueta} />
                        <div className="v2-asistente-complemento-nombre">{etiqueta}</div>
                        <div className="v2-asistente-complemento-precio">${Number(p.price)}</div>
                        <div className="v2-asistente-complemento-stepper">
                          <button onClick={() => cambiarComplementoAsistente(p, -1)} disabled={cantidad === 0}>−</button>
                          <span>{cantidad}</span>
                          <button onClick={() => cambiarComplementoAsistente(p, 1)}>+</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="v2-asistente-disclaimer">*Sujeto a disponibilidad</p>
                <button className="btn-primario" onClick={() => patchAsistente({ paso: 6 })}>
                  {Object.keys(asistente.complementos).length > 0 ? 'Continuar →' : 'No gracias, continuar →'}
                </button>
              </>
            )}

            {asistente.paso === 6 && (
              <>
                <div className="v2-asistente-titulo">¿A qué hora recoges?</div>
                <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radio-lg)', padding: 18, boxShadow: 'var(--sombra)' }}>
                  {ahoraPasadoElLimiteAsistente ? (
                    <p style={{ fontSize: 13, color: 'var(--rojo)', margin: 0 }}>
                      Ya no se están tomando pedidos por hoy — el horario de pedidos cierra a las {formatearHora12(HORA_MAXIMA_PEDIDO_ASISTENTE)}.
                    </p>
                  ) : (
                    <>
                      {tieneCocinadosAsistente && cocInicio && cocFinMostradoAsistente && (
                        <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', border: '1px solid #F59E0B44', borderRadius: 8, padding: '7px 12px', marginBottom: 10 }}>
                          🍗 Tu pedido incluye productos cocinados · disponible entre <b>{formatearHora12(cocInicio)}</b> y <b>{formatearHora12(cocFinMostradoAsistente)}</b>
                        </div>
                      )}
                      <button
                        onClick={elegirAsapAsistente}
                        style={{
                          width: '100%', padding: '12px 14px', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left',
                          border: `2px solid ${asistente.asap ? 'var(--rojo)' : 'var(--gris)'}`, borderRadius: 'var(--radio)',
                          background: asistente.asap ? '#fff5f5' : 'var(--crema)', cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 15, color: asistente.asap ? 'var(--rojo)' : 'var(--texto)' }}>
                          ⚡ Lo antes posible
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--texto-suave)' }}>Te avisamos en cuanto esté listo</span>
                      </button>

                      {horariosAsistente.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--rojo)' }}>No hay horarios disponibles con el tiempo de preparación requerido.</p>
                      ) : (
                        <>
                          <div className={`v2-asistente-ruleta-label${asistente.asap ? ' apagado' : ''}`}>O elige tu hora</div>
                          <RuletaHoras
                            horas={horariosAsistente}
                            valor={asistente.hora || horariosAsistente[0]}
                            onCambiar={elegirHoraAsistente}
                          />
                        </>
                      )}
                    </>
                  )}
                </div>

                <button className="btn-primario" disabled={!asistente.hora && !asistente.asap} onClick={() => patchAsistente({ paso: 7 })}>
                  Continuar →
                </button>
              </>
            )}

            {asistente.paso === 7 && (
              <>
                <div className="v2-asistente-titulo">Ya casi — solo falta tu nombre</div>
                <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radio-lg)', padding: 18, boxShadow: 'var(--sombra)', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label className="config-label">Tu nombre</label>
                    <input
                      type="text"
                      placeholder="¿A nombre de quién es el pedido?"
                      value={asistente.nombre}
                      onChange={(e) => patchAsistente({ nombre: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gris)', borderRadius: 'var(--radio)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label className="config-label">Teléfono (opcional)</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="668 815 1425"
                      value={asistente.telefono}
                      onChange={(e) => patchAsistente({ telefono: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--gris)', borderRadius: 'var(--radio)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--texto)', background: 'var(--crema)', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff5eb', border: '1.5px solid #e85d0433', borderRadius: 'var(--radio)', padding: '12px 16px' }}>
                    <span style={{ fontSize: 14, color: 'var(--cafe-medio)' }}>Hora de recogida</span>
                    <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 18, color: 'var(--rojo)' }}>
                      {asistente.asap ? '⚡ Lo antes posible' : formatearHora12(asistente.hora)}
                    </span>
                  </div>
                </div>

                <button className="btn-primario" disabled={!puedeConfirmarAsistente} onClick={confirmarAsistente}>
                  Confirmar pedido →
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
