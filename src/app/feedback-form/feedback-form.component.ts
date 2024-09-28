import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

interface Astrologer {
  id: number;
  name: string;
}

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.css']
})
export class FeedbackFormComponent implements OnInit {
  feedbackForm: FormGroup;
  astrologers: Astrologer[] = [];
  private apiUrl = 'http://localhost:8081/api/feedbacks';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.feedbackForm = this.fb.group({
      astrologerId: ['', Validators.required],
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getAstrologers().subscribe(
      data => {
        this.astrologers = data;
      },
      error => {
        console.error('Error fetching astrologers', error);
      }
    );
  }

  onSubmit() {
    if (this.feedbackForm.valid) {
      this.createFeedback(this.feedbackForm.value).subscribe(
        response => {
          console.log('Feedback submitted', response);
          this.feedbackForm.reset();
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

  getAstrologers(): Observable<Astrologer[]> {
    return this.http.get<Astrologer[]>('http://localhost:8010/api/astrologers'); // Adjust the URL as needed
  }
}
