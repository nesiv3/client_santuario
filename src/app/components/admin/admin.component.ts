import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListUsersAdminComponent } from '../list-users-admin/list-users-admin.component';
import { ListTypesAdminComponent } from '../list-types-admin/list-types-admin.component';
import { ListCustomersAdminComponent } from '../list-customers-admin/list-customers-admin.component';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ListUsersAdminComponent, ListTypesAdminComponent, ListCustomersAdminComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
