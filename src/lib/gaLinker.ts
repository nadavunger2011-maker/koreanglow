/**
 * Decorates a URL with Google Analytics cross-domain linker parameters
 * so that GA sessions persist between this site and the Shopify checkout.
 *
 * GTM's auto-linker only decorates real <a> clicks. When we redirect via
 * window.open / location.href we must append the `_ga` (and `_gl`) params
 * ourselves, otherwise the checkout domain starts a new session.
 */
export function decorateUrlForCrossDomain(url: string): string {
  if (typeof window === "undefined" || typeof document === "undefined") return url;

  try {
    const decorated = new URL(url, window.location.href);

    // Preferred path: ask gtag to build a proper _gl linker token (GA4-compatible, hashed).
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      try {
        // Synchronous call — gtag linker plugin returns the decorated URL via callback.
        let linked: string | null = null;
        gtag("get", "linker", "decorate", (value: string) => {
          linked = value;
        });
        if (linked) return linked;
      } catch {
        // fall through to cookie-based fallback
      }
    }

    // Fallback: copy the raw `_ga` cookie value (Client ID) onto the URL.
    // Shopify reads `_ga` and stitches the session when GA is configured there.
    const gaCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("_ga="));
    if (gaCookie) {
      const value = gaCookie.substring("_ga=".length);
      if (value && !decorated.searchParams.has("_ga")) {
        decorated.searchParams.set("_ga", value);
      }
    }

    // Also forward any _ga_<MEASUREMENT_ID> cookies (GA4 session cookies).
    document.cookie
      .split("; ")
      .filter((c) => c.startsWith("_ga_"))
      .forEach((c) => {
        const [name, ...rest] = c.split("=");
        const value = rest.join("=");
        if (name && value && !decorated.searchParams.has(name)) {
          decorated.searchParams.set(name, value);
        }
      });

    return decorated.toString();
  } catch {
    return url;
  }
}