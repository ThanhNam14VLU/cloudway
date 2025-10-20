import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirlineAddFlightForm } from '../airline-add-flight-form/airline-add-flight-form';
import { AirlineService } from '../../services/airline/airline.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationDialog } from '../notification-dialog/notification-dialog';

@Component({
  selector: 'app-airline-management',
  imports: [AirlineAddFlightForm, CommonModule, FormsModule, NotificationDialog],
  standalone: true,
  templateUrl: './airline-management.html',
  styleUrl: './airline-management.scss'
})
export class AirlineManagement implements OnInit {
  //biến kiểm tra
  isShowForm = false;
  flights: any[] = [];
  allFlights: any[] = []; // Store all flights for search/filter
  isLoading = false;
  isUpdating = false;
  isCancelling = false;
  selectedFlight: any = null;
  showEditModal = false;
  showCancelModal = false;
  showDeleteModal = false;
  
  // Filter and search properties
  selectedStatus = '';
  searchTerm = '';
  isFiltering = false;
  
  // Notification dialog properties
  showNotificationDialog = false;
  notificationType: 'success' | 'error' | 'warning' | 'info' = 'success';
  notificationTitle = '';
  notificationMessage = '';

  constructor(
    private airlineService: AirlineService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('=== AIRLINE MANAGEMENT INIT ===');
    await this.loadFlights();
  }

