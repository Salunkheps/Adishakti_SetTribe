import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Config } from 'datatables.net';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit, OnDestroy {
  users: any[] = [];
  dtOptions: Config = {};
  astrologerRegId: string | null; // Declare the property

  constructor(private http: HttpClient, private router: Router, private webSocketService: WebSocketService) {
    this.astrologerRegId = sessionStorage.getItem('regId');

  }
  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  ngOnInit(): void {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        const astrologerRegId = sessionStorage.getItem('regId');
        // Fetch chat sessions for this astrologer
        this.http.get<any[]>(`http://localhost:8075/api/chatsessions/astrologer/${astrologerRegId}`)
          .subscribe((chatSessions) => {
            // Map through chatSessions to get only the required user fields
            const users = chatSessions.map(cs => ({
              firstName: cs.user.firstName,
              lastName: cs.user.lastName,
              email: cs.user.email,
              dob: cs.user.dob,
              birthTime: cs.user.birthTime,
              birthPlace: cs.user.birthPlace

            }));

            callback({
              recordsTotal: users.length,
              recordsFiltered: users.length,
              data: users
            });
          }, (error) => {
            console.error("Error fetching chat sessions:", error);
            alert("Error fetching chat sessions");
          });
      },
      columns: [
        {
          title: 'Sr. No.',
          data: null,
          render: (data: any, type: any, row: any, meta: any) => {
            return meta.row + 1; // This generates the serial number
          }
        },
        {
          title: 'Full Name',
          data: null,
          render: (data: any) => {
            return` ${data.firstName} ${data.lastName}`;
          }
        },
        {
          title: 'Date Of Birth',
          data: 'dob'
        },
        {
          title: 'Email',
          data: 'email'
        },
        {
          title: 'Birth Time',
          data: 'birthTime'
        }, {
          title: 'Birth Place',
          data: 'birthPlace'
        }
      ]
    };

    this.webSocketService.connect();
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get<any[]>('http://localhost:8075/api/users') // Ensure the URL matches your backend configuration
      .subscribe(
        data => {
          this.users = data;
        },
        error => {
          console.error('Error fetching users', error);
        }
      );
  }
  logout(event: MouseEvent): void {
    // Prevent the default behavior of the button click (in case it's a form submission or link)
    event.preventDefault();
    const isUserOnline = sessionStorage.getItem('isUserOnline') === 'true';

    if (isUserOnline) {
      Swal.fire({
        title: 'You are online',
        text: 'Are you sure you want to go offline and logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, go offline and logout',
        cancelButtonText: 'No, stay online'
      }).then((result) => {
        if (result.isConfirmed) {
          // Proceed to update the user's online status in the database
          const apiUrl =` http://localhost:8075/api/astrologers/toggle-status/${this.astrologerRegId}`;
          this.http.put(apiUrl, {}).subscribe(
            (response) => {
              console.log('User status updated to offline:', response);

              // Clear session storage and perform logout
              this.performLogout();
            },
            (error: HttpErrorResponse) => {
              console.error('Error updating user status', error);
              // Optionally show an error message or handle it accordingly
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error updating your status. Please try again.',
              });
            }
          );
        }
        // If the user cancels, do nothing (stay online)
      });
    } else {
      // If the user is offline, show a standard logout confirmation
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'No, stay logged in'
      }).then((result) => {
        if (result.isConfirmed) {
          // Clear session storage and perform logout
          this.performLogout();
        }
        // If the user cancels, do nothing (no redirection)
      });
    }
  }

  // Helper method to perform the actual logout logic
  private performLogout(): void {
    sessionStorage.clear(); // Clear session storage
    localStorage.removeItem('currentUser'); // Optional: clear local storage if you're storing user info

    // Show another SweetAlert message confirming logout success
    Swal.fire({
      title: 'Logged Out',
      text: 'You have been logged out successfully.',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then(() => {
      // Redirect to login page after showing success message
      this.router.navigate(['/astrologer-login']);
    });
  }

}