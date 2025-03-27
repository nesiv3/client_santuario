import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'nav-bar',

    standalone: true,
    imports: [ RouterLink,ReactiveFormsModule, FormsModule, CommonModule],

    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
    constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }

}
