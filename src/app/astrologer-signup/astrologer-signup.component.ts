// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
// import { Router } from '@angular/router';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-astrologer-signup',
//   templateUrl: './astrologer-signup.component.html',
//   styleUrls: ['./astrologer-signup.component.css']
// })
// export class AstrologerSignupComponent implements OnInit {
//   backEndUrl: string = 'http://localhost:8075/api/astrologers/create';

//   uploadedImage!: File;
//   image: any = [];

//   constructor(private http: HttpClient, private router: Router) { }

//   signupForm: FormGroup = new FormGroup({
//     firstName: new FormControl('', Validators.required),
//     lastName: new FormControl('', Validators.required),
//     email: new FormControl('', [Validators.required, Validators.email]),
//     mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
//     dob: new FormControl('', Validators.required),
//     gender: new FormControl('', Validators.required),
//     aadharNumber: new FormControl('', Validators.required),
//     experience: new FormControl('', Validators.required),
//     languages: new FormControl([]),  // Correct field name
//     skills: new FormControl([], Validators.required),
//     certification: new FormControl(''),
//     degree: new FormControl(''),
//     city: new FormControl(''),
//     pinCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]),
//     profilePhoto: new FormControl('', Validators.required),  // Correct field name
//     password: new FormControl('', Validators.required),
//     confirmpass: new FormControl('')
//   });

//   ngOnInit(): void { }

//   // Password Match Validator
//   passwordMatchValidator(): ValidatorFn {
//     return (control: AbstractControl): ValidationErrors | null => {
//       const group = control as FormGroup;
//       const password = group.get('password')?.value;
//       const confirmPassword = group.get('confirmpass')?.value;

//       return password === confirmPassword ? null : { mismatch: true };
//     };
//   }

//   get firstName() { return this.signupForm.get('firstName'); }
//   get imageData() { return this.signupForm.get('profilePhoto'); }  // Correct field name
//   get lastName() { return this.signupForm.get('lastName'); }
//   get email() { return this.signupForm.get('email'); }
//   get mobile() { return this.signupForm.get('mobile'); }
//   get dob() { return this.signupForm.get('dob'); }
//   get gender() { return this.signupForm.get('gender'); }
//   get aadharNumber() { return this.signupForm.get('aadharNumber'); }
//   get experience() { return this.signupForm.get('experience'); }
//   get languages() { return this.signupForm.get('languages'); }  // Correct field name
//   get skills() { return this.signupForm.get('skills'); }
//   get certification() { return this.signupForm.get('certification'); }
//   get degree() { return this.signupForm.get('degree'); }
//   get city() { return this.signupForm.get('city'); }
//   get pinCode() { return this.signupForm.get('pinCode'); }

//   public onImageUpload(event: any) {
//     this.uploadedImage = event.target.files[0];
//     this.imageUploadAction();
//   }

//   imageUploadAction() {
//     const imageFormData = new FormData();
//     imageFormData.append('image', this.uploadedImage, this.uploadedImage.name);
//     this.http.post('http://localhost:8075/api/astrologers/convert-image', imageFormData, { observe: 'response' })
//       .subscribe((response) => {
//         this.image = response;
//         // this.imageData?.setValue(this.image.body);  // Save image response in profilePhoto
//       }, (error) => {
//         alert("Something Went Wrong");
//       });
//   }

//   signup(form: FormGroup) {
//     if (form.invalid) {
//       alert('Please fill all required fields correctly.');
//       return;
//     }
  
//     if (form.hasError('mismatch')) {
//       alert('Passwords do not match.');
//       return;
//     }
  
//     // Convert the date of birth to 'YYYY-MM-DD' format
//     const formattedDob = new Date(form.value.dob).toISOString().split('T')[0];
  
//     const formData = {
//       firstName: form.value.firstName,
//       lastName: form.value.lastName,
//       email: form.value.email,
//       mobile: form.value.mobile,
//       dob: formattedDob,  // Use the formatted date
//       gender: form.value.gender,
//       aadharNumber: form.value.aadharNumber,
//       experience: form.value.experience,
//       languages: Array.isArray(form.value.languages) ? form.value.languages : [form.value.languages],  // Ensure array format
//       skills: form.value.skills,
//       certification: form.value.certification,
//       degree: form.value.degree,
//       city: form.value.city,
//       pinCode: form.value.pinCode,
//       password: form.value.password,
//       profilePhoto: this.image?.body || '',  // Include the image response here
//     };
  
