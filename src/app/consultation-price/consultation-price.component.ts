import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import Swal from 'sweetalert2';

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
  private apiUrl = 'http://localhost:8075/api/astrologers'; // Set your API URL here
  currentEditId: number | undefined; // Change from number | null to number | undefined

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.consultationForm = this.fb.group({
      ratePerMinute: ['', [Validators.required, Validators.min(1)]],
    });

    this.loadConsultationPrices(); // Load existing consultation prices on init
  }

  onSubmit(): void {
    if (this.consultationForm.valid) {
      const ratePerMinute = this.consultationForm.get('ratePerMinute')?.value;

      // Retrieve regId from sessionStorage
      const regId = sessionStorage.getItem('regId');

      if (regId) {
        // If regId exists, send the value to the backend
        this.http.post(`${this.apiUrl}/${regId}/ratePerMinute`, ratePerMinute).subscribe(
          response => {
            console.log('Rate per minute set successfully:', response);
            Swal.fire('Success', 'Rate per minute has been set successfully!', 'success'); // SweetAlert for success
            this.loadConsultationPrices(); // Reload the price list after submission
            this.resetForm(); // Reset the form after submission
          },
          error => {
            console.error('Error setting rate per minute:', error);
            Swal.fire('Error', 'There was an error setting the rate per minute. Please try again!', 'error'); // SweetAlert for error
          }
        );
      } else {
        Swal.fire('Error', 'Astrologer ID not found in session storage!', 'error');
      }
    } else {
      console.log('Form is not valid');
      Swal.fire('Error', 'Form is not valid. Please fill out the required fields correctly.', 'error'); // SweetAlert for form validation error
    }
  }


  // Load existing consultation prices from the server
  private loadConsultationPrices(): void {
    const regId = sessionStorage.getItem('regId');
  
    if (regId) {
      this.http.get<number>(`${this.apiUrl}/${regId}/ratePerMinute`).subscribe(
        data => {
          if (data !== null && data !== undefined) {
            // If data is a number (not an array), handle it accordingly
            this.consultationPrices = [{ ratePerMinute: data }];
            console.log('Consultation price loaded successfully:', data);
          } else {
            // No data, so show the form
            this.consultationPrices = [];
            console.log('No consultation prices found for the astrologer.');
          }
        },
        error => {
          console.error('Error loading consultation prices:', error);
          // Only show the alert if the error is not due to deletion
          if (error.status !== 404) { // Assuming 404 is the error code for no consultation price found
            Swal.fire('Error', 'Error loading consultation prices.', 'error');
          }
          // Handle the error: either show the form or an error message
          this.consultationPrices = [];
        }
      );
    } else {
      console.error('regId not found in session storage.');
      Swal.fire('Error', 'Astrologer ID not found in session storage!', 'error');
    }
  }

  editPrice(price: ConsultationPrice): void {
    const regId = sessionStorage.getItem('regId');

    if (!regId) {
      alert('Astrologer ID not found in session storage!');
      return;
    }

    Swal.fire({
      title: 'Update Consultation Price',
      input: 'number',
      inputLabel: 'Rate per Minute (in currency)',
      inputValue: price.ratePerMinute,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        const numericValue = Number(value);
        if (!value || isNaN(numericValue) || numericValue <= 0) {
          return 'Please enter a valid rate per minute!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newRatePerMinute = Number(result.value);

        // Set the headers to specify the content type
        const headers = { 'Content-Type': 'application/json' }; // Set to application/json

        // Call the PUT API to update the consultation price with a plain number
        this.http.put(`${this.apiUrl}/${regId}/ratePerMinute`, newRatePerMinute, { headers, responseType: 'text' }).subscribe(
          response => {
            Swal.fire('Success', 'Rate per minute has been updated successfully!', 'success');
            this.loadConsultationPrices();
          },
          error => {
            console.error('Error updating price:', error);
            Swal.fire('Error', 'There was an error updating the price. Please try again.', 'error');
          }
        );
      }
    });
  }




  updateConsultationPrice(): void {
    if (this.consultationForm.valid && this.currentEditId !== undefined) {
      const ratePerMinute = this.consultationForm.get('ratePerMinute')?.value;
      const regId = sessionStorage.getItem('regId'); // Fetch regId from session storage

      this.http.put(`${this.apiUrl}/${regId}/ratePerMinute`, ratePerMinute, { responseType: 'text' }).subscribe(
        response => {
          console.log('Price updated successfully:', response);
          alert('Price updated successfully!');
          this.loadConsultationPrices(); // Reload prices after update
          this.resetForm(); // Reset the form
        },
        error => {
          console.error('Error updating price', error);
          alert('Error updating price. Please try again.');
        }
      );
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  // Delete consultation price
  deletePrice(id: number): void {
    const regId = sessionStorage.getItem('regId');

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${regId}/ratePerMinute`).subscribe(
          response => {
            console.log('Price deleted successfully:', response);
            Swal.fire('Deleted!', 'Price has been deleted.', 'success');
            this.loadConsultationPrices(); // Reload prices after deletion
          },
          error => {
            console.error('There was an error deleting the price!', error);
            Swal.fire('Error!', 'There was an error deleting the price. Please try again!', 'error');
          }
        );
      }
    });
  }


  // Reset form fields
  private resetForm(): void {
    this.consultationForm.reset();
    this.currentEditId = undefined; // Reset the edit ID to undefined
  }
}