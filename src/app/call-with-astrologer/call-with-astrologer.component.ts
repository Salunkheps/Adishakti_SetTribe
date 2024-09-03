import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Astrologer {
  firstName: string;
  lastName: string;
  mobile: string; // Use mobile instead of mobileNumber
}

@Component({
  selector: 'app-call-with-astrologer',
  templateUrl: './call-with-astrologer.component.html',
  styleUrls: ['./call-with-astrologer.component.css']
})
export class CallWithAstrologerComponent implements OnInit {
  astrologer: Astrologer | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.setCurrentDate();
    this.getAstrologerData();
  }

  setCurrentDate(): void {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString();
    }
  }

  getAstrologerData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Astrologer>(`http://localhost:8081/api/astrologers/${id}`).subscribe(
        (data) => {
          this.astrologer = data;
        },
        (error) => {
          console.error('Error fetching astrologer data', error);
        }
      );
    }
  }
}
