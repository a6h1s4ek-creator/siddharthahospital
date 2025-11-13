
import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

// This is a simple event emitter that will be used to bubble up
// Firestore permission errors to the UI.
export const errorEmitter = new EventEmitter();

// This is the type of the event that will be emitted.
export type PermissionErrorEvent = {
  'permission-error': FirestorePermissionError;
};

// This is the type of the event listener.
export type PermissionErrorListener = <E extends keyof PermissionErrorEvent>(
  event: E,
  listener: (arg: PermissionErrorEvent[E]) => void
) => void;

// This is the type of the event emitter.
export type PermissionErrorEventEmitter = <E extends keyof PermissionErrorEvent>(
  event: E,
  arg: PermissionErrorEvent[E]
) => void;
