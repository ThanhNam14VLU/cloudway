import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { supabase } from '../../supabase.client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private backendUrl = environment.apiUrl;
  
  user$ = new BehaviorSubject<any | null>(null);

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Chỉ setup listener, không gọi API ngay
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        this.user$.next(session?.user ?? null);
      });

      // Chỉ check session hiện tại, không gọi getUser
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.user$.next(session.user);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.user$.next(null);
    }
  }

  /** 🔹 Login bằng Google OAuth */
  async signInWithGoogle() {
    try {
      console.log('🚀 Bắt đầu đăng nhập Google OAuth');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ OAuth sign in error:', error);
        throw error;
      }

      console.log('✅ OAuth redirect initiated:', data);
      return data;
    } catch (error) {
      console.error('❌ Google sign in failed:', error);
      throw error;
    }
  }

  /** 🔹 Login với email và password */
  async signInWithPassword(email: string, password: string) {
    try {
      console.log('🚀 Bắt đầu đăng nhập với email/password');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Password sign in error:', error);
        throw error;
      }

      console.log('✅ Password sign in successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Password sign in failed:', error);
      throw error;
    }
  }

  /** 🔹 Đăng ký với email và password */
  async signUpWithPassword(email: string, password: string, userData?: any) {
    try {
      console.log('🚀 Bắt đầu đăng ký với email/password');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // Thông tin bổ sung như tên, số điện thoại
        }
      });

      if (error) {
        console.error('❌ Password sign up error:', error);
        throw error;
      }

      console.log('✅ Password sign up successful:', data);

      // 🔥 Gửi token lên backend để lưu vào DB
      if (data.session?.access_token) {
        await this.saveUserToBackend(data.session.access_token);
      }

      return data;
    } catch (error) {
      console.error('❌ Password sign up failed:', error);
      throw error;
    }
  }

  /** 🔹 Reset password */
  async resetPassword(email: string) {
    try {
      console.log('🚀 Bắt đầu reset password');
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        console.error('❌ Reset password error:', error);
        throw error;
      }

      console.log('✅ Reset password email sent:', data);
      return data;
    } catch (error) {
      console.error('❌ Reset password failed:', error);
      throw error;
    }
  }

  /** 🔹 Đăng xuất */
  async signOut() {
    await supabase.auth.signOut();
    this.user$.next(null);
  }

  /** 🔹 Lấy access token để gửi về backend (NestJS) */
  async getAccessToken() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  }

  /** 🔹 Lưu thông tin user vào backend DB */
  private async saveUserToBackend(token: string) {
    try {
      console.log('🔄 Đang lưu thông tin người dùng vào backend DB...');
      await firstValueFrom(
        this.http.post(`${this.backendUrl}/auth/supabase-register`, {
          token: token
        })
      );
      console.log('✅ Đã lưu thông tin người dùng vào backend DB');
    } catch (backendError) {
      console.warn('⚠️ Backend không khả dụng, tiếp tục với frontend auth:', backendError);
      // Không throw error để không làm gián đoạn flow đăng ký
    }
  }
}
