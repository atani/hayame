// YouTube Ad Skipper Module
// eslint-disable-next-line no-unused-vars
function createYouTubeAdSkipper(controller) {
  let classObserver = null;
  let domObserver = null;
  let adActive = false;

  function getPlayerContainer() {
    return document.querySelector("#movie_player, .html5-video-player");
  }

  function isAdPlaying(container) {
    if (!container) return false;
    return container.classList.contains("ad-showing");
  }

  function tryClickSkip() {
    const selectors = [
      ".ytp-skip-ad-button",
      ".ytp-ad-skip-button",
      ".ytp-ad-skip-button-modern",
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
    const container = getPlayerContainer();
    if (!container) {
      setTimeout(init, 1000);
      return;
    }

    if (isAdPlaying(container)) onAdStart();

    classObserver = new MutationObserver(() => {
      if (isAdPlaying(container)) {
        onAdStart();
        tryClickSkip();
      } else {
        onAdEnd();
      }
    });
    classObserver.observe(container, { attributes: true, attributeFilter: ["class"] });

    // Watch for skip buttons appearing
    domObserver = new MutationObserver(() => {
      if (adActive) tryClickSkip();
    });
    domObserver.observe(document.body, { childList: true, subtree: true });
  }

  function destroy() {
    if (classObserver) classObserver.disconnect();
    if (domObserver) domObserver.disconnect();
    classObserver = null;
    domObserver = null;
    if (adActive) onAdEnd();
  }

  function isInAd() {
    return adActive;
  }

  return { init, destroy, isInAd };
}
