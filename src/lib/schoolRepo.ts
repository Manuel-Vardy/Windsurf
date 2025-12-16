import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { classesData, generateInitialWeeks, type WeekPayment } from "@/data/mockData";

export type ClassDoc = {
  name: string;
  tutor: string;
};

export type StudentDoc = {
  name: string;
  classId: number;
  gender: "Male" | "Female";
  age: number;
  parentPhone: string;
  photoUrl: string;
  startWeek: number;
};

export type WeekDoc = {
  weekNumber: number;
  weekName: string;
  payments: Record<string, boolean[]>;
};

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
type DayKey = (typeof DAY_KEYS)[number];
type PaymentsByDay = Partial<Record<DayKey, boolean>>;

type StudentKeys = Record<string, string>; // studentId -> student name

function toUiClassDoc(d: unknown): ClassDoc {
  const anyD = (d || {}) as Record<string, unknown>;
  const name = (anyD["Class"] ?? anyD["name"]) as string | undefined;
  const tutor = (anyD["Tutor"] ?? anyD["tutor"]) as string | undefined;
  return {
    name: name ?? "",
    tutor: tutor ?? "",
  };
}

function fromUiClassDoc(c: ClassDoc) {
  return {
    Class: c.name,
    Tutor: c.tutor,
  };
}

function toUiStudentDoc(d: unknown): StudentDoc {
  const anyD = (d || {}) as Record<string, unknown>;

  const name = (anyD["Student"] ?? anyD["name"]) as string | undefined;
  const classId = (anyD["Class"] ?? anyD["classId"]) as number | string | undefined;
  const gender = (anyD["Gender"] ?? anyD["gender"]) as StudentDoc["gender"] | undefined;
  const age = (anyD["Age"] ?? anyD["age"]) as number | string | undefined;
  const parentPhone = (anyD["Parent Phone"] ?? anyD["parentPhone"]) as string | undefined;
  const photoUrl = (anyD["Photo"] ?? anyD["photoUrl"]) as string | undefined;
  const startWeek = (anyD["Start Week"] ?? anyD["startWeek"]) as number | string | undefined;

  return {
    name: name ?? "",
    classId: typeof classId === "string" ? Number(classId) : (classId ?? 0),
    gender: gender ?? "Male",
    age: typeof age === "string" ? Number(age) : (age ?? 0),
    parentPhone: parentPhone ?? "",
    photoUrl: photoUrl ?? "",
    startWeek: typeof startWeek === "string" ? Number(startWeek) : (startWeek ?? 1),
  };
}

function fromUiStudentDoc(s: StudentDoc) {
  return {
    Student: s.name,
    Class: s.classId,
    Gender: s.gender,
    Age: s.age,
    "Parent Phone": s.parentPhone,
    Photo: s.photoUrl,
    "Start Week": s.startWeek,
  };
}

function normalizePaymentRow(row: unknown): boolean[] {
  if (Array.isArray(row)) {
    const padded = [...row].slice(0, 5);
    while (padded.length < 5) padded.push(false);
    return padded.map(Boolean);
  }

  const obj = (row || {}) as Record<string, unknown>;
  return DAY_KEYS.map((k) => Boolean(obj[k]));
}

function paymentsArrayToUiMap(payments: Record<string, boolean[]>): Record<string, PaymentsByDay> {
  const out: Record<string, PaymentsByDay> = {};
  for (const [studentId, arr] of Object.entries(payments)) {
    const row: PaymentsByDay = {};
    DAY_KEYS.forEach((day, idx) => {
      row[day] = Boolean(arr?.[idx]);
    });
    out[studentId] = row;
  }
  return out;
}

function paymentsArrayToNameKeyedUiMap(
  payments: Record<string, boolean[]>,
  studentKeys: StudentKeys
): Record<string, PaymentsByDay> {
  const out: Record<string, PaymentsByDay> = {};
  for (const [studentId, arr] of Object.entries(payments)) {
    const nameKey = studentKeys[studentId] ?? studentId;
    const row: PaymentsByDay = {};
    DAY_KEYS.forEach((day, idx) => {
      row[day] = Boolean(arr?.[idx]);
    });
    out[nameKey] = row;
  }
  return out;
}

