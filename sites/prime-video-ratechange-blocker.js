// Amazon Prime Video ratechange blocker
// Runs in MAIN world before Prime Video's scripts load.
(() => {
  const origAddEventListener = HTMLVideoElement.prototype.addEventListener;
  const origRemoveEventListener = HTMLVideoElement.prototype.removeEventListener;
  const blockedListeners = new WeakMap();

  HTMLVideoElement.prototype.addEventListener = function (type, listener, options) {
    if (type === "ratechange") {
      // Store so removeEventListener still works without errors
      if (!blockedListeners.has(this)) blockedListeners.set(this, []);
      blockedListeners.get(this).push(listener);
      return;
    }
    return origAddEventListener.call(this, type, listener, options);
  };

  HTMLVideoElement.prototype.removeEventListener = function (type, listener, options) {
    if (type === "ratechange") return;
    return origRemoveEventListener.call(this, type, listener, options);
  };

  Object.defineProperty(HTMLVideoElement.prototype, "onratechange", {
    get: () => null,
    set: () => {},
    configurable: true,
  });
})();
