'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

type SuccessCallback = (credential: UserCredential) => void;
type ErrorCallback = (error: any) => void;

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(
    authInstance: Auth, 
    onSuccess?: SuccessCallback, 
    onError?: ErrorCallback
): void {
  signInAnonymously(authInstance)
    .then(onSuccess)
    .catch(onError);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
    authInstance: Auth, 
    email: string, 
    password: string, 
    onSuccess?: SuccessCallback, 
    onError?: ErrorCallback
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(onSuccess)
    .catch(onError);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
    authInstance: Auth, 
    email: string, 
    password: string,
    onSuccess?: SuccessCallback,
    onError?: ErrorCallback
): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then(onSuccess)
    .catch(onError);
}
