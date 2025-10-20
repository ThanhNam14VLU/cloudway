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
  isLoading = false;
  selectedFlight: any = null;
  showEditModal = false;
  showCancelModal = false;
  showDeleteModal = false;
  
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
          this.flights = response || [];
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

  closeNotificationDialog() {
    this.showNotificationDialog = false;
  }

  // Edit flight
  editFlight(flight: any) {
    console.log('✏️ Editing flight:', flight);
    this.selectedFlight = flight;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedFlight = null;
  }

  saveFlightChanges() {
    console.log('💾 Saving flight changes:', this.selectedFlight);
    // TODO: Implement API call to update flight
    this.closeEditModal();
    this.loadFlights(); // Reload flights after update
  }

  // Cancel flight
  cancelFlight(flight: any) {
    console.log('❌ Cancelling flight:', flight);
    this.selectedFlight = flight;
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.selectedFlight = null;
  }

  confirmCancelFlight() {
    console.log('🚫 Confirming flight cancellation:', this.selectedFlight);
    // TODO: Implement API call to cancel flight
    this.closeCancelModal();
    this.loadFlights(); // Reload flights after cancellation
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

}
