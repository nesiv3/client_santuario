import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';
import { TypeUserService } from '../typeUser/type-user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuth = false;
  private USERS_URL = environment.USERS_URL; 

  constructor(
    private http: HttpClient, 
    private router: Router,
    private serviceTypeUsers: TypeUserService
  ) {}

  // Guarda el estado de autenticación
  setAuthStatus(status: boolean): void {
    this.isAuth = status;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isAuth', status.toString());
    }
  }

  // Verifica si el usuario está autenticado
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isAuth') === 'true';
    }
    return false;
  }
  
  // Llamada al backend para autenticar al usuario
  onLogin(username: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.USERS_URL}?username=${username}&password=${password}`);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // Cierra sesión y limpia los datos almacenados
  logout(): void {
    this.isAuth = false;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAuth');
    }
    this.router.navigate(['/login']);
  }
}
