import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updatePassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Crea (o reutiliza) una segunda app de Firebase con un nombre distinto
// a la principal. Sirve para llamar a createUserWithEmailAndPassword
// sin afectar la sesión activa del administrador en la app principal.
function getSecondaryApp() {
  const name = 'Secondary';
  const existing = getApps().find((a) => a.name === name);
  return existing || initializeApp(firebaseConfig, name);
}

/**
 * Crea una cuenta de Firebase Auth para un nuevo monitor/administrador
 * sin cerrar la sesión de quien está creando la cuenta (el admin).
 * Devuelve el uid de la cuenta creada.
 */
export async function createMonitorAuthAccount(email, password) {
  const secondaryApp = getSecondaryApp();
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;
    await signOut(secondaryAuth);
    return uid;
  } finally {
    // Limpiamos la app secundaria para evitar fugas de memoria si se
    // crean muchas cuentas en una sola sesión del navegador.
    await deleteApp(secondaryApp);
  }
}
