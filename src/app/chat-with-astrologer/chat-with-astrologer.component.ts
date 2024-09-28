import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Astrologer {
  reg_id: number;
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
export class ChatWithAstrologerComponent implements OnInit {
  astrologer: Astrologer | null = null;
  minutes: number | null = null;
  totalAmount: number | null = null;
  isAvailable: boolean = true; // Set availability status based on your logic

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setCurrentDate();
    this.getAstrologerData();
  }

  setCurrentDate(): void {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString();
    }
  }

  getAstrologerData(): void {
    const reg_id = this.route.snapshot.paramMap.get('reg_id');
    if (reg_id) {
      this.http
        .get<Astrologer>(`http://localhost:8075/api/astrologers/${reg_id}`)
        .subscribe(
          (data) => {
            this.astrologer = data;
          },
          (error) => {
            console.error('Error fetching astrologer data', error);
          }
        );
    }
  }

  calculateTotal(): void {
    if (this.astrologer && this.minutes !== null) {
      this.totalAmount = this.astrologer.ratePerMinute * this.minutes;
    }
  }

  goToPayment(): void {
    if (this.totalAmount !== null && this.astrologer) {
      this.router.navigate(['/payment'], {
        queryParams: {
          mobile: this.astrologer.mobile,
          amount: this.totalAmount
        },
      });
    }
  }
  goToChat(): void {
    if (this.totalAmount !== null && this.astrologer && this.minutes !== null) {
      // console.log('Navigating to Payment with totalAmount:', this.totalAmount, 'and minutes:', this.minutes);
      console.log('Reg ID received:', this.astrologer.reg_id); // Print reg_id to the console

      this.router.navigate(['/payment'], {
        queryParams: {
          reg_id: this.astrologer.reg_id,
          mobile: this.astrologer.mobile,
          amount: this.totalAmount,
          minutes: this.minutes // Pass minutes to Payment component
        },
      });
    }
  }
}
