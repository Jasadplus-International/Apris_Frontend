import { useEffect, useState } from 'react';
import { API } from './api';

let cache = null;        // module-level so every page shares one fetch
let pending = null;

const load = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch(`${API}/api/institution`)
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
  }, []);
  return profile || { display_name: '', caps_name: '', logo_url: null, report_defaults: {} };
}