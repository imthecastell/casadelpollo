/* QR de la tarjeta de lealtad: CDP2 + 17 dígitos (código de 6 + teléfono
   de 10 revueltos con una clave fija, más un dígito verificador). Lo lee
   la caja en el admin (casadelpollo-admin, src/lib/lealtadQR.js), que tiene
   la misma lógica — si cambia aquí, cambia allá.

   Solo letras y números a propósito: los lectores físicos "teclean" lo que
   leen y con teclado en español cambiaban los símbolos del formato anterior
   (base64). Revolver no es cifrado; solo evita que el teléfono se lea a
   simple vista. */

const CLAVE = '7302958146'

function digitoVerificador(digitos) {
  return String([...digitos].reduce((suma, d, i) => suma + Number(d) * (i % 2 ? 3 : 1), 0) % 10)
}

export function codificarQR(codigo, telefono) {
  const plano = `${codigo}${telefono}`
  const revuelto = [...plano].map((d, i) => (Number(d) + Number(CLAVE[i % CLAVE.length]) + i) % 10).join('')
  return `CDP2${revuelto}${digitoVerificador(plano)}`
}
