import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  backEndUrl: string = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      dob: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      district: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      pinCode: new FormControl('', Validators.required),
      mobileNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      gender: new FormControl('', Validators.required),
      birthPlace: new FormControl('', Validators.required),
      birthTime: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      profile_img: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });
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
  // imageUploadAction() {
  //   const imageFormData = new FormData();
  //   imageFormData.append('image', this.uploadedImage, this.uploadedImage.name);
  //   this.http.post('http://localhost:8081/api/astrologers/convert-image', imageFormData, { observe: 'response' })
  //     .subscribe((response) => {
  //       this.image = response;
  //       this.imageInsert?.setValue(this.image.body.imageData);
  //     }
  //       , (error) => {
  //         alert("Something Went Wrong")
  //       }
  //     );
  // }
  imageUploadAction() {
    const imageFormData = new FormData();
    imageFormData.append('image', this.uploadedImage, this.uploadedImage.name);
  
    this.http.post('http://localhost:8081/api/astrologers/convert-image', imageFormData, { observe: 'response' })
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
    console.log('Form submission started'); // Debug statement
    if (this.signupForm.invalid) {
      console.log('Form is invalid'); // Debug statement
      this.showValidationErrors();
      return;
    }
    console.log('Form is valid, proceeding with submission'); // Debug statement
  
    this.http.post(this.backEndUrl, this.signupForm.value).subscribe(
      response => {
        console.log('Signup successful:', response);
        alert('Signup successful! You can now log in.');
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
  
  
    this.http.post(this.backEndUrl, this.signupForm.value).subscribe(
      response => {
        console.log('Signup successful:', response);
        alert('Signup successful! You can now log in.');
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Signup failed:', error);
        alert('Signup failed! Please try again later.');
      }
    );
  }
}
