import { Component, EventEmitter, Output, output } from '@angular/core';

@Component({
  selector: 'app-airline-add-flight-form',
  imports: [],
  standalone:true,
  templateUrl: './airline-add-flight-form.html',
  styleUrl: './airline-add-flight-form.scss'
})
export class AirlineAddFlightForm {
 @Output() close = new EventEmitter<void>();//con tạo sự kiện để phát ra ngoài

  handle() {
    this.close.emit();//phát sự kiện ra ngoài
  }
}
