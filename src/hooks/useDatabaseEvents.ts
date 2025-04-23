import { useEffect } from 'react';
import { DatabaseEvents } from '@/services/api';

type EventCallback<T> = (data: T) => void;

/**
 * Custom hook to subscribe to database events
 * @param eventName The event name to subscribe to
 * @param callback The callback to execute when the event is emitted
 */
export function useDatabaseEvent<T = any>(eventName: string, callback: EventCallback<T>) {
  useEffect(() => {
    // Subscribe to the event
    const unsubscribe = DatabaseEvents.subscribe(eventName, callback);
    
    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, [eventName, callback]);
}

/**
 * Custom hook to subscribe to background added events
 * @param callback The callback to execute when a background is added
 */
export function useBackgroundAddedEvent<T = any>(callback: EventCallback<T>) {
  useDatabaseEvent(DatabaseEvents.BACKGROUND_ADDED, callback);
}

/**
 * Custom hook to subscribe to background updated events
 * @param callback The callback to execute when a background is updated
 */
export function useBackgroundUpdatedEvent<T = any>(callback: EventCallback<T>) {
  useDatabaseEvent(DatabaseEvents.BACKGROUND_UPDATED, callback);
}

/**
 * Custom hook to subscribe to gift card added events
 * @param callback The callback to execute when a gift card is added
 */
export function useGiftCardAddedEvent<T = any>(callback: EventCallback<T>) {
  useDatabaseEvent(DatabaseEvents.GIFT_CARD_ADDED, callback);
}

/**
 * Custom hook to subscribe to gift card updated events
 * @param callback The callback to execute when a gift card is updated
 */
export function useGiftCardUpdatedEvent<T = any>(callback: EventCallback<T>) {
  useDatabaseEvent(DatabaseEvents.GIFT_CARD_UPDATED, callback);
}

export default useDatabaseEvent; 