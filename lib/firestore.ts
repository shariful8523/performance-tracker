import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
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
  const q = query(
    ref,
    where("date", "==", date),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LearningEntry[];
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
    where("date", "<=", endDate),
    orderBy("date", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LearningEntry[];
}

export async function deleteEntry(userId: string, entryId: string) {
  const ref = doc(db, "users", userId, "entries", entryId);
  await deleteDoc(ref);
}
