import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from './supabase.client';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth-callback',
  template: `<p>Đang xác thực, vui lòng chờ...</p>`
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient) {}

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
        await this.http.post('http://localhost:3000/auth/supabase-login', {
          token: accessToken,
        }).toPromise();
        console.log('✅ Backend xác thực & lưu user thành công');
      } catch (backendError) {
        console.warn('⚠️ Backend không khả dụng, tiếp tục với frontend auth');
      }

      // Điều hướng sang trang chính
      this.router.navigate(['/home']);
    } catch (e) {
      console.error('❌ Auth callback error:', e);
      this.router.navigate(['/login']);
    }
  }
}