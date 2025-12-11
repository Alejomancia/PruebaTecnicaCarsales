import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Episode {
  id: number;
  name: string;
  airDate?: string;
  episode?: string;
  characters?: string[];
}

export interface EpisodesPage {
  page: number;
  totalPages: number;
  totalResults: number;
  episodes: Episode[];
}

@Injectable({ providedIn: 'root' })
export class EpisodesService {
  private base = `${environment.apiUrl}api/Episodes`;


  constructor(private http: HttpClient) {}

  getEpisodes(page = 1): Observable<EpisodesPage> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<EpisodesPage>(this.base, { params });
  }
}
