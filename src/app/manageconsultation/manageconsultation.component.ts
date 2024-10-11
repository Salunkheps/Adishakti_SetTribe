import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manageconsultation',
  templateUrl: './manageconsultation.component.html',
  styleUrls: ['./manageconsultation.component.css']
})
export class ManageconsultationComponent implements OnInit {
  consultationPrices: any[] = []; // Holds consultation prices
  private apiUrl = 'http://localhost:8075/api/astrologers/get-astrologers'; // API URL for fetching astrologers

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadConsultationPrices();
  }

  // Load the existing consultation prices from the new API
  private loadConsultationPrices(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      data => {
        this.consultationPrices = data.map(consultation => ({
          ...consultation,
          rpm_status: consultation.rpm_status || 'pending' // Default status to 'pending'
        }));
        console.log(this.consultationPrices); // Debugging: log data to the console
      },
      error => {
        console.error('Error loading consultation prices:', error);
        Swal.fire('Error', 'Error loading consultation prices.', 'error');
      }
    );
  }

  // Approve consultation rate
  approveConsultation(consultation: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve this consultation rate?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'No, cancel!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedStatus = { rpmStatus: 'approved' }; // Prepare updated status object
        this.http.put(`http://localhost:8075/api/astrologers/rpm-status/${consultation.regId}`, updatedStatus).subscribe(
          () => {
            Swal.fire('Approved!', 'The consultation rate has been approved.', 'success');
            this.loadConsultationPrices(); // Refresh the list after approval
          },
          error => {
            Swal.fire('Error', 'Could not approve the consultation rate.', 'error');
          }
        );
      }
    });
  }

  // Reject consultation rate
  rejectConsultation(consultation: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reject this consultation rate?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'No, cancel!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedStatus = { rpmStatus: 'rejected' }; // Prepare updated status object 
        this.http.put(`http://localhost:8075/api/astrologers/rpm-status/${consultation.regId}`, updatedStatus).subscribe(
          () => {
            Swal.fire('Approved!', 'The consultation rate has been approved.', 'success');
            this.loadConsultationPrices(); // Refresh the list after approval
          },
          error => {
            console.error('Error updating status:', error); // Log error details
            Swal.fire('Error', 'Could not approve the consultation rate.', 'error');
          }
        );
      }
    });
  }

  // Logout functionality
  logout(event: MouseEvent) {
    event.preventDefault(); // Prevent default link behavior
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
        sessionStorage.clear();
        this.router.navigate(['/Home']);
      }
    });
  }
}
