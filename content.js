(() => {
  "use strict";

  const STEP = 0.1;
  const MIN_SPEED = 0.1;
  const MAX_SPEED = 16;
  const SEEK_SEC = 10;
  const INDICATOR_DURATION = 2000;

  let speed = 1.0;
  let prevSpeed = 1.0;
  let adSkipper = null;
  const managedVideos = new WeakSet();
  const indicators = new WeakMap();
  let hideTimer = 0;
  let helpEl = null;
  let helpVisible = false;

  // --- Speed helpers ---

  function clamp(v) {
    return Math.round(Math.max(MIN_SPEED, Math.min(MAX_SPEED, v)) * 10) / 10;
  }

  function applySpeed(video) {
    if (adSkipper && adSkipper.isInAd()) return; // ad skipper controls speed
    video.playbackRate = speed;
  }

  function applyAll() {
    for (const v of document.querySelectorAll("video")) applySpeed(v);
  }

  function setSpeed(newSpeed) {
    prevSpeed = speed;
    speed = clamp(newSpeed);
    chrome.storage.local.set({ speed });
    applyAll();
    showIndicatorAll(speed.toFixed(1) + "x", false);
  }

  // --- Indicator ---

  function ensureIndicator(video) {
    if (indicators.has(video)) return indicators.get(video);
    const parent = video.parentElement;
    if (!parent) return null;
    // Ensure parent is positioned
    const pos = getComputedStyle(parent).position;
    if (pos === "static") parent.style.position = "relative";
    const el = document.createElement("div");
    el.className = "vsc-indicator";
    parent.appendChild(el);
    indicators.set(video, el);
    return el;
  }

  function showIndicatorAll(text, isAd) {
    for (const v of document.querySelectorAll("video")) {
      showIndicatorFor(v, text, isAd);
    }
  }

  function showIndicatorFor(video, text, isAd) {
    const el = ensureIndicator(video);
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("vsc-ad", isAd);
    el.classList.add("vsc-visible");
    clearTimeout(hideTimer);
    if (!isAd) {
      hideTimer = setTimeout(() => el.classList.remove("vsc-visible"), INDICATOR_DURATION);
    }
  }

  // --- Controller interface for site modules ---

  const controller = {
    getSpeed: () => speed,
    showIndicator: (text, isAd) => showIndicatorAll(text, isAd),
  };

  // --- Video management ---

  function manage(video) {
    if (managedVideos.has(video)) return;
    managedVideos.add(video);
    applySpeed(video);
  }

  function scan() {
    for (const v of document.querySelectorAll("video")) manage(v);
  }

  // MutationObserver for dynamically added videos
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.tagName === "VIDEO") manage(node);
        else if (node.querySelectorAll) {
          for (const v of node.querySelectorAll("video")) manage(v);
        }
      }
    }
  });

  // --- Help overlay ---

  const HELP_ITEMS = [
    ["Shift+D", "Speed up (+0.1)"],
    ["Shift+S", "Slow down (-0.1)"],
    ["Shift+A", "Reset / restore"],
    ["Shift+Z", "Rewind 10s"],
    ["Shift+C", "Forward 10s"],
    ["Shift+\\", "Toggle this help"],
  ];

  function toggleHelp() {
    if (!helpEl) {
      helpEl = document.createElement("div");
      helpEl.className = "hayame-help";
      const title = document.createElement("div");
      title.className = "hayame-help-title";
      title.textContent = "Hayame";
      helpEl.appendChild(title);
      for (const [key, desc] of HELP_ITEMS) {
        const row = document.createElement("div");
        row.className = "hayame-help-row";
        const k = document.createElement("span");
        k.className = "hayame-help-key";
        k.textContent = key;
        const d = document.createElement("span");
        d.className = "hayame-help-desc";
        d.textContent = desc;
        row.appendChild(k);
        row.appendChild(d);
        helpEl.appendChild(row);
      }
      const footer = document.createElement("div");
      footer.className = "hayame-help-footer";
      footer.textContent = "Current: " + speed.toFixed(1) + "x";
      helpEl.appendChild(footer);
      document.body.appendChild(helpEl);
    }
    helpEl.querySelector(".hayame-help-footer").textContent = "Current: " + speed.toFixed(1) + "x";
    helpVisible = !helpVisible;
    helpEl.classList.toggle("vsc-visible", helpVisible);
  }

  // --- Keyboard shortcuts ---

  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function onKeyDown(e) {
    if (isEditable(e.target)) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (!e.shiftKey) return;

    const key = e.key.toUpperCase();
    switch (key) {
      case "D":
        e.preventDefault();
        e.stopPropagation();
        setSpeed(speed + STEP);
        break;
      case "S":
        e.preventDefault();
        e.stopPropagation();
        setSpeed(speed - STEP);
        break;
      case "A":
        e.preventDefault();
        e.stopPropagation();
        if (speed === 1.0) {
          setSpeed(prevSpeed);
        } else {
          setSpeed(1.0);
        }
        break;
      case "Z": {
        e.preventDefault();
        e.stopPropagation();
        for (const v of document.querySelectorAll("video")) {
          v.currentTime = Math.max(0, v.currentTime - SEEK_SEC);
        }
        showIndicatorAll("-10s", false);
        break;
      }
      case "C": {
        e.preventDefault();
        e.stopPropagation();
        for (const v of document.querySelectorAll("video")) {
          v.currentTime = Math.min(v.duration || Infinity, v.currentTime + SEEK_SEC);
        }
        showIndicatorAll("+10s", false);
        break;
      }
      case "|":
        e.preventDefault();
        e.stopPropagation();
        toggleHelp();
        break;
    }
  }

  // --- Message from popup ---

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "setSpeed") {
      setSpeed(msg.speed);
    }
  });

  // --- Init ---

  async function init() {
    const stored = await chrome.storage.local.get({ speed: 1.0 });
    speed = stored.speed;

    scan();
    mo.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("keydown", onKeyDown, true);

    // Init site-specific ad skipper
    const host = location.hostname;
    if (host.includes("youtube.com") && typeof createYouTubeAdSkipper === "function") {
      adSkipper = createYouTubeAdSkipper(controller);
      adSkipper.init();
    } else if (
      (host.includes("amazon.co") || host.includes("amazon.com") || host.includes("primevideo.com")) &&
      typeof createPrimeVideoAdSkipper === "function"
    ) {
      adSkipper = createPrimeVideoAdSkipper(controller);
      adSkipper.init();
    }
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
