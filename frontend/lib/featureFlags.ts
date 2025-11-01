/**
 * Simple feature flags utility.
 *
 * Flags are enabled if any of the following is true:
 * - NEXT_PUBLIC_FEATURE_<FLAG> env var is '1' or 'true'
 * - URL search param <flag>=1 or true (client-side only)
 */

export function isFeatureEnabled(
  flag: string,
  opts?: { searchParams?: Record<string, string | string[] | undefined> }
): boolean {
  const envKey = `NEXT_PUBLIC_FEATURE_${flag.replace(/-/g, '_').toUpperCase()}`;
  if (typeof process !== 'undefined' && process.env && envKey in process.env) {
    const v = String(process.env[envKey] || '').toLowerCase();
    if (v === '1' || v === 'true') return true;
  }

  // Prefer server-provided searchParams when available to avoid SSR/CSR divergence
  if (opts?.searchParams) {
    const raw = opts.searchParams[flag];
    const v = Array.isArray(raw) ? raw[0] : raw;
    const low = String(v || '').toLowerCase();
    if (low === '1' || low === 'true') return true;
  }

  // Client-side URL param check
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      const v = (url.searchParams.get(flag) || '').toLowerCase();
      if (v === '1' || v === 'true') return true;
    } catch {}
  }

  return false;
}
