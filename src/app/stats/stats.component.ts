import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  stats = { 
    totalAstrologers: 0,  // Initialize as 0 instead of undefined
    minutesConsulted: 500,
    happyCustomers: 0,     // Initialize as 0 instead of undefined
    upcomingEvents: 5
  };

  private apiUrlAstrologers = 'http://localhost:8075/api/astrologers/count';
  private apiUrlHappyCustomers = 'http://localhost:8075/api/users/count'; 

  private localStorageKeyAstrologers = 'totalAstrologers';
  private localStorageKeyHappyCustomers = 'happyCustomers'; 

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

    if (storedTotalAstrologers) {
      this.stats.totalAstrologers = parseInt(storedTotalAstrologers, 10) || 0;  // Fallback to 0
      console.log('Total Astrologers from localStorage:', this.stats.totalAstrologers);
    }

    if (storedHappyCustomers) {
      this.stats.happyCustomers = parseInt(storedHappyCustomers, 10) || 0;  // Fallback to 0
      console.log('Happy Customers from localStorage:', this.stats.happyCustomers);
    }
  }

  fetchCounts(): void {
    // Fetch total astrologer count
    this.http.get<number>(this.apiUrlAstrologers).subscribe(
      data => {
        if (data !== this.stats.totalAstrologers) { // Only update if different
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
        if (data !== this.stats.happyCustomers) { // Only update if different
          this.stats.happyCustomers = data;
          localStorage.setItem(this.localStorageKeyHappyCustomers, data.toString());
          console.log('Happy Customers from API:', this.stats.happyCustomers);
        }
      },
      error => {
        console.error('Error fetching happy customers:', error);
      }
    );
  }
}