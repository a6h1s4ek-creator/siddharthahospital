
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  collection,
  type DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollection<T extends DocumentData>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const db = useFirestore();

  useEffect(() => {
    if (!db) return;

    const collectionRef = collection(db, collectionName);

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const data: T[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(data);
        setLoading(false);
      },
      async (err) => {
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
            path: collectionRef.path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      }
    );

    return () => unsubscribe();
  }, [collectionName, db]);

  return { data, loading, error };
}
