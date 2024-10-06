
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../web-socket.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'; // Import SweetAlert2

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit, OnDestroy {
  totalAmount: number | null = null;
  astrologerMobile: string | null = null;
  minutes: number | null = null;
  regId: string | null = null;

  transactionId: string = ''; // Variable for transaction ID
  screenshot: File | null = null; // Variable for screenshot file

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) {}

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  ngOnInit(): void {
    const ratePerMinuteFromStorage = sessionStorage.getItem('ratePerMinute');
    const selectedAstrologer = sessionStorage.getItem('selectedAstrologer');
    const currentUser = sessionStorage.getItem('currentUser');

    if (ratePerMinuteFromStorage) {
      this.totalAmount = +ratePerMinuteFromStorage; // Convert string to number
    }
  }

  // Handle file input change
  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.screenshot = event.target.files[0]; // Store the selected file
    }
  }

  // Submit payment details
  submitPayment(): void {
    // Validate fields before proceeding
    if (!this.transactionId || !this.screenshot) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Both Transaction ID and Screenshot are required!',
      });
      return; // Stop the submission if validation fails
    }

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const selectedAstrologer = JSON.parse(sessionStorage.getItem('selectedAstrologer') || '{}');
    const selectedMinutes = sessionStorage.getItem('selectedMinutes'); // Get selectedMinutes from sessionStorage

    if (!currentUser || !selectedAstrologer|| !selectedMinutes) {
      console.error('User, selected astrologer, or selectedMinutes not found in sessionStorage');
      return;
    }

    const paymentData = {
      userRegId: currentUser.regId,
      amount: this.totalAmount,
      transactionId: this.transactionId,
      astrologerRegId: selectedAstrologer.regId,
      screenshot: this.screenshot,
      selectedMinutes: selectedMinutes, // Include selectedMinutes in payment data

    };

    const formData: FormData = new FormData();
    formData.append('userRegId', paymentData.userRegId);
    formData.append('amount', this.totalAmount!.toString());
    formData.append('transactionId', this.transactionId);
    formData.append('astrologerRegId', paymentData.astrologerRegId);
    formData.append('selectedMinutes', paymentData.selectedMinutes); // Add selectedMinutes to formData

    if (this.screenshot) {
      formData.append('screenshot', this.screenshot, this.screenshot.name);
    }

    this.http.post('http://localhost:8075/api/payments/create', formData, { responseType: 'text' })
      .subscribe(
        response => {
          // Show SweetAlert on successful submission
          Swal.fire({
            icon: 'success',
            title: 'Form Submitted',
            text: 'Payment submitted successfully. Please wait for admin to authorize your payment.',
          });
          console.log('Payment submitted successfully', response);
        },
        error => {
          console.error('Error submitting payment', error);
        }
      );
  }
}
