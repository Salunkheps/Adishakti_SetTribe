// astrologer service .ts

// getAstrologers(): Observable<Astrologer[]> 
  // return this.http.get<Astrologer[]>(this.apiUrl);

  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable, of } from 'rxjs';
  
  @Injectable({
    providedIn: 'root'
  })
  export class AstrologerService {
    private apiUrl = 'http://localhost:8075/api/astrologers';
  
    constructor(private http: HttpClient) {}
  
    // Mock method to avoid build errors
    getAstrologers(): Observable<any[]> {
      // This is just a mock implementation; replace it with real data if available
      return this.getAllAstrologers();
    }
  
    getAllAstrologers(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/get-astrologers`);
    }
  
    approveAstrologer(regId: string): Observable<void> {
      return this.http.put<void>(`${this.apiUrl}/approve/${regId}`, {});
    }
  
    rejectAstrologer(regId: string): Observable<void> {
      return this.http.put<void>(`${this.apiUrl}/reject/${regId}`, {});
    }
  
    deleteAstrologer(regId: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${regId}`);
    }
  
    searchAstrologers(searchTerm: string): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/search?term=${searchTerm}`);
    }
  
    addAstrologer(astrologer: any): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/add`, astrologer);
    }
  }
  