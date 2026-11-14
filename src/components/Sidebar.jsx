import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, ClipboardEdit, FileSpreadsheet,
  ScrollText, Building2, UserPlus, BookOpen, Database,
  Home, LogOut, ChevronDown, ShieldCheck, UserCog, Repeat2,
} from 'lucide-react';
import { useInstitution, useInstitutionVersion, refreshInstitution } from '../lib/useInstitution';
import { API, authFetch } from '../lib/api';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Student Registry', hint: 'Enrolment records', icon: Users },
  { id: 'results', label: 'Result Entry', hint: 'Scores & grades', icon: ClipboardEdit },
  { id: 'carryovers', label: 'Carry-overs', hint: 'Repeat tracking', icon: Repeat2 },
  { id: 'registration', label: 'Registration', hint: 'Course registration', icon: UserPlus },
  { id: 'broadsheet', label: 'BroadSheet Mgr', hint: 'Official reports', icon: FileSpreadsheet },
  { id: 'transcript', label: 'Transcripts', hint: 'Per student', icon: ScrollText },
  { id: 'departments', label: 'Departments', hint: 'Configure', icon: Building2 },
  { id: 'courses', label: 'Courses', hint: 'Catalogue', icon: BookOpen },
  { id: 'institution', label: 'Institution', hint: 'Workbook / .mdb import', icon: Database },
];

// Operator-only items (appended to the menu when the platform admin is signed in)
const operatorItems = [
  { id: 'approvals', label: 'Approvals', hint: 'New institutions', icon: ShieldCheck },
];

// Registry-management item (only for university Admin / Developer accounts)
const MANAGE_ROLES = ['Admin', 'Developer'];
const managerItems = [
  { id: 'users', label: 'User accounts', hint: 'Staff access', icon: UserCog },
];

export default function Sidebar({ setActivePage, activePage, setSlipData, onSignOut }) {
  const inst = useInstitution();
  useInstitutionVersion(); // re-render on institution change

  // Platform isolation: a university must never learn that other universities
  // exist. Only the platform operator (SUPERADMIN) gets the switcher.
  const isSuperAdmin = (() => {
    try { return localStorage.getItem('arpis_role') === 'SUPERADMIN'; } catch { return false; }
  })();
  const myRole = (() => {
    try { return localStorage.getItem('arpis_role') || ''; } catch { return ''; }
  })();

  const [profiles, setProfiles] = useState([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return; // university accounts: never fetch the platform roster
    const load = () =>
      authFetch(`${API}/api/database/profiles`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setProfiles)
        .catch(() => {});
    load();
    const off = () => load();
    window.addEventListener('arpis-institution-changed', off);
    return () => window.removeEventListener('arpis-institution-changed', off);
  }, [isSuperAdmin]);

  const switchInstitution = async (code) => {
    if (!code || code === inst.code || switching) return;
    setSwitching(true);
    try {
      const r = await authFetch(`${API}/api/database/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (r.ok) {
        refreshInstitution(); // every page re-reads the new profile
        setActivePage('dashboard');
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <aside className="w-[248px] shrink-0 bg-ink text-white flex flex-col h-screen">
      {/* Brand */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <button
          onClick={() => setActivePage('landing')}
          title="Back to the home page"
          className="w-full text-left"
        >
          <div className="flex items-center gap-3">
            {inst.logo_url ? (
              <img src={`${API}${inst.logo_url}`} alt="Institution logo" className="w-10 h-10 rounded-lg object-contain bg-white/95 p-0.5" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-seal grid place-items-center">
                <span className="font-display font-bold text-lg leading-none">A</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="font-display text-[16px] font-semibold tracking-tight leading-tight truncate">{inst.display_name || 'ARPIS'}</div>
              <div className="text-[9.5px] tracking-[0.2em] text-white/45 mt-0.5 font-mono uppercase">Records · v2.0</div>
            </div>
          </div>
        </button>

        {/* Platform switcher — SUPERADMIN only; universities never see other institutions */}
        {isSuperAdmin && profiles.length > 1 && (
          <div className="relative mt-3">
            <select
              value={inst.code || profiles.find((p) => p.active)?.code || ''}
              onChange={(e) => switchInstitution(e.target.value)}
              disabled={switching}
              className="w-full appearance-none rounded-lg bg-ink-2 border border-white/10 hover:border-white/25 text-[12px] text-white/80 pl-3 pr-8 py-2 cursor-pointer outline-none focus:border-brass"
            >
              {profiles.map((p) => (
                <option key={p.code} value={p.code} className="bg-ink-2">
                  {p.display_name}{p.active ? '  ✓' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-5 space-y-1 overflow-y-auto">
        {(() => {
          const items = [...menuItems];
          if (isSuperAdmin) items.push(...operatorItems);
          else if (MANAGE_ROLES.includes(myRole)) items.splice(4, 0, ...managerItems);
          return items.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                active ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                />
              )}
              <item.icon size={17.5} strokeWidth={2} className={`relative z-10 transition-colors ${active ? 'text-brass' : ''}`} />
              <span className="relative z-10 flex-1">
                <span className="block text-[13.5px] font-medium leading-tight">{item.label}</span>
                <span className={`block text-[10.5px] leading-tight mt-px ${active ? 'text-white/45' : 'text-white/25'}`}>{item.hint}</span>
              </span>
            </button>
          );
          });
        })()}
      </nav>

      {/* Home / Log out */}
      <div className="px-3 pb-3 space-y-1">
        <button
          onClick={() => setActivePage('landing')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Home size={17} strokeWidth={2} />
          <span className="text-[13px] font-medium">Home page</span>
        </button>
        <button
          onClick={() => {
            try {
              localStorage.removeItem('arpis_token');
              localStorage.removeItem('arpis_role');
            } catch {}
            onSignOut?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/55 hover:text-[#ff8f94] hover:bg-white/5 transition-colors"
        >
          <LogOut size={17} strokeWidth={2} />
          <span className="text-[13px] font-medium">Log out</span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-white/10 text-[10.5px] text-white/35 leading-relaxed">
        <div className="font-mono tracking-wide uppercase text-white/45">{inst.caps_name || 'ARPIS'}</div>
        <div className="mt-1">Powered by JasadPlus Services International</div>
      </div>
    </aside>
  );
}
