
'use client';

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// --- PATIENT SERVICES ---

export interface Patient {
  id: string; // Firestore document ID
  patientId: string; // Custom 4-digit ID
  name: string;
  avatar: {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  };
  lastVisit: string;
  status: 'Active' | 'Inactive' | 'Admitted';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  email: string;
  phone: string;
  address?: string;
  registrationDate?: string;
  billing?: BillingItem[];
  admissionDate?: string;
  dischargeDate?: string;
}

const patientsCollection = collection(db, 'patients');

// Function to generate a unique 4-digit patient ID
async function generateUniquePatientId(): Promise<string> {
  let isUnique = false;
  let newId = '';
  while (!isUnique) {
    newId = Math.floor(1000 + Math.random() * 9000).toString();
    const q = query(patientsCollection, where('patientId', '==', newId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      isUnique = true;
    }
  }
  return newId;
}


export async function addPatient(patientData: Omit<Patient, 'id' | 'patientId'>) {
    const uniquePatientId = await generateUniquePatientId();
    const newPatientData = {
        ...patientData,
        patientId: uniquePatientId,
        createdAt: serverTimestamp(),
    };
  const docRef = await addDoc(patientsCollection, newPatientData).catch(serverError => {
     errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: patientsCollection.path,
        operation: 'create',
        requestResourceData: newPatientData
     }));
     throw serverError;
  });
  return docRef.id;
}

export async function updatePatient(patientId: string, patientData: Partial<Omit<Patient, 'id' | 'patientId'>>) {
  const patientDoc = doc(db, 'patients', patientId);
  await updateDoc(patientDoc, {
      ...patientData,
      updatedAt: serverTimestamp(),
  }).catch(serverError => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: patientDoc.path,
        operation: 'update',
        requestResourceData: patientData
     }));
     throw serverError;
  });
}

export async function deletePatient(patientId: string) {
    const patientDoc = doc(db, 'patients', patientId);
    await deleteDoc(patientDoc).catch(serverError => {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: patientDoc.path,
            operation: 'delete'
        }));
        throw serverError;
    });
}

export async function admitPatient(patientId: string) {
    await updatePatient(patientId, { 
        status: 'Admitted', 
        admissionDate: new Date().toISOString() 
    });
}


// --- BILLING SERVICES ---

export interface BillingItem {
  id: string;
  date: string;
  service: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}

export async function addBillingItem(patientId: string, item: Omit<BillingItem, 'id'>, existingItems: BillingItem[] = []) {
  const newItem = { ...item, id: `B-${Date.now()}` };
  const updatedBilling = [...existingItems, newItem];
  await updatePatient(patientId, { billing: updatedBilling });
  return newItem;
}

export async function updateBillingStatus(patientId: string, itemId: string, newStatus: 'Paid' | 'Unpaid', existingItems: BillingItem[] = []) {
    const updatedBilling = existingItems.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
    );
    await updatePatient(patientId, { billing: updatedBilling });
}

export async function deleteBillingItem(patientId: string, itemId: string, existingItems: BillingItem[] = []) {
    const updatedBilling = existingItems.filter(item => item.id !== itemId);
    const patientDoc = doc(db, 'patients', patientId);
    await updateDoc(patientDoc, { billing: updatedBilling }).catch(serverError => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: patientDoc.path,
            operation: 'update',
            requestResourceData: { billing: updatedBilling }
        }));
        throw serverError;
    });
}


// --- STAFF SERVICES ---

export interface Staff {
  id: string;
  name: string;
  avatar: {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  };
  profession: string;
  salary: number;
  status: 'Active' | 'On Leave';
  joinDate: string;
  salaryHistory?: SalaryHistoryItem[];
}

export interface SalaryHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid';
}

const staffCollection = collection(db, 'staff');

export async function addStaff(staffData: Omit<Staff, 'id'>) {
  const docRef = await addDoc(staffCollection, {
    ...staffData,
    createdAt: serverTimestamp(),
  }).catch(serverError => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: staffCollection.path,
        operation: 'create',
        requestResourceData: staffData
     }));
     throw serverError;
  });
  return docRef.id;
}

export async function addSalaryPayment(staffId: string, item: Omit<SalaryHistoryItem, 'id'>, existingHistory: SalaryHistoryItem[] = []) {
  const newPayment = { ...item, id: `SH-${Date.now()}` };
  const updatedHistory = [...existingHistory, newPayment];
  const staffDoc = doc(db, 'staff', staffId);
  await updateDoc(staffDoc, { salaryHistory: updatedHistory }).catch(serverError => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: staffDoc.path,
        operation: 'update',
        requestResourceData: { salaryHistory: updatedHistory }
     }));
     throw serverError;
  });
  return newPayment;
}


// --- APPOINTMENT SERVICES ---

export interface Appointment {
  id: string;
  patientName: string;
  patientAvatar: {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  };
  doctorName: string;
  department: string;
  time: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
}

const appointmentsCollection = collection(db, 'appointments');

export async function addAppointment(appointmentData: Omit<Appointment, 'id'>) {
    const docRef = await addDoc(appointmentsCollection, {
        ...appointmentData,
        createdAt: serverTimestamp(),
    }).catch(serverError => {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: appointmentsCollection.path,
            operation: 'create',
            requestResourceData: appointmentData
        }));
        throw serverError;
    });
    return docRef.id;
}

export async function updateAppointmentStatus(appointmentId: string, newStatus: Appointment['status']) {
    const appointmentDoc = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentDoc, { status: newStatus }).catch(serverError => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: appointmentDoc.path,
            operation: 'update',
            requestResourceData: { status: newStatus }
        }));
        throw serverError;
    });
}
