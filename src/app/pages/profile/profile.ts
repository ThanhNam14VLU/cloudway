import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  isDisabled = true;
  str='Chỉnh sửa hồ sơ';
  // Hàm để bật hoặc tắt chế độ chỉnh sửa.
  toggleEdit(): void {
    this.isDisabled = !this.isDisabled;
    this.str= this.isDisabled ? 'Chỉnh sửa hồ sơ' : 'Lưu thay đổi';
  }
}
