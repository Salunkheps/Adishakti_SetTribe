// Admin Dashboard .ts
import { Component } from '@angular/core';
interface User {
  id: number;
  name: string;
  email: string;
}
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  totalClients: number = 100; // Example value
  
  totalAstrologers: number = 10000; // Example value
  
  
  availabilityStatus: string = 'available';
  consultationRates: number = 100; // Example value
  workingHours: string = '9 AM - 5 PM'; // Example value
// User management properties
users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

constructor() { }
  updateAvailability() {
    // Logic to update availability status, consultation rates, and working hours
    console.log('Availability Updated:', {
      status: this.availabilityStatus,
      rates: this.consultationRates,
      hours: this.workingHours
    });
  }
    // User management methods
    addUser(): void {
      // Logic to add a new user
      const newUser: User = { id: this.users.length + 1, name: 'New User', email: 'new@example.com' };
      this.users.push(newUser);
    }
  
    editUser(user: User): void {
      // Logic to edit a user
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users[index] = { ...user, name: 'Updated User' }; // Example update
      }
    }
  
    deleteUser(userId: number): void {
      // Logic to delete a user
      this.users = this.users.filter(user => user.id !== userId);
    }
  }