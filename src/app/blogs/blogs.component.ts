import { Component, OnInit } from '@angular/core';
import { BlogService, Blog } from '../blog.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css']
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  displayBlock: boolean = false;
  individualData: any = [];
  data: any[] = [];

  constructor(private blogService: BlogService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.gerData();
  }

  // Method to handle the 'View More' button click
  viewMore(i: any) {
    this.displayBlock = true;
    this.individualData = i;
  }

  // Method to close the popup
  closs() {
    this.displayBlock = false;
  }

  // Method to fetch all blogs
  gerData() {
    this.blogService.getBlogs().subscribe(
      (data) => {
        this.data = data;
        this.data.forEach((blog: Blog) => {
          this.fetchBlogImage(blog.id); // Fetch images for all blogs
        });
      },
      (error) => {
        console.error('Error fetching blogs:', error);
      }
    );
  }

  // Methods to fetch blogs by categories
  getEducation() {
    this.fetchBlogsByCategory('education');
  }

  getLifeStyle() {
    this.fetchBlogsByCategory('lifestyle');
  }

  getTec() {
    this.fetchBlogsByCategory('technology');
  }

  getHelth() {
    this.fetchBlogsByCategory('health');
  }

  // Generalized method to fetch blogs by category
  fetchBlogsByCategory(category: string) {
    this.blogService.getBlogsByCategory(category).subscribe(
      (data) => {
        this.data = data;
        this.data.forEach((blog: Blog) => {
          this.fetchBlogImage(blog.id); // Fetch images for blogs in this category
        });
      },
      (error) => {
        console.error(`Error fetching ${category} blogs:`, error);
      }
    );
  }

  // Method to fetch the blog image
  fetchBlogImage(id: number) {
    this.blogService.getBlogImage(id).subscribe(
      (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const blogIndex = this.data.findIndex((blog) => blog.id === id);
          if (blogIndex !== -1) {
            this.data[blogIndex].imageUrl = reader.result as string; // Set the image URL
          }
        };
        reader.readAsDataURL(blob); // Convert the Blob to a data URL
      },
      (error) => {
        console.error(`Error fetching image for blog ${id}:`, error);
      }
    );
  }
}
