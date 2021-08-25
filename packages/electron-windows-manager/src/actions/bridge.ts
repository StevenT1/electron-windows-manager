const EventEmitter = new (require("events").EventEmitter)();
export const bridge = {
  /**
   * Sets the callback to trigger whenever an event is emitted
   * @param event The name of the event
   * @param callback The callback to trigger, this callback will be given the data passed (if any), and
   * the name of the targeted window and finally the name of the window that triggered/emitted the event
   * @return the handler that add into the event listeners array
   * */
  on: function (event: string | symbol, callback: (...args: any[]) => void) {
    let id = EventEmitter.listenerCount(event);
    EventEmitter.addListener(
      event,
      function (event: { data: any; target: any; emittedBy: any }) {
        callback.call(null, event.data, event.target, event.emittedBy);
      }
    );

    return EventEmitter.listeners(event)[id];
  },

  /**
   * Sets the callback to trigger only once whenever an event is emitted
   * @param event The name of the event
   * @param callback The callback to trigger, this callback will be given the data passed (if any), and
   * the name of the targeted window and finally the name of the window that triggered/emitted the event
   * */
  once: function (event: string | symbol, callback: (...args: any[]) => void) {
    EventEmitter.once(
      event,
      function (event: { data: any; target: any; emittedBy: any }) {
        callback.call(null, event.data, event.target, event.emittedBy);
      }
    );
  },

  /**
   * Remove a event listener returned by windowManger.bridge.on
   * or windowManager.bridge.addListener
   * @param event The name of the event
   * @param handler the listen handler returned by
   *        windowManager.bridge.on or windowManager.bridge.on
   */
  removeListener: function (
    event: string | symbol,
    handler: (...args: any[]) => void
  ) {
    EventEmitter.removeListener(event, handler);
  },

  /**
   * Emits an event
   * @param event The name of the event
   * @param data [optional] Any accompanying value(s)
   * @param target [optional] The name of the targeted window
   * */
  emit: function (
    event: string | symbol,
    data: any,
    target: any,
    name: string
  ) {
    EventEmitter.emit(event, {
      emittedBy: name,
      target: target,
      data: data,
    });
  },
};
