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
}
