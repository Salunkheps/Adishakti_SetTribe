import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-insertblog',
  templateUrl: './insertblog.component.html',
  styleUrl: './insertblog.component.css'
})
export class InsertblogComponent {
  newArray:any = [];
  backEndUrl: string = 'http://localhost:8081';
  data:any=[]
  uploadedImage!: File;
  image:any=[]
  constructor(private http:HttpClient){
   this.getAllData()
  }
  myData:FormGroup =new FormGroup({
    featuredImage: new FormControl('',[Validators.required]),
    content: new FormControl('',[Validators.required]),
    title: new FormControl('',[Validators.required]),
    blogCatagory: new FormControl('',[Validators.required]),
    astrologer: new FormControl('',[Validators.required])
  })
  public onImageUpload(event:any) {
    this.uploadedImage = event.target.files[0];
    alert("insert image")
    this.imageUploadAction()
  }
  getAllData(){
    this.http.get("http://localhost:8081/api/astrologers/get-astrologers").subscribe(
      (data)=>{
        this.data=data
     
      }
      ,(error)=>
      {
        
      }
     )
  }
  sub(){
    this.http.post('http://localhost:8081/api/blogs', this.myData.value)
      .subscribe((response) => { 
        alert("insert Data") 
        
       }
       ,(error)=>
       {
        alert("Something Went Wrong")
       }
      );
  }
  imageUploadAction() {
    
    const imageFormData = new FormData();
    imageFormData.append('image', this.uploadedImage, this.uploadedImage.name);
    this.http.post('http://localhost:8081/api/astrologers/convert-image', imageFormData, { observe: 'response' })
      .subscribe((response) => { 
        //alert("insert") 
        this.image=response;
        this.myData.get('featuredImage')?.setValue(this.image.body.imageData);
       }
       ,(error)=>
       {
        alert("Something Went Wrong")
       }
      );
    }
}
