import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { ProfileModel } from '../../models/user.model';

@Component({
  selector: 'app-admin-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-customers.html',
  styleUrl: './admin-customers.scss'
})
export class AdminCustomers implements OnInit {
  users: ProfileModel[] = [];
  loading = false;
  searchTerm = '';
  selectedRole = '';

  constructor(private userService: UserService) {}

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
        alert(`Đã cập nhật vai trò của ${user.full_name} thành ${newRole} thành công!`);
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
        
        alert(errorMessage);
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
}
