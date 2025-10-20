import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AirportModel, CreateAirportModel } from '../../models/airport.model';

@Injectable({
  providedIn: 'root'
})
export class AirportService {
  constructor(private httpClient: HttpClient) {}

  getAirports(): Observable<AirportModel[]> {
    return this.httpClient.get<AirportModel[]>(`${environment.apiUrl}/airport`);
  }

  createAirport(airport: CreateAirportModel): Observable<any> {
    return this.httpClient.post<any>(`${environment.apiUrl}/airport`, airport);
  }

  deleteAirport(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${environment.apiUrl}/airport/${id}`);
  }
}
