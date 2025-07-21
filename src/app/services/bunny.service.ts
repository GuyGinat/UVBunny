import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, CollectionReference, DocumentReference } from '@angular/fire/firestore';
import { Bunny, BunnyEvent } from '../models/bunny.model';
import { Observable } from 'rxjs';
import { doc, getDoc, setDoc, updateDoc, addDoc, getDocs, query, where } from 'firebase/firestore';

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
    const config = await this.getPointsConfig();
    return events.reduce((sum, event) => {
      if (event.type === 'eating') {
        if (event.details.foodType === 'lettuce') return sum + config.lettuce;
        if (event.details.foodType === 'carrot') return sum + config.carrot;
      } else if (event.type === 'playing') {
        // Check if this is a bonus (played before)
        // For retroactive, assume all play events after the first with the same playmate are bonus
        const previousPlays = events.filter(e => e.type === 'playing' && e.details.playmateId === event.details.playmateId && e.timestamp < event.timestamp);
        if (previousPlays.length > 0) {
          return sum + config.playBonus;
        } else {
          return sum + config.play;
        }
      }
      return sum;
    }, 0);
  }

  async getPointsConfig(): Promise<{lettuce: number, carrot: number, play: number, playBonus: number}> {
    const configDoc = doc(this.firestore, 'config', 'points');
    const snap = await getDoc(configDoc);
    if (snap.exists()) {
      return snap.data() as {lettuce: number, carrot: number, play: number, playBonus: number};
    } else {
      // Default values
      return { lettuce: 1, carrot: 3, play: 2, playBonus: 4 };
    }
  }

  async setPointsConfig(config: {lettuce: number, carrot: number, play: number, playBonus: number}): Promise<void> {
    const configDoc = doc(this.firestore, 'config', 'points');
    await setDoc(configDoc, config);
  }

  // More methods for events and details will be added as we go
} 