import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Stepper } from '../../components/stepper/stepper';
import { AirlineCardBookingInfo } from '../../components/airline-card-booking-info/airline-card-booking-info';
import { AirlineCardBookingSummary } from '../../components/airline-card-booking-summary/airline-card-booking-summary';

@Component({
  selector: 'app-airline-card-detail',
  imports: [RouterLink,Stepper,AirlineCardBookingInfo,AirlineCardBookingSummary],
  templateUrl: './airline-card-detail.html',
  styleUrl: './airline-card-detail.scss'
})
export class AirlineCardDetail {

}
