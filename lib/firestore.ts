import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export interface LearningEntry {
  id?: string;
  topic: string;
  duration: number;
  date: string; // YYYY-MM-DD
  createdAt?: Timestamp;
}

export async function addEntry(
  userId: string,
  entry: Omit<LearningEntry, "id" | "createdAt">
) {
  const ref = collection(db, "users", userId, "entries");
  const docRef = await addDoc(ref, {
    ...entry,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getEntriesByDate(
  userId: string,
  date: string
): Promise<LearningEntry[]> {
  const ref = collection(db, "users", userId, "entries");
  const q = query(ref, where("date", "==", date));
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LearningEntry[];
  // Sort client-side by createdAt descending
  return entries.sort((a, b) => {
    const aTime = a.createdAt?.toMillis() ?? 0;
    const bTime = b.createdAt?.toMillis() ?? 0;
    return bTime - aTime;
  });
}

export async function getEntriesRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<LearningEntry[]> {
  const ref = collection(db, "users", userId, "entries");
  const q = query(
    ref,
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LearningEntry[];
  // Sort client-side by date ascending
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getAllEntries(userId: string): Promise<LearningEntry[]> {
  const ref = collection(db, "users", userId, "entries");
  const snapshot = await getDocs(ref);
  const entries = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LearningEntry[];
  // Sort client-side by date descending
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteEntry(userId: string, entryId: string) {
  const ref = doc(db, "users", userId, "entries", entryId);
  await deleteDoc(ref);
}
