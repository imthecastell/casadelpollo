// Service worker mínimo: solo existe para cumplir el requisito de
// instalabilidad de Chrome/Android (manifest + SW con fetch handler).
// No cachea nada — todas las peticiones van directo a la red.
self.addEventListener('fetch', () => {})
