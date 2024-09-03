import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
interface Customer {
  email: string;
  password: string;
}
@Component({
  selector: 'app-astrologer-login',
  templateUrl: './astrologer-login.component.html',
  styleUrl: './astrologer-login.component.css'
})
export class AstrologerLoginComponent {
  email: string = '';
  password: string = '';
  customer: Customer | null = null;
  errorMessage: string = '';

  apiUrl = 'http://localhost:8081/';

  constructor(private http: HttpClient, private router: Router) { }

  validateCredentials() {
    this.errorMessage = '';
    this.http.get<Customer>(this.apiUrl + "api/astrologers/email/" + this.email).subscribe(
      success => {
        this.customer = success;
        if (this.customer) {
          if (this.customer.password === this.password) {
            // Store customer data in localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.customer));
            this.router.navigateByUrl("/astrodash");
          } else {
            this.errorMessage = 'Password does not match.';
          }
        } else {
          this.errorMessage = 'Customer with this email not found.';
        }
      },
      error => {
        console.error('Error fetching customer:', error);
        this.errorMessage = 'Error fetching customer data.';
      }
    );
  }
}