import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AirlineService } from '../../services/airline/airline.service';

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
}

@Component({
  selector: 'app-admin-airline-management',
  imports: [CommonModule, FormsModule],
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
    name: ''
  };

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
      return date.toLocaleDateString('vi-VN');
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
      name: ''
    };
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
          alert('Thêm hãng bay thành công!');
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
