import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-astrologer-signup',
  templateUrl: './astrologer-signup.component.html',
  styleUrls: ['./astrologer-signup.component.css']
})
export class AstrologerSignupComponent implements OnInit {
  signupForm!: FormGroup;
  hidePassword: boolean = true;
  profilePhoto!: File; // To hold the uploaded file
  skillsList: string[] = ['Horoscope Reading', 'Tarot Reading', 'Numerology', 'Palmistry', 'Vedic Astrology', 'Feng Shui', 'Face Reading'];
  languagesList: string[] = ['English', 'Hindi', 'Marathi', 'Others'];

  selectedSkills: string[] = [];
  selectedLanguages: string[] = [];

  showSkillsDropdown: boolean = false;
  showLanguagesDropdown: boolean = false;

  backEndUrl: string = 'http://localhost:8075/api/astrologers/create';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      gender: new FormControl('', Validators.required),
      aadharNumber: new FormControl('', Validators.required),
      dob: new FormControl('', Validators.required),
      experience: new FormControl('', Validators.required),
      skills: new FormControl([], Validators.required), // Array for skills
      languages: new FormControl([], Validators.required),// Initialize as an array
      certification: new FormControl('', Validators.required),
      degree: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      pinCode: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
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

  toggleSkillsDropdown(): void {
    this.showSkillsDropdown = !this.showSkillsDropdown;
  }

  toggleLanguagesDropdown(): void {
    this.showLanguagesDropdown = !this.showLanguagesDropdown;
  }

  onSkillChange(event: any): void {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedSkills.push(value);
    } else {
      this.selectedSkills = this.selectedSkills.filter(skill => skill !== value);
    }
    this.signupForm.get('skills')?.setValue(this.selectedSkills);
  }

  onLanguageChange(event: any): void {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedLanguages.push(value);
    } else {
      this.selectedLanguages = this.selectedLanguages.filter(language => language !== value);
    }
    this.signupForm.get('languages')?.setValue(this.selectedLanguages);
  }

  // Capture the file input
  onFileSelected(event: any): void {
    this.profilePhoto = event.target.files[0]; // Store the selected file
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get mobile() { return this.signupForm.get('mobile'); }
  get gender() { return this.signupForm.get('gender'); }
  get aadharNumber() { return this.signupForm.get('aadharNumber'); }
  get dob() { return this.signupForm.get('dob'); }
  get experience() { return this.signupForm.get('experience'); }
  get languages() { return this.signupForm.get('languages'); }
  get skills() { return this.signupForm.get('skills'); }
  get certification() { return this.signupForm.get('certification'); }
  get degree() { return this.signupForm.get('degree'); }
  get city() { return this.signupForm.get('city'); }
  get pinCode() { return this.signupForm.get('pinCode'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
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
      !this.password?.value &&
      !this.confirmpass?.value &&
      !this.mobile?.value &&
      !this.aadharNumber?.value &&
      !this.experience?.value &&
      !this.languages?.value &&
      !this.skills?.value &&
      !this.certification?.value &&
      !this.degree?.value &&
      !this.pinCode?.value;
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
    formData.append('mobile', this.signupForm.get('mobile')?.value);
    formData.append('gender', this.signupForm.get('gender')?.value);
    formData.append('aadharNumber', this.signupForm.get('aadharNumber')?.value);
    formData.append('dob', this.signupForm.get('dob')?.value);
    formData.append('experience', this.signupForm.get('experience')?.value);
    formData.append('languages', this.signupForm.get('languages')?.value);
    formData.append('skills', this.signupForm.get('skills')?.value);
    formData.append('certification', this.signupForm.get('certification')?.value);
    formData.append('degree', this.signupForm.get('degree')?.value);
    formData.append('city', this.signupForm.get('city')?.value);
    formData.append('pinCode', this.signupForm.get('pinCode')?.value);
    formData.append('email', this.signupForm.get('email')?.value);
    formData.append('password', this.signupForm.get('password')?.value);
    formData.append('profilePhoto', this.profilePhoto); // Append the file

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
  
    if (this.mobile?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Mobile Number is required',
        confirmButtonText: 'OK'
      });
      return;
    } else if (this.mobile?.errors?.['pattern']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Mobile Number must be numeric and 10 digits long',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.gender?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Gender is required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.aadharNumber?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Aadhar Number is required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.dob?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Date of Birth is required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.experience?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Experience is required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.languages?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Languages are required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.skills?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Skills are required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.certification?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Certification is required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.degree?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Degree is required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.city?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'City is required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.pinCode?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Pin Code is required',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (this.email?.errors?.['required']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Email is required',
        confirmButtonText: 'OK'
      });
      return;
    } else if (this.email?.errors?.['email']) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Invalid email format',
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
  }  
}