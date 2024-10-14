import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Blog {
  id: number;
  title: string;
  content: string;
  blogCatagory?: string;
  status?: string;
  imageUrl?: string;
  showFullContent?: boolean; // Ensure this is included
  astrologer: {
    name: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'http://localhost:8075/api/blogs';

  constructor(private http: HttpClient) {}

  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  getBlogsByCategory(category: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/category/${category}`);
  }

  getBlogById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`);
  }

  // Method to fetch the blog image URL by blog ID
  getBlogImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/image/${id}`, { responseType: 'blob' });
  }

   // Method to fetch the astrologer details (firstName and lastName) by blog ID
   getAstrologerByBlogId(blogId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${blogId}/astrologer`);
  }

  approveBlog(blogId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve/${blogId}`, {});
  }

  rejectBlog(blogId: number, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reject/${blogId}`, { reason });
  }
}
