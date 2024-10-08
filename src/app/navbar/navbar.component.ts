import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.guard'; // Adjust import path as needed

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  showDropdown = false;
  currentTab = '';
  static homeClick = true;
  static blogClick = false;
  static findAstroClick = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Check login state on initialization
    this.isLoggedIn = this.authService.isLoggedIn();
    const currentUser = sessionStorage.getItem('currentUser');
    this.isLoggedIn = !!currentUser;  // If currentUser exists, isLoggedIn becomes true
    // If logged in, set Find Astrologer as the active tab
    if (this.isLoggedIn) {
      NavbarComponent.findAstroClick = true;
      NavbarComponent.homeClick = false; // Home should be hidden
    }
  }



  onClickHome() {
    NavbarComponent.homeClick = true;
    NavbarComponent.blogClick = false;
    NavbarComponent.findAstroClick = false;
  }

  onClickBlog() {
    NavbarComponent.homeClick = false;
    NavbarComponent.blogClick = true;
    NavbarComponent.findAstroClick = false;
  }
  
  onClickFindAstrologers() {
    if (this.isLoggedIn) {
      this.router.navigate(['/find-astrologers']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  active: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown');
    if (!clickedInside) {
      this.showDropdown = false;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showDropdown = false;
    // Clear session and reload page
    sessionStorage.removeItem('currentUser');
    this.isLoggedIn = false;
    // Optionally reload or navigate
  }

  setActiveTab(tabName: string) {
    this.currentTab = tabName;
  }

  closeDropdown() {
    this.showDropdown = false;
  }
}
