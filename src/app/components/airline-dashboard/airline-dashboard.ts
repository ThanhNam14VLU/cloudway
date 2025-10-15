import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirlineService } from '../../services/airline/airline.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-airline-dashboard',
  imports: [CommonModule],
  standalone:true,
  templateUrl: './airline-dashboard.html',
  styleUrl: './airline-dashboard.scss'
})
export class AirlineDashboard implements OnInit {
  @Input() airlineId: string = '';
  // Dữ liệu thống kê; sẽ fill từ service
  statistics: any;
  currentUserProfile: any = null;

  get onTimeRate(): number {
    if (!this.statistics?.total_flights) return 0;
    return Math.round((this.statistics.on_time_flights / this.statistics.total_flights) * 1000) / 10;
  }

  constructor(private airlineService: AirlineService, private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    console.log('=== AIRLINE DASHBOARD INIT ===');
    
    // 1. Lấy thông tin user đầy đủ (bao gồm airlines)
    this.currentUserProfile = await this.authService.getCurrentUserProfile();
    console.log('🔍 Current user profile:', this.currentUserProfile);
    
    if (this.currentUserProfile?.airlines && this.currentUserProfile.airlines.length > 0) {
      const airlineInfo = this.currentUserProfile.airlines[0];
      console.log('✈️ Airline info:', airlineInfo);
      console.log('🏢 Airline ID:', airlineInfo.id);
      console.log('🏢 Airline name:', airlineInfo.name);
      console.log('🏢 Airline IATA:', airlineInfo.iata_code);
      
      // 2. Gọi API thống kê với airline ID
      this.airlineService.getAirlineStatistics(airlineInfo.id).subscribe({
        next: (res: any) => {
          console.log('📊 Statistics response:', res);
          
          // Map từ camelCase (backend) sang snake_case (frontend)
          const stats = res?.statistics || res; // Backend có thể wrap trong 'statistics' object
          this.statistics = {
            period_date: new Date().toISOString().slice(0, 10), // Default to today
            total_flights: stats?.totalFlights ?? 0,
            total_passengers: stats?.totalPassengers ?? 0,
            total_revenue: stats?.totalRevenue ?? 0,
            cancelled_flights: stats?.cancelledFlights ?? 0,
            on_time_flights: stats?.onTimeFlights ?? 0
          };
          
          console.log('✅ Statistics mapped:', this.statistics);
          console.log('🔢 Total flights:', this.statistics.total_flights);
          console.log('👥 Total passengers:', this.statistics.total_passengers);
          console.log('💰 Total revenue:', this.statistics.total_revenue);
        },
        error: (e) => {
          console.warn('❌ Không thể tải thống kê hãng bay:', e);
        }
      });
    } else {
      console.warn('⚠️ User không có thông tin hãng bay');
    }
  }
}
