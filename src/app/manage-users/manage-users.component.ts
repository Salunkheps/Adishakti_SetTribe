// Manage User component .ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Config } from 'datatables.net';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'; // Import your icons
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface User {
  regId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string; // Ensure mobileNumber is included
  dob?: string; // Ensure dob is included
  status?: string;
}

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isEditable: boolean[] = [];
  isNewUser = false;
  newUser: Partial<User> = {};
  searchTerm = '';
  dtOptions: Config = {};

  // Font Awesome icons
  faEdit = faEdit;
  faTrash = faTrash;

  constructor(private userService: UserService, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.http.get<any[]>('http://localhost:8075/api/users') // Ensure the URL matches your backend configuration
          .subscribe((data) => {
            callback({
              recordsTotal: data.length,
              recordsFiltered: data.length,
              data: data
            });
          }, (error) => {
            console.error("Error fetching Users:", error);
            alert("Error fetching Users");
          });
      },
      columns: [{
        title: 'Sr. No.',
        data: null,
        render: (data: any, type: any, row: any, meta: any) => {
          return meta.row + 1; // This generates the serial number
        }
      },
      {
        title: 'First Name',
        data: 'firstName'
      },
      {
        title: 'Last Name', // Change from 'Name' to 'Last Name'
        data: 'lastName'
      }, {
        title: 'Email',
        data: 'email'
      }, {
        title: 'Mobile Number',
        data: 'mobileNumber'
      },
      {
        title: 'Date of Birth',
        data: 'dob'
      },
      {
        title: 'Status',
        data: 'status'
      },
      {
        title: 'Actions',
        render: (data: any, type: any, row: any, meta: any) => {
          // Check if the user's status is deactivated
          if (row.status === 'Deactivated') {
            return '-'; // Render a hyphen when the user is deactivated
          } else {
            return `
             <button class="edit-btn btn btn-danger" data-index="${row.regId}">
                <fa-icon [icon]="faEdit"></fa-icon> Deactivate
              </button>`;
          }
        },
        orderable: false
      }
      ]
    };
  }

  ngAfterViewInit(): void {
    // Attach event listeners after the DataTable has been initialized
    $(document).on('click', '.edit-btn', (event) => {
      const userId = $(event.currentTarget).data('index'); // Get the user ID from the data-index attribute

      // Call the deactivateUser method
      this.deactivateUser(userId);
    });
  }


  // Load users from the API
  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
        this.filteredUsers = this.users;
        this.isEditable = new Array(this.users.length).fill(false);
      },
      (error) => console.error('Error fetching users', error)
    );
  }
  deactivateUser(regId: string): void {
    this.userService.deactivateUser(regId).subscribe(
      () => {
        this.loadUsers(); // Reload users after deactivating
        console.log(`User with ID ${regId} deactivated successfully.`);

        Swal.fire({
          title: 'User Deactivated',
          text: `User with ID ${regId} deactivated successfully!`,
          icon: 'success',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload(); // Refresh the page after the user clicks "OK"
          }
        });
      },
      (error) => {
        console.error('Error deactivating user', error);
        alert('An error occurred while deactivating the user. Please try again.');
      }
    );
  }




  // Merge firstName and lastName into name
  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  // Filter users based on search input
  searchUsers(): void {
    this.filteredUsers = this.users.filter(user =>
      this.getFullName(user).toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Toggle edit mode for a specific row
  toggleEdit(index: number): void {
    this.isEditable[index] = !this.isEditable[index];
  }

  // Save an existing user after editing
  saveUser(user: User): void {
    this.userService.updateUser(user).subscribe(
      () => {
        this.isEditable.fill(false);
        this.loadUsers(); // Reload users after saving
      },
      (error) => console.error('Error updating user', error)
    );
  }

  // Delete a user
  deleteUser(index: number): void {
    const userId = this.filteredUsers[index].regId;
    this.userService.deleteUser(userId).subscribe(
      () => this.loadUsers(), // Reload users after deletion
      (error) => console.error('Error deleting user', error)
    );
  }

  // Add a new user (trigger adding mode)
  addUser(): void {
    this.isNewUser = true;
    this.newUser = {};
  }



  // Cancel adding new user
  cancelNewUser(): void {
    this.isNewUser = false;
    this.newUser = {};
  }
  logout(event: MouseEvent) {
    event.preventDefault(); // Prevent default link behavior
    Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      backdrop: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('User logged out');
        this.router.navigate(['/Home']);
      }
    });
  }

}