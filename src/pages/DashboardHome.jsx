import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Building2, CalendarRange, AlertTriangle, FileSpreadsheet, GraduationCap, ArrowRight,
} from 'lucide-react';
import { PageHeader, StatCard, CountUp } from '../components/ui';
import { API, APIReady } from '../lib/api';
import { useInstitution } from '../lib/useInstitution';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const inst = useInstitution();

  useEffect(() => {
    const load = async () => {
      try {
        // Wait for the API-base probe (localhost -> 127.0.0.1 -> [::1] fallback)
        await APIReady;
        const [db, depts, sess] = await Promise.all([
          fetch(`${API}/api/debug/db-check`).then(r => r.json()),
          fetch(`${API}/api/departments`).then(r => r.json()),
          fetch(`${API}/api/sessions`).then(r => r.json()),
        ]);
        setStats({
          students: db.total_students ?? 0,
          db: db.connected_database ?? '—',
          departments: Array.isArray(depts) ? depts.length : 0,
          deptNames: Array.isArray(depts) ? depts.slice(0, 5) : [],
          sessions: Array.isArray(sess) ? sess.length : 0,
          current: Array.isArray(sess) ? (sess.find(s => s.name) || { name: '—' }) : { name: '—' },
        });
      } catch {
        setLoadFailed(true);
      }
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Academic Records Office"
        title="Dashboard"
        subtitle="Live overview of the records database: registry, departments, sessions and carry-over pipeline."
      />

      {/* Hero band — current session, the operating state of the system */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 rounded-2xl bg-ink text-white px-8 py-7 flex flex-wrap items-center justify-between gap-6 shadow-[0_18px_40px_-18px_rgba(16,30,56,0.5)]"
      >
        <div>
          {/* Institution identity — this university's own crest and name */}
          <div className="flex items-center gap-3 mb-4">
            {inst.logo_url ? (
              <img
                src={`${API}${inst.logo_url}`}
                alt={`${inst.caps_name || 'Institution'} logo`}
                className="h-11 max-w-[210px] rounded-lg bg-white/95 p-1.5 object-contain shadow-sm"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-white/15 grid place-items-center">
                <GraduationCap size={20} className="text-white/80" />
              </div>
            )}
            <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-white/50 leading-snug">
              {inst.caps_name || 'University Records'}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brass animate-pulse" />
            <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-white/50">Current session</span>
          </div>
          <div className="font-display text-4xl font-semibold tracking-tight">
            {stats ? stats.current.name : 'Loading…'}
          </div>
          <div className="text-white/55 text-sm mt-1.5">
            {stats ? `${stats.sessions} academic sessions on record` : '…'}
          </div>
        </div>
        <div className="flex gap-8 border-l border-white/10 pl-8">
          <div>
            <div className="font-display text-3xl font-semibold tabular-nums">
              <CountUp value={stats?.students ?? 0} />
            </div>
            <div className="text-[11px] text-white/45 font-mono tracking-[0.14em] uppercase mt-1">Students</div>
          </div>
          <div>
            <div className="font-display text-3xl font-semibold tabular-nums">
              <CountUp value={stats?.departments ?? 0} />
            </div>
            <div className="text-[11px] text-white/45 font-mono tracking-[0.14em] uppercase mt-1">Departments</div>
          </div>
          <div>
            <div className="font-display text-3xl font-semibold tabular-nums">
              <CountUp value={stats?.sessions ?? 0} />
            </div>
            <div className="text-[11px] text-white/45 font-mono tracking-[0.14em] uppercase mt-1">Sessions</div>
          </div>
        </div>
      </motion.div>

      {loadFailed && (
        <div className="mb-6 rounded-xl border border-fail/25 bg-fail/5 text-fail px-5 py-4 text-sm flex items-center gap-2.5">
          <AlertTriangle size={17} /> The records server is unreachable on localhost:8000 — start the Python backend, then reload.
        </div>
      )}

      {/* Quick actions into each workflow */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Student Registry" value={stats?.students ?? 0} note="Enrolment records live" delay={0.05} />
        <StatCard icon={Building2} label="Departments" value={stats?.departments ?? 0} note="Full department codes" delay={0.12} />
        <StatCard icon={CalendarRange} label="Sessions" value={stats?.sessions ?? 0} note="2004/2005 → 2024/2025" delay={0.19} />
        <StatCard icon={FileSpreadsheet} label="Report bundle" value={3} note="Broadsheet · Summary · Cover" delay={0.26} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }}
          className="bg-white border border-line rounded-xl p-6"
        >
          <h3 className="font-display text-lg font-semibold text-ink mb-4">Workflows</h3>
          <div className="space-y-2">
            {[
              { icon: GraduationCap, t: 'Student Registry', d: 'Add and maintain every enrolment record', to: 'students' },
              { icon: FileSpreadsheet, t: 'Result Entry', d: 'Enter course work and exam scores with live grading', to: 'results' },
              { icon: FileSpreadsheet, t: 'BroadSheet Manager', d: 'Generate the official three-file report bundle', to: 'broadsheet' },
              { icon: FileSpreadsheet, t: 'Transcripts', d: 'Official per-student transcript and session slips', to: 'transcript' },
            ].map((w) => (
              <button
                key={w.t}
                onClick={() => w.to && window.dispatchEvent(new CustomEvent('arpis-navigate', { detail: w.to }))}
                className="w-full group flex items-center gap-4 p-3.5 rounded-lg border border-transparent hover:border-line hover:bg-paper/70 transition text-left"
              >
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-ink/5 text-ink group-hover:bg-seal/10 group-hover:text-seal transition-colors">
                  <w.icon size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink">{w.t}</span>
                  <span className="block text-xs text-mute">{w.d}</span>
                </span>
                <ArrowRight size={15} className="text-line group-hover:text-seal group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.45 }}
          className="bg-white border border-line rounded-xl p-6"
        >
          <h3 className="font-display text-lg font-semibold text-ink mb-4">Departments on record</h3>
          <div className={`space-y-2.5 ${stats ? '' : 'animate-pulse'}`}>
            {(stats?.deptNames || [0, 0, 0, 0, 0]).map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-mute w-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="h-px flex-1 bg-line" />
                <span className="text-sm text-ink font-medium">{d?.name || '…'}</span>
              </div>
            ))}
          </div>
          {stats && (
            <p className="text-[11.5px] text-mute mt-4">
              {stats.departments > 5 ? `and ${stats.departments - 5} more — see Departments.` : ''}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}