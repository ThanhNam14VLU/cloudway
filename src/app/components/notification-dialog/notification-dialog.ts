import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-notification-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-overlay" *ngIf="visible" (click)="onOverlayClick($event)">
      <div class="notification-container" (click)="$event.stopPropagation()">
        <div class="notification-header">
          <div class="icon-container" [ngClass]="'icon-' + type">
            <i class="fa-solid" [ngClass]="iconClass"></i>
          </div>
          <button class="close-btn" (click)="onClose()">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="notification-body">
          <h3 class="title">{{ title }}</h3>
          <p class="message">{{ message }}</p>
        </div>
        
        <div class="notification-footer">
          <button class="btn btn-primary" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    .notification-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 400px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0;
      margin-bottom: 16px;
    }

    .icon-container {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .icon-container i {
      color: white;
    }

    .icon-success {
      background-color: #10b981;
    }

    .icon-error {
      background-color: #ef4444;
    }

    .icon-warning {
      background-color: #f59e0b;
    }

    .icon-info {
      background-color: #3b82f6;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: #6b7280;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .notification-body {
      padding: 0 24px 20px;
      text-align: center;
    }

    .title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .message {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }

    .notification-footer {
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: center;
    }

    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 100px;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2563eb;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 480px) {
      .notification-container {
        margin: 20px;
        width: calc(100% - 40px);
      }
    }
  `]
})
export class NotificationDialog {
  @Input() visible = false;
  @Input() type: NotificationType = 'info';
  @Input() title = 'Thông báo';
  @Input() message = '';
  @Input() confirmText = 'OK';

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  get iconClass(): string {
    switch (this.type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
      default:
        return 'fa-info-circle';
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
