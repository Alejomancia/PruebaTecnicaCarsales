import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CharacterDto {
  id: number;
  name: string;
  status?: string;
  species?: string;
  gender?: string;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class CharactersService {
  constructor(private http: HttpClient) {}

  /** Obtiene un personaje desde la URL que viene en el episodio */
  getCharacter(url: string): Observable<CharacterDto | null> {
    return this.http.get<CharacterDto>(url).pipe(
      catchError(err => {
        console.error('Error cargando personaje: ', err);
        return of(null); // No corta la ejecución
      })
    );
  }

  /** Obtiene solo los nombres de los personajes */
  getCharacterNames(urls: string[]): Observable<string[]> {
    if (!urls || urls.length === 0) return of([]);

    const requests = urls.map(url => this.getCharacter(url));

    return forkJoin(requests).pipe(
      map(characters =>
        characters
          .filter(c => c !== null)
          .map(c => c!.name ?? 'Desconocido')
      )
    );
  }
}
