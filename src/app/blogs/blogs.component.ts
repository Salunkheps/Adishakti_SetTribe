import { Component, OnInit } from '@angular/core';
import { BlogService, Blog } from '../blog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css']
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
 displayBlock:boolean=false
  individualData:any=[]
  
  selectedBlog: Blog | null = null;
  data:any=[]
  constructor(private blogService: BlogService, private router: Router, private route: ActivatedRoute,public http:HttpClient,private sanitizer: DomSanitizer) {
    this.gerData()
  }
  viewMore(i:any){
    this.displayBlock=!this.displayBlock;
    this.individualData=i

  }
  
 closs(){
  this.displayBlock=false
 }
  gerData(){
    
   this.http.get("http://localhost:8081/api/blogs").subscribe(
    (data)=>{
      this.data=data

    }
    ,(error)=>
    {
      
    }
   )
  }
  getEducation(){
    
    this.http.get("http://localhost:8081/api/blogs/education").subscribe(
     (data)=>{
       this.data=data
      // const objectURL = URL.createObjectURL(data);
       //this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
       
     }
     ,(error)=>
     {
       
     }
    )
   }
   
   getLifeStyle(){
    
    this.http.get("http://localhost:8081/api/blogs/lifestyle").subscribe(
     (data)=>{
       this.data=data
      // const objectURL = URL.createObjectURL(data);
       //this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
       
     }
     ,(error)=>
     {
       
     }
    )
   }
   getTec(){
    
    this.http.get("http://localhost:8081/api/blogs/tecnology").subscribe(
     (data)=>{
       this.data=data
      // const objectURL = URL.createObjectURL(data);
       //this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
       
     }
     ,(error)=>
     {
       
     }
    )
   }
   getHelth(){
    
    this.http.get("http://localhost:8081/api/blogs/helth").subscribe(
     (data)=>{
       this.data=data
      // const objectURL = URL.createObjectURL(data);
       //this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
       
     }
     ,(error)=>
     {
       
     }
    )
   }
  ngOnInit(): void {
    
  }

  fetchBlogs(): void {
    this.blogService.getBlogs().subscribe((data: Blog[]) => {
      this.blogs = data;
    });
  }

  fetchBlogsByCategory(category: string): void {
    this.blogService.getBlogsByCategory(category).subscribe((data: Blog[]) => {
      this.blogs = data;
    });
  }

  fetchBlogById(id: number): void {
    this.blogService.getBlogById(id).subscribe((data: Blog) => {
      this.selectedBlog = data;
    });
  }

  filterByCategory(category: string): void {
    this.selectedBlog = null;
    this.router.navigate(['/blogs/category', category]);
  }

  readMore(blogId: number): void {
    this.router.navigate(['/blogs', blogId]);
  }

  backToList(): void {
    this.selectedBlog = null;
    this.router.navigate(['/blogs']);
  }
}
