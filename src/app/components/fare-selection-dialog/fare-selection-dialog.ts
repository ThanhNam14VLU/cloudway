import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface FareOption {
  id: string;
  code: string;
  class_type: string;
  description: string;
  base_price: number;
  features: string[];
}

interface Flight {
  code: string;
  airline: string;
  logo: string;
  departTime: string;
  departAirport: string;
  arriveTime: string;
  arriveAirport: string;
  price: number;
  duration: string;
  aircraft: string;
  class: string;
  carryOn: string;
  checkedBaggage: string;
  flight_instance_id?: string;
  fare_bucket_id?: string;
  flight_id?: string;
  status?: string;
  available_seats?: number;
  total_seats?: number;
  fares?: Array<{
    base_price: number;
    fare_bucket: {
      id: string;
      code: string;
      class_type: string;
      description: string;
    };
  }>;
  pricing?: {
    base_price: number;
    total_passengers: number;
    total_price: number;
    currency: string;
    breakdown: {
      adults: {
        count: number;
        unit_price: number;
        total: number;
      };
      children: {
        count: number;
        unit_price: number;
        total: number;
      };
      infants: {
        count: number;
        unit_price: number;
        total: number;
      } | null;
    };
  };
}

@Component({
  selector: 'app-fare-selection-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './fare-selection-dialog.html',
  styleUrl: './fare-selection-dialog.scss'
})
export class FareSelectionDialog {
  @Output() fareSelected = new EventEmitter<{flight: Flight, selectedFare: FareOption}>();

  selectedFare: FareOption | null = null;
  flight: Flight;

  constructor(
    public dialogRef: MatDialogRef<FareSelectionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { flight: Flight }
  ) {
    console.log('FareSelectionDialog constructor - data received:', data);
    this.flight = data?.flight || {} as Flight;
    console.log('FareSelectionDialog constructor - flight set to:', this.flight);
  }

  getFareOptions(): FareOption[] {
    console.log('getFareOptions called - flight:', this.flight);
    console.log('getFareOptions called - flight.fares:', this.flight?.fares);
    
    if (!this.flight || !this.flight.fares || this.flight.fares.length === 0) {
      console.log('Using fallback fare options');
      // Fallback to default options if no fares data
      return [
        {
          id: 'b500ed8d-fc0e-4439-bb9d-46f601295b5b',
          code: 'ECO',
          class_type: 'Economy',
          description: 'Hạng phổ thông',
          base_price: this.flight?.pricing?.base_price || this.flight?.price || 0,
          features: [
            'Hành lý xách tay 7kg',
            'Hành lý ký gửi 20kg',
            'Chỗ ngồi tiêu chuẩn',
            'Đồ ăn nhẹ miễn phí'
          ]
        },
        {
          id: '6135348f-2e68-4a4b-a750-9a9dc69a17b6',
          code: 'BUS',
          class_type: 'Business',
          description: 'Hạng thương gia',
          base_price: (this.flight?.pricing?.base_price || this.flight?.price || 0) * 1.5,
          features: [
            'Hành lý xách tay 7kg',
            'Hành lý ký gửi 30kg',
            'Chỗ ngồi rộng rãi',
            'Bữa ăn đầy đủ',
            'Ưu tiên check-in',
            'Phòng chờ thương gia'
          ]
        }
      ];
    }

    console.log('Using API fare data, mapping fares...');
    // Map API fares and remove duplicates by class_type
    const fareMap = new Map<string, FareOption>();
    
    this.flight.fares.forEach(fare => {
      const classType = fare.fare_bucket.class_type;
      if (!fareMap.has(classType)) {
        fareMap.set(classType, {
          id: fare.fare_bucket.id,
          code: fare.fare_bucket.code,
          class_type: fare.fare_bucket.class_type,
          description: fare.fare_bucket.description,
          base_price: fare.base_price,
          features: this.getFeaturesForClass(fare.fare_bucket.class_type)
        });
      }
    });
    
    const uniqueFares = Array.from(fareMap.values());
    console.log('Unique fares after deduplication:', uniqueFares);
    return uniqueFares;
  }

  private getFeaturesForClass(classType: string): string[] {
    if (classType === 'Business') {
      return [
        'Hành lý xách tay 7kg',
        'Hành lý ký gửi 30kg',
        'Chỗ ngồi rộng rãi',
        'Bữa ăn đầy đủ',
        'Ưu tiên check-in',
        'Phòng chờ thương gia'
      ];
    } else {
      return [
        'Hành lý xách tay 7kg',
        'Hành lý ký gửi 20kg',
        'Chỗ ngồi tiêu chuẩn',
        'Đồ ăn nhẹ miễn phí'
      ];
    }
  }

  selectFare(fare: FareOption): void {
    this.selectedFare = fare;
  }

  confirmSelection(): void {
    if (this.selectedFare && this.flight) {
      // Update flight with selected fare
      const updatedFlight = {
        ...this.flight,
        class: this.selectedFare.class_type,
        price: this.selectedFare.base_price,
        fare_bucket_id: this.selectedFare.id
      };
      
      this.fareSelected.emit({
        flight: updatedFlight,
        selectedFare: this.selectedFare
      });
      
      this.dialogRef.close();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  formatPrice(price: number): string {
    if (!price || isNaN(price)) {
      return '0';
    }
    return new Intl.NumberFormat('en-US').format(price) + ' VND';
  }
}
