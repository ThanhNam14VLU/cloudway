import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../supabase.client';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Kiểm tra xem user có đang trong recovery session không
    this.checkRecoverySession();
  }

  async checkRecoverySession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        this.router.navigate(['/login']);
        return;
      }
    } catch (error) {
      console.error('Error checking recovery session:', error);
      this.router.navigate(['/login']);
    }
  }

  async updatePassword() {
    // Validation
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Vui lòng nhập đầy đủ mật khẩu';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';

      const { data, error } = await supabase.auth.updateUser({
        password: this.newPassword
      });

      if (error) {
        throw error;
      }

      this.successMessage = 'Mật khẩu đã được cập nhật thành công!';
      
      // Đợi 2 giây rồi chuyển về trang login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error: any) {
      this.errorMessage = error.message || 'Cập nhật mật khẩu thất bại';
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
