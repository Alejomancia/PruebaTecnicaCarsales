import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpisodesService, Episode } from '../../services/episodes.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CharactersService } from '../../services/character.service';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.css']
})
export class EpisodesComponent {
  page = signal(1);
  totalPages = signal(1);
  episodes = signal<Episode[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filtros
  filterName = signal('');
  filterSeason = signal('');
  filterAirDate = signal('');
  filterCharacter = signal('');

  constructor(
    private svc: EpisodesService,
    private charSvc: CharactersService
  ) {
    this.load();
  }

  load(pageNumber = this.page()) {
    this.loading.set(true);
    this.error.set(null);

    this.svc.getEpisodes(pageNumber).subscribe({
      next: res => {
        // Convertir personajes de URL → Nombre
        const epRequests = res.episodes.map(ep => {
          if (!ep.characters || ep.characters.length === 0) {
            return of(ep);
          }

          return this.charSvc.getCharacterNames(ep.characters).pipe(
            map(names => ({
              ...ep,
              characters: names
            }))
          );
        });

        forkJoin(epRequests).subscribe({
          next: finalEpisodes => {
            this.episodes.set(finalEpisodes);
            this.page.set(res.page);
            this.totalPages.set(res.totalPages);
            this.loading.set(false);
          },

          error: err => {
            console.error(err);
            this.error.set('Error procesando personajes');
            this.loading.set(false);
          }
        });
      },

      error: err => {
        console.error(err);
        this.error.set('No se pudo cargar episodios');
        this.loading.set(false);
      }
    });
  }

  // ⬅️ PAGINACIÓN
  prev() {
    const p = this.page() - 1;
    if (p >= 1) this.load(p);
  }

  next() {
    const p = this.page() + 1;
    if (p <= this.totalPages()) this.load(p);
  }

  // ⬅️ FILTRO PRINCIPAL USANDO SEÑALES Y DATOS PROCESADOS
  get filteredEpisodes() {
    return this.episodes().filter(ep =>
      (!this.filterName() ||
        ep.name?.toLowerCase().includes(this.filterName().toLowerCase())) &&

      (!this.filterSeason() ||
        ep.episode?.toLowerCase().includes(this.filterSeason().toLowerCase())) &&

      (!this.filterAirDate() ||
        ep.airDate?.toLowerCase().includes(this.filterAirDate().toLowerCase())) &&

      (!this.filterCharacter() ||
        ep.characters?.some(c =>
          c.toLowerCase().includes(this.filterCharacter().toLowerCase())
        ))
    );
  }
}
