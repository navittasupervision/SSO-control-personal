import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

const COL = 'dailyRecords';

function recordId(companyId, date) {
  return `${companyId}_${date}`;
}

/** Obtiene el registro de una empresa en una fecha específica (YYYY-MM-DD). */
export async function getDailyRecord(companyId, date) {
  const snap = await getDoc(doc(db, COL, recordId(companyId, date)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Crea o actualiza (merge) el registro diario de una empresa.
 * entries: [{ name, position, status, notes }]
 */
export async function saveDailyRecord({ companyId, companyName, date, entries, monitorId, monitorName }) {
  const ref = doc(db, COL, recordId(companyId, date));
  const totals = summarizeEntries(entries);
  await setDoc(
    ref,
    {
      companyId,
      companyName,
      date,
      entries,
      totals,
      monitorId,
      monitorName,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
  return ref.id;
}

export function summarizeEntries(entries = []) {
  const totals = { presente: 0, ausente: 0, permiso: 0, incapacidad: 0, otro: 0, total: entries.length };
  entries.forEach((e) => {
    if (totals[e.status] !== undefined) totals[e.status] += 1;
  });
  return totals;
}

/** Lista registros de una empresa dentro de un rango de fechas (inclusive). */
export async function listRecordsByCompanyAndRange(companyId, startDate, endDate) {
  const q = query(collection(db, COL), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  const items = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.date >= startDate && r.date <= endDate);
  items.sort((a, b) => a.date.localeCompare(b.date));
  return items;
}

/** Lista los registros de TODAS las empresas en una fecha dada (para el dashboard). */
export async function listRecordsByDate(date) {
  const q = query(collection(db, COL), where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Lista los registros de todas las empresas dentro de un rango (para tendencia). */
export async function listRecordsByRange(startDate, endDate) {
  const q = query(
    collection(db, COL),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
