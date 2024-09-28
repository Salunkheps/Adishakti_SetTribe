// manage blog Component. ts
import { Component, OnInit } from '@angular/core';
import { Blog, BlogService } from '../blog.service';
import { Config } from 'datatables.net';
import { HttpClient } from '@angular/common/http';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'; // Import your icons
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-blogs',
  templateUrl: './manage-blogs.component.html',
  styleUrls: ['./manage-blogs.component.css']
})
export class ManageBlogsComponent implements OnInit {
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  searchTerm: string = '';
  dtOptions: Config = {};

  // Font Awesome icons
  faEdit = faEdit;
  faTrash = faTrash;

  constructor(private blogService: BlogService, private http: HttpClient) { }

  ngOnInit(): void {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        // Use the existing fetchBlogs method
        this.blogService.getBlogs().subscribe(
          (blogs: Blog[]) => {
            const filteredBlogs = blogs.filter(blog => blog.astrologer !== undefined); // Filter as needed
            callback({
              recordsTotal: filteredBlogs.length,
              recordsFiltered: filteredBlogs.length,
              data: filteredBlogs
            });
          },
          (error) => {
            console.error('Error fetching blogs:', error);
            alert('Error fetching blogs');
          }
        );
      },
      columns: [
        {
          title: 'Sr. No.',
          data: null,
          render: (data: any, type: any, row: any, meta: any) => {
            return meta.row + 1; // This generates the serial number
          }
        },
        { title: 'Title', data: 'title' }, // Assuming blog has a 'title' field
        { title: 'Author', data: 'astrologer.firstName' }, // Assuming blog has an astrologer with 'firstName'
        { title: 'content', data: 'content' }, // Assuming blog has a 'publishedDate' field
        { title: 'Catagory', data: 'blogCatagory' }, // Assuming blog has a 'publishedDate' field
        { title: 'Status', data: 'status' }, // Assuming blog has a 'publishedDate' field
        {
          title: 'Actions',
          render: (data: any, type: any, row: any, meta: any) => {
            const approveButton = row.status === 'Pending' || row.status === 'Rejected'
              ? `<button class="edit-btn" data-index="${row.id}"><fa-icon [icon]="faEdit"></fa-icon> Approve</button>`
              : '';

            const rejectButton = row.status === 'Pending' || row.status === 'Approved'
              ? `<button class="delete-btn" data-index="${row.id}"><fa-icon [icon]="faTrash"></fa-icon> Reject</button>`
              : '';

            return `${approveButton} ${rejectButton}`;
          },
          orderable: false
        }

      ]
    };


    this.fetchBlogs();
  }
  ngAfterViewInit(): void {
    // Attach event listeners after the DataTable has been initialized
    $(document).on('click', '.edit-btn', (event) => {
      const blogId = $(event.currentTarget).data('index'); // Get the blog ID
      const blog = this.blogs.find(blog => blog.id === blogId); // Find the blog by ID

      if (blog) { // Check if the blog was found
        this.approveBlog(blog); // Call approveBlog only if blog is defined
      } else {
        console.error('Blog not found for ID:', blogId);
      }
    });

    $(document).on('click', '.delete-btn', (event) => {
      const blogId = $(event.currentTarget).data('index'); // Get the blog ID
      const blog = this.blogs.find(blog => blog.id === blogId); // Find the blog by ID

      if (blog) { // Check if the blog was found
        this.rejectBlog(blog); // Call rejectBlog only if blog is defined
      } else {
        console.error('Blog not found for ID:', blogId);
      }
    });
  }




  fetchBlogs(): void {
    this.blogService.getBlogs().subscribe((blogs: Blog[]) => {
      this.blogs = blogs.filter(blog => blog.astrologer !== undefined); // Ensure astrologer is defined
      this.filteredBlogs = [...this.blogs];
    });
  }

  searchBlogs(): void {
    if (this.searchTerm.trim()) {
      this.filteredBlogs = this.blogs.filter(blog =>
        blog.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredBlogs = [...this.blogs];
    }
  }

  approveBlog(blog: Blog): void {
    if (!blog || !blog.id) {
      console.error('Blog ID is undefined:', blog);
      return; // Early return to prevent the API call
    }
    this.blogService.approveBlog(blog.id).subscribe(() => {
      console.log('Blog approved:', blog.title);
      Swal.fire("Blog has been approved!");
      this.fetchBlogs(); // Refresh the list after approval
      window.location.reload(); // Reload the page after approval
    });
  }

  rejectBlog(blog: Blog): void {
    if (!blog || !blog.id) {
      console.error('Blog ID is undefined:', blog);
      return; // Early return to prevent the API call
    }

    Swal.fire({
      title: 'Reject Blog',
      text: 'Please provide a reason for rejection:',
      input: 'text', // Input type
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!'; // Return error message if no value
        }
        return undefined; // Return undefined if there is a value
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = result.value; // Get the input value
        // console.log('Rejection reason:', reason);

        // Call the service to reject the blog with the reason
        this.blogService.rejectBlog(blog.id, reason).subscribe(() => {
          // console.log('Blog rejected:', blog.title);
          this.fetchBlogs(); // Refresh the list after rejection
          window.location.reload(); // Reload the page after rejection
        });
      }
    });
  }

}
