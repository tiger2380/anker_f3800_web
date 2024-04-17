// create an event emitter using Javascript

class EventEmitter {
  /**
   * Initializes a new instance of the class.
   */
  constructor() {
    this.events = {};
  }

  /**
   * Adds an event listener to the specified event type.
   *
   * @param {string} type - The type of event to listen for.
   * @param {function} listener - The function to be called when the event is triggered.
   */
  on(type, listener) {
    this.events[type] = this.events[type] || [];
    this.events[type].push(listener);
  }

  /**
   * Emits an event of the given type with the provided argument.
   *
   * @param {string} type - The type of event to emit.
   * @param {any} arg - The argument to pass to the event listeners.
   */
  emit(type, arg) {
    if (this.events[type]) {
      this.events[type].forEach((listener) => listener(arg));
    }
  }
}

window.eventEmitter = new EventEmitter();