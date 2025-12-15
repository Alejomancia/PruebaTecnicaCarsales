import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpisodesService } from '../../services/episodes.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ErrorComponent } from '../error/error.component';

/**
 * Modelo usado SOLO por la vista
 * (coincide con lo que entrega el backend)
 */
interface CharacterDto {
  id: number;
  name: string;
  status?: string;
  species?: string;
  gender?: string;
  image?: string;
}

interface EpisodeView {
  id: number;
  name: string;
  airDate?: string;
  episode?: string;
  characters: CharacterDto[];
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

  // Temporadas disponibles
  seasons = [
    { label: 'Todas', value: '' },
    { label: 'Temporada 1', value: 'S01' },
    { label: 'Temporada 2', value: 'S02' },
    { label: 'Temporada 3', value: 'S03' },
    { label: 'Temporada 4', value: 'S04' },
    { label: 'Temporada 5', value: 'S05' }
  ];

  constructor(private episodesService: EpisodesService) {
    this.load();
  }

  /**
   * Carga episodios desde el BFF
   */
  load(pageNumber = this.page()) {
    this.loading.set(true);
    this.error.set(null);

    this.episodesService.getEpisodes(pageNumber).subscribe({
      next: res => {
        this.episodes.set(res.episodes);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
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
        ep.characters.some(c =>
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

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
