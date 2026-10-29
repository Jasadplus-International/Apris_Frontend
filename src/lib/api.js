// Central API base — one place to configure (VITE_API_URL overrides for deployments).
// Browsers resolve "localhost" differently (some pick IPv6 ::1, some IPv4),
// so on startup we probe candidate bases and pin the one that actually answers.

export let API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export let APIReady = Promise.resolve(true);

const probe = async () => {
  const bases = import.meta.env.VITE_API_URL
    ? [import.meta.env.VITE_API_URL]
    : ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://[::1]:8000'];
  for (const base of bases) {
    try {
      const r = await fetch(`${base}/api/sanity-check`, { cache: 'no-store' });
      if (r.ok) {
        if (base !== API) API = base; // live binding: all importers see the new base
        APIReady = Promise.resolve(true);
        return;
      }
    } catch { /* try next candidate */ }
  }
  APIReady = Promise.resolve(false);
};

APIReady = probe();