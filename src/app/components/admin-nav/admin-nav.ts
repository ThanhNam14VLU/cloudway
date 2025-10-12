import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.scss'
})
export class AdminNav {
      isMenuOpen = 1;

      toggleMenu(isMenuOpen:number) {
        this.isMenuOpen = isMenuOpen;
      }


}
