
'use client';
import type { User } from 'firebase/auth';

/**
 * A custom error class for Firestore permission errors.
 * This class is used to wrap the original error and provide
 * additional context about the request that was denied.
 * This is useful for debugging security rules.
 */
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

// This is a custom error that will be thrown when a Firestore permission error
// occurs. It will be caught by the global error handler and displayed to the
// user in a toast notification.
export class FirestorePermissionError extends Error {
  // A custom error class for Firestore permission errors.
  // This class is used to wrap the original error and provide
  // additional context about the request that was denied.
  // This is useful for debugging security rules.
  constructor(public context: SecurityRuleContext) {
    const defaultMessage = `The following request was denied by Firestore Security Rules:
    
method: ${context.operation}
path: ${context.path}
    `;

    // We can't know the authenticated user on the server, so we'll
    // only include the request body in the error message on the client.
    if (typeof window !== 'undefined') {
      super(
        `FirestoreError: Missing or insufficient permissions: ${defaultMessage}`
      );
    } else {
      super(`FirestoreError: Missing or insufficient permissions.`);
    }

    this.name = 'FirestorePermissionError';
  }

  // A helper method to get the user's auth state from the error.
  // This is useful for debugging security rules.
  public async getAuthState(): Promise<User | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const auth = getAuth();

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  // A helper method to get the error as a JSON object.
  // This is useful for displaying the error in the UI.
  public async toJSON() {
    const auth = await this.getAuthState();

    return {
      auth,
      ...this.context,
    };
  }
}
