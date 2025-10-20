import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationType } from '../../components/notification-dialog/notification-dialog';

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  confirmText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationConfig | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  showSuccess(title: string, message: string, confirmText: string = 'OK'): void {
    this.show({
      type: 'success',
      title,
      message,
      confirmText
    });
  }

  showError(title: string, message: string, confirmText: string = 'OK'): void {
    this.show({
      type: 'error',
      title,
      message,
      confirmText
    });
  }

  showWarning(title: string, message: string, confirmText: string = 'OK'): void {
    this.show({
      type: 'warning',
      title,
      message,
      confirmText
    });
  }

  showInfo(title: string, message: string, confirmText: string = 'OK'): void {
    this.show({
      type: 'info',
      title,
      message,
      confirmText
    });
  }

  private show(config: NotificationConfig): void {
    this.notificationSubject.next(config);
  }

  hide(): void {
    this.notificationSubject.next(null);
  }
}
