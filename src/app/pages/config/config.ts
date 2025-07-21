import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BunnyService } from '../../services/bunny.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './config.html',
  styleUrl: './config.css',  
})
export class Config {
  lettuce = 1;
  carrot = 3;
  play = 2;
  playBonus = 4;
  loading = true;
  saving = false;
  message = '';

  constructor(private bunnyService: BunnyService, private cdr: ChangeDetectorRef, private router: Router) {
    this.loadConfig();        
  }

  async loadConfig() {
    this.loading = true;
    const config = await this.bunnyService.getPointsConfig();
    this.lettuce = config.lettuce;
    this.carrot = config.carrot;
    this.play = config.play;
    this.playBonus = config.playBonus;
    this.loading = false;
    this.cdr.detectChanges();
  }

  async saveConfig() {
    this.saving = true;
    await this.bunnyService.setPointsConfig({
      lettuce: this.lettuce,
      carrot: this.carrot,
      play: this.play,
      playBonus: this.playBonus
    });
    this.saving = false;
    this.message = 'Configuration saved!';
    this.cdr.detectChanges();
    setTimeout(() => this.message = '', 2000);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
