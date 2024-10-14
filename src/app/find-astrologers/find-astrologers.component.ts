import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { WebSocketService } from '../web-socket.service';

interface Astrologer {
  regId: string;
  firstName: string;
  lastName: string;
  skills: string;
  languagesKnown: string[];
  rating?: number; // Rating will be added
  mobileNumber: string;
  ratePerMinute: number;
  isOnline?: boolean;
  status: string;
  isBusy?: boolean;
  rpmStatus?: string;
}

@Component({
  selector: 'app-find-astrologers',
  templateUrl: './find-astrologers.component.html',
  styleUrls: ['./find-astrologers.component.css'],
})
export class FindAstrologersComponent implements OnInit, OnDestroy {
  data: Astrologer[] = [];
  filteredAstrologers: Astrologer[] = [];
  searchTerm: string = '';
  hoverRating: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private webSocketService: WebSocketService
  ) {
    this.getAllData();
    this.filteredAstrologers = this.data;
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  ngOnInit(): void {
    this.filteredAstrologers = this.data;
    this.getAllData();
    this.webSocketService.connect();
  }

  fetchAstrologerImage(regId: string): string {
    return `http://localhost:8075/api/astrologers/${regId}/profile-photo`;
  }

  filterAstrologers(): void {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    if (searchTerm === '') {
      this.filteredAstrologers = [...this.data];
    } else {
      this.filteredAstrologers = this.data.filter(
        (astrologer: Astrologer) =>
          astrologer.status === 'Approved' &&
          (astrologer.firstName.toLowerCase().includes(searchTerm) ||
            astrologer.skills.toLowerCase().includes(searchTerm))
      );
    }
  }

  navigateToChat(astrologer: any) {
    sessionStorage.setItem(
      'selectedAstrologer',
      JSON.stringify({
        regId: astrologer.regId,
        firstName: astrologer.firstName,
        lastName: astrologer.lastName,
        imageData: astrologer.astrologerImages ? astrologer.astrologerImages.imageData : null,
      })
    );

    this.router.navigate(['/chatwithastro']);
  }

  getAllData(): void {
    this.http
      .get<Astrologer[]>('http://localhost:8075/api/astrologers/get-astrologers')
      .subscribe(
        (data) => {
          this.data = data.filter((astrologer) => astrologer.status === 'Approved');
          this.filteredAstrologers = this.data; // Initialize filtered astrologers
          this.getAstrologerRatings(); // Fetch ratings after fetching astrologers
        },
        (error) => {
          console.error('Error fetching data', error);
        }
      );
  }

  generateStars(rating: number): number[] {
    return new Array(Math.round(rating)); // Creates an array with the number of stars based on the rating
  }
  
  getAstrologerRatings(): void {
    this.filteredAstrologers.forEach((astrologer) => {
      this.http
        .get<number>(`http://localhost:8075/api/feedbacks/average-rating/${astrologer.regId}`)
        .subscribe(
          (rating) => {
            console.log('Average Rating for astrologer', astrologer.regId, ':', rating);
            astrologer.rating = rating; // Assign the rating to the astrologer object
          },
          (error) => {
            console.error(`Error fetching rating for astrologer ${astrologer.regId}`, error);
            astrologer.rating = 0; // Default to 0 if error occurs
          }
        );
    });
  }

  getAstrologerBusyStatus(): void {
    this.data.forEach((astrologer) => {
      this.http
        .get<boolean>(`http://localhost:8075/api/astrologers/isBusy/${astrologer.regId}`)
        .subscribe(
          (isBusy) => {
            astrologer.isBusy = isBusy;
            console.log(`Astrologer ${astrologer.regId} is busy: ${isBusy}`);
          },
          (error) => {
            console.error(`Error fetching busy status for ${astrologer.regId}`, error);
          }
        );
    });
  }

  getSearchData(): void {
    this.http
      .get<Astrologer[]>(`http://localhost:8075/api/astrologers/get-data/${this.searchTerm}`)
      .subscribe(
        (data) => {
          this.data = data;
          this.filteredAstrologers = data;
        },
        (error) => {
          console.error('Error fetching search data', error);
        }
      );
  }
}
