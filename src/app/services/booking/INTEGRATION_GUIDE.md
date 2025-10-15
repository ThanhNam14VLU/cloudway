# Booking Service Integration Guide

## Overview
Booking service đã được tích hợp vào các trang điền thông tin hành khách và thông tin liên hệ. Hướng dẫn này sẽ giúp bạn hiểu cách sử dụng và tích hợp.

## Components Updated

### 1. Airline Card Detail Page
**File:** `/src/app/pages/airline-card-detail/airline-card-detail.ts`

**Features:**
- ✅ Tích hợp BookingService, BookingHelperService, AuthService
- ✅ Nhận flight data từ router state hoặc sử dụng mock data
- ✅ Convert form data thành PassengerInfo và CreateBookingWithPassengersDto
- ✅ Validate data trước khi gửi API
- ✅ Hiển thị loading state và error messages
- ✅ Navigate đến success page với real booking data

**Key Methods:**
```typescript
// Complete booking với real API
async completeBooking(): Promise<void>

// Navigate to success page với booking result
private navigateToSuccessPage(bookingResponse: BookingResponse): void

// Format time và date cho display
private formatTime(timeString: string): string
private formatDate(timeString: string): string
```

### 2. Airline Card Booking Info Component
**File:** `/src/app/components/airline-card-booking-info/airline-card-booking-info.ts`

**Features:**
- ✅ Standalone component với Input/Output
- ✅ Form nhập thông tin hành khách và liên hệ
- ✅ Tích hợp booking service
- ✅ Emit booking result về parent component

**Input/Output:**
```typescript
@Input() selectedFlight: BackendFlight | null = null;
@Output() bookingCreated = new EventEmitter<BookingResponse>();
```

**Key Methods:**
```typescript
// Tạo booking từ component
async createBooking(): Promise<void>
```

## Data Flow

### 1. Airline Card Detail Page
```
User fills form → Validate → Create PassengerInfo → Create BookingDto → Call API → Navigate to Success
```

### 2. Airline Card Booking Info Component
```
Parent passes flight → User fills form → Create BookingDto → Call API → Emit result to parent
```

## Usage Examples

### 1. Sử dụng Airline Card Detail Page
```typescript
// Navigate với flight data
this.router.navigate(['/airline-card-detail'], {
  state: { selectedFlight: flightData }
});

// Component sẽ tự động:
// - Load flight data từ router state
// - Hiển thị form điền thông tin
// - Tạo booking khi user click "Hoàn tất đặt chỗ"
// - Navigate đến success page
```

### 2. Sử dụng Airline Card Booking Info Component
```typescript
// Trong parent component
<app-airline-card-booking-info 
  [selectedFlight]="selectedFlight"
  (bookingCreated)="onBookingCreated($event)">
</app-airline-card-booking-info>

// Handle booking result
onBookingCreated(bookingResponse: BookingResponse) {
  console.log('Booking created:', bookingResponse.booking.pnr_code);
  // Navigate to success page or show success message
}
```

## Form Data Structure

### Passenger Information
```typescript
passengerInfo = {
  fullName: '',      // Họ và tên
  dateOfBirth: '',   // Ngày sinh
  idNumber: '',      // CCCD/CMND
  phone: '',         // Số điện thoại
  email: ''          // Email
};
```

### Contact Information
```typescript
contactInfo = {
  fullname: '',      // Họ và tên
  phone: '',         // Số điện thoại
  email: ''          // Email
};
```

## API Integration

### Request Flow
1. **Get User ID**: `authService.getCurrentUserProfile()`
2. **Create Passenger Info**: `bookingHelper.createPassengerInfo()`
3. **Create Booking DTO**: `bookingHelper.createBookingDto()`
4. **Validate Data**: `bookingHelper.validateBookingData()`
5. **Call API**: `bookingService.createBookingWithPassengers()`

### Response Handling
```typescript
// Success
{
  message: "✅ Tạo booking thành công",
  booking: {
    id: "uuid",
    pnr_code: "ABC123",
    status: "HOLD",
    payment: {
      amount: 5000000,
      currency: "VND",
      status: "PENDING"
    },
    segments: [...]
  }
}

// Error
{
  error: {
    message: "Validation failed"
  }
}
```

## Error Handling

### Validation Errors
- Required fields validation
- Email format validation
- Phone number validation
- Flight selection validation

### API Errors
- Network errors
- Server errors
- Authentication errors

### UI Error Display
```html
@if (errorMessages.length > 0) {
  <div class="error-messages">
    <h4>Lỗi:</h4>
    <ul>
      <li *ngFor="let error of errorMessages">{{ error }}</li>
    </ul>
  </div>
}
```

## Loading States

### Button Loading
```html
<button [disabled]="isCreatingBooking">
  @if (isCreatingBooking) {
    Đang tạo booking...
  } @else {
    Hoàn tất đặt chỗ
  }
</button>
```

### Form Disabled State
```html
<button [disabled]="isCreatingBooking">Quay lại</button>
<button [disabled]="isCreatingBooking">Tiếp tục</button>
```

## Testing

### 1. Test với Mock Data
- Components có mock data sẵn để test
- Không cần real API để test UI flow

### 2. Test với Real API
- Sử dụng booking service với real backend
- Check console logs để debug

### 3. Test Integration
```typescript
// Sử dụng BookingIntegrationExampleComponent
// Component demo cách tích hợp airline-card-booking-info
```

## Console Logging

Tất cả components đều có comprehensive logging:

```
=== AIRLINE CARD DETAIL INIT ===
✈️ Selected flight received: {...}
=== COMPLETING BOOKING ===
👤 Current user: uuid
👤 Passenger info created: {...}
📋 Booking DTO created: {...}
🚀 Calling booking API...
✅ Booking created successfully: {...}
```

## Files Structure

```
src/app/
├── pages/
│   └── airline-card-detail/
│       ├── airline-card-detail.ts        # Updated với booking service
│       ├── airline-card-detail.html      # Updated với loading states
│       └── airline-card-detail.scss      # Updated với error styles
├── components/
│   ├── airline-card-booking-info/
│   │   ├── airline-card-booking-info.ts  # Updated với booking service
│   │   ├── airline-card-booking-info.html # Updated với forms
│   │   └── airline-card-booking-info.scss # Updated với styles
│   └── booking-integration-example/
│       └── booking-integration-example.ts # Demo component
└── services/
    └── booking/
        ├── booking.service.ts            # Main service
        ├── booking-helper.service.ts     # Helper service
        └── INTEGRATION_GUIDE.md         # This guide
```

## Next Steps

1. **Test Integration**: Sử dụng components để test booking flow
2. **Customize UI**: Điều chỉnh forms theo requirements
3. **Add Validation**: Thêm validation rules nếu cần
4. **Error Handling**: Customize error messages
5. **Success Page**: Tạo success page để hiển thị booking result

## Support

Nếu có vấn đề với integration:
1. Check console logs
2. Verify API endpoints
3. Check authentication
4. Validate form data
5. Check network requests
