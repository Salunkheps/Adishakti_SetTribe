import { Component, OnInit } from '@angular/core';
import { BlogService, Blog } from '../blog.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css']
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  displayBlock: boolean = false;
  individualData: any = [];
  data: Blog[] = []; // Store all blogs
  currentCategory: string = 'all'; // To track the selected category

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.getData(); // By default, get all blogs on initialization
  }

  toggleContent(blog: Blog) {
    blog.showFullContent = !blog.showFullContent; // Toggle full content display
  }

  close() {
    this.displayBlock = false;
  }

  // Method to fetch all blogs
 // Method to fetch all approved blogs
// Method to fetch all approved blogs
getData() {
  this.blogService.getBlogs().subscribe((data) => {
    console.log('Fetched blogs:', data); // Log the fetched blogs
    this.data = data
    .filter(blog => blog.status && blog.status.trim().toLowerCase() === 'approved')

      .map(blog => ({ ...blog, showFullContent: false })); // Initialize showFullContent
    this.filterBlogs(); // Filter blogs after fetching
    this.data.forEach((blog: Blog) => {
      this.fetchBlogImage(blog.id);
    });
  }, (error) => {
    console.error('Error fetching blogs:', error);
  });
}



  // Method to filter blogs based on the current category
  filterBlogs() {
    if (this.currentCategory === 'all') {
      this.blogs = this.data; // Show all blogs
    } else {
      this.blogs = this.data.filter(blog => blog.blogCatagory === this.currentCategory); // Show filtered blogs
    }
  }

  // Category selection methods
  getEducation() {
    this.currentCategory = 'education';
    this.fetchBlogsByCategory(this.currentCategory);
  }

  getLifestyle() {
    this.currentCategory = 'lifestyle'; // Set the current category to lifestyle
    this.fetchBlogsByCategory(this.currentCategory); // Fetch blogs for the lifestyle category
  }

  getTech() {
    this.currentCategory = 'technology';
    this.fetchBlogsByCategory(this.currentCategory);
  }

  getHealth() {
    this.currentCategory = 'health';
    this.fetchBlogsByCategory(this.currentCategory);
  }


  fetchBlogsByCategory(category: string) {
    this.currentCategory = category; // Set the current category to the selected one
    this.blogService.getBlogsByCategory(category).subscribe((data) => {
      console.log(`Fetched ${category} blogs:`, data); // Log the fetched blogs by category
      this.data = data
        .filter(blog => blog.status === 'approved') // Filter only approved blogs
        .map(blog => ({ ...blog, showFullContent: false })); // Initialize showFullContent
      this.filterBlogs(); // Apply filtering to display the blogs for the selected category
      this.data.forEach((blog: Blog) => {
        this.fetchBlogImage(blog.id); // Fetch and assign blog images
      });
    }, (error) => {
      console.error(`Error fetching ${category} blogs:`, error);
    });
  }
  



  fetchBlogImage(id: number) {
    this.blogService.getBlogImage(id).subscribe((blob: Blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        const blogIndex = this.data.findIndex((blog) => blog.id === id);
        if (blogIndex !== -1) {
          this.data[blogIndex].imageUrl = reader.result as string;
        }
      };
      reader.readAsDataURL(blob);
    }, (error) => {
      console.error(`Error fetching image for blog ${id}:`, error);
    });
  }
}
