import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, ClipboardEdit, FileSpreadsheet,
  ScrollText, Building2, UserPlus, BookOpen, Database,
} from 'lucide-react';
import { useInstitution, useInstitutionVersion } from '../lib/useInstitution';
import { API } from '../lib/api';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Student Registry', hint: 'Enrolment records', icon: Users },
  { id: 'results', label: 'Result Entry', hint: 'Scores & grades', icon: ClipboardEdit },
  { id: 'registration', label: 'Registration', hint: 'Course registration', icon: UserPlus },
  { id: 'broadsheet', label: 'BroadSheet Mgr', hint: 'Official reports', icon: FileSpreadsheet },
  { id: 'transcript', label: 'Transcripts', hint: 'Per student', icon: ScrollText },
  { id: 'departments', label: 'Departments', hint: 'Configure', icon: Building2 },
  { id: 'courses', label: 'Courses', hint: 'Catalogue', icon: BookOpen },
  { id: 'institution', label: 'Institution', hint: 'Legacy DB import', icon: Database },
];

export default function Sidebar({ setActivePage, activePage, setSlipData }) {
  const inst = useInstitution();
  useInstitutionVersion(); // re-render on institution change

  return (
    <aside className="w-[248px] shrink-0 bg-ink text-white flex flex-col h-screen">
      {/* Brand */}
      <div className="px-6 pt-6 pb-6 border-b border-white/10">
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
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-5 space-y-1">
        {menuItems.map((item) => {
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
        })}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-white/10 text-[10.5px] text-white/35 leading-relaxed">
        <div className="font-mono tracking-wide uppercase text-white/45">{inst.caps_name || 'ARPIS'}</div>
        <div className="mt-1">Successor to ARPIS 2005 (VB6)</div>
      </div>
    </aside>
  );
}