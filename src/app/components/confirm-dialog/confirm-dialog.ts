import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="visible" (click)="onOverlayClick($event)">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="onCancel()">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="dialog-body">
          <div class="icon-container">
            <i class="fa-solid" [ngClass]="iconClass"></i>
          </div>
          <p class="message">{{ message }}</p>
        </div>
        
        <div class="dialog-footer">
          <button class="btn btn-cancel" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button class="btn btn-confirm" (click)="onConfirm()" [class]="confirmButtonClass">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
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

    .dialog-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 400px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 20px;
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
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

    .dialog-body {
      padding: 0 24px 20px;
      text-align: center;
    }

    .icon-container {
      margin-bottom: 16px;
    }

    .icon-container i {
      font-size: 48px;
      color: #f59e0b;
    }

    .icon-container i.fa-lock {
      color: #ef4444;
    }

    .icon-container i.fa-lock-open {
      color: #10b981;
    }

    .message {
      margin: 0;
      font-size: 16px;
      color: #374151;
      line-height: 1.5;
    }

    .dialog-footer {
      display: flex;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 80px;
    }

    .btn-cancel {
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn-cancel:hover {
      background-color: #e5e7eb;
    }

    .btn-confirm {
      background-color: #3b82f6;
      color: white;
    }

    .btn-confirm:hover {
      background-color: #2563eb;
    }

    .btn-confirm.btn-danger {
      background-color: #ef4444;
    }

    .btn-confirm.btn-danger:hover {
      background-color: #dc2626;
    }

    .btn-confirm.btn-success {
      background-color: #10b981;
    }

    .btn-confirm.btn-success:hover {
      background-color: #059669;
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
      .dialog-container {
        margin: 20px;
        width: calc(100% - 40px);
      }
      
      .dialog-footer {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class ConfirmDialog {
  @Input() visible = false;
  @Input() title = 'Xác nhận';
  @Input() message = 'Bạn có chắc chắn muốn thực hiện hành động này?';
  @Input() confirmText = 'Xác nhận';
  @Input() cancelText = 'Hủy';
  @Input() iconClass = 'fa-question-circle';
  @Input() confirmButtonClass = '';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
