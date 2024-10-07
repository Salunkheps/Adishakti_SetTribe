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
    { id: 1, title: 'The Mysteries of Astrology', content: '', status: 'Approved', astrologer: { name: 'John Doe' } },
    { id: 2, title: 'Understanding Your Horoscope', content: '', status: 'Approved', astrologer: { name: 'Jane Smith' } },
    { id: 3, title: 'Astrological Predictions for 2024', content: '', status: 'Approved', astrologer: { name: 'Emily Johnson' } },
    { id: 4, title: 'The Influence of Planets', content: '', status: 'Approved', astrologer: { name: 'Michael Brown' } },
    { id: 5, title: 'Unapproved Blog', content: '', status: 'Pending', astrologer: { name: 'Unapproved Author' } },
  ];

  constructor(private router: Router, private blogService: BlogService) { }
  
  ngOnInit(): void {
    // Fetch real data from the backend
    this.blogService.getBlogs().subscribe(
      (data) => {
        // Filter only approved blogs
        this.blogs = data.filter(blog => blog.status === 'Approved').slice(0, 4); // Limit to 4 approved blogs
        this.fetchBlogImages(); // Fetch images after approved blogs are filtered
      },
      (error) => {
        console.error('Error fetching blogs, using mock data', error);
        // Filter and limit mock blogs as well
        this.blogs = this.mockBlogs.filter(blog => blog.status === 'Approved').slice(0, 4);
      }
    );
  }

  fetchBlogImages(): void {
    this.blogs.forEach(blog => {
      this.blogService.getBlogImage(blog.id).subscribe(
        (imageBlob) => {
          const imageUrl = URL.createObjectURL(imageBlob);
          blog.imageUrl = imageUrl; // Assign the image URL to the blog
        },
        (error) => {
          console.error(`Error fetching image for blog ID ${blog.id}`, error);
        }
      );
    });
  }

  readMore(id: number): void {
    this.router.navigate(['/blogs', id]);
  }
}
