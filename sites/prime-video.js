// Amazon Prime Video Ad Skipper Module
// eslint-disable-next-line no-unused-vars
function createPrimeVideoAdSkipper(controller) {
  let observer = null;
  let adActive = false;
  let pollTimer = null;
  let overlay = null;

  function isVisible(el) {
    return el && el.offsetParent !== null;
  }

  function isAdPlaying() {
    const selectors = [
      ".atvwebplayersdk-ad-timer",
      ".atvwebplayersdk-ad-timer-ad-text",
      '[class*="adBreak"]',
    ];
    return selectors.some((sel) => isVisible(document.querySelector(sel)));
  }

  function tryClickSkip() {
    const selectors = [
      ".atvwebplayersdk-adskipbutton",
      ".atvwebplayersdk-skipElement button",
      '[class*="adSkip"] button',
      '[class*="skip-ad"] button',
      'button[class*="skip"]',
    ];
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
    }
    return false;
  }

  function forceAdSpeed() {
    for (const v of document.querySelectorAll("video")) {
      if (v.playbackRate !== 16) v.playbackRate = 16;
      if (!v.muted) v.muted = true;
    }
  }

  function getPlayerContainer() {
    return (
      document.querySelector(".atvwebplayersdk-player-container") ||
      document.querySelector('[id="dv-web-player"]') ||
      document.querySelector("video")?.closest("div")
    );
  }

  function showOverlay() {
    if (overlay) return;
    const container = getPlayerContainer();
    if (!container) return;
    const pos = getComputedStyle(container).position;
    if (pos === "static") container.style.position = "relative";
    overlay = document.createElement("div");
    overlay.style.cssText =
      "position:absolute;inset:0;z-index:2147483646;background:#000;" +
      "display:flex;align-items:center;justify-content:center;" +
      "font:bold 18px/1 sans-serif;color:#888;";
    overlay.textContent = "Ad skipping...";
    container.appendChild(overlay);
  }

  function hideOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  function onAdStart() {
    if (adActive) return;
    adActive = true;
    console.log("[Hayame] Ad detected on Prime Video");
    forceAdSpeed();
    showOverlay();
    controller.showIndicator("AD 16x", true);
    tryClickSkip();
    pollTimer = setInterval(() => {
      if (!isAdPlaying()) {
        onAdEnd();
        return;
      }
      forceAdSpeed();
      tryClickSkip();
    }, 200);
  }

  function onAdEnd() {
    if (!adActive) return;
    adActive = false;
    console.log("[Hayame] Ad ended on Prime Video");
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    hideOverlay();
    for (const v of document.querySelectorAll("video")) {
      v.playbackRate = controller.getSpeed();
      v.muted = false;
    }
    controller.showIndicator(controller.getSpeed().toFixed(1) + "x", false);
  }

  function init() {
    console.log("[Hayame] Prime Video ad skipper initialized");

    observer = new MutationObserver(() => {
      if (isAdPlaying()) {
        onAdStart();
      } else if (adActive) {
        onAdEnd();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    if (isAdPlaying()) onAdStart();
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    hideOverlay();
    if (adActive) onAdEnd();
  }

  function isInAd() {
    return adActive;
  }

  return { init, destroy, isInAd };
}
