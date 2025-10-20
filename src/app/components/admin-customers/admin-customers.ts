import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { ProfileModel } from '../../models/user.model';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-admin-customers',
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './admin-customers.html',
  styleUrl: './admin-customers.scss'
})
export class AdminCustomers implements OnInit {
  users: ProfileModel[] = [];
  loading = false;
  searchTerm = '';
  selectedRole = '';

  // Confirm dialog properties
  showConfirmDialog = false;
  confirmDialogConfig = {
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Hủy',
    iconClass: '',
    confirmButtonClass: ''
  };
  pendingUser: ProfileModel | null = null;
  pendingAction: 'lock' | 'unlock' | null = null;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getCustomerUser().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
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
    const currentStatus = user.account_status || 'ACTIVE';
    const isLocking = currentStatus === 'ACTIVE';
    
    // Store pending action
    this.pendingUser = user;
    this.pendingAction = isLocking ? 'lock' : 'unlock';
    
    // Configure dialog
    if (isLocking) {
      this.confirmDialogConfig = {
        title: 'Xác nhận khóa tài khoản',
        message: `Bạn có chắc chắn muốn khóa tài khoản của ${user.full_name}? Người dùng sẽ không thể đăng nhập sau khi tài khoản bị khóa.`,
        confirmText: 'Khóa tài khoản',
        cancelText: 'Hủy',
        iconClass: 'fa-lock',
        confirmButtonClass: 'btn-danger'
      };
    } else {
      this.confirmDialogConfig = {
        title: 'Xác nhận mở khóa tài khoản',
        message: `Bạn có chắc chắn muốn mở khóa tài khoản của ${user.full_name}? Người dùng sẽ có thể đăng nhập lại sau khi tài khoản được mở khóa.`,
        confirmText: 'Mở khóa tài khoản',
        cancelText: 'Hủy',
        iconClass: 'fa-lock-open',
        confirmButtonClass: 'btn-success'
      };
    }
    
    // Show dialog
    this.showConfirmDialog = true;
  }

  onConfirmAction(): void {
    if (!this.pendingUser || !this.pendingAction) return;

    const user = this.pendingUser;
    const originalStatus = user.account_status || 'ACTIVE';
    const nextStatus = this.pendingAction === 'lock' ? 'LOCKED' : 'ACTIVE';
    
    // Optimistically update UI
    user.account_status = nextStatus;

    this.userService.updateAccountStatus(user.id, nextStatus as 'ACTIVE' | 'LOCKED').subscribe({
      next: () => {
        const msg = nextStatus === 'LOCKED' ? 'đã khóa' : 'đã mở khóa';
        this.notificationService.showSuccess(
          'Cập nhật thành công',
          `Tài khoản ${user.full_name} ${msg} thành công!`
        );
        this.closeConfirmDialog();
      },
      error: (error) => {
        // Rollback on error
        user.account_status = originalStatus;
        console.error('Error updating account status:', error);
        
        let errorMessage = 'Không thể cập nhật trạng thái tài khoản';
        
        if (error.status === 401) {
          errorMessage = 'Bạn không có quyền thay đổi trạng thái tài khoản hoặc phiên đăng nhập đã hết hạn';
        } else if (error.status === 403) {
          errorMessage = 'Không có quyền truy cập chức năng này';
        } else if (error.status === 404) {
          errorMessage = 'Không tìm thấy người dùng';
        }
        
        this.notificationService.showError('Lỗi cập nhật', errorMessage);
        this.closeConfirmDialog();
      }
    });
  }

  onCancelAction(): void {
    this.closeConfirmDialog();
  }

  private closeConfirmDialog(): void {
    this.showConfirmDialog = false;
    this.pendingUser = null;
    this.pendingAction = null;
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
}
