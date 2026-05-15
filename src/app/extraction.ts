import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ExtractionError, ExtractionResult } from './models/state.types';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ExtractResponse } from './models/extraction.types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExtractionService {
  private http =inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  extract(resumeText:string):Observable<ExtractionResult>{
    return this.http.post<ExtractResponse>(this.apiUrl,{resume_text:resumeText}).pipe(
      map((data)=> ({status:'success' as const, data})),
      catchError((error:HttpErrorResponse)=>{
        const extractionError = this.mapHttpErrorToExtractionError(error);
        return of({
          status:'error' as const,
          error: extractionError});    
  })
);
  }

  private mapHttpErrorToExtractionError(error:HttpErrorResponse):ExtractionError{
    const detail:string|undefined = error.error?.detail;

    if(error.status === 0){
      return {
        category:'network',
        message:'Could not reach the server.'
      };
    }
    if(error.status === 429){
      const retryAfterHeader = error.headers.get('Retry-After');
      const parsed = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
      const retryIn = Number.isFinite(parsed) ? parsed : 60;
      return {
        category:'rate_limit',
        message: detail ?? 'Too many requests. Please try again later.',
        retryIn
      };
    }
    if(error.status === 422){
      return {
        category:'validation',
        message: detail ?? 'The submitted data was invalid.'
      };
    }
    if(error.status >= 500){
      return {
        category:'server',
        message: detail ?? 'A server error occurred. Please try again later.'
      };
    }
    return {
      category:'server',
      message: detail ?? 'An unexpected error occurred.'
    };
  }
}
