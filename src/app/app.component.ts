import { Component } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, RouterOutlet, FormsModule, CommonModule, NavBarComponent,ReactiveFormsModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']

})
export class AppComponent {
}







