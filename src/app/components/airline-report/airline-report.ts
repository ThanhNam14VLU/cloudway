import { Component } from '@angular/core';

@Component({
  selector: 'app-airline-report',
  imports: [],
  templateUrl: './airline-report.html',
  styleUrl: './airline-report.scss'
})
export class AirlineReport {
  revenueData = [
    { month: '1/2024', value: 2100000000, percent: 70 },
    { month: '2/2024', value: 1500000000, percent: 50 },
    { month: '3/2024', value: 2400000000, percent: 80 },
    { month: '4/2024', value: 2640000000, percent: 95 },
    { month: '5/2024', value: 2640000000, percent: 95 },
    { month: '6/2024', value: 2800000000, percent: 100 },
  ];

  flights = [
    { route: 'HAN - SGN', booking: 1260, value: 1500000000, change: 11.25 },
    { route: 'SGN - DAD', booking: 800, value: 756500000, change: 6.5 },
    { route: 'HAN - DAD', booking: 600, value: 617500000, change: -2.7 },
    { route: 'SGN - PQC', booking: 520, value: 390000000, change: 11.7 },
    { route: 'HAN - CXR', booking: 380, value: 418000000, change: 3.25 },
  ];

}
