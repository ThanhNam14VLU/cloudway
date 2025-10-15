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
    return this.httpClient.get<any>(`${environment.apiUrl}/airline-statistic/${id}/statistics`);
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
}
