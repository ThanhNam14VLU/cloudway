import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from './supabase.client';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './services/auth/auth.service';
import { environment } from '../environments/environment';

@Component({
  imports:[MatProgressSpinnerModule],
  selector: 'app-auth-callback',
  template: `
    <div class="load">
      <p>Đang xác thực, vui lòng chờ...</p>
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles:`p { font-size: 16px; text-align: center; margin-top: 20px; }
          .load { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
          `
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  async ngOnInit() {
    try {
      console.log('🟢 Auth callback bắt đầu');
      console.log('📄 URL callback:', window.location.href);

      // Kiểm tra xem có phải là password recovery không
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');

      if (type === 'recovery') {
        console.log('🔄 Password recovery callback');
        // Đợi Supabase xử lý recovery callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          console.error('❌ Recovery session error:', error);
          this.router.navigate(['/login']);
          return;
        }

        // Điều hướng đến trang reset password
        this.router.navigate(['/reset-password']);
        return;
      }

      // Đợi Supabase xử lý callback
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        console.error('❌ Không có session:', error);
        this.router.navigate(['/login']);
        return;
      }

      const session = data.session;
      const user = session.user;
      const accessToken = session.access_token;

      console.log('✅ Đăng nhập thành công:', user);
      console.log('🔑 Access token:', accessToken);

      // --- 🔥 Gửi access token sang backend để xác thực và tạo user record ---
      try {
        await this.http.post(`${environment.apiUrl}/auth/supabase-login`, {
          token: accessToken,
        }).toPromise();
        console.log('✅ Backend xác thực & lưu user thành công');
      } catch (backendError) {
        console.warn('⚠️ Backend không khả dụng, tiếp tục với frontend auth');
      }

      // Get profile and role for navigation
      const profile = await this.authService.getCurrentUserProfile();
      const role = await this.authService.getCurrentUserRole();
      console.log('🔎 Resolved role after OAuth =', role);
      console.log('🔎 Account status =', profile?.account_status);
      
      // Use actual profile data - check different possible field names
      const accountStatus = profile?.account_status || profile?.accountStatus || profile?.status || 'ACTIVE';
      console.log('🔎 Using accountStatus:', accountStatus);
      
      // Navigate based on role and pass account status info
      if (role === 'ADMIN' || role === 'admin') {
        this.router.navigate(['/admin/admin-customers'], { 
          queryParams: { accountStatus: accountStatus } 
        });
      } else if (role === 'AIRLINE' || role === 'airline') {
        this.router.navigate(['/airline/airline-dashboard'], { 
          queryParams: { accountStatus: accountStatus } 
        });
      } else {
        this.router.navigate(['/home'], { 
          queryParams: { accountStatus: accountStatus } 
        });
      }
    } catch (e) {
      console.error('❌ Auth callback error:', e);
      this.router.navigate(['/login']);
    }
  }
}
