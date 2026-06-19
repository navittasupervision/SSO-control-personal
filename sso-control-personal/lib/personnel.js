import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const COL = 'personnel';

/** Lista los trabajadores activos de una empresa (para la captura diaria). */
export async function listPersonnelByCompany(companyId) {
  const q = query(collection(db, COL), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return items;
}

/** Lista todos los trabajadores de todas las empresas (para el panel de administrador). */
export async function listAllPersonnel() {
  const snap = await getDocs(collection(db, COL));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return items;
}

export async function createPersonnel({ name, position, companyId, active = true }) {
  const ref = await addDoc(collection(db, COL), { name, position, companyId, active, createdAt: Date.now() });
  return { id: ref.id, name, position, companyId, active };
}

export async function updatePersonnel(id, data) {
  return updateDoc(doc(db, COL, id), data);
}

export async function deletePersonnel(id) {
  return deleteDoc(doc(db, COL, id));
}
