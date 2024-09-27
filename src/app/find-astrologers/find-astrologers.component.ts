import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
interface astrologerImages {
  id: number;
  name: string | null;
  type: string | null;
  imageData: string | null;
}
interface Astrologer {
  regId: string;
  firstName: string;
  lastName: string;
  skills: string;
  languagesKnown: string[];
  rating: number;
  astrologerImages: { imageData: string };
  mobileNumber: string; // Make sure this field exists in your backend response
  ratePerMinute: number;
}

@Component({
  selector: 'app-find-astrologers',
  templateUrl: './find-astrologers.component.html',
  styleUrls: ['./find-astrologers.component.css'],
})
export class FindAstrologersComponent implements OnInit {
  data: Astrologer[] = [];
  filteredAstrologers: Astrologer[] = [];
  searchTerm: string = '';
  hoverRating: number | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.getAllData();
    this.filteredAstrologers = this.data;

  }

  ngOnInit(): void {
    this.filteredAstrologers = this.data;
  }

  // filterAstrologers(): void {
  //   const searchTerm = this.searchTerm.toLowerCase().trim();

  //   if (searchTerm === '') {
  //     this.getAllData();
  //     return;
  //   }

  //   this.getSearchData();
  //   this.filteredAstrologers = this.data.filter(
  //     (astrologer: Astrologer) =>
  //       astrologer.firstName.toLowerCase().includes(searchTerm) ||
  //       astrologer.skills.toLowerCase().includes(searchTerm)
  //   );
  // }
  filterAstrologers(): void {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    if (searchTerm === '') {
      this.filteredAstrologers = [...this.data];
    } else {
      this.filteredAstrologers = this.data.filter(
        (astrologer: Astrologer) =>
          astrologer.firstName.toLowerCase().includes(searchTerm) ||
          astrologer.skills.toLowerCase().includes(searchTerm)
      );
    }
  }

  navigateToCall(astrologer: any) {
    // Store astrologer details in session storage
    sessionStorage.setItem('selectedAstrologer', JSON.stringify({
      regId: astrologer.regId,
      firstName: astrologer.firstName,
      lastName: astrologer.lastName,
      imageData: astrologer.astrologerImages ? astrologer.astrologerImages.imageData : null
    }));

    // Navigate to the call page
    this.router.navigate(['/call']); // Update this route as needed
  }


  navigateToChat(astrologer: any) {
    // Store astrologer details in session storage
    sessionStorage.setItem('selectedAstrologer', JSON.stringify({
      regId: astrologer.regId,
      firstName: astrologer.firstName,
      lastName: astrologer.lastName,
      imageData: astrologer.astrologerImages ? astrologer.astrologerImages.imageData : null
    }));
        
    // Navigate to the chat page
    this.router.navigate(['/chatwithastro', astrologer.regId]); // Update this route as needed
  }

  getAllData(): void {
    this.http
      .get<Astrologer[]>(
        'http://localhost:8075/api/astrologers/get-astrologers'
      )
      .subscribe(
        (data) => {
          this.data = data;
          this.filteredAstrologers = data;
        },
        (error) => {
          console.error('Error fetching data', error);
        }
      );
  }

  getSearchData(): void {
    this.http
      .get<Astrologer[]>(
        `http://localhost:8075/api/astrologers/get-data/${this.searchTerm}`
      )
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
