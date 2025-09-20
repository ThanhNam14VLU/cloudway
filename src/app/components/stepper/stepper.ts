import { Component } from '@angular/core';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss'
})
export class Stepper {
  //biến kiểm tra bước đã hoàn thành hay chưa
  isStep1Completed: boolean = true;
  isStep2Completed: boolean = true;
  isStep3Completed: boolean = true;
  currentStep = 0;// xem bước hiện tại(0: tất cả hoàn thành, 1: bước 1, 2: bước 2, 3: bước 3)

}
