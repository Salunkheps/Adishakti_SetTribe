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
  static findAistro = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Check login state on initialization
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  onClickHome() {
    NavbarComponent.homeClick = true;
    NavbarComponent.blogClick = false;
    NavbarComponent.findAistro = false;
  }

  onClickBlog() {
    NavbarComponent.homeClick = false;
    NavbarComponent.blogClick = true;
    NavbarComponent.findAistro = false;
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
  }

  setActiveTab(tabName: string) {
    this.currentTab = tabName;
  }

  closeDropdown() {
    this.showDropdown = false;
  }
}
