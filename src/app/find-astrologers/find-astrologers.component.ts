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
}

@Component({
  selector: 'app-find-astrologers',
  templateUrl: './find-astrologers.component.html',
  styleUrls: ['./find-astrologers.component.css']
})
export class FindAstrologersComponent implements OnInit {
  data: Astrologer[] = [];
  filteredAstrologers: Astrologer[] = [];
  searchTerm: string = '';
  hoverRating: number | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.getAllData();
  }

  ngOnInit(): void {
    this.filteredAstrologers = this.data;
  }

  filterAstrologers(): void {
    const searchTerm = this.searchTerm.toLowerCase().trim();

    if (searchTerm === '') {
      this.getAllData();
      return;
    }

    this.getSearchData();
    this.filteredAstrologers = this.data.filter((astrologer: Astrologer) =>
      astrologer.firstName.toLowerCase().includes(searchTerm) ||
      astrologer.skills.toLowerCase().includes(searchTerm)
    );
  }

 
navagate(){
  this.router.navigateByUrl("/chats")
}

  getAllData(): void {
    this.http.get<Astrologer[]>("http://localhost:8080/api/astrologers/get-astrologers").subscribe(
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
    this.http.get<Astrologer[]>(`http://localhost:8080/api/astrologers/get-data/${this.searchTerm}`).subscribe(
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
