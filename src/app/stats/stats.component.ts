import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  stats = { 
    totalAstrologers: 0,  // Initialize as 0
    totalMinutes: 0, // Initialize as 0
    happyCustomers: 0,     // Initialize as 0
    Blogs: 0               // Initialize blog count as 0
  };

  private apiUrlAstrologers = 'http://localhost:8075/api/astrologers/count';
  private apiUrlHappyCustomers = 'http://localhost:8075/api/users/count'; 
  private apiUrlBlogs = 'http://localhost:8075/api/blogs/count';  
  private apiUrlTotalMinutes = 'http://localhost:8075/api/chatsessions/sum-minutes'; // New API for total minutes

  private localStorageKeyAstrologers = 'totalAstrologers';
  private localStorageKeyHappyCustomers = 'happyCustomers'; 
  private localStorageKeyBlogs = 'Blogs';  
  private localStorageKeyTotalMinutes = 'totalMinutes'; // New local storage key for total minutes

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('StatsComponent initialized');

    // Retrieve counts from local storage
    this.loadCountsFromLocalStorage();

    // Fetch counts from the API
    this.fetchCounts();
  }

  loadCountsFromLocalStorage(): void {
    const storedTotalAstrologers = localStorage.getItem(this.localStorageKeyAstrologers);
    const storedHappyCustomers = localStorage.getItem(this.localStorageKeyHappyCustomers);
    const storedBlogs = localStorage.getItem(this.localStorageKeyBlogs);
    const storedTotalMinutes = localStorage.getItem(this.localStorageKeyTotalMinutes); // Fetch total minutes from local storage

    if (storedTotalAstrologers) {
      this.stats.totalAstrologers = parseInt(storedTotalAstrologers, 10) || 0;
      console.log('Total Astrologers from localStorage:', this.stats.totalAstrologers);
    }

    if (storedHappyCustomers) {
      this.stats.happyCustomers = parseInt(storedHappyCustomers, 10) || 0;
      console.log('Happy Customers from localStorage:', this.stats.happyCustomers);
    }

    if (storedBlogs) {
      this.stats.Blogs = parseInt(storedBlogs, 10) || 0;
      console.log('Blogs from localStorage:', this.stats.Blogs);
    }

    if (storedTotalMinutes) {
      this.stats.totalMinutes = parseInt(storedTotalMinutes, 10) || 0;
      console.log('Total Minutes from localStorage:', this.stats.totalMinutes);
    }
  }

  fetchCounts(): void {
    // Fetch total astrologer count
    this.http.get<number>(this.apiUrlAstrologers).subscribe(
      data => {
        if (data !== this.stats.totalAstrologers) {
          this.stats.totalAstrologers = data;
          localStorage.setItem(this.localStorageKeyAstrologers, data.toString());
          console.log('Total Astrologers from API:', this.stats.totalAstrologers);
        }
      },
      error => {
        console.error('Error fetching total astrologers:', error);
      }
    );
  
    // Fetch happy customers count
    this.http.get<number>(this.apiUrlHappyCustomers).subscribe(
      data => {
        if (data !== this.stats.happyCustomers) {
          this.stats.happyCustomers = data;
          localStorage.setItem(this.localStorageKeyHappyCustomers, data.toString());
          console.log('Happy Customers from API:', this.stats.happyCustomers);
        }
      },
      error => {
        console.error('Error fetching happy customers:', error);
      }
    );
  
    // Fetch blog count
    this.http.get<number>(this.apiUrlBlogs).subscribe(
      data => {
        if (data !== this.stats.Blogs) {
          this.stats.Blogs = data;
          localStorage.setItem(this.localStorageKeyBlogs, data.toString());
          console.log('Blogs from API:', this.stats.Blogs);
        }
      },
      error => {
        console.error('Error fetching blogs count:', error);
      }
    );
  
    // Fetch total minutes count
    this.http.get<any>(this.apiUrlTotalMinutes).subscribe(
      data => {
        if (data && data.totalMinutes !== this.stats.totalMinutes) {
          this.stats.totalMinutes = data.totalMinutes;  // Assuming response is { totalMinutes: number }
          localStorage.setItem(this.localStorageKeyTotalMinutes, data.totalMinutes.toString());
          console.log('Total Minutes from API:', this.stats.totalMinutes);
        }
      },
      error => {
        console.error('Error fetching total minutes:', error);
      }
    );
  }
  
}
