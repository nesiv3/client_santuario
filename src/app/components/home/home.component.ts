import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'home',
    standalone: true, // si este componente es standalone
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

welcomeMessage: string = '';

    ngOnInit(): void {
        const message = sessionStorage.getItem('welcome');
        if (message) {
          this.welcomeMessage = message;
          sessionStorage.removeItem('welcome'); // lo elimina para que no se repita
        }
      }
}
