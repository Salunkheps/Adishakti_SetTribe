import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit{
  users: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<any[]>('http://localhost:8081/api/users') // Ensure the URL matches your backend configuration
      .subscribe(
        data => {
          this.users = data;
        },
        error => {
          console.error('Error fetching users', error);
        }
      );
  }

}
