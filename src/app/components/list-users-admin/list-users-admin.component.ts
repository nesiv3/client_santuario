import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../models/user';

@Component({
  selector: 'list-users-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-users-admin.component.html',
  styleUrl: './list-users-admin.component.css'
})
export class ListUsersAdminComponent implements OnInit {

listUsers : User[] = [];

constructor(
  private usersServices : UsersService
){}

ngOnInit(): void {
  this.chargeUsers();
  console.log('Lista de usuarios al iniciar:', this.listUsers);
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
