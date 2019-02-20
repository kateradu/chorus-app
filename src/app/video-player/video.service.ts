import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import Transcript from './transcript.model';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private baseUrl = 'https://static.chorus.ai/api';

  constructor(
    private http: HttpClient
  ) { }

  /* GET transcript JSON by video id */
  getTranscript(id: string): Observable<Transcript[]> {
    const url = `${this.baseUrl}/${id}.json`;

    return this.http.get<Transcript[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, ` +
        `with response: ${error.error}`
      );
    }
    return throwError('API error');
  };
}
