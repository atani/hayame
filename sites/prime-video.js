// Amazon Prime Video Ad Skipper Module
// eslint-disable-next-line no-unused-vars
function createPrimeVideoAdSkipper(controller) {
  let observer = null;
  let adActive = false;

  function isAdPlaying() {
    if (document.querySelector(".atvwebplayersdk-adtimeindicator-text")) return true;
    if (document.querySelector('[class*="adBreak"]')) return true;
    if (document.querySelector('[class*="ad-overlay"]')) return true;
    return false;
  }

  function tryClickSkip() {
    const selectors = [
      '[class*="skip"] button',
      'button[class*="skip"]',
      '[class*="adSkip"]',
      ".atvwebplayersdk-skipElement button",
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

  function onAdStart() {
    if (adActive) return;
    adActive = true;
    for (const v of document.querySelectorAll("video")) {
      v.playbackRate = 16;
      v.muted = true;
    }
    controller.showIndicator("AD 16x", true);
    tryClickSkip();
  }

  function onAdEnd() {
    if (!adActive) return;
    adActive = false;
    for (const v of document.querySelectorAll("video")) {
      v.playbackRate = controller.getSpeed();
      v.muted = false;
    }
    controller.showIndicator(controller.getSpeed().toFixed(1) + "x", false);
  }

  function init() {
    observer = new MutationObserver(() => {
      if (isAdPlaying()) {
        onAdStart();
        tryClickSkip();
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
    if (adActive) onAdEnd();
  }

  function isInAd() {
    return adActive;
  }

  return { init, destroy, isInAd };
}