  async loadFlights(): Promise<void> {
    try {
      this.isLoading = true;
      const airlineId = await this.authService.getCurrentUserAirlineId();
      
      if (!airlineId) {
        console.warn('⚠️ No airline ID found for current user');
        return;
      }

      console.log('✈️ Loading flights for airline:', airlineId);
      
      this.airlineService.getFlightInstances(airlineId).subscribe({
        next: (response: any) => {
          this.allFlights = response || [];
          this.flights = [...this.allFlights]; // Initialize with all flights
          console.log('📋 Flights loaded:', this.flights.length, 'flights');
          console.log('📋 Sample flight:', this.flights);
        },
        error: (error) => {
          console.error('❌ Error loading flights:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('❌ Error getting airline ID:', error);
      this.isLoading = false;
    }
  }

  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  formatFlightDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTimeForInput(dateTimeString: string): string {
    // Hiển thị thời gian theo múi giờ local để user dễ hiểu
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Convert datetime-local input value back to ISO string for API
   * Sử dụng toISOString() để đảm bảo múi giờ chính xác
   */
  convertInputToISOString(inputValue: string): string {
    if (!inputValue) return '';
    
    // Tạo Date object từ input (đây là local time)
    const localDate = new Date(inputValue);
    
    // Convert sang UTC ISO string - đây là cách chuẩn nhất
    return localDate.toISOString();
  }

  formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  calculateDuration(departure: string, arrival: string): string {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  }

  getFlightStatusText(status: string): string {
    switch (status) {
      case 'CANCELLED':
        return 'Đã hủy';
      case 'SCHEDULED':
        return 'Đã lên lịch';
      case 'BOARDING':
        return 'Đang lên máy bay';
      case 'DEPARTED':
        return 'Đã khởi hành';
      case 'ARRIVED':
        return 'Đã đến';
      default:
        return 'Hoạt động';
    }
  }

  // Check if a flight can be cancelled
  canCancelFlight(flight: any): boolean {
    // Only allow cancellation for SCHEDULED flights
    // Flights that are DEPARTED, ARRIVED, or CANCELLED cannot be cancelled
    return flight.status === 'SCHEDULED';
  }

  // Get appropriate text for cancel button based on flight status
  getCancelButtonText(flight: any): string {
    switch (flight.status) {
      case 'CANCELLED':
        return 'Đã hủy';
      case 'DEPARTED':
        return 'Đã bay';
      case 'ARRIVED':
        return 'Đã đến';
      case 'SCHEDULED':
        return 'Hủy';
      default:
        return 'Hủy';
    }
  }

  //ẩn hiện form
  ShowForm() {
    this.isShowForm = !this.isShowForm;
  }
  
  CloseForm() {
    this.isShowForm = false;
    // Reload flights after adding new one
    this.loadFlights();
  }

  // Handle flight form events
  onFlightFormSuccess() {
    this.showSuccessNotification();
    this.CloseForm();
  }

  onFlightFormError(errorMessage: string) {
    this.showErrorNotification(errorMessage);
  }

  // Notification dialog methods
  showSuccessNotification() {
    this.notificationType = 'success';
    this.notificationTitle = 'Thành công';
    this.notificationMessage = 'Đã thêm chuyến bay thành công!';
    this.showNotificationDialog = true;
  }

  showErrorNotification(message: string) {
    this.notificationType = 'error';
    this.notificationTitle = 'Lỗi';
    this.notificationMessage = message;
    this.showNotificationDialog = true;
  }

  // Edit flight
  editFlight(flight: any) {
    console.log('✏️ Editing flight:', flight);
    this.selectedFlight = { ...flight }; // Tạo copy để tránh thay đổi dữ liệu gốc
    
    // Format datetime cho input (YYYY-MM-DDTHH:mm)
    if (this.selectedFlight.scheduled_departure_local) {
      this.selectedFlight.scheduled_departure_local = this.formatDateTimeForInput(this.selectedFlight.scheduled_departure_local);
    }
    if (this.selectedFlight.scheduled_arrival_local) {
      this.selectedFlight.scheduled_arrival_local = this.formatDateTimeForInput(this.selectedFlight.scheduled_arrival_local);
    }
    
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedFlight = null;
  }

  saveFlightChanges() {
    if (!this.selectedFlight) {
      console.error('❌ No flight selected for update');
      return;
    }

    console.log('💾 Saving flight changes:', this.selectedFlight);

    // Validate thời gian
    const departureTime = new Date(this.selectedFlight.scheduled_departure_local);
    const arrivalTime = new Date(this.selectedFlight.scheduled_arrival_local);

    if (arrivalTime <= departureTime) {
      this.showNotification('error', 'Lỗi', 'Giờ đến phải sau giờ đi');
      return;
    }

    // Chuẩn bị dữ liệu để gửi API - convert từ input format sang ISO string
    const departureISO = this.convertInputToISOString(this.selectedFlight.scheduled_departure_local);
    const arrivalISO = this.convertInputToISOString(this.selectedFlight.scheduled_arrival_local);
    
    console.log('🕐 Time conversion debug:');
    console.log('📅 Original departure:', this.selectedFlight.scheduled_departure_local);
    console.log('📅 Converted departure:', departureISO);
    console.log('📅 Original arrival:', this.selectedFlight.scheduled_arrival_local);
    console.log('📅 Converted arrival:', arrivalISO);
    
    const scheduleData = {
      scheduled_departure_local: departureISO,
      scheduled_arrival_local: arrivalISO
    };

    // Bắt đầu loading
    this.isUpdating = true;

    // Gọi API cập nhật lịch trình
    this.airlineService.updateFlightSchedule(this.selectedFlight.id, scheduleData).subscribe({
      next: (response) => {
        console.log('✅ Flight schedule updated successfully:', response);
        this.showNotification('success', 'Thành công', 'Cập nhật lịch trình chuyến bay thành công');
        this.closeEditModal();
        this.loadFlights(); // Reload flights after update
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('❌ Error updating flight schedule:', error);
        const errorMessage = error.error?.message || 'Có lỗi xảy ra khi cập nhật lịch trình';
        this.showNotification('error', 'Lỗi', errorMessage);
        this.isUpdating = false;
      }
    });
  }

  // Cancel flight
  cancelFlight(flight: any) {
    // Check if flight can be cancelled before opening modal
    if (!this.canCancelFlight(flight)) {
      console.log('❌ Cannot cancel flight with status:', flight.status);
      this.showNotification('warning', 'Không thể hủy', 'Chuyến bay đã khởi hành hoặc đã đến không thể hủy');
      return;
    }
    
    console.log('❌ Cancelling flight:', flight);
    this.selectedFlight = flight;
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.selectedFlight = null;
  }

  confirmCancelFlight() {
    if (!this.selectedFlight) {
      console.error('❌ No flight selected for cancellation');
      return;
    }

    console.log('🚫 Confirming flight cancellation:', this.selectedFlight);
    
    // Start loading
    this.isCancelling = true;

    // Call API to cancel flight
    this.airlineService.cancelFlight(this.selectedFlight.id).subscribe({
      next: (response) => {
        console.log('✅ Flight cancelled successfully:', response);
        this.showNotification('success', 'Thành công', 'Hủy chuyến bay thành công');
        this.closeCancelModal();
        this.loadFlights(); // Reload flights after cancellation
        this.isCancelling = false;
      },
      error: (error) => {
        console.error('❌ Error cancelling flight:', error);
        const errorMessage = error.error?.message || 'Có lỗi xảy ra khi hủy chuyến bay';
        this.showNotification('error', 'Lỗi', errorMessage);
        this.isCancelling = false;
      }
    });
  }

  // Delete flight (permanent)
  deleteFlight(flight: any) {
    console.log('🗑️ Deleting flight:', flight);
    this.selectedFlight = flight;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedFlight = null;
  }

  confirmDeleteFlight() {
    console.log('🗑️ Confirming flight deletion:', this.selectedFlight);
    // TODO: Implement API call to delete flight
    this.closeDeleteModal();
    this.loadFlights(); // Reload flights after deletion
  }

  // Notification methods
  showNotification(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) {
    this.notificationType = type;
    this.notificationTitle = title;
    this.notificationMessage = message;
    this.showNotificationDialog = true;
  }

  closeNotificationDialog() {
    this.showNotificationDialog = false;
  }

  // Filter and search methods
  onStatusFilterChange() {
    console.log('🔍 Status filter changed:', this.selectedStatus);
    this.applyFilters();
  }

  onSearchChange() {
    console.log('🔍 Search term changed:', this.searchTerm);
    // Apply filters immediately for better UX
    this.applyFilters();
  }

  applyFilters() {
    this.isFiltering = true;
    
    let filteredFlights = [...this.allFlights];

    // Apply status filter
    if (this.selectedStatus) {
      filteredFlights = filteredFlights.filter(flight => flight.status === this.selectedStatus);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filteredFlights = filteredFlights.filter(flight => {
        const flightNumber = flight.flight_number?.code?.toLowerCase() || '';
        const departureCity = flight.flight_number?.departure_airport?.city?.toLowerCase() || '';
        const arrivalCity = flight.flight_number?.arrival_airport?.city?.toLowerCase() || '';
        const departureCode = flight.flight_number?.departure_airport?.iata_code?.toLowerCase() || '';
        const arrivalCode = flight.flight_number?.arrival_airport?.iata_code?.toLowerCase() || '';
        
        return flightNumber.includes(searchLower) ||
               departureCity.includes(searchLower) ||
               arrivalCity.includes(searchLower) ||
               departureCode.includes(searchLower) ||
               arrivalCode.includes(searchLower);
      });
    }

    this.flights = filteredFlights;
    this.isFiltering = false;
    
    console.log('🔍 Filtered flights:', this.flights.length, 'out of', this.allFlights.length);
  }

  clearFilters() {
    this.selectedStatus = '';
    this.searchTerm = '';
    this.flights = [...this.allFlights];
    console.log('🧹 Filters cleared');
  }

  // Get available status options for dropdown
  getStatusOptions() {
    return [
      { value: '', label: `Tất cả trạng thái (${this.allFlights.length})` },
      { value: 'SCHEDULED', label: `Đã lên lịch (${this.getFlightCountByStatus('SCHEDULED')})` },
      { value: 'DEPARTED', label: `Đã khởi hành (${this.getFlightCountByStatus('DEPARTED')})` },
      { value: 'ARRIVED', label: `Đã đến (${this.getFlightCountByStatus('ARRIVED')})` },
      { value: 'CANCELLED', label: `Đã hủy (${this.getFlightCountByStatus('CANCELLED')})` }
    ];
  }

  // Get count of flights by status
  getFlightCountByStatus(status: string): number {
    return this.allFlights.filter(flight => flight.status === status).length;
  }
}
