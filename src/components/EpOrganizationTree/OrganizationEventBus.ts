type BusHandler = (...args: any[]) => void;

const listeners: Record<string, BusHandler[]> = {};

export const OrganizationEventBus = {
  $on(event: string, handler: BusHandler) {
    if (!listeners[event]){
      listeners[event] = [];
    }
    listeners[event].push(handler);
  },

  /** With no event name, removes all listeners (matches prior Vue-based bus usage). */
  $off(event?: string) {
    if (event) {
      delete listeners[event];
    }
    else {
      Object.keys(listeners).forEach(key => {
        delete listeners[key];
      });
    }
  },

  $emit(event: string, ...args: any[]) {
    const fns = listeners[event];
    if (!fns) {
      return;
    }
    fns.forEach(fn => {
      fn(...args);
    });
  },
};
