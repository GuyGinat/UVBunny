import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Bunny, BunnyEvent } from '../../models/bunny.model';
import { BunnyService } from '../../services/bunny.service';
import { Observable, map, switchMap, of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-bunny-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bunny-details.html',
  styleUrl: './bunny-details.css'
})
export class BunnyDetails {
  bunny$: Observable<Bunny | undefined>;
  bunnies$: Observable<Bunny[]>;
  events: BunnyEvent[] = [];
  loadingEvents = true;
  playmateId: string = '';
  bunnies: Bunny[] = [];
  happiness: number = 0;
  newAvatarFile: File | null = null;
  pointsConfig: { lettuce: number, carrot: number, play: number, playBonus: number } = { lettuce: 1, carrot: 3, play: 2, playBonus: 4 };

  private bunnyId: string = '';

  constructor(
    private route: ActivatedRoute,
    private bunnyService: BunnyService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private firestore: Firestore
  ) {
    this.bunnies$ = this.bunnyService.getBunnies();
    this.bunny$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => {
        this.bunnyId = id || '';
        this.fetchEvents();
        return this.bunnies$.pipe(map(bunnies => bunnies.find(b => b.id === id)));
      })
    );
    this.bunnies$.subscribe(bunnies => this.bunnies = bunnies);
  }

  async fetchEvents() {
    if (!this.bunnyId) return;
    this.loadingEvents = true;
    this.events = await this.bunnyService.getEventsForBunny(this.bunnyId);
    this.events.sort((a, b) => b.timestamp - a.timestamp);
    this.pointsConfig = await this.bunnyService.getPointsConfig();
    this.happiness = await this.bunnyService.getBunnyHappiness(this.bunnyId);
    this.loadingEvents = false;
    this.cdr.detectChanges();
  }

  getEventPoints(event: BunnyEvent): number {
    if (event.type === 'eating') {
      if (event.details.foodType === 'lettuce') return this.pointsConfig.lettuce;
      if (event.details.foodType === 'carrot') return this.pointsConfig.carrot;
    } else if (event.type === 'playing') {
      const previousPlays = this.events.filter(e =>
        e.type === 'playing' &&
        e.details.playmateId === event.details.playmateId &&
        e.timestamp < event.timestamp
      );
      return previousPlays.length > 0 ? this.pointsConfig.playBonus : this.pointsConfig.play;
    }
    return 0;
  }

  async eat(foodType: 'lettuce' | 'carrot') {
    const happinessDelta = foodType === 'lettuce' ? 1 : 3;
    await this.bunnyService.addEvent({
      bunnyId: this.bunnyId,
      type: 'eating',
      timestamp: Date.now(),
      details: { foodType },
      happinessDelta
    });
    await this.fetchEvents();
  }

  async play() {
    if (!this.playmateId) return;
    const alreadyPlayed = await this.bunnyService.havePlayedTogether(this.bunnyId, this.playmateId);
    const happinessDelta = alreadyPlayed ? 4 : 2;
    // Add event for this bunny
    await this.bunnyService.addEvent({
      bunnyId: this.bunnyId,
      type: 'playing',
      timestamp: Date.now(),
      details: { playmateId: this.playmateId },
      happinessDelta
    });
    // Add event for playmate
    await this.bunnyService.addEvent({
      bunnyId: this.playmateId,
      type: 'playing',
      timestamp: Date.now(),
      details: { playmateId: this.bunnyId },
      happinessDelta
    });
    this.playmateId = '';
    await this.fetchEvents();
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newAvatarFile = input.files[0];
      this.uploadAvatar();
    } else {
      this.newAvatarFile = null;
    }
  }

  async uploadAvatar() {
    if (!this.newAvatarFile || !this.bunnyId) return;
    const storage = getStorage();
    const avatarRef = ref(storage, `bunny-avatars/${this.bunnyId}-${Date.now()}-${this.newAvatarFile.name}`);
    await uploadBytes(avatarRef, this.newAvatarFile);
    const avatarUrl = await getDownloadURL(avatarRef);
    // Update the bunny document
    const bunnyDoc = doc(this.firestore, 'bunnies', this.bunnyId);
    await updateDoc(bunnyDoc, { avatarUrl });
    this.newAvatarFile = null;
    this.fetchEvents(); // refresh bunny data
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getPlaymateName(playmateId: string): string {
    const mate = this.bunnies.find(b => b.id === playmateId);
    return mate ? mate.name : 'another bunny';
  }
  
}
