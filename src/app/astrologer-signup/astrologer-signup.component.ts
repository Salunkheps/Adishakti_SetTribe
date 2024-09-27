import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-astrologer-signup',
  templateUrl: './astrologer-signup.component.html',
  styleUrls: ['./astrologer-signup.component.css']
})
export class AstrologerSignupComponent implements OnInit {
  backEndUrl: string = 'http://localhost:8075/api/astrologers/create';

  uploadedImage!: File;
  image: any = [];

  constructor(private http: HttpClient, private router: Router) { }

  signupForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    dob: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
    aadharNumber: new FormControl('', Validators.required),
    experience: new FormControl('', Validators.required),
    languages: new FormControl([]),  // Correct field name
    skills: new FormControl([], Validators.required),
    certification: new FormControl(''),
    degree: new FormControl(''),
    city: new FormControl(''),
    pinCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]),
    profilePhoto: new FormControl('', Validators.required),  // Correct field name
    password: new FormControl('', Validators.required),
    confirmpass: new FormControl('')
  });

  ngOnInit(): void { }

  // Password Match Validator
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmpass')?.value;

      return password === confirmPassword ? null : { mismatch: true };
    };
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get imageData() { return this.signupForm.get('profilePhoto'); }  // Correct field name
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get mobile() { return this.signupForm.get('mobile'); }
  get dob() { return this.signupForm.get('dob'); }
  get gender() { return this.signupForm.get('gender'); }
  get aadharNumber() { return this.signupForm.get('aadharNumber'); }
  get experience() { return this.signupForm.get('experience'); }
  get languages() { return this.signupForm.get('languages'); }  // Correct field name
  get skills() { return this.signupForm.get('skills'); }
  get certification() { return this.signupForm.get('certification'); }
  get degree() { return this.signupForm.get('degree'); }
  get city() { return this.signupForm.get('city'); }
  get pinCode() { return this.signupForm.get('pinCode'); }

  public onImageUpload(event: any) {
    this.uploadedImage = event.target.files[0];
    this.imageUploadAction();
  }

  imageUploadAction() {
    const imageFormData = new FormData();
    imageFormData.append('image', this.uploadedImage, this.uploadedImage.name);
    this.http.post('http://localhost:8075/api/astrologers/convert-image', imageFormData, { observe: 'response' })
      .subscribe((response) => {
        this.image = response;
        // this.imageData?.setValue(this.image.body);  // Save image response in profilePhoto
      }, (error) => {
        alert("Something Went Wrong");
      });
  }

  signup(form: FormGroup) {
    if (form.invalid) {
      alert('Please fill all required fields correctly.');
      return;
    }
  
    if (form.hasError('mismatch')) {
      alert('Passwords do not match.');
      return;
    }
  
    // Convert the date of birth to 'YYYY-MM-DD' format
    const formattedDob = new Date(form.value.dob).toISOString().split('T')[0];
  
    const formData = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      mobile: form.value.mobile,
      dob: formattedDob,  // Use the formatted date
      gender: form.value.gender,
      aadharNumber: form.value.aadharNumber,
      experience: form.value.experience,
      languages: Array.isArray(form.value.languages) ? form.value.languages : [form.value.languages],  // Ensure array format
      skills: form.value.skills,
      certification: form.value.certification,
      degree: form.value.degree,
      city: form.value.city,
      pinCode: form.value.pinCode,
      password: form.value.password,
      profilePhoto: this.image?.body || '',  // Include the image response here
    };
  
    console.log('Submitting form data:', formData);
  
    this.http.post(this.backEndUrl, formData).subscribe(
      (response: any) => {
        console.log('Signup successful:', response);
        Swal.fire("Signup successful! Please wait for the admin to approve your request!");
        this.signupForm.reset();
        this.router.navigate(['/astrologer-login']);
      },
      (error) => {
        console.error('Signup failed:', error);
        alert('Signup failed');
      }
    );
  }
  
}
