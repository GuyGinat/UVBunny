import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, addDoc, getDocs, updateDoc, deleteDoc, CollectionReference, DocumentReference, query, where } from '@angular/fire/firestore';
import { Bunny, BunnyEvent } from '../models/bunny.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BunnyService {
  private bunniesCollection: CollectionReference;
  private eventsCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.bunniesCollection = collection(this.firestore, 'bunnies');
    this.eventsCollection = collection(this.firestore, 'events');
  }

  getBunnies(): Observable<Bunny[]> {
    return collectionData(this.bunniesCollection, { idField: 'id' }) as Observable<Bunny[]>;
  }

  addBunny(bunny: Bunny): Promise<DocumentReference> {
    return addDoc(this.bunniesCollection, bunny);
  }

  addEvent(event: BunnyEvent): Promise<DocumentReference> {
    return addDoc(this.eventsCollection, event);
  }

  getEventsForBunny(bunnyId: string): Promise<BunnyEvent[]> {
    const q = query(this.eventsCollection, where('bunnyId', '==', bunnyId));
    return getDocs(q).then(snapshot =>
      snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as BunnyEvent) }))
    );
  }

  async havePlayedTogether(bunnyId: string, playmateId: string): Promise<boolean> {
    const q = query(this.eventsCollection, where('bunnyId', '==', bunnyId), where('type', '==', 'playing'), where('details.playmateId', '==', playmateId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async getBunnyHappiness(bunnyId: string): Promise<number> {
    const events = await this.getEventsForBunny(bunnyId);
    return events.reduce((sum, event) => sum + (event.happinessDelta || 0), 0);
  }

  // More methods for events and details will be added as we go
} 