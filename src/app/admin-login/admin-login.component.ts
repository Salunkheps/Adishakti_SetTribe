import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Admin {
  email: string;
  password: string;
}

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {

  email: string = '';
  password: string = '';
  admin: Admin | null = null;
  errorMessage: string = '';
  data: any = []
  apiUrl = 'http://localhost:8081/';

  constructor(private http: HttpClient, private router: Router) {

  }

  validateCredentials() {
    this.errorMessage = '';
    this.http.get<Admin>(this.apiUrl + "api/admins/email/" + this.email).subscribe(
      success => {
        this.admin = success;
        if (this.admin) {
          if (this.admin.password === this.password) {
            // Store Admin data in localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.admin));
            this.router.navigateByUrl("/admin-dashbord");
          } else {
            this.errorMessage = 'Password does not match.';
          }
        } else {
          this.errorMessage = 'admin with this email not found.';
        }
      },
      error => {
        console.error('Error fetching admin:', error);
        this.errorMessage = 'Error fetching admin data.';
      }

    );
    this.router.navigate(['/admin-login']);

  }


}
