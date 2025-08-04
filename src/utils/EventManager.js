// Event Manager - Centralized event handling system
export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.isDebug = window.gameConfig ? window.gameConfig.isFeatureEnabled('debugLogging') : false;
    }

    // Register an event listener
    on(eventName, callback, context = null) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        
        this.listeners.get(eventName).push({ callback, context });
        
        if (this.isDebug) {
            console.log(`EventManager: Registered listener for '${eventName}'`);
        }
    }

    // Remove an event listener
    off(eventName, callback, context = null) {
        if (!this.listeners.has(eventName)) return;
        
        const eventListeners = this.listeners.get(eventName);
        const index = eventListeners.findIndex(
            listener => listener.callback === callback && listener.context === context
        );
        
        if (index !== -1) {
            eventListeners.splice(index, 1);
            if (this.isDebug) {
                console.log(`EventManager: Removed listener for '${eventName}'`);
            }
        }
    }

    // Emit an event to all listeners
    emit(eventName, ...args) {
        if (!this.listeners.has(eventName)) return;
        
        const eventListeners = this.listeners.get(eventName);
        eventListeners.forEach(({ callback, context }) => {
            try {
                if (context) {
                    callback.apply(context, args);
                } else {
                    callback(...args);
                }
            } catch (error) {
                console.error(`EventManager: Error in listener for '${eventName}':`, error);
            }
        });
        
        if (this.isDebug) {
            console.log(`EventManager: Emitted '${eventName}' to ${eventListeners.length} listeners`);
        }
    }

    // Remove all listeners for an event
    removeAllListeners(eventName) {
        if (this.listeners.has(eventName)) {
            this.listeners.delete(eventName);
            if (this.isDebug) {
                console.log(`EventManager: Removed all listeners for '${eventName}'`);
            }
        }
    }

    // Clear all event listeners
    clear() {
        this.listeners.clear();
        if (this.isDebug) {
            console.log('EventManager: Cleared all event listeners');
        }
    }

    // Cleanup method for NetworkManager compatibility
    cleanup() {
        this.clear();
    }

    // Get the number of listeners for an event
    getListenerCount(eventName) {
        return this.listeners.has(eventName) ? this.listeners.get(eventName).length : 0;
    }

    // Get all registered event names
    getEventNames() {
        return Array.from(this.listeners.keys());
    }

    // Check if an event has listeners
    hasListeners(eventName) {
        return this.listeners.has(eventName) && this.listeners.get(eventName).length > 0;
    }

    // One-time event listener (auto-removes after first trigger)
    once(eventName, callback, context = null) {
        const onceWrapper = (...args) => {
            this.off(eventName, onceWrapper);
            if (context) {
                callback.apply(context, args);
            } else {
                callback(...args);
            }
        };
        
        this.on(eventName, onceWrapper);
    }

    // Debounced event emission (useful for rapid-fire events)
    emitDebounced(eventName, delay = 100, ...args) {
        if (this._debounceTimers) {
            clearTimeout(this._debounceTimers[eventName]);
        } else {
            this._debounceTimers = {};
        }
        
        this._debounceTimers[eventName] = setTimeout(() => {
            this.emit(eventName, ...args);
            delete this._debounceTimers[eventName];
        }, delay);
    }
}

// Create singleton instance
export const eventManager = new EventManager(); 