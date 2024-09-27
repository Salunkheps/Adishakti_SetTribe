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
    { id: 1, featuredImage: 'blog1.jpg', title: 'The Mysteries of Astrology', content: '', astrologer: { name: 'John Doe' } },
    { id: 2, featuredImage: 'blog3.jpg', title: 'Understanding Your Horoscope', content: '', astrologer: { name: 'Jane Smith' } },
    { id: 3, featuredImage: 'blog3.png', title: 'Astrological Predictions for 2024', content: '', astrologer: { name: 'Emily Johnson' } },
    { id: 4, featuredImage: 'blog4.jpg', title: 'The Influence of Planets', content: '', astrologer: { name: 'Michael Brown' } },
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