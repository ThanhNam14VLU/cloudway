import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { AirlineService } from '../../services/airline/airline.service';
import { ProfileModel } from '../../models/user.model';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-admin-airlines',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-airlines.html',
  styleUrl: './admin-airlines.scss'
})
export class AdminAirlines implements OnInit {
  users: ProfileModel[] = [];
  loading = false;
  searchTerm = '';
  selectedRole = '';
  
  // Modal and form properties
  showAddModal = false;
  isSubmitting = false;
  airlines: any[] = [];
  
  newAirlineUser = {
    email: '',
    full_name: '',
    phone: '',
    password: '',
    airline_id: ''
  };

  constructor(
    private userService: UserService,
    private airlineService: AirlineService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadAirlines();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAirlineUser().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading airline users:', error);
        this.loading = false;
      }
    });
  }

  onRoleChange(user: ProfileModel, newRole: string): void {
    if (user.role === newRole) return;

    // Store original role for rollback
    const originalRole = user.role;
    
    // Optimistically update UI
    user.role = newRole;

    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        console.log(`Successfully updated user ${user.full_name} role to ${newRole}`);
        this.notificationService.showSuccess(
          'Cập nhật thành công',
          `Đã cập nhật vai trò của ${user.full_name} thành ${newRole} thành công!`
        );
      },
      error: (error) => {
        // Rollback on error
        user.role = originalRole;
        
        console.error('Error updating user role:', error);
        
        let errorMessage = 'Có lỗi xảy ra khi cập nhật vai trò người dùng';
        
        if (error.status === 401) {
          errorMessage = 'Bạn không có quyền thay đổi vai trò người dùng hoặc phiên đăng nhập đã hết hạn';
        } else if (error.status === 403) {
          errorMessage = 'Không có quyền truy cập chức năng này';
        } else if (error.status === 404) {
          errorMessage = 'Không tìm thấy người dùng';
        }
        
        this.notificationService.showError('Lỗi cập nhật', errorMessage);
      }
    });
  }

  toggleAccountStatus(user: ProfileModel): void {
    const originalStatus = user.account_status || 'ACTIVE';
    const nextStatus = originalStatus === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    user.account_status = nextStatus;

    this.userService.updateAccountStatus(user.id, nextStatus as 'ACTIVE' | 'LOCKED').subscribe({
      next: (res) => {
        const msg = nextStatus === 'LOCKED' ? 'đã khóa' : 'đã mở khóa';
        this.notificationService.showSuccess(
          'Cập nhật thành công',
          `Tài khoản ${user.full_name} ${msg} thành công!`
        );
      },
      error: (error) => {
        user.account_status = originalStatus;
        console.error('Error updating account status:', error);
        this.notificationService.showError('Lỗi cập nhật', 'Không thể cập nhật trạng thái tài khoản');
      }
    });
  }

  get filteredUsers(): ProfileModel[] {
    return this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        (user.full_name && user.full_name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(this.searchTerm));
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US');
  }

  loadAirlines(): void {
    this.airlineService.getAirlines().subscribe({
      next: (airlines) => {
        this.airlines = airlines;
      },
      error: (error) => {
        console.error('Error loading airlines:', error);
        this.notificationService.showError('Lỗi tải dữ liệu', 'Không thể tải danh sách hãng bay');
      }
    });
  }

  openAddAirlineUserModal(): void {
    this.showAddModal = true;
    this.resetForm();
  }

  closeAddAirlineUserModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newAirlineUser = {
      email: '',
      full_name: '',
      phone: '',
      password: '',
      airline_id: ''
    };
    this.isSubmitting = false;
  }

  onSubmitAddAirlineUser(): void {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    const userData = {
      email: this.newAirlineUser.email,
      full_name: this.newAirlineUser.full_name,
      phone: this.newAirlineUser.phone || undefined,
      password: this.newAirlineUser.password,
      airline_id: this.newAirlineUser.airline_id
    };

    this.userService.createAirlineUser(userData).subscribe({
      next: (response) => {
        console.log('Airline user created successfully:', response);
        this.notificationService.showSuccess(
          'Tạo tài khoản thành công',
          `Tạo tài khoản hãng bay cho ${userData.full_name} thành công!`
        );
        this.closeAddAirlineUserModal();
        this.loadUsers(); // Refresh the user list
      },
      error: (error) => {
        console.error('Error creating airline user:', error);
        
        let errorMessage = 'Có lỗi xảy ra khi tạo tài khoản hãng bay';
        
        if (error.status === 400) {
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
          }
        } else if (error.status === 401) {
          errorMessage = 'Bạn không có quyền tạo tài khoản hãng bay hoặc phiên đăng nhập đã hết hạn';
        } else if (error.status === 403) {
          errorMessage = 'Không có quyền truy cập chức năng này';
        } else if (error.status === 409) {
          errorMessage = 'Email đã được sử dụng. Vui lòng chọn email khác.';
        }
        
        this.notificationService.showError('Lỗi cập nhật', errorMessage);
        this.isSubmitting = false;
      }
    });
  }
}
