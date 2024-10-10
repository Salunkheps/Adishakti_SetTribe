import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../web-socket.service';

interface Astrologer {
  regId: number;
  firstName: string;
  lastName: string;
  mobile: string;
  ratePerMinute: number | null; // Accept ratePerMinute as nullable
}

@Component({
  selector: 'app-chat-with-astrologer',
  templateUrl: './chat-with-astrologer.component.html',
  styleUrls: ['./chat-with-astrologer.component.css'],
})
export class ChatWithAstrologerComponent implements OnInit,OnDestroy {
  astrologer: Astrologer | null = null;
  minutes: number | null = null;
  totalAmount: number | null = null;
  minutesError: boolean = false; // Flag for input validation error
  isAvailable: boolean = true; // Set availability status based on your logic
  cardExpanded: boolean = false;  // Declare the property and set its initial value

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private webSocketService: WebSocketService
  ) { }
  ngOnDestroy(): void {
    this.webSocketService.disconnect();

  }

  ngOnInit(): void {
    this.setCurrentDate();
    this.getAstrologerData();
    this.webSocketService.connect();
  }

  setCurrentDate(): void {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString();
    }
  }

  getAstrologerData(): void {
    const selectedAstrologer = sessionStorage.getItem('selectedAstrologer');

    if (selectedAstrologer) {
      const parsedUser = JSON.parse(selectedAstrologer);
      const regId = parsedUser.regId;

      if (regId) {
        this.http
          .get<Astrologer>(`http://localhost:8075/api/astrologers/${regId}`)
          .subscribe(
            (data) => {
              this.astrologer = data;
              if (!this.astrologer.ratePerMinute || this.astrologer.ratePerMinute <= 0) {
                console.warn('Astrologer has not set a rate yet.');
              }
            },
            (error) => {
              console.error('Error fetching astrologer data', error);
            }
          );
      }
    } else {
      console.error('No current user found in session storage');
    }
  }

  validateInput(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode);

    // Ensure that only digits are allowed (prevent symbols and letters)
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  onMinutesChange(): void {
    if (this.minutes === null || this.minutes < 1) {
      this.minutesError = true;
    } else {
      this.minutesError = false;
      this.calculateTotal(); // Call calculateTotal whenever the input changes

    }
  }

  calculateTotal(): void {
    if (this.astrologer && this.minutes !== null) {
      this.totalAmount = this.astrologer.ratePerMinute! * this.minutes;

      sessionStorage.setItem('ratePerMinute', this.totalAmount.toString());
      sessionStorage.setItem('selectedMinutes', this.minutes.toString());

      this.cardExpanded = true; // Add a boolean variable to track if the card should expand
    } else {
      this.totalAmount = 0; // Reset the totalAmount if no valid input
    }
  }


  goToPayment(): void {
    if (this.totalAmount !== null && this.astrologer) {
      this.router.navigate(['/payment'], {
        
      });
    }
  }
  goToChat(): void {
    if (this.totalAmount !== null && this.astrologer && this.minutes !== null) {
      // console.log('Navigating to Payment with totalAmount:', this.totalAmount, 'and minutes:', this.minutes);
      console.log('Reg ID received:', this.astrologer.regId); // Print regId to the console

      this.router.navigate(['/payment'], {
        queryParams: {
          regId: this.astrologer.regId,
          mobile: this.astrologer.mobile,
          amount: this.totalAmount,
          minutes: this.minutes // Pass minutes to Payment component
        },
      });
    }
  }
}