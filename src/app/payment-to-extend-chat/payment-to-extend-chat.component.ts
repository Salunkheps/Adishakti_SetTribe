import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../web-socket.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'; // Import SweetAlert2

@Component({
  selector: 'app-payment-to-extend-chat',
  templateUrl: './payment-to-extend-chat.component.html',
  styleUrl: './payment-to-extend-chat.component.css'
})
export class PaymentToExtendChatComponent implements OnInit {
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
  ) { }


  ngOnInit(): void {
    // Get the sessionId from the route or sessionStorage
    const sessionId = this.route.snapshot.paramMap.get('chatSessionId') || sessionStorage.getItem('chatSessionId');

    if (sessionId) {
      // Fetch the ChatSession data using the sessionId
      this.http.get<any>(`http://localhost:8075/api/chatsessions/${sessionId}`)
        .subscribe(
          sessionData => {
            // Extract required data from the session response
            const userRegId = sessionData.user.regId;
            const astrologerRegId = sessionData.astrologer.regId;
            const ratePerMinute = sessionData.astrologer.ratePerMinute;
            const extendedMinutes = sessionData.extendedMinutes;
            this.transactionId = sessionData.payment.transactionId;
            const screenshotUrl = sessionData.payment.paymentScreenshot;

            // Calculate totalAmount (ratePerMinute * extendedMinutes)
            this.totalAmount = ratePerMinute * extendedMinutes;

            // Store the relevant data in sessionStorage for further use
            sessionStorage.setItem('userRegId', userRegId);
            sessionStorage.setItem('astrologerRegId', astrologerRegId);
            sessionStorage.setItem('transactionId', this.transactionId);
            sessionStorage.setItem('extendedMinutes', extendedMinutes.toString());
            sessionStorage.setItem('screenshotUrl', screenshotUrl);
          },
          error => {
            console.error('Error fetching chat session data', error);
          }
        );
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

    // Get data from sessionStorage
    const userRegId = sessionStorage.getItem('userRegId');
    const astrologerRegId = sessionStorage.getItem('astrologerRegId');
    const extendedMinutes = sessionStorage.getItem('extendedMinutes');
    const paymentType = 'Extend chat'; // Set the paymentType

    if (!userRegId || !astrologerRegId || !extendedMinutes) {
      console.error('Required data is missing from sessionStorage');
      return;
    }

    const formData: FormData = new FormData();
    formData.append('userRegId', userRegId);
    formData.append('amount', this.totalAmount!.toString()); // Use the calculated totalAmount
    formData.append('transactionId', this.transactionId);
    formData.append('astrologerRegId', astrologerRegId);
    formData.append('selectedMinutes', extendedMinutes); // Add selectedMinutes
    formData.append('paymentType', paymentType); // Add paymentType

    if (this.screenshot) {
      formData.append('screenshot', this.screenshot, this.screenshot.name);
    }

    this.http.post('http://localhost:8075/api/payments/create', formData, { responseType: 'text' })
      .subscribe(
        response => {
          // Show SweetAlert on successful submission
          Swal.fire({
            icon: 'info',
            title: 'Payment in Progress!',
            text: 'Your payment is being processed, You can start your chat once the payment is reviewed and approved. Please wait for confirmation.',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              // // Redirect to 'find-astrologers' route
              this.router.navigate(['/chat']);              
            }
          });

          console.log('Payment submitted successfully', response);
        },
        error => {
          console.error('Error submitting payment', error);
        }
      );
  }
}

