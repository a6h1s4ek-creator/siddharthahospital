'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <FirebaseProvider>{children}</FirebaseProvider>;
};
