import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, CollectionReference, DocumentReference } from '@angular/fire/firestore';
import { Bunny, BunnyEvent } from '../models/bunny.model';
import { Observable } from 'rxjs';
import { doc, getDoc, setDoc, updateDoc, addDoc, getDocs, query, where } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class BunnyService {
  // Reference to the 'bunnies' collection in Firestore
  private bunniesCollection: CollectionReference;
  // Reference to the 'events' collection in Firestore
  private eventsCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    // Initialize Firestore collection references
    this.bunniesCollection = collection(this.firestore, 'bunnies');
    this.eventsCollection = collection(this.firestore, 'events');
  }

  /**
   * Get a live Observable stream of all bunnies in the database.
   * Each bunny will include its Firestore document ID as 'id'.
   */
  getBunnies(): Observable<Bunny[]> {
    return collectionData(this.bunniesCollection, { idField: 'id' }) as Observable<Bunny[]>;
  }

  /**
   * Add a new bunny to the database.
   * @param bunny The bunny object to add
   * @returns Promise resolving to the new document reference
   */
  addBunny(bunny: Bunny): Promise<DocumentReference> {
    return addDoc(this.bunniesCollection, bunny);
  }

  /**
   * Add a new event (eating, playing, etc.) for a bunny.
   * @param event The event object to add
   * @returns Promise resolving to the new document reference
   */
  addEvent(event: BunnyEvent): Promise<DocumentReference> {
    return addDoc(this.eventsCollection, event);
  }

  /**
   * Get all events for a specific bunny by its ID.
   * @param bunnyId The bunny's document ID
   * @returns Promise resolving to an array of BunnyEvent objects
   */
  getEventsForBunny(bunnyId: string): Promise<BunnyEvent[]> {
    const q = query(this.eventsCollection, where('bunnyId', '==', bunnyId));
    return getDocs(q).then(snapshot =>
      snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as BunnyEvent) }))
    );
  }

  /**
   * Check if two bunnies have played together before.
   * Used to determine if play bonus should be awarded.
   * @param bunnyId The main bunny's ID
   * @param playmateId The playmate's ID
   * @returns Promise resolving to true if they have played together
   */
  async havePlayedTogether(bunnyId: string, playmateId: string): Promise<boolean> {
    const q = query(this.eventsCollection, where('bunnyId', '==', bunnyId), where('type', '==', 'playing'), where('details.playmateId', '==', playmateId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  /**
   * Calculate the total happiness for a bunny based on its event history and the current points config. (aggregates all events)
   * @param bunnyId The bunny's document ID
   * @returns Promise resolving to the bunny's happiness score
   */
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

  /**
   * Get the current points configuration for actions (lettuce, carrot, play, play bonus).
   * @returns Promise resolving to the config object
   */
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

  /**
   * Set/update the points configuration for actions.
   * @param config The new config object
   * @returns Promise resolving when the config is saved
   */
  async setPointsConfig(config: {lettuce: number, carrot: number, play: number, playBonus: number}): Promise<void> {
    const configDoc = doc(this.firestore, 'config', 'points');
    await setDoc(configDoc, config);
  }

  // More methods for bunny events and details will be added as we go (how cute each bunny is sounds good)
} 