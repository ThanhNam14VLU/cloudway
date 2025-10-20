import {Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlightSearch } from '../../components/flight-search/flight-search';
import { Feature } from '../../components/feature/feature';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { AirportService } from '../../services/airport/airport.service';
import { AirportModel } from '../../models/airport.model';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FlightSearch, Feature, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Check account status directly from backend
    await this.checkAccountStatus();
  }

  async checkAccountStatus() {
    try {
      console.log('🔍 Checking account status...');
      
      // Debug auth info first
      await this.authService.debugAuthInfo();
      
      // First check if backend is available
      const isBackendAvailable = await this.authService.isBackendAvailable();
      if (!isBackendAvailable) {
        console.log('⚠️ Backend is not available, skipping account status check');
        console.log('✅ Account is active (backend unavailable), no alert needed');
        return;
      }
      
      const profile = await this.authService.getCurrentUserProfile();
      console.log('🔍 Profile result:', profile);
      console.log('✅ Account status check completed');
    } catch (error) {
      console.error('Error checking account status:', error);
    }
  }


  // Method để test backend connection (temporary)
  async testBackendConnection() {
    console.log('🧪 Testing backend connection...');
    const isAvailable = await this.authService.isBackendAvailable();
    console.log('🧪 Backend available:', isAvailable);
    
    if (isAvailable) {
      console.log('🧪 Testing user profile fetch...');
      const profile = await this.authService.getCurrentUserProfile();
      console.log('🧪 Profile result:', profile);
    }
  }
}
