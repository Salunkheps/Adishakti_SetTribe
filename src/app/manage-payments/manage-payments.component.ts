import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from 'datatables.net';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-payments',
  templateUrl: './manage-payments.component.html',
  styleUrls: ['./manage-payments.component.css']
})
export class ManagePaymentsComponent implements OnInit {
  payments: any[] = [];
  dtOptions: Config = {};

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.http.get<any[]>('http://localhost:8075/api/payments/pending').subscribe(data => {
          // Fetch user details for each payment and store full name in payment object
          const paymentsWithFullNames = data.map(payment => {
            return this.fetchUserDetails(payment.userId).then(fullName => {
              payment.fullName = fullName;
              return payment;
            });
          });

          // Wait for all names to be fetched before proceeding
          Promise.all(paymentsWithFullNames).then(payments => {
            this.payments = payments; // Store payments for rendering via Angular
            callback({
              recordsTotal: payments.length,
              recordsFiltered: payments.length,
              data: payments
            });
          });
        }, error => {
          console.error("Error fetching payments:", error);
          alert("Error fetching payments");
        });
      },
      columns: [
        {
          title: 'Sr. No.',
          data: null,
          render: (data: any, type: any, row: any, meta: any) => {
            return meta.row + 1; // Generates the serial
          }
        },
        { title: 'Payment ID', data: 'transactionId' }, // Updated to use transactionId
        { title: 'User Name', data: 'fullName' }, // Now showing full name instead of userId
        { title: 'Amount', data: 'amount' },
        { title: 'Status', data: 'status' },
        {
          title: 'View',
          render: (data: any, type: any, row: any) => {
            return `<a href="http://localhost:8075/api/payments/getScreenshotByUserId/${row.userId}" target="_blank" style="text-decoration: none;">View Payment Screenshot</a>`;
          },
        },
        {
          title: 'Actions',
          render: (data: any, type: any, row: any, meta: any) => {
            let buttons = '';
            if (row.status === 'Pending') {
              buttons = `
              <button class="edit-btn btn btn-primary" data-index="${row.paymentId || row.transactionId}">
                
             <i class="fa-solid fa-check"></i>
             </button>
              <button class="delete-btn btn btn-danger"  data-index="${row.paymentId || row.transactionId}">
                <i class="fa-solid fa-close"></i>
              </button>`;
          }
            return buttons;
          },
          orderable: false
        }
      ]
    };

    this.loadPayments();
  }

  ngAfterViewInit(): void {
    // Attach event listeners after the DataTable has been initialized
    $(document).on('click', '.edit-btn', (event) => {
      const index = $(event.currentTarget).data('index');
      this.approvePayment(index);
    });

    $(document).on('click', '.delete-btn', (event) => {
      const index = $(event.currentTarget).data('index');
      this.rejectPayment(index);
    });
  }

  loadPayments(): void {
    this.http.get<any[]>('http://localhost:8075/api/payments/pending').subscribe((data: any[]) => {
      this.payments = data;
      this.payments.forEach(payment => {
        const regId = payment.userId;
        this.fetchUserDetails(regId).then(fullName => {
          payment.fullName = fullName; // Store the full name
        });
      });
    });
  }

  fetchUserDetails(regId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`http://localhost:8075/api/users/regId/${regId}`).subscribe(user => {
        const fullName = `${user.firstName} ${user.lastName}`;
        resolve(fullName); // Return the full name
      }, error => {
        console.error("Error fetching user details:", error);
        reject('');
      });
    });
  }
  approvePayment(paymentId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to change the payment status again!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'No, go back'
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with approving the payment
        this.http.put(`http://localhost:8075/api/payments/approve/${paymentId}`, {}, { responseType: 'text' })
          .subscribe({
          next: (response) => {
            console.log("Response:", response);
            Swal.fire({
              title: 'Approved!',
              text: 'The payment has been approved.',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              // Refresh the page after the user clicks "OK"
              window.location.reload();
            });
          },
          error: (error) => {
            console.error("Error:", error);
            Swal.fire('Error!', 'Error approving payment. Please try again.', 'error');
          }
        });
      }
    });
  }

  rejectPayment(paymentId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to change the payment status again!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'No, go back'
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with rejecting the payment
        this.http.put(`http://localhost:8075/api/payments/reject/${paymentId}`, {}, { responseType: 'text' })
          .subscribe({
          next: (response) => {
            console.log("Response:", response);
            Swal.fire({
              title: 'Rejected!',
              text: 'The payment has been rejected.',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then(() => {
              // Refresh the page after the user clicks "OK"
              window.location.reload();
            });
          },
          error: (error) => {
            console.error("Error:", error);
            Swal.fire('Error!', 'Error rejecting payment. Please try again.', 'error');
          }
        });
      }
    });
  }
  logout(event: MouseEvent) {
    event.preventDefault(); // Prevent default link behavior
    Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      backdrop: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('User logged out');
        this.router.navigate(['/Home']);
      }
    });
  }
}