//     console.log('Submitting form data:', formData);
  
//     this.http.post(this.backEndUrl, formData).subscribe(
//       (response: any) => {
//         console.log('Signup successful:', response);
//         Swal.fire("Signup successful! Please wait for the admin to approve your request!");
//         this.signupForm.reset();
//         this.router.navigate(['/astrologer-login']);
//       },
//       (error) => {
//         console.error('Signup failed:', error);
//         alert('Signup failed');
//       }
//     );
//   }
  
// }





// ------
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-astrologer-signup',
  templateUrl: './astrologer-signup.component.html',
  styleUrls: ['./astrologer-signup.component.css']
})
export class AstrologerSignupComponent implements OnInit {
  newArray: any = [];
  backEndUrl: string = 'http://localhost:8081/api/astrologers';

  uploadedImage!: File;
  image: any = []
  constructor(private http: HttpClient, private router: Router) { }
  signupForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    dob: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    aadharNumber: new FormControl('', [Validators.required]),
    experience: new FormControl('', [Validators.required]),
    languagesKnown: new FormControl([]),
    skills: new FormControl([]),
    lang: new FormControl([]),
    certification: new FormControl(null),
    degree: new FormControl(''),
    ratePerMinute: new FormControl(''),
    city: new FormControl(''),
    district: new FormControl(''),
    state: new FormControl(''),
    country: new FormControl(''),
    id: new FormControl(0),

