import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Bunny, BunnyEvent } from '../../models/bunny.model';
import { BunnyService } from '../../services/bunny.service';
import { Observable, map, switchMap, of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

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

  private bunnyId: string = '';

  constructor(
    private route: ActivatedRoute,
    private bunnyService: BunnyService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
    this.happiness = await this.bunnyService.getBunnyHappiness(this.bunnyId);
    this.loadingEvents = false;
    this.cdr.detectChanges();
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

  goBack() {
    this.router.navigate(['/']);
  }

  getPlaymateName(playmateId: string): string {
    const mate = this.bunnies.find(b => b.id === playmateId);
    return mate ? mate.name : 'another bunny';
  }
  
}
