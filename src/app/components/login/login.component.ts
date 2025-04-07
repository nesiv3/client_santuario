import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../services/users/users.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  listUsers: User[] = [];
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargeUsers1();
  }

  chargeUsers1(): void {
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.listUsers = users || [];
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.listUsers = [];
      }
    });
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();

    const foundUser = this.listUsers.find(
      user => user.email.trim() === trimmedEmail && user.password.trim() === trimmedPassword
    );
    
    if (foundUser) {
      this.authService.setAuthStatus(true);
      sessionStorage.setItem('user', JSON.stringify(foundUser));
      this.successMessage = `¡Bienvenido ${foundUser.email}!`;
      
      setTimeout(() => {
        this.router.navigate(['/home']).then(() => {
          this.isLoading = false;
        });
      }, 1500);
    } else {
      this.errorMessage = 'Credenciales incorrectas';
      this.isLoading = false;
    }
  }
}
