import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, addDoc, getDocs, updateDoc, deleteDoc, CollectionReference, DocumentReference } from '@angular/fire/firestore';
import { Bunny, BunnyEvent } from '../models/bunny.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BunnyService {
  private bunniesCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.bunniesCollection = collection(this.firestore, 'bunnies');
  }

  getBunnies(): Observable<Bunny[]> {
    return collectionData(this.bunniesCollection, { idField: 'id' }) as Observable<Bunny[]>;
  }

  addBunny(bunny: Bunny): Promise<DocumentReference> {
    return addDoc(this.bunniesCollection, bunny);
  }

  // More methods for events and details will be added as we go
} 