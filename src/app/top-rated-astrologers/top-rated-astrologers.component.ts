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
  regId: string; 
  profilePhoto?: string; 
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
  cardWidth: number = 300;
  visibleCards: number = 3; // Show 3 cards

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getAllData();
    window.addEventListener('resize', this.updateVisibleCards.bind(this));
    this.updateVisibleCards(); // Adjust number of visible cards on init
  }

  getAllData(): void {
    this.http.get<Astrologer[]>('http://localhost:8075/api/astrologers/get-astrologers').subscribe(
      (data) => {
        this.data = data;
        this.filteredAstrologers = data.slice(0, this.visibleCards); // Limit to 3 cards
      },
      (error) => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch astrologers. Please try again later.');
      }
    );
  }

  fetchAstrologerImage(regId: string): string {
    return `http://localhost:8075/api/astrologers/${regId}/profile-photo`;
  }

  onImageError(astrologer: Astrologer): void {
    astrologer.profilePhoto = 'assets/placeholder.jpg'; // Placeholder
  }

  updateVisibleCards(): void {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      this.visibleCards = 1; // Mobile
    } else if (screenWidth < 1200) {
      this.visibleCards = 2; // Tablet
    } else {
      this.visibleCards = 3; // Desktop
    }
    this.filteredAstrologers = this.data.slice(0, this.visibleCards);
  }

  navigateToCall(astrologer: Astrologer): void {
    this.router.navigate(['/callwithastro', astrologer.id]);
  }

  navigateToChat(astrologer: Astrologer): void {
    this.router.navigate(['/chatwithastro', astrologer.id]);
  }
}