// Central API base — one place to configure (VITE_API_URL overrides for deployments).
// Browsers resolve "localhost" differently (some pick IPv6 ::1, some IPv4),
// so on startup we probe candidate bases and pin the one that actually answers.
// When the page itself is NOT local (a client's device in a demo, or any LAN
// visitor), "localhost" would point at the VISITOR'S machine — so the app
// falls back to its own origin: the backend serves the built SPA, and the dev
// server proxies /api, so the API rides the same host the page came from.
const _localnames = ['localhost', '127.0.0.1', '[::1]', '::1'];
const _defaultBase = _localnames.includes(window.location.hostname)
  ? 'http://localhost:8000'
  : window.location.origin;

export let API = import.meta.env.VITE_API_URL || _defaultBase;

const probe = async () => {
  const bases = [API, 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://[::1]:8000']
    .filter((b, i, all) => b && all.indexOf(b) === i); // de-dupe, pinned base first
  for (const base of bases) {
    try {
      const r = await fetch(`${base}/api/sanity-check`, { cache: 'no-store' });
      if (r.ok) {
        if (base !== API) API = base; // live binding: all importers see the new base
        return true;
      }
    } catch { /* try next candidate */ }
  }
  return false;
};

// Probe once at load to pin a reachable base early (fire and forget).
probe();

// A thenable, not a resolved promise: every `await APIReady` (sign-in etc.)
// re-runs the probe at that moment. A backend that was briefly down (a
// restart) is therefore retried on the next sign-in click instead of the
// page being stuck on a stale "server unreachable" verdict until reload.
export const APIReady = { then: (resolve, reject) => probe().then(resolve, reject) };

// Authenticated fetch: attaches the session token from local storage.
// All app data calls go through this — the backend rejects bare requests.
// A 401 response mid-session clears the dead session and signals the app
// to return to the sign-in screen.
export const authFetch = (url, opts = {}) => {
  let token = null;
  try { token = localStorage.getItem('arpis_token'); } catch {}
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...opts, headers }).then((r) => {
    if (r.status === 401 && token) {
      try {
        localStorage.removeItem('arpis_token');
        localStorage.removeItem('arpis_role');
      } catch {}
      window.dispatchEvent(new CustomEvent('arpis-session-expired'));
    }
    return r;
  });
};