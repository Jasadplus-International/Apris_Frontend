import { useEffect, useState, useCallback } from 'react';
import { API, APIReady } from './api';

let cache = null;        // module-level so every page shares one fetch
let pending = null;

const load = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = APIReady.then(() => fetch(`${API}/api/institution`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        cache = data || {
          display_name: 'ARPIS University',
          caps_name: 'ARPIS UNIVERSITY',
          logo_url: null,
          report_defaults: {},
        };
        return cache;
      })
      .catch(() => {
        cache = { display_name: 'ARPIS University', caps_name: 'ARPIS UNIVERSITY', logo_url: null, report_defaults: {} };
        return cache;
      })
      .finally(() => { pending = null; });
  }
  return pending;
};

export function useInstitution() {
  const [profile, setProfile] = useState(cache);
  useEffect(() => {
    if (!cache) load().then(setProfile);
    // when another page activates a different university, follow along
    const h = () => load().then(setProfile);
    window.addEventListener('arpis-institution-changed', h);
    return () => window.removeEventListener('arpis-institution-changed', h);
  }, []);
  return profile || { display_name: '', caps_name: '', logo_url: null, report_defaults: {} };
}

let version = 0; // bumped on refresh so components can re-render

export function useInstitutionVersion() {
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force(v => v + 1);
    window.addEventListener('arpis-institution-changed', h);
    return () => window.removeEventListener('arpis-institution-changed', h);
  }, []);
  return version;
}

/* Force every live page to re-read the institution profile (after activation) */
export function refreshInstitution() {
  version += 1;
  cache = null;
  pending = null;
  load();
  window.dispatchEvent(new CustomEvent('arpis-institution-changed'));
}

export function onInstitutionChanged(handler) {
  window.addEventListener('arpis-institution-changed', handler);
  return () => window.removeEventListener('arpis-institution-changed', handler);
}