import { Component } from '@angular/core';

@Component({
  selector: 'app-airline-setting',
  imports: [],
  templateUrl: './airline-setting.html',
  styleUrl: './airline-setting.scss'
})
export class AirlineSetting {
isMotify = false;
isEdit=false;//khi chọn s
state="Chỉnh sửa";
  edit() {
    this.isEdit=!this.isEdit;
    if(this.isEdit){
      this.state="Lưu";
      this.isMotify=true;
    }else{
      this.state="Chỉnh sửa";
      this.isMotify=false;
    } 
  }
  
}
