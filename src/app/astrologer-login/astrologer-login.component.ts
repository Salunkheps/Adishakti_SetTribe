import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Astrologer {
  email: string;
  password: string;
  regId: string; // Add regId to the interface
}

@Component({
  selector: 'app-astrologer-login',
  templateUrl: './astrologer-login.component.html',
  styleUrls: ['./astrologer-login.component.css']
})
export class AstrologerLoginComponent {
  email: string = '';
  password: string = '';
  astrologer: Astrologer | null = null; // Update to use Astrologer
  errorMessage: string = '';

  apiUrl = 'http://localhost:8075/';

  constructor(private http: HttpClient, private router: Router) { }

  validateCredentials() {
    this.errorMessage = '';
    this.http.get<Astrologer>(this.apiUrl + "api/astrologers/email/" + this.email).subscribe(
      success => {
        this.astrologer = success; // Update to use astrologer
        if (this.astrologer) {
          if (this.astrologer.password === this.password) {
            // Store astrologer data in localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.astrologer));
            // Store regId in sessionStorage
            sessionStorage.setItem('regId', this.astrologer.regId);
            this.router.navigateByUrl("/astrodash");
          } else {
            this.errorMessage = 'Password does not match.';
          }
        } else {
          this.errorMessage = 'Astrologer with this email not found.';
        }
      },
      error => {
        console.error('Error fetching astrologer:', error);
        this.errorMessage = 'Error fetching astrologer data.';
      }
    );
  }
}
