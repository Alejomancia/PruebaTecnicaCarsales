import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpisodesService, Episode } from '../../services/episodes.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.css']
})
export class EpisodesComponent {
  page = signal(1);
  totalPages = signal(1);
  episodes = signal<Episode[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private svc: EpisodesService) {
    this.load();
  }

  load(pageNumber = this.page()) {
    this.loading.set(true);
    this.error.set(null);
    this.svc.getEpisodes(pageNumber).subscribe({
      next: res => {
        this.episodes.set(res.episodes);
        this.totalPages.set(res.totalPages);
        this.page.set(res.page);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.error.set('No se pudo cargar episodios');
        this.loading.set(false);
      }
    });
  }

  prev() {
    const p = this.page() - 1;
    if (p >= 1) this.load(p);
  }

  next() {
    const p = this.page() + 1;
    if (p <= this.totalPages()) this.load(p);
  }
}
