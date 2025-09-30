import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {

  isActive: boolean = false;   
  isPassWordVisible: boolean = false;
  isPassWordVisibleconfirm: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      if (mode === 'register') {
        this.isActive = true;
      } else {
        this.isActive = false;
      }
    });
  }

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