    pinCode: new FormControl(''),
    blogs: new FormControl(null),
    astrologerImages: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    confirmpass: new FormControl('')
  });

  ngOnInit(): void {

  }

  get firstName() { return this.signupForm.get('firstName'); }
  get imageData() { return this.signupForm.get('astrologerImages'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get mobile() { return this.signupForm.get('mobile'); }
  get dob() { return this.signupForm.get('dob'); }
  get gender() { return this.signupForm.get('gender'); }
  get aadharNumber() { return this.signupForm.get('aadharNumber'); }
  get experience() { return this.signupForm.get('experience'); }
  get languagesKnown() { return this.signupForm.get('languagesKnown'); }
  get skills() { return this.signupForm.get('skills'); }
  get lang() { return this.signupForm.get('lang'); }
  get certification() { return this.signupForm.get('certification'); }
  get degree() { return this.signupForm.get('degree'); }
  get ratePerMinute() { return this.signupForm.get('ratePerMinute'); }
  get city() { return this.signupForm.get('city'); }
  get district() { return this.signupForm.get('district'); }
  get state() { return this.signupForm.get('state'); }
  get country() { return this.signupForm.get('country'); }
  get pinCode() { return this.signupForm.get('pinCode'); }
  public onImageUpload(event: any) {
    this.uploadedImage = event.target.files[0];
    alert("insert image")
    this.imageUploadAction()
  }
  skillsChange() {

    this.newArray.push(this.lang?.value)
    console.log(this.newArray)
    this.languagesKnown?.setValue(this.newArray);
  }
  imageUploadAction() {
    const imageFormData = new FormData();
    imageFormData.append('image', this.uploadedImage, this.uploadedImage.name);
    this.http.post('http://localhost:8081/api/astrologers/convert-image', imageFormData, { observe: 'response' })
      .subscribe((response) => {
        this.image = response;
        this.imageData?.setValue(this.image.body);
      }
        , (error) => {
          alert("Something Went Wrong")
        }
      );
  }
  sublit(form: any) {
    this.http.post(this.backEndUrl, form).subscribe(
      (response) => {
        alert("Data Insert")

      },
      (error) => {
        alert("error")
      }
    );
  }
  signup(form: FormGroup) {



    this.http.post(this.backEndUrl, form.value).subscribe(
      (response: any) => {
        console.log('Signup successful:', response);
        alert('Submit Data');
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


// -----------------


// import { Component, OnInit } from '@angular/core';
// import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { map, Observable } from 'rxjs';

// @Component({
//   selector: 'app-astrologer-signup',
//   templateUrl: './astrologer-signup.component.html',
//   styleUrls: ['./astrologer-signup.component.css']
// })
// export class AstrologerSignupComponent implements OnInit {
//   newArray: any = [];
//   backEndUrl: string = 'http://localhost:8081/api/astrologers';

//   uploadedImage!: File;
//   image: any = [];
//   constructor(private http: HttpClient, private router: Router) { }

//   signupForm: FormGroup = new FormGroup({
//     firstName: new FormControl('', Validators.required),
//     lastName: new FormControl('', Validators.required),
//     email: new FormControl('', [Validators.required, Validators.email]),
//     mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
//     dob: new FormControl('', [Validators.required]),
//     gender: new FormControl('', [Validators.required]),
//     aadharNumber: new FormControl('', [Validators.required]),
//     experience: new FormControl('', [Validators.required]),
//     languagesKnown: new FormControl([]),
//     skills: new FormControl([]),
//     lang: new FormControl([]),
//     certification: new FormControl(null),
//     degree: new FormControl(''),
//     ratePerMinute: new FormControl(''),
//     city: new FormControl(''),
//     district: new FormControl(''),
//     state: new FormControl(''),
//     country: new FormControl(''),
//     id: new FormControl(0),
//     pinCode: new FormControl(''),
//     blogs: new FormControl(null),
//     astrologerImages: new FormControl('', Validators.required),
//     password: new FormControl('', Validators.required),
//     confirmpass: new FormControl('')
//   });

//   ngOnInit(): void { }

//   get firstName() { return this.signupForm.get('firstName'); }
//   get imageData() { return this.signupForm.get('astrologerImages'); }
//   get lastName() { return this.signupForm.get('lastName'); }
//   get email() { return this.signupForm.get('email'); }
//   get mobile() { return this.signupForm.get('mobile'); }
//   get dob() { return this.signupForm.get('dob'); }
//   get gender() { return this.signupForm.get('gender'); }
//   get aadharNumber() { return this.signupForm.get('aadharNumber'); }
//   get experience() { return this.signupForm.get('experience'); }
//   get languagesKnown() { return this.signupForm.get('languagesKnown'); }
//   get skills() { return this.signupForm.get('skills'); }
//   get lang() { return this.signupForm.get('lang'); }
//   get certification() { return this.signupForm.get('certification'); }
//   get degree() { return this.signupForm.get('degree'); }
//   get ratePerMinute() { return this.signupForm.get('ratePerMinute'); }
//   get city() { return this.signupForm.get('city'); }
//   get district() { return this.signupForm.get('district'); }
//   get state() { return this.signupForm.get('state'); }
//   get country() { return this.signupForm.get('country'); }
//   get pinCode() { return this.signupForm.get('pinCode'); }

//   public onImageUpload(event: any) {
//     this.uploadedImage = event.target.files[0];
//     alert("insert image");
//     this.imageUploadAction();
//   }

//   skillsChange() {
//     this.newArray.push(this.lang?.value);
//     console.log(this.newArray);
//     this.languagesKnown?.setValue(this.newArray);
//   }

//   imageUploadAction() {
//     const imageFormData = new FormData();
//     imageFormData.append('image', this.uploadedImage, this.uploadedImage.name);
//     this.http.post('http://localhost:8081/api/astrologers/convert-image', imageFormData, { observe: 'response' })
//       .subscribe((response) => {
//         this.image = response;
//         this.imageData?.setValue(this.image.body);
//       }, (error) => {
//         alert("Something Went Wrong");
//       });
//   }

//   signup(form: FormGroup) {
//     if (form.invalid || form.hasError('mismatch')) {
//       alert('Please ensure all fields are filled out correctly and passwords match.');
//       return;
//     }

//     console.log('Form Data:', form.value); // Debugging line
//     this.http.post(this.backEndUrl, form.value).subscribe(
//       (response: any) => {
//         console.log('Signup successful:', response);
//         alert('Submit Data');
//         this.signupForm.reset();
//         this.router.navigate(['/astrologer-login']);
//       },
//       (error) => {
//         console.error('Signup failed:', error);
//         alert('Signup failed');
//       }
//     );
//   }
// }