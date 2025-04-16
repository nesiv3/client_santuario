import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TypeUserService } from '../../services/typeUser/type-user.service';
import { UserType } from '../../models/userType';
import { FormsModule } from '@angular/forms';
import { error } from 'node:console';
import { response } from 'express';

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
  if (this.typeForm) {
    this.serviceTypeUsers.createTypeUser(this.typeForm).subscribe({
      next: (res) => {
        alert('Tipo de usuario creado con éxito');
        console.log(res);
        this.closeModal();
        this.chargeTypeUsers(); // recargar la lista si lo necesitas
      },
      error: (err) => {
        alert('Error al guardar usuario');
        console.error(err);
      }
    });
  } else {
    alert('Formulario inválido o incompleto');
  }
}

  toggleTypeUser(type: any) {
    const previousState = type.active; // Guardar estado previo por si hay error
    type.active = !type.active; // Cambiar estado visualmente
    
    this.serviceTypeUsers.toggleActiveStatus(type.id_userType).subscribe({
      next: (response) => {
        console.log("Estado actualizado correctamente:", response);
        alert(response.message);
      },
      error: (error) => {
        console.error("Error al actualizar estado:", error);
        alert("Hubo un error al cambiar el estado del usuario.");
        type.active = previousState; // Revertir cambio si falla
      }
    });
  }

}
