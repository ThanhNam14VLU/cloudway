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
}
