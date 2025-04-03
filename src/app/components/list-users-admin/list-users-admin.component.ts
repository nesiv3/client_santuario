import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { TypeUserService } from '../../services/typeUser/type-user.service';
import { UserType } from '../../models/userType';

@Component({
  selector: 'list-users-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './list-users-admin.component.html',
  styleUrl: './list-users-admin.component.css'
})
export class ListUsersAdminComponent implements OnInit {

listUsers : User[] = [];
typesUsersApi: UserType[] = [];
showModal2: boolean = false;
username:string = '';
password:string='';
email:string='';
type_user:number= 0;

constructor(
  private usersServices : UsersService,
  private serviceTypeUsers: TypeUserService
){}

ngOnInit(): void {
  this.chargeUsers();
  this.chargeTypeUsers();
  console.log('Lista de usuarios al iniciar:', this.listUsers);
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

openModal2(){
  this.showModal2 = true;
  this.resetModal();
}

closeModal(){
  this.showModal2 = false;
}

resetModal(){
  this.username = '';
  this.password = '';
  this.email='';
  this.type_user = 0;
}

saveUser() {
  // Validación previa antes de enviar la petición
  if (!this.username || !this.password || !this.email || this.type_user === undefined) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  if (this.password.length < 8) {
    alert("La contraseña debe tener al menos 8 caracteres.");
    return;
  }

  // Validar si el tipo de usuario está activo
  const selectedTypeUser = this.typesUsersApi.find(type => type.id_userType === this.type_user);
  if (!selectedTypeUser || !selectedTypeUser.active) {
    alert("El tipo de usuario seleccionado está inactivo. Seleccione uno activo.");
    return;
  }

  const newUser: User = {
    username: this.username,
    password: this.password,
    email: this.email,
    type_user: this.type_user,
    active: true
  };

  this.usersServices.createUser(newUser).subscribe({
    next: (response) => {
      alert(response.message); // Muestra el mensaje que devuelve el backend
    },
    error: (error) => {
      console.error("Error al crear usuario:", error);

      // Verificar si el backend envió un mensaje de error y mostrarlo
      if (error.error && error.error.message) {
        alert(`Error: ${error.error.message}`);
      } else {
        alert("Error desconocido. Consulte la consola para más detalles.");
      }
    }
  });
}

toggleUser(user:any){
  const previousState = user.active; // Guardar estado previo por si hay error
  user.active = !user.active; // Cambiar estado visualmente

  this.usersServices.toggleUserActive(user.id_user).subscribe({
    next: (response) => {
      console.log("Estado actualizado correctamente:", response);
      alert(response.message);
    },
    error: (error) => {
      console.error("Error al actualizar estado:", error);
      alert("Hubo un error al cambiar el estado del usuario.");
      user.active = previousState; // Revertir cambio si falla
    }
  });

}

chargeUsers(){
   this.usersServices.getAllUsers().subscribe({
      next: (users) => {  
        this.listUsers = users || [];  
        console.log('usuarios obtenidos:', this.listUsers);
      },
      error: (error) => {
        console.error('Error en la búsqueda de usurios:', error);
        this.listUsers = [];  
      }
    });
}

}
