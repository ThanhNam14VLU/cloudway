import { Component } from '@angular/core';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss'
})
export class Stepper {
  //biến kiểm tra bước đã hoàn thành hay chưa
  isStep1Completed: boolean = false;
  isStep2Completed: boolean = false;
  isStep3Completed: boolean = false;
  currentStep = 1;// xem bước hiện tại(0: tất cả hoàn thành, 1: bước 1, 2: bước 2, 3: bước 3)

}
