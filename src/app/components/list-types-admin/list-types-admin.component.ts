import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TypeUserService } from '../../services/typeUser/type-user.service';
import { UserType } from '../../models/userType';

@Component({
  selector: 'list-types-admin',
  imports: [CommonModule],
  templateUrl: './list-types-admin.component.html',
  styleUrl: './list-types-admin.component.css'
})
export class ListTypesAdminComponent implements OnInit {

  typesUsersApi: UserType[] = [];

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

}
