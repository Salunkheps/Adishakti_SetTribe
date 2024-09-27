// user service .ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
  regId: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8075/api/users'; // Adjust the URL if needed

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(regId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/regId/${regId}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }
  // user.service.ts
  deactivateUser(regId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/deactivate/${regId}`, {});
  }
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/regId/${user.regId}`, user);
  }

  deleteUser(regId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/regId/${regId}`);
  }
}
