import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Astrologer {
  id: number;
  firstName: string;
  lastName: string;
  skills: string;
  languagesKnown: string[];
  rating: number;
  astrologerImages: { imageData: string };
  mobileNumber: string;
  ratePerMinute: number;
}

@Component({
  selector: 'app-top-rated-astrologers',
  templateUrl: './top-rated-astrologers.component.html',
  styleUrls: ['./top-rated-astrologers.component.css']
})
export class TopRatedAstrologersComponent implements OnInit {
  data: Astrologer[] = [];
  filteredAstrologers: Astrologer[] = [];
  searchTerm: string = '';
  hoverRating: number | null = null;

  currentIndex: number = 0;
  cardWidth: number = 300;
  visibleCards: number = 3;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getAllData();
    
  }

  getAllData(): void {
    this.http.get<Astrologer[]>('http://localhost:8075/api/astrologers/get-astrologers').subscribe(
      (data) => {
        this.data = data;
        this.filteredAstrologers = data; 
      },
      (error) => {
        console.error('Error fetching data', error);
      }
    );
  }

  filterAstrologers(): void {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    if (searchTerm === '') {
      this.filteredAstrologers = this.data;
      return;
    }
    this.filteredAstrologers = this.data.filter(
      (astrologer) =>
        astrologer.firstName.toLowerCase().includes(searchTerm) ||
        astrologer.skills.toLowerCase().includes(searchTerm)
    );
  }

 
  navigateToCall(astrologer: Astrologer): void {
    this.router.navigate(['/callwithastro', astrologer.id]);
  }

  navigateToChat(astrologer: Astrologer): void {
    this.router.navigate(['/chatwithastro', astrologer.id]);
  }
}