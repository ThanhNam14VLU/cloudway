import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AirportService } from '../../services/airport/airport.service';
import { AirportModel, CreateAirportModel } from '../../models/airport.model';
import { NotificationDialog } from '../notification-dialog/notification-dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-airports',
  imports: [CommonModule, FormsModule, NotificationDialog, ConfirmDialog],
  templateUrl: './admin-airports.html',
  styleUrl: './admin-airports.scss'
})
export class AdminAirports implements OnInit {
  airports: AirportModel[] = [];
  loading = false;
  searchTerm = '';
  showAddForm = false;
  submitting = false;

  // Form model for creating new airport
  newAirport: CreateAirportModel = {
    iata_code: '',
    name: '',
    city: '',
    country: 'Vietnam',
    timezone: 'Asia/Ho_Chi_Minh'
  };

  // Notification dialog properties
  showSuccessDialog = false;
  successMessage = '';

  // Delete confirmation dialog properties
  showDeleteDialog = false;
  airportToDelete: AirportModel | null = null;
  deleting = false;

  constructor(private airportService: AirportService) {}

  ngOnInit(): void {
    this.loadAirports();
  }

  loadAirports(): void {
    this.loading = true;
    this.airportService.getAirports().subscribe({
      next: (airports) => {
        this.airports = airports;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading airports:', error);
        this.loading = false;
      }
    });
  }

  get filteredAirports(): AirportModel[] {
    return this.airports.filter(airport => {
      const matchesSearch = !this.searchTerm || 
        (airport.iata_code && airport.iata_code.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (airport.name && airport.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (airport.city && airport.city.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (airport.country && airport.country.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }

  formatDate(dateString: string | Date): string {
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
    this.newAirport = {
      iata_code: '',
      name: '',
      city: '',
      country: 'Vietnam',
      timezone: 'Asia/Ho_Chi_Minh'
    };
  }

  onSubmit(form: NgForm): void {
    if (form.valid && !this.submitting) {
      this.submitting = true;
      
      // Convert IATA code to uppercase
      const airportData = {
        ...this.newAirport,
        iata_code: this.newAirport.iata_code.toUpperCase()
      };

      this.airportService.createAirport(airportData).subscribe({
        next: (response) => {
          console.log('Airport created successfully:', response);
          this.successMessage = 'Thêm sân bay thành công!';
          this.showSuccessDialog = true;
          this.loadAirports(); // Reload the list
          this.toggleAddForm(); // Close the form
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating airport:', error);
          let errorMessage = 'Có lỗi xảy ra khi thêm sân bay';
          
          if (error.status === 400) {
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
          } else if (error.status === 409) {
            errorMessage = 'Mã IATA đã tồn tại. Vui lòng sử dụng mã khác.';
          } else if (error.status === 401) {
            errorMessage = 'Bạn không có quyền thêm sân bay hoặc phiên đăng nhập đã hết hạn';
          }
          
          alert(errorMessage);
          this.submitting = false;
        }
      });
    }
  }

  onSuccessDialogClose(): void {
    this.showSuccessDialog = false;
    this.successMessage = '';
  }

  onDeleteAirport(airport: AirportModel): void {
    this.airportToDelete = airport;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.airportToDelete && !this.deleting) {
      this.deleting = true;
      
      this.airportService.deleteAirport(this.airportToDelete.id).subscribe({
        next: (response) => {
          console.log('Airport deleted successfully:', response);
          this.successMessage = `Đã xóa sân bay "${this.airportToDelete?.name}" thành công!`;
          this.showSuccessDialog = true;
          this.loadAirports(); // Reload the list
          this.closeDeleteDialog();
          this.deleting = false;
        },
        error: (error) => {
          console.error('Error deleting airport:', error);
          let errorMessage = 'Có lỗi xảy ra khi xóa sân bay';
          
          if (error.status === 404) {
            errorMessage = 'Không tìm thấy sân bay';
          } else if (error.status === 401) {
            errorMessage = 'Bạn không có quyền xóa sân bay hoặc phiên đăng nhập đã hết hạn';
          } else if (error.status === 403) {
            errorMessage = 'Không thể xóa sân bay này';
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
    this.airportToDelete = null;
    this.deleting = false;
  }

  getDeleteMessage(): string {
    if (this.airportToDelete) {
      return `Bạn có chắc chắn muốn xóa sân bay "${this.airportToDelete.name}"? Hành động này không thể hoàn tác.`;
    }
    return 'Bạn có chắc chắn muốn xóa sân bay này? Hành động này không thể hoàn tác.';
  }
}
