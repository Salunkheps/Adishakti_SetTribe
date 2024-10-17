import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-astrologer-dashboard',
  templateUrl: './astrologer-dashboard.component.html',
  styleUrls: ['./astrologer-dashboard.component.css'],
})
export class AstrologerDashboardComponent implements OnInit, OnDestroy {

  isOnline: boolean = false; // Set default value
  regId?: string; // Assuming you have the regId from session storage or a service
  firstName: string = '';
  lastName: string = '';

  totalClients: number = 100; // Example value
  reviewsCount: number = 50; // Example value
  totalRevenue: number = 10000; // Example value
  ratingsCount: number = 200; // Example value

  availabilityStatus: string = 'available';
  consultationRates: number = 100; // Example value
  workingHours: string = '9 AM - 5 PM'; // Example value

  ngOnInit(): void {
    // Get the regId from session storage or your service
    this.regId = sessionStorage.getItem('regId') || ''; // Adjust as needed
    this.firstName = sessionStorage.getItem('firstName') || ''; 
   this.lastName = sessionStorage.getItem('lastName') || ''; 
   console.log('First Name:', this.firstName);
  console.log('Last Name:', this.lastName); 
   // You can also fetch current online status from your backend if needed
    this.getOnlineStatus();
    this.webSocketService.connect();

  }

 // Fetch astrologer details from the API using regId
 getAstrologerDetails(regId: string): void {
  const apiUrl = `http://localhost:8075/api/astrologers/${regId}`;
  this.http.get<{ firstName: string, lastName: string }>(apiUrl).subscribe(
    (data) => {
      this.firstName = data.firstName; // Extract firstName
      this.lastName = data.lastName;   // Extract lastName
    },
    (error: HttpErrorResponse) => {
      console.error('Error fetching astrologer details:', error);
    }
  );
}

  constructor(private http: HttpClient, private router: Router, private webSocketService: WebSocketService) { }
  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  getOnlineStatus(): void {
    const apiUrl = `http://localhost:8075/api/astrologers/${this.regId}`;
    this.http.get(apiUrl).subscribe((data: any) => {
      this.isOnline = data.isOnline; // Assuming the response has isOnline property
    });
  }
  toggleOnlineStatus(): void {
    // Store the initial state of the toggle before any changes
    const initialOnlineStatus = this.isOnline;
    // Temporary toggle switch state for visual purposes
    this.isOnline = !this.isOnline;

    const desiredOnlineStatus = !initialOnlineStatus; // Determine the desired new state
    const statusMessage = desiredOnlineStatus
      ? 'You will receive chat and call requests when you go online.'
      : 'You will not receive chat or call requests if you go offline.';

    const confirmationText = desiredOnlineStatus ? 'Yes, go online' : 'Yes, go offline';

    Swal.fire({
      title: 'Are you sure?',
      text: statusMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmationText,
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with the toggle action after confirmation
        const apiUrl = `http://localhost:8075/api/astrologers/toggle-status/${this.regId}`;

        this.http.put(apiUrl, {}).subscribe(
          (response) => {
            console.log('Status updated successfully', response);

            // Update the actual online status based on the desired status
            this.isOnline = desiredOnlineStatus;

            // Update session storage based on the new status
            if (this.isOnline) {
              sessionStorage.setItem('isUserOnline', 'true');
            } else {
              sessionStorage.removeItem('isUserOnline');
            }

            const successMessage = this.isOnline
              ? 'You are now online and will receive chat or call requests.'
              : 'You are now offline and will not receive chat or call requests.';

            Swal.fire({
              icon: 'success',
              title: 'Status Updated',
              text: successMessage,
            });
          },
          (error: HttpErrorResponse) => {
            console.error('Error updating status', error);
            // Revert to the original state if the update fails
            this.isOnline = initialOnlineStatus;

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'There was an error updating your status. Please try again.',
            });
          }
        );
      } else {
        // If the user cancels, revert the toggle back to its initial state
        this.isOnline = initialOnlineStatus;

        Swal.fire({
          icon: 'info',
          title: 'Cancelled',
          text: 'Your status remains unchanged.',
        });
      }
    });
  }



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
    const isUserOnline = sessionStorage.getItem('isUserOnline') === 'true';

    if (isUserOnline) {
      Swal.fire({
        title: 'You are online',
        text: 'Are you sure you want to go offline and logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, go offline and logout',
        cancelButtonText: 'No, stay online'
      }).then((result) => {
        if (result.isConfirmed) {
          // Proceed to update the user's online status in the database
          const apiUrl =` http://localhost:8075/api/astrologers/toggle-status/${this.regId}`;
          this.http.put(apiUrl, {}).subscribe(
            (response) => {
              console.log('User status updated to offline:', response);
  
              // Clear session storage and perform logout
              this.performLogout();
            },
            (error: HttpErrorResponse) => {
              console.error('Error updating user status', error);
              // Optionally show an error message or handle it accordingly
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error updating your status. Please try again.',
              });
            }
          );
        }
        // If the user cancels, do nothing (stay online)
      });
    } else {
      // If the user is offline, show a standard logout confirmation
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'No, stay logged in'
      }).then((result) => {
        if (result.isConfirmed) {
          // Clear session storage and perform logout
          this.performLogout();
        }
        // If the user cancels, do nothing (no redirection)
      });
    }
  }
  
  // Helper method to perform the actual logout logic
  private performLogout(): void {
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
}