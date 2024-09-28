// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// @Component({
//   selector: 'app-manage-blog-form',
//   templateUrl: './manage-blog-form.component.html',
//   styleUrl: './manage-blog-form.component.css'
// })
// export class ManageBlogFormComponent {
//   blogForm: FormGroup;

//   constructor(private fb: FormBuilder, private http: HttpClient) {
//     this.blogForm = this.fb.group({
//       id: [''],
//       title: ['', Validators.required],
//       featuredImage: [null, Validators.required],
//       content: ['', Validators.required],
//       blogCatagory: ['', Validators.required]
//     });
//   }

//   onFileChange(event: any) {
//     const file = event.target.files[0];
//     this.blogForm.patchValue({
//       featuredImage: file
//     });
//   }

//   // onSubmit() {
//   //   if (this.blogForm.valid) {
//   //     const formData = new FormData();
//   //     Object.keys(this.blogForm.controls).forEach(key => {
//   //       formData.append(key, this.blogForm.get(key)?.value);
//   //     });

//   //     this.http.post('http://localhost:8081/api/blogs/df', formData).subscribe(
//   //       response => {
//   //         console.log('Blog created successfully', response);
//   //       },
//   //       error => {
//   //         console.error('Error creating blog', error);
//   //       }
//   //     );
//   //   }
//   // }
//   onSubmit() {
//     if (this.blogForm.valid) {
//       const formData = new FormData();
//       Object.keys(this.blogForm.controls).forEach(key => {
//         const value = this.blogForm.get(key)?.value;
//         if (value !== null && value !== undefined) {
//           formData.append(key, value);
//         }
//       });
  
//       // Log FormData to check its contents
//       for (let pair of formData.entries()) {
//         console.log(pair[0]+ ', '+ pair[1]); 
//       }
  
//       this.http.post('http://localhost:8081/api/blogs/df', formData).subscribe(
//         response => {
//           console.log('Blog created successfully', response);
//         },
//         error => {
//           console.error('Error creating blog', error);
//         }
//       );
//     }
//   }
  
// }

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-blog-form',
  templateUrl: './manage-blog-form.component.html',
  styleUrls: ['./manage-blog-form.component.css']
})
export class ManageBlogFormComponent {
  blogForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.blogForm = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      featuredImage: [null, Validators.required],
      content: ['', Validators.required],
      blogCatagory: ['', Validators.required]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.blogForm.patchValue({
      featuredImage: file
    });
  }

  onSubmit() {
    if (this.blogForm.valid) {
      const formData = new FormData();
      Object.keys(this.blogForm.controls).forEach(key => {
        const value = this.blogForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
  
      // Log FormData manually
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
  
      this.http.post('http://localhost:8081/api/blogs/df', formData).subscribe(
        response => {
          console.log('Blog created successfully', response);
        },
        error => {
          console.error('Error creating blog', error);
        }
      );
    } else {
      console.error('Form is invalid');
    }
  }
  
}
