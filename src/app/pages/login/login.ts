import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  isActive: boolean = false;   
  isPassWordVisible: boolean = false;
  isPassWordVisibleconfirm: boolean = false;
  togglePasswordVisibility() {
    this.isPassWordVisible = !this.isPassWordVisible;
  }
  togglePasswordVisibilityconfirm() {
    this.isPassWordVisibleconfirm = !this.isPassWordVisibleconfirm;
  }

  toggle(isRegister: boolean) {
    this.isActive = isRegister;
  }
}
