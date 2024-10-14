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
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchFeedbacks();  // Fetch feedbacks when the component loads
  }

  // Fetch feedbacks from API
  fetchFeedbacks() {
    this.http.get('http://localhost:8075/api/feedbacks').subscribe(
      (data: any) => {
        this.feedbacks = data;
      },
      (error) => {
        console.error('Error fetching feedbacks', error);
      }
    );
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