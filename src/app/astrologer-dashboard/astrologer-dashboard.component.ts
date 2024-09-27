import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-astrologer-dashboard',
  templateUrl: './astrologer-dashboard.component.html',
  styleUrls: ['./astrologer-dashboard.component.css'],
})
export class AstrologerDashboardComponent {

  constructor(private router: Router) {}


  totalClients: number = 100; // Example value
  reviewsCount: number = 50; // Example value
  totalRevenue: number = 10000; // Example value
  ratingsCount: number = 200; // Example value

  availabilityStatus: string = 'available';
  consultationRates: number = 100; // Example value
  workingHours: string = '9 AM - 5 PM'; // Example value

  updateAvailability() {
    // Logic to update availability status, consultation rates, and working hours
    console.log('Availability Updated:', {
      status: this.availabilityStatus,
      rates: this.consultationRates,
      hours: this.workingHours,
    });
  }
  logout(event: MouseEvent): void {
    // Prevent the default behavior of the button click (in case it's a form submission or link)
    event.preventDefault(); 
  
    // Show SweetAlert confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,  // Show the "Cancel" button
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'No, stay logged in'
    }).then((result) => {
      if (result.isConfirmed) {
        // Only if the user confirms, clear session and redirect
        sessionStorage.clear(); // Clear session storage
        localStorage.removeItem('currentUser'); // Optional: clear local storage if you're storing user info
  
        // Show another SweetAlert message confirming logout success
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been logged out successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          // Redirect to login page after showing success message
          this.router.navigate(['/astrologer-login']);
        });
      }
      // If the user cancels, do nothing (no redirection)
    });
  }
}
