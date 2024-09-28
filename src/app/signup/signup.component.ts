import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  uploadedImage!: File;
  image: any = []
  backEndUrl: string = 'http://localhost:8075/api/users';

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
      profile_img: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });
    console.log('Form Controls:', this.signupForm.controls);
  }
  

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get mobileNumber() { return this.signupForm.get('mobileNumber'); }
  get imageInsert() { return this.signupForm.get('profile_img'); }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
  public onImageUpload(event: any) {
    this.uploadedImage = event.target.files[0];
    alert("insert image")
    this.imageUploadAction()
  }

  imageUploadAction() {
    const imageFormData = new FormData();
    imageFormData.append('image', this.uploadedImage, this.uploadedImage.name);

    this.http.post('http://localhost:8075/api/astrologers/convert-image', imageFormData, { observe: 'response' })
      .subscribe(
        (response: any) => {
          console.log('Full response received from server:', response);

          // Check if response has a body and imageData
          if (response && response.body && response.body.imageData) {
            console.log('Image data received:', response.body.imageData);

            // Set the form control value
            this.imageInsert?.setValue(response.body.imageData);
            this.image = response;  // Save the response in the component's image property

          } else {
            console.error('Response does not contain expected imageData:', response);
            alert('Unexpected response format.');
          }
        },
        (error) => {
          console.error('Error during image upload:', error);

          // Provide detailed error feedback
          if (error.status === 500) {
            alert('Server error: Please check the server logs.');
          } else if (error.status === 404) {
            alert('API endpoint not found: Please check the URL.');
          } else {
            alert('Something went wrong during the image upload.');
          }
        }
      );
  }
  signup() {
    if (this.signupForm.invalid) {
      this.showValidationErrors();
      return;
    }
    const formData = { ...this.signupForm.value}; // Update the form data with the correct country

    this.http.post(this.backEndUrl, formData).subscribe(
      response => {
       Swal.fire("SweetAlert2 is working!");

        // Signup successful! You can now log in.
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Signup failed:', error);
        alert('Signup failed! Please try again later.');
      }
    );
  }


  showValidationErrors() {
    if (this.firstName?.errors?.['required']) {
      alert('First Name is required');
    }
    if (this.lastName?.errors?.['required']) {
      alert('Last Name is required');
    }
    if (this.email?.errors?.['required'] || this.email?.errors?.['email']) {
      alert('Email is required and must be in a valid format');
    }
    if (this.password?.errors?.['minlength']) {
      alert('Password should be at least 8 characters long');
    } else if (this.password?.errors?.['required']) {
      alert('Password is required');
    }
    if (this.mobileNumber?.errors?.['required']) {
      alert('Mobile Number is required');
    } else if (this.mobileNumber?.errors?.['pattern']) {
      alert('Mobile Number must be numeric and 10 digits long');
    }

  }
}
