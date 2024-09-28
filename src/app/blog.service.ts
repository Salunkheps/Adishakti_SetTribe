import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Blog {
  id: number;
  title: string;
  featuredImage: string;
  content: string;
  blogCatagory?:string;
  status?:string;
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


//for manage blogs section
  approveBlog(blogId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve/${blogId}`, {});
  }

  rejectBlog(blogId: number, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reject/${blogId}`, { reason });
  }
}
