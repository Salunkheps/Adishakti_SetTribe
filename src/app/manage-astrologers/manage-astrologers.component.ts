//  Manage Astrologer component .ts 

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AstrologerService } from '../astrologer.service';
import { Config } from 'datatables.net';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'; // Import your icons
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-astrologers',
  templateUrl: './manage-astrologers.component.html',
  styleUrls: ['./manage-astrologers.component.css']
})
export class ManageAstrologersComponent implements OnInit {
  astrologers: any[] = [];
  searchForm: FormGroup;
  newAstrologerForm: FormGroup;
  dtOptions: Config = {};
  displayAddForm: boolean = false;
  selectedAstrologer: any = null;

  // Font Awesome icons
  faEdit = faEdit;
  faTrash = faTrash;

  formFields = [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'mobile', label: 'Mobile', type: 'text' },
    { name: 'aadhar', label: 'Aadhar Number', type: 'text' },
    { name: 'dob', label: 'Date of Birth', type: 'date' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'exp', label: 'Experience', type: 'number' },
    { name: 'langKnown', label: 'Languages Known', type: 'text' },
    { name: 'skills', label: 'Skills', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'profilePhoto', label: 'Profile Photo URL', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'district', label: 'District', type: 'text' },
    { name: 'state', label: 'State', type: 'text' },
    { name: 'country', label: 'Country', type: 'text' },
    { name: 'pinCode', label: 'Pin Code', type: 'text' },
    { name: 'ratePerMinute', label: 'Rate per Minute', type: 'number' },
    { name: 'certification', label: 'Certification', type: 'text' },
    { name: 'degree', label: 'Degree', type: 'text' }
  ];
  constructor(private astrologerService: AstrologerService, private fb: FormBuilder, private http: HttpClient,private router: Router) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.newAstrologerForm = this.fb.group(this.createFormGroup());
  }

  ngOnInit(): void {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.astrologerService.getAllAstrologers().subscribe(data => {
          callback({
            recordsTotal: data.length,
            recordsFiltered: data.length,
            data: data
          });
        }, error => {
          console.error("Error fetching astrologers:", error);
          alert("Error fetching astrologers");
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
        { title: 'First Name', data: 'firstName' },
        { title: 'Last Name', data: 'lastName' },
        { title: 'Email', data: 'email' },
        { title: 'Mobile Number', data: 'mobile' },
        { title: 'Status', data: 'status' },
        {
          title: 'Actions',
          render: (data: any, type: any, row: any, meta: any) => {
            let buttons = '';
            if (row.status === 'Pending') {
              buttons = `
                <button class="edit-btn btn btn-success" data-index="${row.regId}">
                  Approve
                </button>
                <button class="delete-btn btn btn-danger" data-index="${row.regId}">
                  Reject
                </button>`;

            } else if (row.status === 'Approved') {
              buttons = `
              <button class="edit-btn btn btn-success" data-index="${row.regId}">
                Approve
              </button>`;
            }
            else if (row.status === 'Rejected') {
              buttons = `
                <button class="edit-btn" data-index="${row.regId}">
                  Approve
                </button>`;
            }
            return buttons;
          },
          orderable: false
        }
      ]
    };
    this.loadAstrologers();

  }

  ngAfterViewInit(): void {
    // Attach event listeners after the DataTable has been initialized
    $(document).on('click', '.edit-btn', (event) => {
      const index = $(event.currentTarget).data('index');
      this.approveAstrologer(index);
    });

    $(document).on('click', '.delete-btn', (event) => {
      const index = $(event.currentTarget).data('index');
      this.rejectAstrologer(index);
    });
  }
  loadAstrologers(): void {
    this.astrologerService.getAllAstrologers().subscribe((data: any[]) => {
      this.astrologers = data; // Store astrologers for rendering via Angular
    });
  }

  approveAstrologer(regId: string): void {
    console.log(regId);
    this.astrologerService.approveAstrologer(regId).subscribe(() => {
      this.loadAstrologers();
      Swal.fire(`Astrologer has been approved!`);
      window.location.reload(); // Reload the page after approval

    });
  }

  rejectAstrologer(regId: string): void {
    this.astrologerService.rejectAstrologer(regId).subscribe(() => {
      this.loadAstrologers();
      Swal.fire(`Astrologer has been rejected!`);
      window.location.reload(); // Reload the page after approval

    });
  }

  // deleteAstrologer(id: number): void {
  //   this.astrologerService.deleteAstrologer(id).subscribe(() => {
  //     this.loadAstrologers();
  //   });
  // }

  search(): void {
    const searchTerm = this.searchForm.value.searchTerm;
    this.astrologerService.searchAstrologers(searchTerm).subscribe((data: any[]) => {
      this.astrologers = data;
    });
  }

  addAstrologer(): void {
    if (this.newAstrologerForm.valid) {
      this.astrologerService.addAstrologer(this.newAstrologerForm.value).subscribe(() => {
        this.loadAstrologers();
        this.newAstrologerForm.reset();
        this.displayAddForm = false; // Hide form after submission
      });
    }
  }

  createFormGroup() {
    const group: any = {};
    this.formFields.forEach(field => {
      group[field.name] = [''];
    });
    return group;
  }

  editAstrologer(astrologer: any): void {
    // Populate the form with the astrologer's data for editing
    this.selectedAstrologer = astrologer;
    this.newAstrologerForm.patchValue(astrologer);
    this.displayAddForm = true; // Show the form for editing
  }

  showAddAstrologerForm(): void {
    // Toggle form visibility
    this.displayAddForm = !this.displayAddForm;
    if (!this.displayAddForm) {
      this.newAstrologerForm.reset(); // Reset form if hiding
      this.selectedAstrologer = null; // Clear selected astrologer
    }
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
