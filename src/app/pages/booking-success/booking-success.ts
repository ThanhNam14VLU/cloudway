import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-booking-success',
  imports: [CommonModule, Header],
  templateUrl: './booking-success.html',
  styleUrl: './booking-success.scss'
})
export class BookingSuccess implements OnInit {
  // Default data - sẽ được override từ router state
  bookingData = {
    bookingCode: 'ABC123XYZ',
    totalAmount: 1500000,
    paymentStatus: 'Đã thanh toán',
    passengerName: 'Nguyễn Văn A',
    contactName: 'Nguyễn Văn A',
    contactPhone: '0123456789',
    contactEmail: 'customer@example.com',
    flightNumber: 'QH818',
    airline: 'Bamboo Airways',
    departure: 'Hải Phòng',
    destination: 'Phú Quốc',
    departureTime: '11:00',
    arrivalTime: '13:15',
    flightDate: 'Thứ Sáu, 22 tháng 2, 2025'
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Get booking data from router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['bookingData']) {
      this.bookingData = { ...this.bookingData, ...navigation.extras.state['bookingData'] };
    }
  }

  /**
   * Navigate to ticket details
   */
  viewTicketDetails(): void {
    // Navigate to ticket details page
    console.log('Navigate to ticket details');
  }

  /**
   * Navigate to home page
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Print ticket
   */
  printTicket(): void {
    window.print();
  }

  /**
   * Download PDF
   */
  downloadPDF(): void {
    // Implement PDF download
    console.log('Download PDF');
  }

  /**
   * Book new ticket
   */
  bookNewTicket(): void {
    this.router.navigate(['/']);
  }
}
