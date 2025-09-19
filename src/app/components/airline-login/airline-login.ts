import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-airline-login',
  imports: [RouterLink],
  templateUrl: './airline-login.html',
  styleUrl: './airline-login.scss'
})
export class AirlineLogin {
     
  isPassWordVisible: boolean=true;
  //ẩn/hiện mật khẩu
  togglePassword() {
    this.isPassWordVisible = !this.isPassWordVisible;
  }
  
   
}
