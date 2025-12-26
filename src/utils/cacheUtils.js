/**
 * Cache utilities for managing browser caches
 */

/**
 * Clear all browser caches (Cache Storage, Service Workers, localStorage, sessionStorage)
 * @returns {Promise<boolean>} - Returns true if successful
 */
export const clearAllCaches = async () => {
  try {
    // Clear Cache Storage (Service Worker caches)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Cache Storage cleared');
    }

    // Unregister Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('✅ Service Workers unregistered');
    }

    // Clear localStorage
    localStorage.clear();
    console.log('✅ LocalStorage cleared');

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ SessionStorage cleared');

    return true;
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    return false;
  }
};

/**
 * Force refresh the page and clear caches
 */
export const forceRefresh = async () => {
  await clearAllCaches();
  // Hard reload - bypass cache
  window.location.reload(true);
};

/**
 * Check if there's a new service worker waiting
 * @returns {Promise<boolean>}
 */
export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return registration.waiting !== null;
    }
  }
  return false;
};

/**
 * Apply pending service worker update
 */
export const applyUpdate = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
};
