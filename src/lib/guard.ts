/**
 * Environment & Hostname Guards for ticket-pill
 * Ensures the overlay and endpoints only run on localhost and never in production.
 */

export function isLocalhostHostname(hostname: string): boolean {
  if (!hostname) return false;
  const clean = hostname.split(":")[0].toLowerCase();
  return (
    clean === "localhost" ||
    clean === "127.0.0.1" ||
    clean.endsWith(".localhost") ||
    clean.endsWith(".local")
  );
}

export function isLocalhostClient(): boolean {
  if (typeof window === "undefined") return false;
  return isLocalhostHostname(window.location.hostname);
}

export function isLocalhostServer(req: Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "";
  return isLocalhostHostname(host);
}
