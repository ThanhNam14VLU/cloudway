import { Injectable } from '@angular/core';
import { ProfileModel } from '../../models/user.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) {}

  getProfile(id: string): Observable<ProfileModel> {
    return this.httpClient.get<ProfileModel>(`${environment.apiUrl}/user/${id}`);
  }

  getAirlineUser(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/user/role/AIRLINE`);
  }

  getCustomerUser(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/user/role/CUSTOMER`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    // Try different possible endpoints
    return this.httpClient.patch<any>(`${environment.apiUrl}/user/${userId}/role`, { role });
  }

  getUserBookingHistory(userId: string, limit: number = 5): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/bookings/user/${userId}?limit=${limit}`);
  }

  /**
   * Update user profile (full_name, phone, email)
   */
  updateProfile(userId: string, update: { full_name?: string; phone?: string; email?: string }): Observable<any> {
    const url = `${environment.apiUrl}/user/${userId}/profile`;
    console.log('Making PATCH request to:', url);
    console.log('Payload:', update);
    return this.httpClient.patch<any>(url, update);
  }

  /**
   * Upload user avatar. Expects backend @Post(':id/avatar') with FileInterceptor('file')
   */
  uploadAvatar(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<any>(`${environment.apiUrl}/user/${userId}/avatar`, formData);
  }

  /**
   * Create airline user account (Admin only)
   */
  createAirlineUser(userData: {
    email: string;
    full_name: string;
    phone?: string;
    password: string;
    airline_id: string;
  }): Observable<any> {
    return this.httpClient.post<any>(`${environment.apiUrl}/user/admin/airline`, userData);
  }

  /**
   * Update account status (Admin only)
   */
  updateAccountStatus(userId: string, account_status: 'ACTIVE' | 'LOCKED'): Observable<any> {
    return this.httpClient.patch<any>(`${environment.apiUrl}/user/${userId}/account-status`, { account_status });
  }
}
