import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AirlineService } from '../../services/airline/airline.service';
import { NotificationDialog } from '../notification-dialog/notification-dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

export interface AirlineData {
  id: string;
  iata_code: string;
  name: string;
  created_at: string;
  logo: string;
}

export interface CreateAirlineModel {
  iata_code: string;
  name: string;
  logo?: string;
}

@Component({
  selector: 'app-admin-airline-management',
  imports: [CommonModule, FormsModule, NotificationDialog, ConfirmDialog],
  templateUrl: './admin-airline-management.html',
  styleUrl: './admin-airline-management.scss'
})
export class AdminAirlineManagement implements OnInit {
  airlines: AirlineData[] = [];
  loading = false;
  searchTerm = '';
  showAddForm = false;
  submitting = false;

  // Form model for creating new airline
  newAirline: CreateAirlineModel = {
    iata_code: '',
    name: '',
    logo: ''
  };

  // Logo upload properties
  selectedLogoFile: File | null = null;
  logoPreview: string | null = null;

  // Notification dialog properties
  showSuccessDialog = false;
  successMessage = '';

  // Delete confirmation dialog properties
  showDeleteDialog = false;
  airlineToDelete: AirlineData | null = null;
  deleting = false;

  constructor(private airlineService: AirlineService) {}

  ngOnInit(): void {
    this.loadAirlines();
  }

  loadAirlines(): void {
    this.loading = true;
    this.airlineService.getAirlines().subscribe({
      next: (airlines) => {
        this.airlines = airlines;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading airlines:', error);
        this.loading = false;
      }
    });
  }

  get filteredAirlines(): AirlineData[] {
    return this.airlines.filter(airline => {
      const matchesSearch = !this.searchTerm || 
        (airline.iata_code && airline.iata_code.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (airline.name && airline.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newAirline = {
      iata_code: '',
      name: '',
      logo: ''
    };
    this.selectedLogoFile = null;
    this.logoPreview = null;
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      this.selectedLogoFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
        this.newAirline.logo = this.logoPreview;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreview = null;
    this.newAirline.logo = '';
    
    // Reset file input
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSuccessDialogClose(): void {
    this.showSuccessDialog = false;
    this.successMessage = '';
  }

  onDeleteAirline(airline: AirlineData): void {
    this.airlineToDelete = airline;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.airlineToDelete && !this.deleting) {
      this.deleting = true;
      
      this.airlineService.deleteAirline(this.airlineToDelete.id).subscribe({
        next: (response) => {
          console.log('Airline deleted successfully:', response);
          this.successMessage = `Đã xóa hãng bay "${this.airlineToDelete?.name}" thành công!`;
          this.showSuccessDialog = true;
          this.loadAirlines(); // Reload the list
          this.closeDeleteDialog();
          this.deleting = false;
        },
        error: (error) => {
          console.error('Error deleting airline:', error);
          let errorMessage = 'Có lỗi xảy ra khi xóa hãng bay';
          
          if (error.status === 404) {
            errorMessage = 'Không tìm thấy hãng bay';
          } else if (error.status === 401) {
            errorMessage = 'Bạn không có quyền xóa hãng bay hoặc phiên đăng nhập đã hết hạn';
          } else if (error.status === 403) {
            errorMessage = 'Không thể xóa hãng bay này';
          }
          
          alert(errorMessage);
          this.deleting = false;
        }
      });
    }
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.airlineToDelete = null;
    this.deleting = false;
  }

  getDeleteMessage(): string {
    if (this.airlineToDelete) {
      return `Bạn có chắc chắn muốn xóa hãng bay "${this.airlineToDelete.name}"? Hành động này không thể hoàn tác.`;
    }
    return 'Bạn có chắc chắn muốn xóa hãng bay này? Hành động này không thể hoàn tác.';
  }

  onSubmit(form: NgForm): void {
    if (form.valid && !this.submitting) {
      this.submitting = true;
      
      // Convert IATA code to uppercase
      const airlineData = {
        ...this.newAirline,
        iata_code: this.newAirline.iata_code.toUpperCase()
      };

      this.airlineService.createAirline(airlineData).subscribe({
        next: (response) => {
          console.log('Airline created successfully:', response);
          this.successMessage = 'Thêm hãng bay thành công!';
          this.showSuccessDialog = true;
          this.loadAirlines(); // Reload the list
          this.toggleAddForm(); // Close the form
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating airline:', error);
          let errorMessage = 'Có lỗi xảy ra khi thêm hãng bay';
          
          if (error.status === 400) {
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
          } else if (error.status === 409) {
            errorMessage = 'Mã IATA đã tồn tại. Vui lòng sử dụng mã khác.';
          } else if (error.status === 401) {
            errorMessage = 'Bạn không có quyền thêm hãng bay hoặc phiên đăng nhập đã hết hạn';
          }
          
          alert(errorMessage);
          this.submitting = false;
        }
      });
    }
  }
}
