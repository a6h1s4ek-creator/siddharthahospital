
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useDoc<T extends DocumentData>(collectionName: string, docId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const db = useFirestore();

  useEffect(() => {
    if (!db || !docId) {
      setLoading(false);
      return;
    };

    const docRef = doc(db, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      async (err) => {
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId, db]);

  return { data, loading, error };
}
