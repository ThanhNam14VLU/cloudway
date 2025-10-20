import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  isDisabled = true;
  str = 'Chỉnh sửa hồ sơ';
  avatarUrl: string | null = null;
  isLoading = false;
  errorMessage = '';

  // Change password state
  showChangePasswordModal = false;
  changePasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isChangingPassword = false;
  changePasswordError = '';

  // Booking history data
  bookingHistory: any[] = [];
  isLoadingHistory = false;
  historyError = '';

  // User data
  userData: any = {
    id: '',
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    role: '',
    airlines: []
  };

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Load user profile data
  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Get current user profile from auth service
    this.authService.getCurrentUserProfile().then((profile) => {
      if (!profile || !profile.id) {
        this.errorMessage = 'Không thể lấy thông tin người dùng';
        this.isLoading = false;
        return;
      }

      // Use the profile data directly from auth service
      console.log('Profile data received:', profile);
      console.log('Avatar URL:', profile.avatar_url);
      this.userData = profile;
      
      // Set avatar URL with fallback
      if (profile.avatar_url) {
        this.avatarUrl = profile.avatar_url;
        console.log('Setting avatar URL:', this.avatarUrl);
      } else {
        this.avatarUrl = null;
        console.log('No avatar URL found, using placeholder');
      }
      
      this.isLoading = false;
      
      // Load booking history after profile is loaded
      this.loadBookingHistory();
    }).catch((error) => {
      console.error('Error loading profile:', error);
      this.errorMessage = 'Không thể tải thông tin profile';
      this.isLoading = false;
    });
  }

  // Hàm để bật hoặc tắt chế độ chỉnh sửa.
  toggleEdit(): void {
    this.isDisabled = !this.isDisabled;
    this.str = this.isDisabled ? 'Chỉnh sửa hồ sơ' : 'Lưu thay đổi';
  }

  // Hàm để thay đổi avatar
  changeAvatar(): void {
    this.fileInput.nativeElement.click();
  }

  // Hàm xử lý khi chọn file
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh!');
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB!');
        return;
      }

      // Đọc file và hiển thị preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarUrl = e.target.result;
        console.log('Avatar đã được thay đổi:', this.avatarUrl);
        // Ở đây bạn có thể gọi API để upload avatar lên server
        // this.uploadAvatar(file);
      };
      reader.readAsDataURL(file);
    }
  }

  // Hàm upload avatar lên server (có thể implement sau)
  private uploadAvatar(file: File): void {
    // TODO: Implement upload logic
    console.log('Uploading avatar:', file.name);
  }

  // Get user role display name
  getUserRoleDisplay(): string {
    switch (this.userData.role) {
      case 'AIRLINE':
        return 'Airline User';
      case 'CUSTOMER':
        return 'Customer';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'User';
    }
  }

  // Get airline name if user is airline
  getAirlineName(): string {
    if (this.userData.airlines && this.userData.airlines.length > 0) {
      return this.userData.airlines[0].name;
    }
    return '';
  }

  // Load booking history
  loadBookingHistory(): void {
    if (!this.userData.id) {
      console.log('No user ID available for booking history');
      return;
    }

    this.isLoadingHistory = true;
    this.historyError = '';

    this.userService.getUserBookingHistory(this.userData.id, 5).subscribe({
      next: (response) => {
        console.log('Booking history received:', response);
        // Handle the new API response structure
        if (response && response.bookings && Array.isArray(response.bookings)) {
          this.bookingHistory = response.bookings;
        } else if (Array.isArray(response)) {
          this.bookingHistory = response;
        } else if (response && Array.isArray(response.data)) {
          this.bookingHistory = response.data;
        } else {
          this.bookingHistory = [];
        }
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('Error loading booking history:', error);
        this.historyError = 'Không thể tải lịch sử đặt vé';
        this.bookingHistory = []; // Ensure it's always an array
        this.isLoadingHistory = false;
      }
    });
  }

  // Format booking date
  formatBookingDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  // Format booking time
  formatBookingTime(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  // Get booking status display
  getBookingStatusDisplay(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'hold':
        return 'Đang giữ chỗ';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status || 'N/A';
    }
  }

  // Get booking status class
  getBookingStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'hold':
        return 'status-hold';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US').format(amount) + ' VND';
  }

  // Get booking history as array (safety check)
  getBookingHistoryArray(): any[] {
    if (Array.isArray(this.bookingHistory)) {
      return this.bookingHistory;
    }
    return [];
  }

  // Check if value is array (for template use)
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  // Handle image load success
  onImageLoad(event: any): void {
    console.log('Avatar image loaded successfully:', event.target.src);
  }

  // Handle image load error
  onImageError(event: any): void {
    console.error('Avatar image failed to load:', event.target.src);
    // Fallback to placeholder
    this.avatarUrl = null;
  }

  // Test avatar URL
  testAvatarUrl(): void {
    console.log('Current avatarUrl:', this.avatarUrl);
    console.log('User data avatar_url:', this.userData.avatar_url);
    
    // Try to create a new image element to test loading
    if (this.userData.avatar_url) {
      const img = new Image();
      img.onload = () => {
        console.log('✅ Avatar URL is valid and loadable');
        this.avatarUrl = this.userData.avatar_url;
      };
      img.onerror = () => {
        console.log('❌ Avatar URL failed to load');
        this.avatarUrl = null;
      };
      img.src = this.userData.avatar_url;
    }
  }

  // Open change password modal
  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.changePasswordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.changePasswordError = '';
  }

  // Close change password modal
  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.changePasswordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.changePasswordError = '';
  }

  // Change password
  async changePassword(): Promise<void> {
    // Validate form
    if (!this.changePasswordData.currentPassword || !this.changePasswordData.newPassword || !this.changePasswordData.confirmPassword) {
      this.changePasswordError = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    if (this.changePasswordData.newPassword !== this.changePasswordData.confirmPassword) {
      this.changePasswordError = 'Mật khẩu mới và xác nhận mật khẩu không khớp';
      return;
    }

    if (this.changePasswordData.newPassword.length < 6) {
      this.changePasswordError = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      return;
    }

    if (this.changePasswordData.currentPassword === this.changePasswordData.newPassword) {
      this.changePasswordError = 'Mật khẩu mới phải khác mật khẩu hiện tại';
      return;
    }

    this.isChangingPassword = true;
    this.changePasswordError = '';

    try {
      // First verify current password by attempting to sign in
      const currentUser = await this.authService.getCurrentUserProfile();
      if (!currentUser || !currentUser.email) {
        this.changePasswordError = 'Không thể xác thực người dùng';
        return;
      }

      // Verify current password
      try {
        await this.authService.signInWithPassword(currentUser.email, this.changePasswordData.currentPassword);
      } catch (verifyError) {
        this.changePasswordError = 'Mật khẩu hiện tại không đúng';
        return;
      }

      // If verification successful, change password
      await this.authService.changePassword(this.changePasswordData.newPassword);
      alert('Đổi mật khẩu thành công!');
      this.closeChangePasswordModal();
    } catch (error: any) {
      console.error('Change password error:', error);
      this.changePasswordError = error.message || 'Có lỗi xảy ra khi đổi mật khẩu';
    } finally {
      this.isChangingPassword = false;
    }
  }
}
