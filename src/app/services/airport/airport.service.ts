import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AirportModel } from '../../models/airport.model';

@Injectable({
  providedIn: 'root'
})
export class AirportService {
  constructor(private httpClient: HttpClient) {}

  getAirports(): Observable<AirportModel[]> {
    return this.httpClient.get<AirportModel[]>(`${environment.apiUrl}/airport`);
  }
}
