import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  totalAmount: number | null = null;
  astrologerMobile: string | null = null;
  minutes: number | null = null; // Add minutes to track time for chat
  reg_id: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    console.log("hello",this.minutes);
    
    this.route.queryParams.subscribe(params => {
      this.totalAmount = +params['amount'] || null; // Convert string to number
      this.astrologerMobile = params['mobile'] || null;
      this.minutes = +params['minutes'] || null; // Retrieve minutes from query params
      this.reg_id = params['reg_id'] || null; // Retrieve reg_id from query params

      // console.log('Received in Payment Component - Amount:', this.totalAmount, 'Minutes:', this.minutes);

      // Additional logic, if required
    });
  }

  goToChat(): void {
    // console.log('Navigating from Payment to Chat with minutes:', this.minutes);
    // console.log('Reg ID received:', this.reg_id); // Print reg_id to the console
    this.router.navigate(['/chat'], {
      queryParams: {
        reg_id: this.reg_id,

        mobile: this.astrologerMobile,
        amount: this.totalAmount,
        minutes: this.minutes // Pass minutes to Chat component
      },
    });
  }

}
