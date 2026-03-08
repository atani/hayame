// Amazon Prime Video ratechange blocker
// Runs in MAIN world before Prime Video's scripts load.
(() => {
  const origAddEventListener = HTMLVideoElement.prototype.addEventListener;
  const origRemoveEventListener = HTMLVideoElement.prototype.removeEventListener;

  HTMLVideoElement.prototype.addEventListener = function (type, listener, options) {
    if (type === "ratechange") return;
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
