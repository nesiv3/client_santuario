import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'nav-bar',
    standalone: true,
    imports: [ RouterLink, ReactiveFormsModule, FormsModule, CommonModule],
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  userItem : any = null;
    constructor(public authService: AuthService) {}

    ngOnInit(): void {  
      this.userItem = JSON.parse(sessionStorage.getItem('user') || '{}');
      
    }

  logout(): void {
    sessionStorage.clear();
    this.authService.logout();
  }

}
