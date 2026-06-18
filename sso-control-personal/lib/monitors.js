import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { createMonitorAuthAccount } from './firebaseSecondary';
import { pinToPassword, slugifyUsername, usernameToEmail } from './auth';

const COL = 'monitors';

export async function listMonitors() {
  const snap = await getDocs(query(collection(db, COL), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMonitorProfile(uid) {
  const snap = await getDoc(doc(db, COL, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function findAvailableUsername(base) {
  let candidate = base || 'usuario';
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const q = query(collection(db, COL), where('username', '==', candidate));
    const snap = await getDocs(q);
    if (snap.empty) return candidate;
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
}

/**
 * Crea un monitor/administrador completo: cuenta de Firebase Auth +
 * documento de perfil en Firestore (mismo id = uid de Auth).
 */
export async function createMonitor({ name, pin, role = 'monitor', companyIds = [], active = true }) {
  const baseUsername = slugifyUsername(name);
  const username = await findAvailableUsername(baseUsername);
  const email = usernameToEmail(username);
  const password = pinToPassword(pin);

  const uid = await createMonitorAuthAccount(email, password);

  await setDoc(doc(db, COL, uid), {
    name,
    username,
    role, // 'admin' | 'monitor'
    companyIds,
    active,
    createdAt: Date.now(),
  });

  return { id: uid, name, username, role, companyIds, active };
}

export async function updateMonitor(id, data) {
  return updateDoc(doc(db, COL, id), data);
}

export async function deleteMonitor(id) {
  // Nota: esto borra el perfil en Firestore. La cuenta de Auth asociada
  // debe deshabilitarse/eliminarse desde la consola de Firebase o con
  // una Cloud Function si se requiere borrado completo automatizado.
  return deleteDoc(doc(db, COL, id));
}
