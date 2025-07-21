import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyB95UmY6iPd-ys1E9bSmKaoni7m-P5PG6w",
  authDomain: "uvbunny-8b01b.firebaseapp.com",
  projectId: "uvbunny-8b01b",
  storageBucket: "uvbunny-8b01b.firebasestorage.app",
  messagingSenderId: "355000426796",
  appId: "1:355000426796:web:74fd8634a88fa9634c0c89",
  measurementId: "G-KB4H32NW19"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ]
};
