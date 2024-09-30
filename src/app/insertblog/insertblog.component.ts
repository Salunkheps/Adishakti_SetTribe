import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Config } from 'datatables.net';
import Swal from 'sweetalert2';

interface Astrologer {
  // firstName: string;
  // lastName: string;
}
export interface Blog {
  id: number;
  title: string;
  // featuredImage: any;  // Represented as a byte array in Java; can be of type any or Blob in TypeScript.
  content: string;
  blogCatagory: string; // Define this type based on available categories.
  astrologer: string;
  status: string; // Default to "Pending" in Java
}
@Component({
  selector: 'app-insertblog',
  templateUrl: './insertblog.component.html',
  styleUrl: './insertblog.component.css'
})


export class InsertblogComponent implements OnInit {
  newArray: any = [];
  Astrologer: Astrologer[] = [];
  Blogs: Blog[] = [];
  data: any = []
  featuredImage!: File;
  image: any = []
  dtOptions: Config = {};

  constructor(private http: HttpClient, private router: Router) {
    this.getAllData()
  }
  myData: FormGroup = new FormGroup({
    featuredImage: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    blogCatagory: new FormControl('', [Validators.required]),
    astrologer: new FormControl('', [Validators.required])
  })
  ngOnInit() {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.http.get<Blog[]>(`http://localhost:8075/api/blogs`)
          .subscribe((Blogs) => {
            callback({
              recordsTotal: Blogs.length,
              recordsFiltered: Blogs.length,
              data: Blogs
            });
          }, (error) => {
            console.error("Error fetching blogs:", error);
            alert("Error fetching blogs");
          });
      },
      columns: [{
        title: 'Sr. No.',
        data: null,
        render: (data: any, type: any, row: any, meta: any) => {
          return meta.row + 1; // This generates the serial number
        }
      }, {
        title: 'ID',
        data: 'id'
      }, {
        title: 'Title',
        data: 'title'
      }, {
        title: 'Content',
        data: 'content'
      }, {
        title: 'Blog Category',
        data: 'blogCatagory'
      }]
    };
    this.getAllAstrologers();
  }
  onImageUpload(event: any) {
    // Capture the uploaded image file
    const file = event.target.files[0];
    if (file) {
      this.featuredImage = file;
    }
  }
  
  getBlogs() {
    // Add a timestamp to avoid caching issues
    this.http.get<Blog[]>(`http://localhost:8075/api/blogs`)
      .subscribe(
        (Blogs) => {
          console.log("Fetched Blogs:", Blogs);
          this.Blogs = Blogs;
        },
        (error) => {
          console.error("Error fetching blogs:", error);
          alert("Error fetching blogs");
        }
      );
  }
  getAllAstrologers() {
    this.http.get<Astrologer[]>("http://localhost:8075/api/astrologers/get-astrologers")
      .subscribe(
        (Astrologer) => {
          this.Astrologer = Astrologer;
        },
        (error) => {
          console.error("Error fetching astrologers:", error);
          alert("Error fetching astrologers");
        }
      );
  }

  getAllData() {
    this.http.get("http://localhost:8075/api/astrologers/get-astrologers").subscribe(
      (data) => {
        this.data = data

      }
      , (error) => {

      }
    )
  }
  // sub(){
  //   this.http.post('http://localhost:8075/api/blogs/upload', this.myData.value)
  //     .subscribe((response) => { 
  //       alert("insert Data") 

  //      }
  //      ,(error)=>
  //      {
  //       alert("Something Went Wrong")
  //      }
  //     );
  // }
  sub() {
    const formData = new FormData();
  
    // Get values from the form and session storage
    const title = this.myData.get('title')?.value;
    const content = this.myData.get('content')?.value;
    const blogCatagory = this.myData.get('blogCatagory')?.value;
    const reg_id = sessionStorage.getItem('regId'); // Assuming 'regId' is stored in session storage
  
    // Log to check if values are correct
    console.log('Title:', title);
    console.log('Content:', content);
    console.log('Blog Category:', blogCatagory);
    console.log('Astrologer (reg_id):', reg_id);
  
    // Validation to ensure required fields are filled
    if (!title || !content || !blogCatagory || !this.featuredImage || !reg_id) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill out all fields, upload an image, and ensure you are logged in properly!',
      });
      return;
    }
  
    // Append the form data to be sent to the backend
    formData.append('title', title);
    formData.append('content', content);
    formData.append('blogCatagory', blogCatagory);
    formData.append('reg_id', reg_id);  // Append the astrologer's reg_id from session storage
    formData.append('featuredImage', this.featuredImage, this.featuredImage.name); // Append the uploaded image
  
    console.log('Form Data to be sent:', formData);
  
    // Make the POST request to the backend's /create API
    this.http.post('http://localhost:8075/api/blogs/upload', formData)
      .subscribe((response) => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Blog added successfully, please wait for admin approval!',
        });
          this.getBlogs();
      }, (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Something went wrong while submitting the blog. Please try again.',
        });
        console.error('Error:', error);
      });
  }
  

  // Capture the file input
  onFileSelected(event: any): void {
    this.featuredImage = event.target.files[0]; // Store the selected file
  }

  logout(event: MouseEvent): void {
    // Prevent the default behavior of the button click (in case it's a form submission or link)
    event.preventDefault();

    // Show SweetAlert confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to logout?',
      icon: 'warning',
      showCancelButton: true,  // Show the "Cancel" button
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'No, stay logged in'
    }).then((result) => {
      if (result.isConfirmed) {
        // Only if the user confirms, clear session and redirect
        sessionStorage.clear(); // Clear session storage
        localStorage.removeItem('currentUser'); // Optional: clear local storage if you're storing user info

        // Show another SweetAlert message confirming logout success
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been logged out successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          // Redirect to login page after showing success message
          this.router.navigate(['/astrologer-login']);
        });
      }
      // If the user cancels, do nothing (no redirection)
    });
  }
}
