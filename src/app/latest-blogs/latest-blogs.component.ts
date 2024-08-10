// src/app/latest-blogs/latest-blogs.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService, Blog } from '../blog.service';

@Component({
  selector: 'app-latest-blogs',
  templateUrl: './latest-blogs.component.html',
  styleUrls: ['./latest-blogs.component.css']
})
export class LatestBlogsComponent implements OnInit {
  blogs: Blog[] = [];
  mockBlogs = [
    { id: 1, featuredImage: 'images/content/blog/b1.jpg', title: 'The Mysteries of Astrology', content: '', astrologer: { name: 'John Doe' } },
    { id: 2, featuredImage: 'images/content/blog/b3.jpg', title: 'Understanding Your Horoscope', content: '', astrologer: { name: 'Jane Smith' } },
    { id: 3, featuredImage: 'images/content/blog/b4.jpg', title: 'Astrological Predictions for 2024', content: '', astrologer: { name: 'Emily Johnson' } },
    { id: 4, featuredImage: 'images/content/blog/b2.jpg', title: 'The Influence of Planets', content: '', astrologer: { name: 'Michael Brown' } },
  ];

  constructor(private router: Router, private blogService: BlogService) { }

  ngOnInit(): void {
    // Fetch real data from the backend
    this.blogService.getBlogs().subscribe(
      (data) => this.blogs = data,
      (error) => {
        console.error('Error fetching blogs, using mock data', error);
        this.blogs = this.mockBlogs;
      }
    );
  }

  readMore(id: number): void {
    this.router.navigate(['/blogs', id]);
  }
}


// when data will be there in db the use following code
/* 
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService, Blog } from '../blog.service';

@Component({
  selector: 'app-latest-blogs',
  templateUrl: './latest-blogs.component.html',
  styleUrls: ['./latest-blogs.component.css']
})
export class LatestBlogsComponent implements OnInit {
  blogs: Blog[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private blogService: BlogService, private router: Router) { }

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    this.blogService.getBlogs().subscribe(
      (data) => {
        this.blogs = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching blogs:', error);
        this.error = 'Failed to load blogs.';
        this.loading = false;
      }
    );
  }

  readMore(blogId: number): void {
    this.router.navigate(['/blog', blogId]);
  }
}

*/