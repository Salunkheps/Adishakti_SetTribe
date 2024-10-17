import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Astrologer {
  email: string;
  password: string;
  regId: string;
  status: string;
  rejectionReason: string | null;
  firstName: string; // Add firstName
  lastName: string;  // Add lastName
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
          // Check if the astrologer is approved, pending, or rejected
          if (this.astrologer.status === 'Approved') {
            if (this.astrologer.password === this.password) {
              // Store astrologer data in localStorage
              localStorage.setItem('currentUser', JSON.stringify(this.astrologer));
              // Store regId in sessionStorage
              sessionStorage.setItem('regId', this.astrologer.regId);
              sessionStorage.setItem('firstName', this.astrologer.firstName);
sessionStorage.setItem('lastName', this.astrologer.lastName);

              this.router.navigateByUrl("/astrodash");
            } else {
              this.errorMessage = 'Password does not match.';
            }
          } else if (this.astrologer.status === 'Rejected') {
            this.errorMessage = `Your account has been rejected. Reason: ${this.astrologer.rejectionReason || 'No reason provided.'}`;
          } else if (this.astrologer.status === 'Pending') {
            this.errorMessage = 'Your account is pending approval. Please wait for admin approval.';
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