function paymentsUiMapToArrayMap(payments: Record<string, unknown>): Record<string, boolean[]> {
  const out: Record<string, boolean[]> = {};
  for (const [studentId, row] of Object.entries(payments || {})) {
    out[studentId] = normalizePaymentRow(row);
  }
  return out;
}

function paymentsNameKeyedUiMapToArrayMap(
  payments: Record<string, unknown>,
  studentKeys: StudentKeys
): Record<string, boolean[]> {
  const out: Record<string, boolean[]> = {};
  for (const [studentId, studentName] of Object.entries(studentKeys || {})) {
    const row = (payments || {})[studentName];
    if (row !== undefined) {
      out[studentId] = normalizePaymentRow(row);
    }
  }
  return out;
}

function toUiWeekDoc(d: unknown, fallbackDocId?: string): WeekDoc {
  const anyD = (d || {}) as Record<string, unknown>;

  const rawWeekNumber = (anyD["Week Number"] ?? anyD["weekNumber"]) as number | string | undefined;
  const rawWeekName = (anyD["Week Name"] ?? anyD["weekName"]) as string | undefined;
  const paymentsRaw = (anyD["Payments"] ?? anyD["payments"]) as Record<string, unknown> | undefined;
  const studentKeys = (anyD["Student Keys"] ?? anyD["studentKeys"]) as StudentKeys | undefined;

  const fallbackWeekNumber = fallbackDocId ? Number(fallbackDocId) : 0;
  const weekNumber =
    typeof rawWeekNumber === "string"
      ? Number(rawWeekNumber)
      : (rawWeekNumber ?? fallbackWeekNumber);

  const weekName = rawWeekName ?? (weekNumber ? `Week ${weekNumber}` : "");

  // Backward compatibility:
  // - Old schema: payments keyed by studentId
  // - New readable schema: Payments keyed by student display name, with Student Keys mapping studentId->name
  const payments = paymentsRaw
    ? studentKeys
      ? paymentsNameKeyedUiMapToArrayMap(paymentsRaw, studentKeys)
      : paymentsUiMapToArrayMap(paymentsRaw)
    : {};

  return {
    weekNumber: weekNumber || 0,
    weekName,
    payments,
  };
}

function shouldRepairWeekDoc(data: unknown): boolean {
  const anyD = (data || {}) as Record<string, unknown>;
  const hasWeekNumber = anyD["Week Number"] !== undefined || anyD["weekNumber"] !== undefined;
  const hasWeekName = anyD["Week Name"] !== undefined || anyD["weekName"] !== undefined;
  return !(hasWeekNumber && hasWeekName);
}

function fromUiWeekDoc(w: WeekDoc, studentKeys?: StudentKeys) {
  const keys = studentKeys ?? {};
  return {
    "Week Number": w.weekNumber,
    "Week Name": w.weekName,
    "Student Keys": keys,
    Payments: Object.keys(keys).length
      ? paymentsArrayToNameKeyedUiMap(w.payments, keys)
      : paymentsArrayToUiMap(w.payments),
  };
}

const classesCol = (firestore: Firestore) => collection(firestore, "classes");
const classDocRef = (firestore: Firestore, classId: number) => doc(firestore, "classes", String(classId));
const classWeeksCol = (firestore: Firestore, classId: number) => collection(firestore, "classes", String(classId), "weeks");
const weekDocRef = (firestore: Firestore, classId: number, weekNumber: number) =>
  doc(firestore, "classes", String(classId), "weeks", String(weekNumber));
const studentsCol = (firestore: Firestore) => collection(firestore, "students");

export async function getAllClasses() {
  const snap = await getDocs(classesCol(db));
  return snap.docs.map((d) => ({ id: Number(d.id), ...toUiClassDoc(d.data()) }));
}

