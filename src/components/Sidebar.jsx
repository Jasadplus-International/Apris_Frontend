import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, ClipboardEdit, FileSpreadsheet,
  ScrollText, Building2, UserPlus, BookOpen, Database,
  Home, LogOut, ChevronDown, ShieldCheck, UserCog, Repeat2, LifeBuoy, X,
} from 'lucide-react';
import { useInstitution, useInstitutionVersion, refreshInstitution } from '../lib/useInstitution';
import { API, authFetch } from '../lib/api';

// Menus grouped by category — the labels double as plain-language descriptions
// of what each cluster is for.
const MENU_GROUPS = [
  { label: 'Records', items: [
      { id: 'dashboard', label: 'Dashboard', hint: 'Overview', icon: LayoutDashboard },
      { id: 'students', label: 'Student Registry', hint: 'Enrolment records', icon: Users },
      { id: 'registration', label: 'Registration', hint: 'Course registration', icon: UserPlus },
      { id: 'carryovers', label: 'Carry-overs', hint: 'Repeat tracking', icon: Repeat2 },
      { id: 'results', label: 'Result Entry', hint: 'Scores & grades', icon: ClipboardEdit },
  ]},
  { label: 'Reports', items: [
      { id: 'broadsheet', label: 'BroadSheet Mgr', hint: 'Official reports', icon: FileSpreadsheet },
      { id: 'transcript', label: 'Transcripts', hint: 'Per student', icon: ScrollText },
  ]},
  { label: 'Setup', items: [
      { id: 'departments', label: 'Departments', hint: 'Configure', icon: Building2 },
      { id: 'courses', label: 'Courses', hint: 'Catalogue', icon: BookOpen },
      { id: 'institution', label: 'Institution', hint: 'Workbook / .mdb import', icon: Database },
  ]},
];

const MANAGE_ROLES = ['Admin', 'Developer'];
const ADMIN_GROUP = { label: 'Administration', items: [
  { id: 'users', label: 'User accounts', hint: 'Staff access', icon: UserCog },
]};
const OPERATOR_GROUP = { label: 'Platform', items: [
  { id: 'approvals', label: 'Approvals', hint: 'New institutions', icon: ShieldCheck },
]};
const SUPPORT_GROUP = { label: 'Support', items: [
  { id: 'help', label: 'Help guide', hint: 'How to use ARPIS', icon: LifeBuoy },
]};

export default function Sidebar({ setActivePage, activePage, setSlipData, onSignOut, menuOpen, onCloseMenu }) {
  const inst = useInstitution();
  useInstitutionVersion(); // re-render on institution change

  const isSuperAdmin = (() => {
    try { return localStorage.getItem('arpis_role') === 'SUPERADMIN'; } catch { return false; }
  })();
  const myRole = (() => {
    try { return localStorage.getItem('arpis_role') || ''; } catch { return ''; }
  })();

  // compose the groups for this role
  const groups = MENU_GROUPS
    .concat(MANAGE_ROLES.includes(myRole) ? [ADMIN_GROUP] : [])
    .concat(isSuperAdmin ? [OPERATOR_GROUP] : [])
    .concat([SUPPORT_GROUP]);

  const nav = (id) => {
    setActivePage(id);
    onCloseMenu?.();
  };

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
        nav('dashboard');
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[262px] shrink-0 bg-ink text-white flex flex-col h-screen
      transition-transform duration-200 md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* drawer close (mobile only) */}
      <button
        onClick={onCloseMenu}
        aria-label="Close menu"
        className="md:hidden absolute right-3 top-3 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
      >
        <X size={17} />
      </button>

      {/* Brand */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10 pr-10 md:pr-6">
        <button
          onClick={() => nav('landing')}
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
              <div className="text-[9.5px] tracking-[0.2em] text-white/45 mt-0.5 font-mono uppercase">ARPIS by JasadPlus</div>
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

      {/* Grouped nav */}
      <nav className="flex-1 px-3 pt-4 pb-2 space-y-4 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-1.5 text-[9.5px] font-mono tracking-[0.22em] uppercase text-white/30 select-none">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => nav(item.id)}
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
                    <span className="relative z-10 flex-1 min-w-0">
                      <span className="block text-[13.5px] font-medium leading-tight">{item.label}</span>
                      <span className={`block text-[10.5px] leading-tight mt-px ${active ? 'text-white/45' : 'text-white/25'}`}>{item.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Home / Log out */}
      <div className="px-3 pb-3 space-y-1">
        <button
          onClick={() => nav('landing')}
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
            onCloseMenu?.();
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
        <div className="mt-2 text-white/40">ARPIS is a product of</div>
        <div className="text-white/55 font-medium">JasadPlus Services International</div>
      </div>
    </aside>
  );
}
