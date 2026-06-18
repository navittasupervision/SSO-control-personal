// Firebase Auth exige contraseñas de al menos 6 caracteres, pero a las
// personas en obra les pedimos solo un PIN de 4 a 6 dígitos. Por eso el
// PIN real se "envuelve" con un prefijo fijo antes de usarlo como
// contraseña interna. Esto es invisible para el usuario: él solo
// escribe su PIN numérico.
const PIN_PREFIX = 'sso-pin-';

export function pinToPassword(pin) {
  return `${PIN_PREFIX}${pin}`;
}

export function isValidPin(pin) {
  return /^[0-9]{4,6}$/.test(pin);
}

// Genera un "username" a partir del nombre completo: minúsculas, sin
// acentos ni espacios, separado por puntos. Ej: "Juan Pérez" -> "juan.perez"
export function slugifyUsername(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .join('.');
}

// Construye el correo "falso" que usa Firebase Auth internamente.
// Nunca se envían correos reales a esta dirección.
export function usernameToEmail(username) {
  return `${username}@sso-control-personal.app`;
}
