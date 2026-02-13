(async () => {
  const speedEl = document.getElementById("speed");
  const stored = await chrome.storage.local.get({ speed: 1.0 });
  let speed = stored.speed;

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
})();
