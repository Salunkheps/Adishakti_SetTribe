import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  hidePassword: boolean = true;
  invalidFile: boolean = false;
  profilePhoto!: File;
  backEndUrl: string = 'http://localhost:8075/api/users/sk';
  

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      dob: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      mobileNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      gender: new FormControl('', Validators.required),
      birthPlace: new FormControl('', Validators.required),
      birthTime: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
      // profilePhoto: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmpass: new FormControl('', Validators.required) // New confirm password field
    }, { validators: this.passwordsMatchValidator });
  }
  // Validator to check if password and confirm password are the same
  passwordsMatchValidator: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const password = formGroup.get('password')?.value;
    const confirmpass = formGroup.get('confirmpass')?.value;
    return password === confirmpass ? null : { passwordsMismatch: true };
  }


  // Capture the file input
  onFileSelected(event: any): void {
    const file = event.target.files[0]; // Capture the selected file
  
    // Check if a file is selected and validate its type
    if (file) {
      const fileType = file.type;
      const validTypes = ['image/jpeg', 'image/png', 'image/gif']; // Define valid types
  
      // Check if the selected file type is valid
      if (validTypes.includes(fileType)) {
        this.profilePhoto = file; // Store the selected file
        this.invalidFile = false; // Reset invalid file flag
      } else {
        this.invalidFile = true; // Set invalid file flag
        
      }
    }
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get dob() { return this.signupForm.get('dob'); }
  get city() { return this.signupForm.get('city'); }
  get gender() { return this.signupForm.get('gender'); }
  get birthPlace() { return this.signupForm.get('birthPlace'); }
  get birthTime() { return this.signupForm.get('birthTime'); }
  get password() { return this.signupForm.get('password'); }
  get mobileNumber() { return this.signupForm.get('mobileNumber'); }
  get confirmpass() { return this.signupForm.get('confirmpass'); }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  checkIfAllFieldsEmpty(): boolean {
    return !this.firstName?.value &&
      !this.lastName?.value &&
      !this.email?.value &&
      !this.dob?.value &&
      !this.city?.value &&
      !this.gender?.value &&
      !this.birthPlace?.value &&
      !this.birthTime?.value &&
      !this.password?.value &&
      !this.confirmpass?.value &&
      !this.mobileNumber?.value;
  }

  validateStartDigit(event: KeyboardEvent) {
    const validStartDigits = ['6', '7', '8', '9'];
    const inputLength = (event.target as HTMLInputElement).value.length;

    // Allow backspace and delete
    if (event.key === 'Backspace' || event.key === 'Delete') {
        return;
    }

    // Prevent entering more than 10 digits
    if (inputLength >= 10) {
        event.preventDefault();
    }

    // Prevent entering a number not starting with 6-9 for the first character
    if (inputLength === 0 && !validStartDigits.includes(event.key)) {
        event.preventDefault();
    }
}

  signup() {
    if (this.checkIfAllFieldsEmpty()) {
      // Show SweetAlert if all fields are empty
      Swal.fire({
        title: 'Error!',
        text: 'All fields are empty! Please fill out the form.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.signupForm.invalid) {
      this.showValidationErrors();
      return;
    }

    const formData = new FormData();
    formData.append('firstName', this.signupForm.get('firstName')?.value);
    formData.append('lastName', this.signupForm.get('lastName')?.value);
    formData.append('email', this.signupForm.get('email')?.value);
    formData.append('dob', this.signupForm.get('dob')?.value);
    formData.append('city', this.signupForm.get('city')?.value);
    formData.append('gender', this.signupForm.get('gender')?.value);
    formData.append('birthPlace', this.signupForm.get('birthPlace')?.value);
    formData.append('birthTime', this.signupForm.get('birthTime')?.value);
    formData.append('password', this.signupForm.get('password')?.value);
    formData.append('mobileNumber', this.signupForm.get('mobileNumber')?.value);
    formData.append('profilePhoto', this.profilePhoto); // Append the file

    // Log the data for debugging purposes
    console.log('Form Data:', formData);

    this.http.post(this.backEndUrl, formData).subscribe(
      response => {
        // Debug response for success
        console.log('Success Response:', response);

        // Display success SweetAlert
        Swal.fire({
          title: 'Success!',
          text: 'Signup successful!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/login']); // Redirect to login after success
        });
      },
      error => {

        // Check for conflict error (user with same email already exists)
        if (error.status === 409) {
          Swal.fire({
            title: 'Error!',
            text: 'User with this email already exists. Please try a different email.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }

        // Debug error for more clarity
        console.error('Error Response:', error);

        // Display error SweetAlert only for actual errors
        Swal.fire({
          title: 'Error!',
          text: error.error?.message || 'Signup failed! Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }





  showValidationErrors() {
    if (this.signupForm.errors?.['passwordsMismatch']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password and Confirm Password do not match',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.firstName?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'First Name is required',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.lastName?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Last Name is required',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.email?.errors?.['required'] || this.email?.errors?.['email']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Email is required and must be in a valid format',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.password?.errors?.['minlength']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password should be at least 8 characters long',
        confirmButtonText: 'OK'
      });
      return;
    } else if (this.password?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password is required',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.confirmpass?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Confirm Password is required',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.mobileNumber?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Mobile Number is required',
        confirmButtonText: 'OK'
      });
      return;
    } else if (this.mobileNumber?.errors?.['pattern']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Mobile Number must be numeric and 10 digits long',
        confirmButtonText: 'OK'
      });
      return;
    }
  }
  validateAlphabetic(event: KeyboardEvent) {
    const charCode = event.keyCode ? event.keyCode : event.which;
    
    // Allow only alphabetic keys (A-Z and a-z)
    if (
      (charCode > 31 && (charCode < 65 || charCode > 90)) && // Uppercase A-Z
      (charCode < 97 || charCode > 122) // Lowercase a-z
    ) {
      event.preventDefault();
    }
  }
  

  validateNumeric(event: KeyboardEvent) {
    const charCode = event.keyCode ? event.keyCode : event.which;
    
    // Allow only numeric keys
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
}