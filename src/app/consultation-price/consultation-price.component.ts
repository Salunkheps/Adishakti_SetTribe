// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-consultation-price',
//   templateUrl: './consultation-price.component.html',
//   styleUrls: ['./consultation-price.component.css']
// })
// export class ConsultationPriceComponent implements OnInit {
//   consultationForm!: FormGroup;

//   constructor(private fb: FormBuilder, private router: Router) { }

//   ngOnInit(): void {
//     this.consultationForm = this.fb.group({
//       // experience: ['', [Validators.required, Validators.min(0)]],
//       ratePerMinute: ['', [Validators.required, Validators.min(1)]],
//       // currency: ['', Validators.required]
//     });
//   }

//   onSubmit(): void {
//     if (this.consultationForm.valid) {
//       console.log('Form Submitted', this.consultationForm.value);

//       // Trigger the SweetAlert
//       Swal.fire({
//         title: 'Success!',
//         text: 'Consultation price changed successfully!',
//         icon: 'success',
//         confirmButtonText: 'OK'
//       }).then((result) => {
//         if (result.isConfirmed) {
//           // Handle any additional actions after the alert
//           console.log('SweetAlert closed');
//         }
//       });

//     } else {
//       // Display SweetAlert for form errors
//       Swal.fire({
//         title: 'Error!',
//         text: 'Please ensure all fields are correctly filled.',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//     }
//   }

//   logout(event: MouseEvent): void {
//     // Prevent the default behavior of the button click (in case it's a form submission or link)
//     event.preventDefault();

//     // Show SweetAlert confirmation dialog
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'Do you really want to logout?',
//       icon: 'warning',
//       showCancelButton: true,  // Show the "Cancel" button
//       confirmButtonText: 'Yes, logout',
//       cancelButtonText: 'No, stay logged in'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         // Only if the user confirms, clear session and redirect
//         sessionStorage.clear(); // Clear session storage
//         localStorage.removeItem('currentUser'); // Optional: clear local storage if you're storing user info

//         // Show another SweetAlert message confirming logout success
//         Swal.fire({
//           title: 'Logged Out',
//           text: 'You have been logged out successfully.',
//           icon: 'success',
//           confirmButtonText: 'OK'
//         }).then(() => {
//           // Redirect to login page after showing success message
//           this.router.navigate(['/astrologer-login']);
//         });
//       }
//       // If the user cancels, do nothing (no redirection)
//     });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Import HttpClient

// Define the model interface for ConsultationPrice
interface ConsultationPrice {
  id?: number; // Optional, as it won't be present when creating a new entry
  reg_id?: string; // Assuming reg_id is optional too
  ratePerMinute: number;
}

@Component({
  selector: 'app-consultation-price',
  templateUrl: './consultation-price.component.html',
  styleUrls: ['./consultation-price.component.css']
})
export class ConsultationPriceComponent implements OnInit {
  consultationForm!: FormGroup;
  consultationPrices: ConsultationPrice[] = []; // Array to hold consultation prices
  private apiUrl = 'http://localhost:8075/api/consultation-prices'; // Set your API URL here
  currentEditId: number | undefined; // Change from number | null to number | undefined

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.consultationForm = this.fb.group({
      ratePerMinute: ['', [Validators.required, Validators.min(1)]],
    });

    this.loadConsultationPrices(); // Load existing consultation prices on init
  }

  onSubmit(): void {
    if (this.consultationForm.valid) {
      if (this.currentEditId !== undefined) {
        // If editing an existing price
        this.http.put(`${this.apiUrl}/${this.currentEditId}`, this.consultationForm.value).subscribe(
          response => {
            console.log('Price updated successfully:', response);
            alert('Price updated successfully!');
            this.loadConsultationPrices(); // Reload prices after update
            this.resetForm(); // Reset form after submission
          },
          error => {
            console.error('There was an error!', error);
            alert('There was an error updating the price. Please try again!');
          }
        );
      } else {
        // Send data to API for creating a new entry
        this.http.post(this.apiUrl, this.consultationForm.value).subscribe(
          response => {
            console.log('Form submitted successfully:', response);
            alert('Your data has been submitted successfully!');
            this.loadConsultationPrices(); // Reload prices after submission
            this.resetForm(); // Reset form after submission
          },
          error => {
            console.error('There was an error!', error);
            alert('There was an error submitting your form. Please try again!');
          }
        );
      }
    } else {
      console.log('Form is not valid');
      alert('Form is not valid. Please fill out the required fields correctly.');
    }
  }

  // Load existing consultation prices from the server
  private loadConsultationPrices(): void {
    this.http.get<ConsultationPrice[]>(this.apiUrl).subscribe(
      data => {
        this.consultationPrices = data;
      },
      error => {
        console.error('Error loading consultation prices', error);
      }
    );
  }

  // Edit consultation price
  editPrice(price: ConsultationPrice): void {
    this.currentEditId = price.id; // Set the current edit ID
    this.consultationForm.patchValue({
      ratePerMinute: price.ratePerMinute
    });
  }

  // Delete consultation price
  deletePrice(id: number): void {
    if (confirm('Are you sure you want to delete this price?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(
        response => {
          console.log('Price deleted successfully:', response);
          alert('Price deleted successfully!');
          this.loadConsultationPrices(); // Reload prices after deletion
        },
        error => {
          console.error('There was an error deleting the price!', error);
          alert('There was an error deleting the price. Please try again!');
        }
      );
    }
  }

  // Reset form fields
  private resetForm(): void {
    this.consultationForm.reset();
    this.currentEditId = undefined; // Reset the edit ID to undefined
  }
}