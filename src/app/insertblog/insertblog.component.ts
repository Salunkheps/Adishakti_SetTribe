import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Config } from 'datatables.net';
import Swal from 'sweetalert2';
import { WebSocketService } from '../web-socket.service';

interface Astrologer {}
export interface Blog {
  id: number;
  title: string;
  content: string;
  blogCatagory: string;
  astrologer: string;
  status: string;
  rejectionReason?: string; // Optional field for rejection reason
}

@Component({
  selector: 'app-insertblog',
  templateUrl: './insertblog.component.html',
  styleUrls: ['./insertblog.component.css']
})
export class InsertblogComponent implements OnInit, OnDestroy {
  newArray: any = [];
  Astrologer: Astrologer[] = [];
  Blogs: Blog[] = [];
  data: any = [];
  featuredImage!: File;
  image: any = [];
  dtOptions: Config = {};
  editMode = false; // Flag to check if we're editing an existing blog
  currentBlogId: number | null = null; // Store current blog ID for editing
  reg_id: string | null = null;  // Define the reg_id property

  constructor(private http: HttpClient, private router: Router, private webSocketService: WebSocketService) {
    this.getAllData();
    this.reg_id = sessionStorage.getItem('regId');  // Retrieve reg_id from session storage
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  myData: FormGroup = new FormGroup({
    featuredImage: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    blogCatagory: new FormControl('', [Validators.required]),
    astrologer: new FormControl('', [Validators.required])
  });

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
          return meta.row + 1;
        }
      }, {
        title: 'Title',
        data: 'title'
      }, {
        title: 'Content',
        data: 'content'
      }, {
        title: 'Blog Category',
        data: 'blogCatagory'
      },{
        title: 'Status', // New column for status
        data: 'status',
        render: (data: string, type: string, row: Blog) => {
          if (data === 'Rejected') {
            return `
              <span>${data}</span>
              <span style="color: red; cursor: pointer;" title="Click for reason!" onclick="showReason(${row.id}, '${row.rejectionReason || "No reason available"}')">❗</span>
            `;
          }
          return `<span>${data}</span>`;
        }
      }, {
        title: 'Action',
        data: null,
        render: (data: Blog) => {
          return `
            <div style="display: flex; align-items: center; gap: 10px;">
              <button class="btn btn-primary edit-btn" data-id="${data.id}" onclick="editBlog(${data.id})">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger delete-btn" data-id="${data.id}" onclick="deleteBlog(${data.id})">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          `;
        }
      }]
    };

    this.getAllAstrologers();
    this.webSocketService.connect();

    // Attach event handlers for edit and delete buttons
    $(document).on('click', '.edit-btn', (event) => {
      const blogId = $(event.currentTarget).data('id');
      this.editBlog(blogId);
    });

    $(document).on('click', '.delete-btn', (event) => {
      const blogId = $(event.currentTarget).data('id');
      this.deleteBlog(blogId);
    });
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.featuredImage = file;
    }
  }

  getBlogs() {
    this.http.get<Blog[]>(`http://localhost:8075/api/blogs`)
      .subscribe(
        (Blogs) => {
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
        this.data = data;
      },
      (error) => {}
    );
  }

  // Method to edit/update a blog by ID
  editBlog(id: number): void {
    this.http.get<Blog>(`http://localhost:8075/api/blogs/${id}`).subscribe(
      (blog) => {
        this.myData.patchValue({
          title: blog.title,
          content: blog.content,
          blogCatagory: blog.blogCatagory,
          astrologer: blog.astrologer
        });

        this.currentBlogId = id; // Store current blog ID for update
        this.editMode = true; // Set edit mode
      },
      (error) => {
        console.error("Error fetching blog for editing:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Could not fetch blog data. Please try again later.',
        });
      }
    );
  }

  // Method to delete a blog by ID
  deleteBlog(id: number): void {
    this.http.delete(`http://localhost:8075/api/blogs/delete/${id}`)
      .subscribe(() => {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Blog has been deleted successfully.',
        }).then(() => {
          location.reload(); // Automatically refresh the page after success
        });

        this.Blogs = this.Blogs.filter(blog => blog.id !== id);
      }, (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Something went wrong while deleting the blog. Please try again.',
        });
        console.error('Delete Error:', error);
      });
  }
  

  sub() {
    const formData = new FormData();
    const title = this.myData.get('title')?.value;
    const content = this.myData.get('content')?.value;
    const blogCatagory = this.myData.get('blogCatagory')?.value;
    const reg_id = sessionStorage.getItem('regId');

    if (!title || !content || !blogCatagory || (!this.featuredImage && !this.editMode) || !reg_id) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill out all fields, upload an image, and ensure you are logged in properly!',
      });
      return;
    }

    formData.append('title', title);
    formData.append('content', content);
    formData.append('blogCatagory', blogCatagory);
    formData.append('reg_id', reg_id);

    if (this.featuredImage) {
      formData.append('featuredImage', this.featuredImage, this.featuredImage.name);
    }

    if (this.editMode && this.currentBlogId !== null) {
      // Update the blog
      this.http.put(`http://localhost:8075/api/blogs/update/${this.currentBlogId}`, formData)
        .subscribe((response) => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Blog updated successfully!',
          }).then(() => {
            location.reload();  // Automatically refresh the page after success
          });
          this.getBlogs();
          this.resetForm();
        }, (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Something went wrong while updating the blog. Please try again.',
          });
          console.error('Update Error:', error);
        });
    } else {
      // Add new blog
      this.http.post('http://localhost:8075/api/blogs/upload', formData)
      .subscribe((response) => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Blog added successfully, please wait for admin approval!',
        }).then(() => {
          location.reload(); // Automatically refresh the page after success
        });
        this.getBlogs();
        this.resetForm();
      }, (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Something went wrong while adding the blog. Please try again.',
        });
        console.error('Add Error:', error);
      });
    }
  }

  resetForm() {
    this.myData.reset();
    // this.featuredImage = null; 
    this.editMode = false; // Reset edit mode
    this.currentBlogId = null; // Reset current blog ID
  }

  showReason(id: number, reason: string) {
    Swal.fire({
      title: 'Rejection Reason',
      text: reason,
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }




  onFileSelected(event: any): void {
    this.featuredImage = event.target.files[0];
  }

  logout(event: MouseEvent): void {
    // Prevent the default behavior of the button click (in case it's a form submission or link)
    event.preventDefault();
    const isUserOnline = sessionStorage.getItem('isUserOnline') === 'true';

    if (isUserOnline) {
      Swal.fire({
        title: 'You are online',
        text: 'Are you sure you want to go offline and logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, go offline and logout',
        cancelButtonText: 'No, stay online'
      }).then((result) => {
        if (result.isConfirmed) {
          // Proceed to update the user's online status in the database
          const apiUrl =` http://localhost:8075/api/astrologers/toggle-status/${this.reg_id}`;
          this.http.put(apiUrl, {}).subscribe(
            (response) => {
              console.log('User status updated to offline:', response);
  
              // Clear session storage and perform logout
              this.performLogout();
            },
            (error: HttpErrorResponse) => {
              console.error('Error updating user status', error);
              // Optionally show an error message or handle it accordingly
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error updating your status. Please try again.',
              });
            }
          );
        }
        // If the user cancels, do nothing (stay online)
      });
    } else {
      // If the user is offline, show a standard logout confirmation
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'No, stay logged in'
      }).then((result) => {
        if (result.isConfirmed) {
          // Clear session storage and perform logout
          this.performLogout();
        }
        // If the user cancels, do nothing (no redirection)
      });
    }
  }
  
  // Helper method to perform the actual logout logic
  private performLogout(): void {
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
}
