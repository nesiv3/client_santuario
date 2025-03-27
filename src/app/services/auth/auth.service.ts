import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  // private USERS_URL = environment.USERS_URL;

  constructor(private http: HttpClient,private router: Router) {}

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === '1234') { 
      this.isAuthenticated = true;
      localStorage.setItem('user', 'true');
      this.router.navigate(['/home']);
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('user') === 'true';
  }
}
