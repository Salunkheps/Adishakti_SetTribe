import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Astrologer {
  id: number;
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http
        .get<Astrologer>(`http://localhost:8081/api/astrologers/${id}`)
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
}
