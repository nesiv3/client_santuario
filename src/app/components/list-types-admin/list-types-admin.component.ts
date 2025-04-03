import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TypeUserService } from '../../services/typeUser/type-user.service';
import { UserType } from '../../models/userType';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'list-types-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-types-admin.component.html',
  styleUrl: './list-types-admin.component.css'
})
export class ListTypesAdminComponent implements OnInit {

  typesUsersApi: UserType[] = [];
  showModal4: boolean = false;

  typeForm = {
    rol: '',
    active: true
  };

  constructor(private serviceTypeUsers : TypeUserService){}

  ngOnInit(): void {
    this.chargeTypeUsers()
  }

  chargeTypeUsers(){
    this.serviceTypeUsers.getAllTypeUsers().subscribe({
      next: (types) => {  
        this.typesUsersApi = types || [];  
        console.log('Tipos de usuarios obtenidos:', this.typesUsersApi );
      },
      error: (error) => {
        console.error('Error en la búsqueda de tipos de usuarios:', error);
        this.typesUsersApi = [];  
      }
    });
  }

  openModal4() {
    this.showModal4 = true;
    this.resetModal();  // Limpia el formulario cada vez que se abre el modal
  }

  closeModal() {
    this.showModal4 = false;
  }

  resetModal() {
    this.typeForm = { rol: '', active: true };
  }

  saveUserType() {
    console.log('Guardando usuario...', this.typeForm);
    this.closeModal();
  }

}
