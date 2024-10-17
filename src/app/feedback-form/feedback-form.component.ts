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
  sessionId: number | null = null; // Store the session ID
  astrologerFirstName: string | null = null; // Store the astrologer's first name
  astrologerLastName: string | null = null; // Store the astrologer's first name
  astrologerRegId: string | null = null; // Store the astrologer's regId


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
    this.sessionId = Number(sessionStorage.getItem('chatSessionId')); // Assuming you store the session ID in session storage

    if (this.sessionId) {
      this.fetchChatSessionData(this.sessionId);
    } else {
      console.error('Chat session ID is missing.');
    }
  }
  fetchChatSessionData(sessionId: number): void {
    // Make the GET request to fetch the chat session data
    this.http.get<any>(`http://localhost:8075/api/chatsessions/${sessionId}`).subscribe(
      (response) => {
        // Extract astrologer's first name and regId
        if (response && response.astrologer) {
          this.astrologerFirstName = response.astrologer.firstName;
          this.astrologerLastName = response.astrologer.lastName;

          this.astrologerRegId = response.astrologer.regId;
          console.log('Astrologer First Name:', this.astrologerFirstName);
          console.log('Astrologer Reg ID:', this.astrologerRegId);
        } else {
          console.error('Astrologer data not found in response.');
        }
      },
      (error) => {
        console.error('Error fetching chat session data:', error);
      }
    );
  }

  onSubmit() {
    if (this.feedbackForm.valid) {
      // Retrieve regId values from session storage
      const selectedAstrologer = sessionStorage.getItem('astrologerRegId');
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser')!);

      // Construct the feedback object
      const feedback = {
        user: {
          regId: currentUser.regId
        },
        astrologer: {
          regId: this.astrologerRegId
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
    console.log(feedback);
    
    return this.http.post<any>(this.apiUrl, feedback);
  }
}