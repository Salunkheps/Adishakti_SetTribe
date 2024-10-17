import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookings: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchBookings();
  }

  fetchBookings() {
    this.http.get('http://localhost:8075/api/bookings/all').subscribe(
      (data: any) => {
        this.bookings = data;
        console.log(this.bookings);
      },
      (error) => {
        console.error('Error fetching bookings:', error);
      }
    );
  }

  approveBooking(id: number) {
    Swal.fire({
      title: 'Are you sure you want to approve this booking?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Make an HTTP request to update the booking status to "Approved"
        this.http.put(`http://localhost:8075/api/bookings/update-status/${id}`, { status: 'Approved' })
          .subscribe(
            () => {
              Swal.fire('Approved!', 'Booking has been approved.', 'success');
              this.fetchBookings(); // Re-fetch bookings to reflect the status change
            },
            (error) => {
              console.error('Error approving booking:', error);
              Swal.fire('Error!', 'There was an error approving the booking.', 'error');
            }
          );
      }
    });
  }

  rejectBooking(id: number) {
    Swal.fire({
      title: 'Are you sure you want to reject this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Make an HTTP request to update the booking status to "Rejected"
        this.http.put(`http://localhost:8075/api/bookings/update-status/${id}`, { status: 'Rejected' })
          .subscribe(
            () => {
              Swal.fire('Rejected!', 'Booking has been rejected.', 'success');
              this.fetchBookings(); // Re-fetch bookings to reflect the status change
            },
            (error) => {
              console.error('Error rejecting booking:', error);
              Swal.fire('Error!', 'There was an error rejecting the booking.', 'error');
            }
          );
      }
    });
  }

  logout(event: MouseEvent) {
    event.preventDefault();
    Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      backdrop: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('User logged out');
        // Redirect to the home page
      }
    });
  }
}
