import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

const COL = 'companies';

export async function listCompanies() {
  const snap = await getDocs(query(collection(db, COL), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createCompany({ name, specialty, active = true }) {
  return addDoc(collection(db, COL), { name, specialty, active, createdAt: Date.now() });
}

export async function updateCompany(id, data) {
  return updateDoc(doc(db, COL, id), data);
}

export async function deleteCompany(id) {
  return deleteDoc(doc(db, COL, id));
}