export function subscribeClasses(onChange: (classes: Array<{ id: number } & ClassDoc>) => void) {
  return onSnapshot(classesCol(db), (snap) => {
    onChange(snap.docs.map((d) => ({ id: Number(d.id), ...toUiClassDoc(d.data()) })));
  });
}

export async function getAllStudents() {
  const snap = await getDocs(studentsCol(db));
  return snap.docs.map((d) => ({ id: d.id, ...toUiStudentDoc(d.data()) }));
}

export function subscribeStudents(onChange: (students: Array<{ id: string } & StudentDoc>) => void) {
  return onSnapshot(studentsCol(db), (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...toUiStudentDoc(d.data()) })));
  });
}

export async function getWeeksForClass(classId: number): Promise<WeekPayment[]> {
  const snap = await getDocs(classWeeksCol(db, classId));
  return snap.docs
    .map((d) => toUiWeekDoc(d.data(), d.id))
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map((w) => ({ weekNumber: w.weekNumber, weekName: w.weekName, payments: w.payments || {} }));
}

export function subscribeWeeksForClass(
  classId: number,
  onChange: (weeks: WeekPayment[]) => void
) {
  return onSnapshot(classWeeksCol(db, classId), (snap) => {
    // Auto-repair empty/malformed docs so Firestore and UI stay consistent.
    for (const d of snap.docs) {
      if (!shouldRepairWeekDoc(d.data())) continue;
      const week = toUiWeekDoc(d.data(), d.id);
      if (!week.weekNumber) continue;
      void setDoc(weekDocRef(db, classId, week.weekNumber), fromUiWeekDoc(week), { merge: true });
    }

    const weeks = snap.docs
      .map((d) => toUiWeekDoc(d.data(), d.id))
      .filter((w) => w.weekNumber > 0)
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map((w) => ({ weekNumber: w.weekNumber, weekName: w.weekName, payments: w.payments || {} }));

    onChange(weeks);
  });
}

export async function upsertClass(classId: number, data: ClassDoc) {
  await setDoc(classDocRef(db, classId), fromUiClassDoc(data), { merge: true });
}

export async function upsertStudent(studentId: string, data: StudentDoc) {
  await setDoc(doc(db, "students", studentId), fromUiStudentDoc(data), { merge: true });
}

export async function upsertWeek(classId: number, week: WeekDoc) {
  await setDoc(weekDocRef(db, classId, week.weekNumber), fromUiWeekDoc(week), { merge: true });
}

export async function upsertWeekWithStudentKeys(
  classId: number,
  week: WeekDoc,
  studentKeys: StudentKeys
) {
  await setDoc(weekDocRef(db, classId, week.weekNumber), fromUiWeekDoc(week, studentKeys), { merge: true });
}

export async function ensureSeededFromMockData() {
  const existing = await getDocs(query(classesCol(db)));
  if (!existing.empty) return;

  const batch = writeBatch(db);

  for (const c of classesData) {
    batch.set(classDocRef(db, c.id), fromUiClassDoc({ name: c.name, tutor: c.tutor } satisfies ClassDoc));

    for (const s of c.students) {
      batch.set(
        doc(db, "students", s.id),
        fromUiStudentDoc({
          name: s.name,
          classId: c.id,
          gender: s.gender,
          age: s.age,
          parentPhone: s.parentPhone,
          photoUrl: s.photoUrl,
          startWeek: 1,
        } satisfies StudentDoc)
      );
    }

    const weeks = generateInitialWeeks();
    for (const w of weeks) {
      batch.set(
        weekDocRef(db, c.id, w.weekNumber),
        fromUiWeekDoc({
          weekNumber: w.weekNumber,
          weekName: w.weekName,
          payments: w.payments,
        } satisfies WeekDoc)
      );
    }
  }

  await batch.commit();
}

export async function healthCheckFirestore() {
  const ref = doc(db, "meta", "health");
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, { ok: true, ts: Date.now() }, { merge: true });
}
