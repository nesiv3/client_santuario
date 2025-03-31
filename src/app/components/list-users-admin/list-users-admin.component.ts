import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'list-users-admin',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './list-users-admin.component.html',
  styleUrl: './list-users-admin.component.css'
})
export class ListUsersAdminComponent implements OnInit {

listUsers : User[] = [];
showModal2: boolean = false;
username:string = '';
password:string='';
email:string='';
type_user:number= 0;

constructor(
  private usersServices : UsersService
){}

ngOnInit(): void {
  this.chargeUsers();
  console.log('Lista de usuarios al iniciar:', this.listUsers);
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

saveUser(){
  const newUser: User = {
    username: this.username,
    password: this.password,
    email: this.email,
    type_user:this.type_user,
    active:true
  };

  this.usersServices.createUser(newUser).subscribe(()=> {
    alert("Usuario creado correctamente")
  })
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
