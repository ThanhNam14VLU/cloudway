import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  constructor(
    private route: ActivatedRoute, 
    private authService: AuthService,
    private router: Router
  ) {}

  // Form data cho login
  loginForm = {
    email: '',
    password: ''
  };

  // Form data cho register
  registerForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  // UI state
  isActive: boolean = false;   
  isPassWordVisible: boolean = false;
  isPassWordVisibleconfirm: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  async loginGoogle() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      // OAuth sẽ redirect ra ngoài app, code dưới đây thường sẽ không chạy
      // Điều hướng dựa trên role sẽ được xử lý ở AuthCallbackComponent
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.errorMessage = error.message || 'Đăng nhập Google thất bại';
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithPassword() {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ email và mật khẩu';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      await this.authService.signInWithPassword(this.loginForm.email, this.loginForm.password);
      
      const role = await this.authService.getCurrentUserRole();
      console.log('roleeeeeeee', role);
      
      // Navigate based on role (always route, check account status at destination)
      console.log('Navigating based on role:', role);
      
      if (role === 'ADMIN') {
        console.log('Navigating to admin dashboard');
        this.router.navigate(['/admin/admin-customers']);
      } else if (role === 'AIRLINE') {
        console.log('Navigating to airline dashboard');
        this.router.navigate(['/airline/airline-dashboard']);
      } else {
        console.log('Navigating to home');
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.log('❌ Login error:', error);
      this.errorMessage = error.message || 'Đăng nhập thất bại';
    } finally {
      this.isLoading = false;
    }
  }

  async registerWithPassword() {
    // Validation
    if (!this.registerForm.firstName || !this.registerForm.lastName || 
        !this.registerForm.email || !this.registerForm.phone || 
        !this.registerForm.password || !this.registerForm.confirmPassword) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp';
      return;
    }

    if (this.registerForm.password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      const userData = {
        first_name: this.registerForm.firstName,
        last_name: this.registerForm.lastName,
        phone: this.registerForm.phone
      };

      const result = await this.authService.signUpWithPassword(
        this.registerForm.email, 
        this.registerForm.password, 
        userData
      );

      if (result.user && !result.user.email_confirmed_at) {
        this.successMessage = 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.';
      } else {
        this.successMessage = 'Đăng ký thành công!';
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Đăng ký thất bại';
    } finally {
      this.isLoading = false;
    }
  }

  async resetPassword() {
    if (!this.loginForm.email) {
      this.errorMessage = 'Vui lòng nhập email để reset mật khẩu';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.resetPassword(this.loginForm.email);
      this.successMessage = 'Email reset mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.';
    } catch (error: any) {
      this.errorMessage = error.message || 'Gửi email reset mật khẩu thất bại';
    } finally {
      this.isLoading = false;
    }
  }


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      const error = params['error'];
      
      if (mode === 'register') {
        this.isActive = true;
      } else {
        this.isActive = false;
      }
      
      if (error) {
        this.errorMessage = error;
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
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

}
