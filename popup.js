(async () => {
  const speedEl = document.getElementById("speed");
  const rememberEl = document.getElementById("rememberSpeed");
  const stored = await chrome.storage.local.get({ speed: 1.0, rememberSpeed: false });
  let speed = stored.speed;

  rememberEl.checked = stored.rememberSpeed;
  rememberEl.addEventListener("change", () => {
    chrome.storage.local.set({ rememberSpeed: rememberEl.checked });
  });

  function render() {
    speedEl.textContent = speed.toFixed(1) + "x";
  }

  function clamp(v) {
    return Math.round(Math.max(0.1, Math.min(16, v)) * 10) / 10;
  }

  async function setSpeed(v) {
    speed = clamp(v);
    render();
    await chrome.storage.local.set({ speed });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "setSpeed", speed }).catch(() => {});
    }
  }

  document.getElementById("faster").addEventListener("click", () => setSpeed(speed + 0.1));
  document.getElementById("slower").addEventListener("click", () => setSpeed(speed - 0.1));
  document.getElementById("reset").addEventListener("click", () => setSpeed(1.0));

  render();

  // Site-specific options
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";

  if (url.includes("dazn.com")) {
    document.getElementById("siteOptions").hidden = false;
    document.getElementById("siteOptionsTitle").textContent = "DAZN";
    const fanZoneEl = document.getElementById("daznFanZone");
    const fanZoneOption = document.getElementById("daznFanZoneOption");
    fanZoneOption.hidden = false;
    const { daznFanZone } = await chrome.storage.local.get({ daznFanZone: false });
    fanZoneEl.checked = daznFanZone;
    fanZoneEl.addEventListener("change", () => {
      chrome.storage.local.set({ daznFanZone: fanZoneEl.checked });
    });
  }
})();
