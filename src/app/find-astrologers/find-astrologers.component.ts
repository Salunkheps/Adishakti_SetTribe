import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { WebSocketService } from '../web-socket.service';
import Swal from 'sweetalert2';

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

  bookAstrologer(astrologer: Astrologer): void {
    Swal.fire({
      title: 'Book Astrologer',
      html: `
      <style>
  /* Reset the top margin for SweetAlert input fields */
  div:where(.swal2-container) input:where(.swal2-input),
  div:where(.swal2-container) input:where(.swal2-file),
  div:where(.swal2-container) textarea:where(.swal2-textarea),
  div:where(.swal2-container) select:where(.swal2-select),
  div:where(.swal2-container) div:where(.swal2-radio),
  div:where(.swal2-container) label:where(.swal2-checkbox) {
    margin-top: 0 !important; /* Remove top margin */
    margin-left: 0 !important; /* Remove left margin */
    margin-right: 0 !important; /* Remove right margin */
  }
</style>
<br>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
  <div style="display: flex; justify-content: space-between; width: 100%;">
    <label for="bookingDate" style="flex: 1; text-align: left;">Date:</label>
    <input type="date" id="bookingDate" class="swal2-input" style="flex: 2; text-align: right;">
  </div>
<br>
  <div style="display: flex; justify-content: space-between; width: 100%;">
    <label for="bookingTime" style="flex: 1; text-align: left;">Time:</label>
    <input type="time" id="bookingTime" class="swal2-input" style="flex: 2; text-align: right;">
  </div>
<br>
  <div style="display: flex; justify-content: space-between; width: 100%;">
    <label for="bookingMinutes" style="flex: 1; text-align: left;">Minutes:</label>
    <input type="number" id="bookingMinutes" class="swal2-input" min="5" style="flex: 2; text-align: right;">
  </div>
</div>
`,
      confirmButtonText: 'Book Now',
      showCancelButton: true,
      preConfirm: () => {
        const date = (document.getElementById('bookingDate') as HTMLInputElement).value;
        const time = (document.getElementById('bookingTime') as HTMLInputElement).value;
        const minutes = (document.getElementById('bookingMinutes') as HTMLInputElement).value;

        if (!date || !time || !minutes) {
          Swal.showValidationMessage('Please fill out all the fields');
          return;
        }

        // Combine date and time to create bookingTime
        const bookingTime = `${date}T${time}`;

        return { bookingTime, minutes: parseInt(minutes, 10) };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const bookingDetails = {
          astrologerRegId: astrologer.regId,
          userRegId: this.getCurrentUserRegId(), // Method to get the current user's regId
          bookingTime: result.value.bookingTime,
          minutes: result.value.minutes,
        };

        // Call the backend to save the booking
        this.saveBooking(bookingDetails);
      }
    });
  }

  saveBooking(bookingDetails: any): void {
    this.http.post('http://localhost:8075/api/bookings/save', bookingDetails).subscribe(
      (response) => {
        Swal.fire('Success', 'Your booking has been confirmed!', 'success');
      },
      (error) => {
        console.error('Error saving booking', error);
        Swal.fire('Error', 'There was a problem booking the astrologer. Please try again.', 'error');
      }
    );
  }

  // Method to get the current user's regId (from session storage or other source)
  getCurrentUserRegId(): string {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')!);
    return currentUser.regId;
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
