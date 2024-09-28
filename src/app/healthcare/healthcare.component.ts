import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-healthcare',
  templateUrl: './healthcare.component.html',
  styleUrls: ['./healthcare.component.css']
})
export class HealthcareComponent implements OnInit {

  healthcareBlogs = [
    {
      id: 1,
      title: 'Importance of Mental Health',
      featuredImage: 'assets/mental-health.jpg',
      astrologer: { name: 'Dr. John Doe' },
      content: 'Mental health is an essential part of overall well-being...'
    },
    {
      id: 2,
      title: 'Healthy Eating Habits',
      featuredImage: 'assets/healthy-eating.jpg',
      astrologer: { name: 'Dr. Jane Smith' },
      content: 'Good nutrition is essential for health...'
    },
    {
      id: 3,
      title: 'Exercise for a Healthy Life',
      featuredImage: 'assets/exercise.jpg',
      astrologer: { name: 'Dr. Mike Johnson' },
      content: 'Regular exercise helps prevent chronic diseases...'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void { }

  readMore(blogId: number): void {
    this.router.navigate(['/healthcare', blogId]);
  }
}
