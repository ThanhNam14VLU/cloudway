import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, timeout, firstValueFrom } from 'rxjs';
import { supabase } from '../../supabase.client';

@Injectable({ providedIn: 'root' })
export class PaymentRealtimeService implements OnDestroy {
  private activeChannelNames: Set<string> = new Set();

  /**
   * Subscribe to payments row changes by bookingId.
   * Emits every time the payment row for this booking changes (INSERT/UPDATE/DELETE).
   */
  onPaymentChangesByBooking(bookingId: string): Observable<any> {
    const subject = new Subject<any>();
    const channelName = `payments-by-booking-${bookingId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          subject.next(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // no-op
        }
      });

    this.activeChannelNames.add(channelName);

    // Teardown when the observable is unsubscribed
    return new Observable<any>((observer) => {
      const sub = subject.subscribe(observer);
      return () => {
        sub.unsubscribe();
        supabase.removeChannel(channel);
        this.activeChannelNames.delete(channelName);
      };
    });
  }

  /**
   * Wait until the payment for a booking becomes PAID. Returns true if observed before timeout.
   */
  async waitForPaidByBooking(bookingId: string, timeoutMs: number = 5 * 60 * 1000): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const channelName = `payments-paid-by-booking-${bookingId}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `booking_id=eq.${bookingId}`,
          },
          (payload: any) => {
            const newRow = payload.new || payload.record;
            if (newRow && newRow.status === 'PAID') {
              supabase.removeChannel(channel);
              resolve(true);
            }
          }
        )
        .subscribe();

      this.activeChannelNames.add(channelName);

      // Timeout guard
      const timer = setTimeout(() => {
        supabase.removeChannel(channel);
        this.activeChannelNames.delete(channelName);
        resolve(false);
      }, timeoutMs);

      // Note: RealtimeChannel does not expose a 'close' event via .on().
      // We rely on the timeout guard above and explicit removeChannel calls.
    });
  }

  /**
   * Subscribe to payments row changes by paymentId.
   */
  onPaymentChangesById(paymentId: string): Observable<any> {
    const subject = new Subject<any>();
    const channelName = `payments-by-id-${paymentId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments', filter: `id=eq.${paymentId}` },
        (payload) => subject.next(payload)
      )
      .subscribe();

    this.activeChannelNames.add(channelName);

    return new Observable<any>((observer) => {
      const sub = subject.subscribe(observer);
      return () => {
        sub.unsubscribe();
        supabase.removeChannel(channel);
        this.activeChannelNames.delete(channelName);
      };
    });
  }

  ngOnDestroy(): void {
    // Best-effort cleanup if any channel is still open
    for (const name of this.activeChannelNames) {
      // supabase-js v2 does not provide a direct lookup by name, so we rely on removeAllChannels
    }
    supabase.removeAllChannels();
    this.activeChannelNames.clear();
  }
}


