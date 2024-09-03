import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-astro-profile',
  templateUrl: './astro-profile.component.html',
  styleUrls: ['./astro-profile.component.css']
})
export class AstroProfileComponent implements OnInit {
  user: any = {};
  private apiUrl = 'http://localhost:8081/';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const userId = localStorage.getItem('currentUserId'); // Adjust based on how you store the user's ID
    if (userId) {
      this.http.get(`${this.apiUrl}users/${userId}`)
        .pipe(
          catchError(this.handleError)
        )
        .subscribe((data: any) => {
          // Assuming the API returns the user data in the expected format
          this.user = data;
        });
    }
  }

  updateProfile(): void {
    const userId = localStorage.getItem('currentUserId'); // Adjust based on how you store the user's ID
    if (userId) {
      this.http.put(`${this.apiUrl}users/${userId}`, this.user)
        .pipe(
          catchError(this.handleError)
        )
        .subscribe(response => {
          console.log('Profile updated:', response);
        });
    }
  }

  updateImage(): void {
    // Handle image update logic here
    console.log('Update image clicked');
  }

  removeImage(): void {
    // Handle image removal logic here
    console.log('Remove image clicked');
  }

  logout(): void {
    // Handle logout logic here
    console.log('Logout clicked');
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
