export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const isLocalhost =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "[::1]";

  // Avoid dev caching surprises; register only for production builds.
  if (import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // Intentionally swallow errors; PWA is progressive enhancement.
      });

    // If you're testing registration in production locally, localhost is still fine.
    void isLocalhost;
  });
}
