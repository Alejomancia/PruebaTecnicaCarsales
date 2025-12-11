import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EpisodesComponent } from './components/episodes/episodes.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    EpisodesComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('frontend');
}
