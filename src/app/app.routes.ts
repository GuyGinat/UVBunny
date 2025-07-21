import { Routes } from '@angular/router';
import { BunnyList } from './pages/bunny-list/bunny-list';
import { BunnyDetails } from './pages/bunny-details/bunny-details';

export const routes: Routes = [
  { path: '', component: BunnyList },
  { path: 'bunny/:id', component: BunnyDetails },
];
