/**
 * Event Bus for handling application-wide events
 * This allows components to communicate without direct dependencies
 */

export interface BackgroundUpdatedEvent {
  background: any;
  action: 'added' | 'updated' | 'deleted';
}

class EventBus {
  private eventTarget: EventTarget;

  constructor() {
    this.eventTarget = new EventTarget();
  }

  /**
   * Emit a background updated event
   */
  emitBackgroundUpdated(data: BackgroundUpdatedEvent): void {
    const event = new CustomEvent('background-updated', { detail: data });
    this.eventTarget.dispatchEvent(event);
    console.log('Background updated event emitted:', data);
  }

  /**
   * Listen for background updates
   */
  onBackgroundUpdated(callback: (data: BackgroundUpdatedEvent) => void): () => void {
    const handler = (event: Event) => {
      callback((event as CustomEvent).detail);
    };
    
    this.eventTarget.addEventListener('background-updated', handler);
    
    // Return cleanup function
    return () => {
      this.eventTarget.removeEventListener('background-updated', handler);
    };
  }
}

// Export a singleton instance
export const eventBus = new EventBus(); 