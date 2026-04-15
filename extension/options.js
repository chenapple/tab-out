'use strict';

const DEFAULT_SETTINGS = {
  theme: 'system',
  staleThresholdDays: 7,
  sound: true,
  animation: true,
  customLandingHostnames: [],
};

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 1800);
}

async function loadSettings() {
  const { settings = {} } = await chrome.storage.local.get('settings');
  const s = { ...DEFAULT_SETTINGS, ...settings };

  document.getElementById('theme').value = s.theme;
  document.getElementById('sound').checked = s.sound;
  document.getElementById('animation').checked = s.animation;
  document.getElementById('staleThresholdDays').value = String(s.staleThresholdDays);
  document.getElementById('customLandingHostnames').value =
    (s.customLandingHostnames || []).join('\n');

  // Apply theme preview on the options page itself
  applyThemePreview(s.theme);
}

function applyThemePreview(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

async function saveSettings() {
  const { settings = {} } = await chrome.storage.local.get('settings');

  const customRaw = document.getElementById('customLandingHostnames').value;
  const customLandingHostnames = customRaw
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const updated = {
    ...settings,
    theme: document.getElementById('theme').value,
    sound: document.getElementById('sound').checked,
    animation: document.getElementById('animation').checked,
    staleThresholdDays: Number(document.getElementById('staleThresholdDays').value),
    customLandingHostnames,
  };

  await chrome.storage.local.set({ settings: updated });
  showToast();

  // Update theme preview
  applyThemePreview(updated.theme);
}

// Load on startup
loadSettings();

// Save on any change
document.addEventListener('change', saveSettings);
document.addEventListener('input', (e) => {
  if (e.target.id === 'customLandingHostnames') {
    // Debounce textarea saves
    clearTimeout(e.target._saveTimer);
    e.target._saveTimer = setTimeout(saveSettings, 600);
  }
});
