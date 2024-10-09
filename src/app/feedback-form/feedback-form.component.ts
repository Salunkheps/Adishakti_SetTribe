import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface Astrologer {
  regId: string;
  firstName: string;
  lastName: string;
}
@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.css']
})
export class FeedbackFormComponent implements OnInit {
  feedbackForm: FormGroup;
  astrologerName: { firstName: string; lastName: string } | null = null; // To store astrologer's first and last name
  private apiUrl = 'http://localhost:8075/api/feedbacks';


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router // Injecting Router for navigation
  ) {
    this.feedbackForm = this.fb.group({
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: ['', Validators.required]
    });
  }

  ngOnInit() {
    const selectedAstrologer = JSON.parse(sessionStorage.getItem('selectedAstrologer')!);
    this.getAstrologerDetails(selectedAstrologer.regId).subscribe(
      astrologer => {
        this.astrologerName = {
          firstName: astrologer.firstName,
          lastName: astrologer.lastName
        };
      },
      error => {
        console.error('Error fetching astrologer details', error);
      }
    );
  }

  onSubmit() {
    if (this.feedbackForm.valid) {
      // Retrieve regId values from session storage
      const selectedAstrologer = JSON.parse(sessionStorage.getItem('selectedAstrologer')!);
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser')!);

      // Construct the feedback object
      const feedback = {
        user: {
          regId: currentUser.regId
        },
        astrologer: {
          regId: selectedAstrologer.regId
        },
        rating: this.feedbackForm.value.rating,
        comments: this.feedbackForm.value.comments
      };

      this.createFeedback(feedback).subscribe(
        response => {
          console.log('Feedback submitted', response);
          this.feedbackForm.reset();
          // Show SweetAlert popup
          Swal.fire({
            title: 'Success!',
            text: 'Your feedback has been submitted.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              // Redirect to "find-astrologers" route
              this.router.navigate(['/find-astrologers']);
            }
          });
        },
        error => {
          console.error('Error submitting feedback', error);
        }
      );
    }
  }
  createFeedback(feedback: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, feedback);
  }

  getAstrologerDetails(regId: string): Observable<Astrologer> {
    const url = `http://localhost:8075/api/astrologers/${regId}`;
    return this.http.get<Astrologer>(url);
  }
}