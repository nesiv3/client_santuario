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
  listUsers: User[] = [];

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
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();

    const foundUser = this.listUsers.find(
      user => user.email.trim() === trimmedEmail && user.password.trim() === trimmedPassword
    );
    
    if (foundUser) {
      this.authService.setAuthStatus(true);
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Credenciales incorrectas';
    }
  }
}
