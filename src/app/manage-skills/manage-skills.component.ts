import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Config } from 'datatables.net';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-skills',
  templateUrl: './manage-skills.component.html',
  styleUrls: ['./manage-skills.component.css']
})
export class ManageSkillsComponent implements OnInit {
  newSkillName: string = ''; // Model for skill name input
  skills: any[] = []; // Array to hold the skills
  editIndex: number = -1; // Keep track of the index of the skill being edited
  apiUrl: string = 'http://localhost:8075/api/manage-skills'; // Spring Boot API URL
  dtOptions: Config = {};

  // Font Awesome icons
  faEdit = faEdit;
  faTrash = faTrash;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.http.get<any[]>(this.apiUrl).subscribe((data) => {
          callback({
            recordsTotal: data.length,
            recordsFiltered: data.length,
            data: data // Pass the fetched skills data to DataTables
          });
        }, (error) => {
          console.error("Error fetching skills:", error);
          alert("Error fetching skills");
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
          title: 'Skill Name',
          data: 'skillname' // Ensure this matches the skill name field in your backend data
        },
        {
          title: 'Actions',
          render: (data: any, type: any, row: any, meta: any) => {
            return `
              <button class="edit-btn btn btn-primary" data-index="${meta.row}">
                <fa-icon [icon]="faEdit"></fa-icon> Edit
              </button>
              <button class="delete-btn btn btn-danger" data-index="${meta.row}">
                <fa-icon [icon]="faTrash"></fa-icon> Delete
              </button>`;
          },
          orderable: false
        }
      ]
    };

    // Fetch the initial skill list
    this.getAllSkills();
  }

  ngAfterViewInit(): void {
    // Attach event listeners after the DataTable has been initialized
    $(document).on('click', '.edit-btn', (event) => {
      const index = $(event.currentTarget).data('index');
      this.editSkill(index);
    });

    $(document).on('click', '.delete-btn', (event) => {
      const index = $(event.currentTarget).data('index');
      this.deleteSkill(index);
    });
  }

  // Fetch all skills from API
  getAllSkills(): void {
    this.http.get<any[]>(this.apiUrl).subscribe((data) => {
      this.skills = data;
    });
  }

  // Check for duplicate skill before adding
  isDuplicateSkill(skillName: string): boolean {
    return this.skills.some(skill => skill.skillname.toLowerCase() === skillName.toLowerCase());
  }

  // Add a new skill and immediately update the skills array
  addSkill(): void {
    if (this.newSkillName) {
      if (this.isDuplicateSkill(this.newSkillName)) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Skill',
          text: 'This skill already exists. Please enter a different skill name.',
        });
        return; // Exit the function if a duplicate is found
      }

      const skill = { skillname: this.newSkillName }; // Create skill object
      this.http.post<any>(this.apiUrl, skill).subscribe((createdSkill) => {
        // Push the new skill into the local array for immediate update in the UI
        this.skills.push(createdSkill);
        this.resetForm(); // Reset the form after adding the skill
        Swal.fire("Skill added!");
        window.location.reload(); 
      }, (error) => {
        console.error("Error adding skill:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'There was an issue adding the skill. Please try again.',
        });
      });
    }
  }

  deleteSkill(index: number): void {
    if (index >= 0 && index < this.skills.length) {
      const skill = this.skills[index];

      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(`${this.apiUrl}/${skill.id}`).subscribe(() => {
            this.getAllSkills(); // Reload the skills after deleting
            Swal.fire({
              title: "Deleted!",
              text: "The skill has been deleted.",
              icon: "success"
            });
            window.location.reload(); // Refresh the page after deletion
          }, (error) => {
            console.error("Error deleting skill:", error);
          });
        }
      });
    } else {
      console.error("Invalid index for deleteSkill:", index);
    }
  }

  // Edit an existing skill
  editSkill(index: number): void {
    const skill = this.skills[index];
    this.newSkillName = skill.skillname;
    this.editIndex = index;
  }

  // Update the skill via API
  updateSkill(): void {
    if (this.newSkillName && this.editIndex !== -1) {
      const skill = { id: this.skills[this.editIndex].id, skillname: this.newSkillName };
      this.http.put(`${this.apiUrl}/${skill.id}`, skill).subscribe(() => {
        Swal.fire("Skill has been updated!");
        window.location.reload();
        this.getAllSkills(); // Reload the skills after updating
        this.resetForm();
      }, (error) => {
        console.error("Error updating skill:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'There was an issue updating the skill. Please try again.',
        });
      });
    }
  }

  // Reset form fields
  resetForm(): void {
    this.newSkillName = '';
    this.editIndex = -1; // Reset edit mode
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
