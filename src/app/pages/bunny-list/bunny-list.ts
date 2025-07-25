import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bunny } from '../../models/bunny.model';
import { BunnyService } from '../../services/bunny.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-bunny-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bunny-list.html',
  styleUrl: './bunny-list.css'  
})
export class BunnyList {
  bunnies$: Observable<Bunny[]>;
  newBunnyName = '';
  newBunnyAvatarFile: File | null = null;
  newBunnyAvatarFileName: string = 'Upload Bunny Avatar';
  // Map of bunnyId to happiness value
  happinessMap: { [bunnyId: string]: number } = {};
  loadingHappiness = true;
  averageHappiness: number = 0;

  /**
   * On component creation, subscribe to bunnies and calculate happiness for each.
   * Also computes the average happiness for display.
   */
  constructor(private bunnyService: BunnyService, private router: Router, private cdr: ChangeDetectorRef) {
    this.bunnies$ = this.bunnyService.getBunnies();
    this.bunnies$.subscribe(async bunnies => {
      this.happinessMap = {};
      this.loadingHappiness = true;
      await Promise.all(
        bunnies.map(async bunny => {
          if (bunny.id) {
            this.happinessMap[bunny.id] = await this.bunnyService.getBunnyHappiness(bunny.id);
          }
        })
      );
      // Calculate average happiness
      const happinessValues = Object.values(this.happinessMap);
      this.averageHappiness = happinessValues.length ? Math.round(happinessValues.reduce((a, b) => a + b, 0) / happinessValues.length) : 0;
      this.loadingHappiness = false;
      this.cdr.detectChanges();
    });
  }

  /**
   * Handler for avatar file input change.
   * Updates the selected file and its display name.
   */
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newBunnyAvatarFile = input.files[0];
      this.newBunnyAvatarFileName = this.newBunnyAvatarFile.name;
    } else {
      this.newBunnyAvatarFile = null;
      this.newBunnyAvatarFileName = 'Choose Bunny avatar';
    }
  }

  /**
   * Adds a new bunny to the list, uploading the avatar if provided.
   * Resets the form after submission.
   */
  async addBunny() {
    if (!this.newBunnyName.trim()) return;
    let avatarUrl = '';
    if (this.newBunnyAvatarFile) {
      const storage = getStorage();
      const avatarRef = ref(storage, `bunny-avatars/${Date.now()}-${this.newBunnyAvatarFile.name}`);
      await uploadBytes(avatarRef, this.newBunnyAvatarFile);
      avatarUrl = await getDownloadURL(avatarRef);
    }
    await this.bunnyService.addBunny({ name: this.newBunnyName.trim(), avatarUrl });
    this.newBunnyName = '';
    this.newBunnyAvatarFile = null;
    this.newBunnyAvatarFileName = 'Choose Bunny avatar';
    const avatarInput = document.getElementById('bunnyAvatarInput') as HTMLInputElement;
    if (avatarInput) avatarInput.value = '';
  }

  /**
   * Navigates to the details page for the selected bunny.
   */
  goToBunny(bunny: Bunny) {
    if (bunny.id) {
      this.router.navigate(['/bunny', bunny.id]);
    }
  }

  /**
   * Navigates to the configuration page for happiness points.
   */
  goToConfig() {
    this.router.navigate(['/config']);
  }
}
