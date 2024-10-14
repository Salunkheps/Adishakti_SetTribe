import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-astro-feedback',
  templateUrl: './manage-astro-feedback.component.html',
  styleUrls: ['./manage-astro-feedback.component.css']
})
export class ManageAstroFeedbackComponent implements OnInit {
  feedbacks: any[] = [];
  astrologers: any[] = []; // To store astrologer data

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchFeedbacks();  // Fetch feedbacks when the component loads
  }

  // Fetch feedbacks from API
  fetchFeedbacks() {
    this.http.get('http://localhost:8075/api/feedbacks').subscribe(
      (data: any) => {
        this.feedbacks = data;
        this.fetchAstrologers(); // Fetch astrologer data after feedbacks are fetched
      },
      (error) => {
        console.error('Error fetching feedbacks', error);
      }
    );
  }

  // Fetch astrologers from the API
  fetchAstrologers() {
    this.http.get('http://localhost:8075/api/astrologers/get-astrologers').subscribe(
      (data: any) => {
        this.astrologers = data;
      },
      (error) => {
        console.error('Error fetching astrologers', error);
      }
    );
  }

  // Method to get astrologer's full name by matching regId
  getAstrologerName(feedbackregId: string): string {
    // Find astrologer with matching regId
    const astrologer = this.astrologers.find(a => a.regId === feedbackregId);
    return astrologer ? `${astrologer.firstName} ${astrologer.lastName}` : 'No astrologer found';
  }

  // Method to generate stars based on the rating
getStars(rating: number): string {
  return '⭐'.repeat(rating);  // Repeat the star character based on the rating
}


  // Logout method
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
        this.router.navigate(['/Home']);
      }
    });
  }
}
