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

  constructor(private blogService: BlogService, private router: Router, private http: HttpClient) {
    this.gerData();
  }

  viewMore(i: any) {
    this.displayBlock = !this.displayBlock;
    this.individualData = i;
    this.fetchBlogImage(i.id); // Fetch the image when viewing more
  }

  closs() {
    this.displayBlock = false;
  }

  gerData() {
    this.blogService.getBlogs().subscribe(
      (data) => {
        this.data = data;
        this.data.forEach((blog: Blog) => {
          this.fetchBlogImage(blog.id); // Fetch images for all blogs
        });
      },
      (error) => {}
    );
  }

  getEducation() {
    this.blogService.getBlogsByCategory('education').subscribe(
      (data) => {
        this.data = data;
      },
      (error) => {}
    );
  }

  getLifeStyle() {
    this.blogService.getBlogsByCategory('lifestyle').subscribe(
      (data) => {
        this.data = data;
      },
      (error) => {}
    );
  }

  getTec() {
    this.blogService.getBlogsByCategory('technology').subscribe(
      (data) => {
        this.data = data;
      },
      (error) => {}
    );
  }

  getHelth() {
    this.blogService.getBlogsByCategory('health').subscribe(
      (data) => {
        this.data = data;
      },
      (error) => {}
    );
  }

  fetchBlogImage(id: number) {
    this.blogService.getBlogImage(id).subscribe(
      (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const blogIndex = this.data.findIndex((blog) => blog.id === id);
        if (blogIndex !== -1) {
          this.data[blogIndex].imageUrl = url; // Set the image URL
        }
      },
      (error) => {}
    );
  }

  ngOnInit(): void {}
}
