/* Efectos de sonido de "Atrapa los pollitos": tonos cortos con WebAudio (no hay archivos de audio). Los navegadores
   no dejan sonar nada antes del primer toque, así que el contexto se crea/reanuda con `desbloquear()`. */
let ctx = null

function contexto() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)() } catch { ctx = null }
  }
  return ctx
}

export function desbloquear() {
  const c = contexto()
  if (c && c.state === 'suspended') c.resume().catch(() => {})
  return !!c && c.state === 'running'
}

function tono(f1, f2, dur, tipo = 'triangle', vol = 0.12, retraso = 0) {
  const c = contexto()
  if (!c || c.state !== 'running') return
  const t = c.currentTime + retraso
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = tipo
  o.frequency.setValueAtTime(f1, t)
  if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(c.destination)
  o.start(t); o.stop(t + dur + 0.02)
}

// cada sonido recibe `activo()` para respetar el botón de silencio
export function sonar(activo, nombre, extra = 0) {
  if (!activo()) return
  try {
    switch (nombre) {
      case 'atrapa': {                       // sube de tono con la racha
        const f = 520 * 2 ** (Math.min(extra, 12) / 12)
        tono(f, f * 1.5, 0.14, 'triangle', 0.13)
        break
      }
      case 'moneda': tono(880, 880, 0.08, 'square', 0.06); tono(1320, 1320, 0.18, 'square', 0.06, 0.07); break
      case 'vida': [523, 659, 784, 1047].forEach((f, i) => tono(f, f, 0.14, 'triangle', 0.12, i * 0.07)); break
      case 'malo': tono(190, 70, 0.32, 'sawtooth', 0.12); break
      case 'falla': tono(300, 200, 0.12, 'sine', 0.06); break
      case 'inicio': [392, 523, 659].forEach((f, i) => tono(f, f, 0.12, 'triangle', 0.11, i * 0.08)); break
      case 'fin': [523, 440, 349, 262].forEach((f, i) => tono(f, f * 0.98, 0.24, 'triangle', 0.12, i * 0.16)); break
      case 'record': [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, f, 0.18, 'triangle', 0.12, i * 0.09)); break
      default: break
    }
  } catch { /* sin audio */ }
}
