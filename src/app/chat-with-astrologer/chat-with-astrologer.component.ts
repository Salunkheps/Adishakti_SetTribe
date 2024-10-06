import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../web-socket.service';

interface Astrologer {
  regId: number;
  firstName: string;
  lastName: string;
  mobile: string;
  ratePerMinute: number;
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
  isAvailable: boolean = true; // Set availability status based on your logic

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


  calculateTotal(): void {
    if (this.astrologer && this.minutes !== null) {
      this.totalAmount = this.astrologer.ratePerMinute * this.minutes;

      sessionStorage.setItem('ratePerMinute', this.totalAmount.toString());
      sessionStorage.setItem('selectedMinutes', this.minutes.toString());

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
