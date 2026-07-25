/**
 * Global Feed Video Manager
 * Manages global audio preference (muted/unmuted) and single active video playback
 * for an Instagram-like video experience on the Home Feed.
 */

const STORAGE_KEY = 'evoa_feed_muted';
const EVENT_NAME = 'evoa:audio-preference-changed';

// Read initial preference from localStorage (default to true/muted if not set)
let globalMuted = (() => {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val !== null ? val === 'true' : true;
  } catch (_) {
    return true;
  }
})();

let currentActiveVideo = null;

export const getGlobalMuted = () => globalMuted;

export const setGlobalMuted = (muted) => {
  globalMuted = Boolean(muted);
  try {
    localStorage.setItem(STORAGE_KEY, String(globalMuted));
  } catch (_) {}

  // Broadcast change to all active video instances
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { muted: globalMuted },
    })
  );
};

export const registerActiveVideo = (videoEl) => {
  if (!videoEl) return;
  // If another video is currently active and it's not this video, pause it immediately
  if (currentActiveVideo && currentActiveVideo !== videoEl) {
    try {
      if (!currentActiveVideo.paused) {
        currentActiveVideo.pause();
      }
    } catch (_) {}
  }
  currentActiveVideo = videoEl;
};

export const unregisterActiveVideo = (videoEl) => {
  if (currentActiveVideo === videoEl) {
    currentActiveVideo = null;
  }
};
