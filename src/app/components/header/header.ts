import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user/user.service';
import { ProfileModel } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  userProfile: ProfileModel | null = null;
  isLoggedIn = false;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      
      console.log('user', user);
      if (user) {
        // Get user profile from backend
        this.loadUserProfile(user.id);
      } else {
        this.userProfile = null;
      }
    });
  }

  private loadUserProfile(userId: string) {
    this.userService.getProfile(userId).subscribe({
      next: (profile) => {
        console.log('User profile loaded:', profile);
        this.userProfile = profile;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        // Chỉ hiển thị thông báo lỗi, không fallback
        this.userProfile = null;
      }
    });
  }

  logout() {
    this.authService.signOut();
  }
}
