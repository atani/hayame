// Abema ratechange blocker
// Runs in MAIN world before Abema's scripts load.
// Prevents Abema from detecting playbackRate changes.
(() => {
  const origAddEventListener = HTMLVideoElement.prototype.addEventListener;
  HTMLVideoElement.prototype.addEventListener = function (type, listener, options) {
    if (type === "ratechange") return;
    return origAddEventListener.call(this, type, listener, options);
  };

  Object.defineProperty(HTMLVideoElement.prototype, "onratechange", {
    get: () => null,
    set: () => {},
    configurable: true,
  });
})();
