import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bunny } from '../../models/bunny.model';
import { BunnyService } from '../../services/bunny.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private bunnyService: BunnyService, private router: Router) {
    this.bunnies$ = this.bunnyService.getBunnies();
  }

  addBunny() {
    if (!this.newBunnyName.trim()) return;
    this.bunnyService.addBunny({ name: this.newBunnyName.trim(), happiness: 0 })
      .then(() => this.newBunnyName = '');
  }

  goToBunny(bunny: Bunny) {
    if (bunny.id) {
      this.router.navigate(['/bunny', bunny.id]);
    }
  }
}
