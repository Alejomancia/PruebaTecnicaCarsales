import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpisodesService, Episode } from '../../services/episodes.service';
import { CharactersService, CharacterDto } from '../../services/character.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorComponent } from '../error/error.component';

/**
 * Modelo usado SOLO por la vista
 * (no representa el contrato del backend)
 */
interface EpisodeView {
  id: number;
  name: string;
  airDate?: string;
  episode?: string;
  characters?: CharacterDto[];
}

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ErrorComponent],
  templateUrl: './episodes.component.html',
  styleUrls: ['./episodes.component.css']
})
export class EpisodesComponent {

  page = signal(1);
  totalPages = signal(1);
  episodes = signal<EpisodeView[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filtros
  filterName = signal('');
  filterSeason = signal('');
  filterAirDate = signal('');
  filterCharacter = signal('');

  // Temporadas disponibles para el combo
  seasons = [
    { label: 'Todas', value: '' },
    { label: 'Temporada 1', value: 'S01' },
    { label: 'Temporada 2', value: 'S02' },
    { label: 'Temporada 3', value: 'S03' },
    { label: 'Temporada 4', value: 'S04' },
    { label: 'Temporada 5', value: 'S05' }
  ];


  constructor(
    private episodesService: EpisodesService,
    private charactersService: CharactersService
  ) {
    this.load();
  }

  /**
   * Carga episodios y resuelve los personajes
   */
  load(pageNumber = this.page()) {
    this.loading.set(true);
    this.error.set(null);

    this.episodesService.getEpisodes(pageNumber).subscribe({
      next: res => {

        const requests = res.episodes.map(ep => {
          if (!ep.characters || ep.characters.length === 0) {
            return of({
              ...ep,
              characters: []
            } as EpisodeView);
          }

          return this.charactersService.getCharacters(ep.characters).pipe(
            map(chars => ({
              id: ep.id,
              name: ep.name,
              airDate: ep.airDate,
              episode: ep.episode,
              characters: chars
            }))
          );
        });

        forkJoin(requests).subscribe({
          next: finalEpisodes => {
            this.episodes.set(finalEpisodes);
            this.page.set(res.page);
            this.totalPages.set(res.totalPages);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Error al procesar los personajes');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('No se pudieron cargar los episodios');
        this.loading.set(false);
      }
    });
  }

  prev() {
    if (this.page() > 1) {
      this.scrollToTop();
      this.load(this.page() - 1);
    }
  }

  next() {
    if (this.page() < this.totalPages()) {
      this.scrollToTop();
      this.load(this.page() + 1);
    }
  }


  /**
   * Limpia todos los filtros de búsqueda
   */
  limpiarFiltros() {
    this.filterName.set('');
    this.filterSeason.set('');
    this.filterAirDate.set('');
    this.filterCharacter.set('');
  }

  get filteredEpisodes() {
    return this.episodes().filter(ep =>
      (!this.filterName() || ep.name.toLowerCase().includes(this.filterName().toLowerCase())) &&
      (!this.filterSeason() || ep.episode?.includes(this.filterSeason())) &&
      (!this.filterAirDate() || ep.airDate?.includes(this.filterAirDate())) &&
      (!this.filterCharacter() ||
        ep.characters?.some(c =>
          c.name.toLowerCase().includes(this.filterCharacter().toLowerCase())
        ))
    );
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return 'Fecha no disponible';

    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Hace scroll suave hacia el inicio de la página
   * Se usa al cambiar de página para mejorar la experiencia de usuario
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }




}
