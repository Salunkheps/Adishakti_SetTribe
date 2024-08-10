import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  constructor(private router: Router) { }
  canActivate(): boolean {
    // Check if the user is logged in
    if (localStorage.getItem('currentUser')) {
      return true;
    } else {
      // Redirect to login page if not logged in
      this.router.navigate(['/login']);
      return false;
    }
  }

  login(user: any) {
    // Store user data in local storage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Optionally, set the login state in a service or other state management solution
    // this.isLoggedIn = true; // Update login state

    // Redirect to a different page, e.g., dashboard
    this.router.navigate(['/find-astrologers']);
  }

  logout() {
    // Clear user data from local storage
    localStorage.removeItem('currentUser');

    // Redirect to login page
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }
}
