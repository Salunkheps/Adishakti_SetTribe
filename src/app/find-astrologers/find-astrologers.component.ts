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
  rating: number;
  mobileNumber: string; // Ensure this field exists in your backend response
  ratePerMinute: number;
  isOnline?: boolean; // Add this field
  status: string; // Add this field
  isBusy?: boolean; // Add isBusy field here
  rpmStatus?: string; // Add this field for rate per minute status
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
          astrologer.status === 'Approved' && // Filter by status
          (astrologer.firstName.toLowerCase().includes(searchTerm) ||
            astrologer.skills.toLowerCase().includes(searchTerm))
      );
    }
  }

  navigateToChat(astrologer: any) {
    sessionStorage.setItem('selectedAstrologer', JSON.stringify({
      regId: astrologer.regId,
      firstName: astrologer.firstName,
      lastName: astrologer.lastName,
      imageData: astrologer.astrologerImages ? astrologer.astrologerImages.imageData : null
    }));

    this.router.navigate(['/chatwithastro']); // Update this route as needed
  }

  getAllData(): void {
    this.http
      .get<Astrologer[]>('http://localhost:8075/api/astrologers/get-astrologers')
      .subscribe(
        (data) => {
          this.data = data.filter(astrologer => astrologer.status === 'Approved'); // Filter here as well
          this.filteredAstrologers = this.data;
          this.getAstrologerBusyStatus(); // Fetch busy status after fetching all astrologers
        },
        (error) => {
          console.error('Error fetching data', error);
        }
      );
  }

  getAstrologerBusyStatus(): void {
    this.data.forEach(astrologer => {
      this.http
        .get<boolean>(`http://localhost:8075/api/astrologers/isBusy/${astrologer.regId}`)
        .subscribe(
          (isBusy) => {
            astrologer.isBusy = isBusy; // Set the busy status
            console.log(`Astrologer ${astrologer.regId} is busy: ${isBusy}`); // Print the busy status to console
          },
          (error) => {
            console.error(`Error fetching busy status for ${astrologer.regId}`, error);
          }
        );
    });
  }

  getAstrologerOnlineStatus(astrologer: Astrologer): void {
    this.http
      .get<boolean>(`http://localhost:8075/api/astrologers/${astrologer.regId}/isOnline`)
      .subscribe(
        (isOnline) => {
          astrologer.isOnline = isOnline;
        },
        (error) => {
          console.error(`Error fetching online status for ${astrologer.regId}`, error);
        }
      );
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
