import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-airline-card-detail',
  imports: [Header, MatIconModule, FormsModule, CommonModule],
  templateUrl: './airline-card-detail.html',
  styleUrl: './airline-card-detail.scss'
})
export class AirlineCardDetail {
  // Step management
  currentStep: number = 1;
  completedSteps: number[] = [];

  constructor(private router: Router) {}

  // Passenger information (Step 1)
  passengerInfo = {
    title: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    idNumber: '',
    phone: ''
  };

  // Contact information (Step 2)
  contactInfo = {
    title: '',
    fullName: '',
    phone: '',
    email: ''
  };

  specialRequests = '';
  
  // Additional services
  additionalServices = {
    specialMeal: false,
    extraLuggage: false,
    seatSelection: false
  };

  /**
   * Move to next step
   */
  nextStep(): void {
    if (this.currentStep === 1) {
      // Validate passenger info
      if (this.validatePassengerInfo()) {
        this.completedSteps.push(1);
        this.currentStep = 2;
      }
    } else if (this.currentStep === 2) {
      // Validate contact info
      if (this.validateContactInfo()) {
        this.completedSteps.push(2);
        this.currentStep = 3;
      }
    }
  }

  /**
   * Move to previous step
   */
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      // Remove from completed steps if going back
      const index = this.completedSteps.indexOf(this.currentStep + 1);
      if (index > -1) {
        this.completedSteps.splice(index, 1);
      }
    }
  }

  /**
   * Validate passenger information
   */
  private validatePassengerInfo(): boolean {
    return !!(
      this.passengerInfo.title &&
      this.passengerInfo.firstName &&
      this.passengerInfo.lastName &&
      this.passengerInfo.birthDate &&
      this.passengerInfo.idNumber
    );
  }

  /**
   * Validate contact information
   */
  private validateContactInfo(): boolean {
    return !!(
      this.contactInfo.title && 
      this.contactInfo.fullName && 
      this.contactInfo.phone && 
      this.contactInfo.email
    );
  }

  /**
   * Check if step is completed
   */
  isStepCompleted(step: number): boolean {
    return this.completedSteps.includes(step);
  }

  /**
   * Check if step is active
   */
  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  /**
   * Get step status class
   */
  getStepClass(step: number): string {
    if (this.isStepCompleted(step)) {
      return 'step completed';
    } else if (this.isStepActive(step)) {
      return 'step active';
    } else {
      return 'step';
    }
  }

  /**
   * Get passenger display name
   */
  getPassengerDisplayName(): string {
    const titleMap: { [key: string]: string } = {
      'mr': 'Ông',
      'ms': 'Bà', 
      'miss': 'Cô'
    };

    const title = titleMap[this.passengerInfo.title] || '';
    const firstName = this.passengerInfo.firstName || '';
    const lastName = this.passengerInfo.lastName || '';

    if (title && firstName && lastName) {
      return `${title} ${firstName} ${lastName}`;
    } else if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else {
      return 'Chưa nhập thông tin hành khách';
    }
  }

  /**
   * Get contact display name
   */
  getContactDisplayName(): string {
    const titleMap: { [key: string]: string } = {
      'mr': 'Ông',
      'ms': 'Bà', 
      'miss': 'Cô'
    };

    const title = titleMap[this.contactInfo.title] || '';
    const fullName = this.contactInfo.fullName || '';

    if (title && fullName) {
      return `${title} ${fullName}`;
    } else if (fullName) {
      return fullName;
    } else {
      return 'Chưa nhập thông tin liên hệ';
    }
  }

  /**
   * Check if has additional services
   */
  hasAdditionalServices(): boolean {
    return this.additionalServices.specialMeal || 
           this.additionalServices.extraLuggage || 
           this.additionalServices.seatSelection;
  }

  /**
   * Calculate total amount
   */
  getTotalAmount(): number {
    let total = 716100; // Base price (ticket + taxes)

    // Add additional services
    if (this.additionalServices.specialMeal) {
      total += 150000;
    }
    if (this.additionalServices.extraLuggage) {
      total += 300000;
    }
    if (this.additionalServices.seatSelection) {
      total += 200000;
    }

    return total;
  }

  /**
   * Complete booking and navigate to success page
   */
  completeBooking(): void {
    // In a real app, this would save the booking to backend
    console.log('Completing booking...');
    
    // Navigate to booking success page with booking data
    this.router.navigate(['/booking-success'], {
      state: {
        bookingData: {
          bookingCode: this.generateBookingCode(),
          totalAmount: this.getTotalAmount(),
          paymentStatus: 'Đã thanh toán',
          passengerName: this.getPassengerDisplayName(),
          contactName: this.getContactDisplayName(),
          contactPhone: this.contactInfo.phone,
          contactEmail: this.contactInfo.email,
          flightNumber: 'QH818',
          airline: 'Bamboo Airways',
          departure: 'Hải Phòng',
          destination: 'Phú Quốc',
          departureTime: '11:00',
          arrivalTime: '13:15',
          flightDate: 'Thứ Sáu, 22 tháng 2, 2025'
        }
      }
    });
  }

  /**
   * Generate booking code
   */
  private generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
