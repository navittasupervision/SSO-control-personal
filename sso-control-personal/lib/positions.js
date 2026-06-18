import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { PUESTOS_CATALOGO } from './catalog';

const COL = 'positions';

export async function listPositions() {
  const snap = await getDocs(collection(db, COL));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => {
    const catCompare = (a.categoria || '').localeCompare(b.categoria || '');
    if (catCompare !== 0) return catCompare;
    return (a.nombre || '').localeCompare(b.nombre || '');
  });
  return items;
}

export async function createPosition({ nombre, categoria }) {
  return addDoc(collection(db, COL), { nombre, categoria });
}

export async function updatePosition(id, data) {
  return updateDoc(doc(db, COL, id), data);
}

export async function deletePosition(id) {
  return deleteDoc(doc(db, COL, id));
}

/** Carga el catálogo sugerido la primera vez (si la colección está vacía). */
export async function seedDefaultPositions() {
  const existing = await getDocs(collection(db, COL));
  if (!existing.empty) return { created: 0, skipped: true };

  const batch = writeBatch(db);
  PUESTOS_CATALOGO.forEach((p) => {
    const ref = doc(collection(db, COL));
    batch.set(ref, p);
  });
  await batch.commit();
  return { created: PUESTOS_CATALOGO.length, skipped: false };
}
