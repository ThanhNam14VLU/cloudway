import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateFlightInstanceModel } from '../../models/create-flight-instance.model';

@Injectable({
  providedIn: 'root'
})
export class AirlineService {
  constructor(private httpClient: HttpClient) {}
  
  getAirlineStatistics(id: string): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/airline-statistics/${id}`);
  }

  getAircrafts(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/aircrafts`);
  }

  createFlightInstance(dto: CreateFlightInstanceModel): Observable<any> {
    return this.httpClient.post<any>(`${environment.apiUrl}/flights`, dto);
  }

  getFlightInstances(id: string): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/flights/airline/${id}`);
  }

  getAirlines(): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/airline`);
  }

  createAirline(airline: any): Observable<any> {
    return this.httpClient.post<any>(`${environment.apiUrl}/airline`, airline);
  }

  deleteAirline(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.apiUrl}/airline/${id}`);
  }

  updateFlightSchedule(id: string, scheduleData: { scheduled_departure_local: string, scheduled_arrival_local: string }): Observable<any> {
    return this.httpClient.patch<any>(`${environment.apiUrl}/flights/${id}/schedule`, scheduleData);
  }

  cancelFlight(id: string): Observable<any> {
    return this.httpClient.patch<any>(`${environment.apiUrl}/flights/${id}/cancel`, {});
  }

  filterFlightsByStatus(status: string): Observable<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}/flights/filter/status?status=${status}`);
  }
}
