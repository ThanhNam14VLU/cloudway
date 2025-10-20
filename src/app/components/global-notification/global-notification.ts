import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationConfig } from '../../services/notification/notification.service';
import { NotificationDialog } from '../notification-dialog/notification-dialog';

@Component({
  selector: 'app-global-notification',
  standalone: true,
  imports: [CommonModule, NotificationDialog],
  template: `
    <app-notification-dialog
      [visible]="!!currentNotification"
      [type]="currentNotification?.type || 'info'"
      [title]="currentNotification?.title || ''"
      [message]="currentNotification?.message || ''"
      [confirmText]="currentNotification?.confirmText || 'OK'"
      (confirm)="onConfirm()"
      (close)="onClose()">
    </app-notification-dialog>
  `,
  styles: []
})
export class GlobalNotification implements OnInit, OnDestroy {
  currentNotification: NotificationConfig | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(
      (notification) => {
        this.currentNotification = notification;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onConfirm(): void {
    this.notificationService.hide();
  }

  onClose(): void {
    this.notificationService.hide();
  }
}
