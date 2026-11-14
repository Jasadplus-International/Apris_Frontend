import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Download, Search, History, CircleCheck, CircleX } from 'lucide-react';
import { PageHeader, StatCard, Spinner, EmptyState, Button, Reveal } from '../components/ui';
import { API, authFetch } from '../lib/api';

const statusChip = (s) =>
  s === 'cleared' ? 'text-pass border-pass' : s === 'active' ? 'text-fail border-fail' : 'text-mute border-line';

export default function CarryOvers() {
  const [rows, setRows] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState('active');
  const [sessionId, setSessionId] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // per-student extraction (old records, easily readable back out)
  const [lookupId, setLookupId] = useState('');
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    authFetch(`${API}/api/results/sessions`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]));
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams({ status: status || 'all' });
      if (sessionId) p.set('session_id', sessionId);
      if (q.trim()) p.set('q', q.trim());
      const r = await authFetch(`${API}/api/results/carryovers?${p}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError('Failed to load carry-overs. Confirm the records server is running on port 8000.');
      setRows([]);
    }
    setLoading(false);
  }, [status, sessionId, q]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const downloadCsv = async () => {
    try {
      const r = await authFetch(`${API}/api/results/carryovers/export`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'carryovers.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed:', e); }
  };

  const fetchHistory = async (e) => {
    e?.preventDefault();
    const id = lookupId.trim();
    if (!id) return;
    setHistoryLoading(true); setHistoryError(null); setHistory(null);
    try {
      const r = await authFetch(`${API}/api/results/student-attempt-history?student=${encodeURIComponent(id)}`);
      if (r.status === 404) { setHistoryError('No student with that matric number.'); return; }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setHistory(await r.json());
    } catch {
      setHistoryError('Extraction failed — is the records server running?');
    }
    setHistoryLoading(false);
  };

  const active = rows.filter((r) => r.status === 'active').length;
  const worst = rows.reduce((m, r) => Math.max(m, r.repeats || 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Registry"
        title="Carry-overs"
        subtitle="Every student who failed a course — a counter of repeats per course, session by session. Cleared ones are kept as history, never deleted."
        actions={<Button variant="ghost" icon={Download} onClick={downloadCsv}>Export CSV</Button>}
      />

      <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={CircleX} label="Active carry-overs" value={active}
            note={status === 'cleared' ? 'listing cleared rows' : 'shown in broadsheets'} />
          <StatCard icon={Repeat} label={status === 'all' ? 'Records tracked' : 'Rows shown'} value={rows.length}
            note="one record per student + course" delay={0.06} />
          <StatCard icon={History} label="Highest repeat count" value={worst}
            note="most repeats of one course" delay={0.12} />
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="bg-white border border-line rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Show</label>
            <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active (not yet cleared)</option>
              <option value="cleared">Cleared (history)</option>
              <option value="all">All records</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Failed in session</label>
            <select className="field" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
              <option value="">Any session</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Search</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
              <input className="field pl-9" placeholder="Matric, name or course code…"
                value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
        </div>
      </Reveal>

      {error && (
        <div className="mb-6 rounded-xl border border-fail/25 bg-fail/5 text-fail px-5 py-4 text-sm">{error}</div>
      )}

      {loading ? (
        <Spinner label="Loading carry-over records…" />
      ) : rows.length === 0 ? (
        <Reveal>
          <div className="doc-sheet rounded-xl">
            <EmptyState icon={Repeat} title="No carry-overs here"
              hint="Nothing matches this filter — marks below 40 in Result Entry create these records automatically." />
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="doc-sheet rounded-xl overflow-hidden mb-10">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Matric No</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th className="text-center">Repeat counter</th>
                  <th>Failed in</th>
                  <th className="text-center">Status</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.025, 0.4), duration: 0.3 }}>
                    <td className="font-mono text-[12.5px] text-ink font-medium">{r.matric_no}</td>
                    <td>
                      {r.name}
                      <span className="text-[11px] text-mute ml-2">{r.level}</span>
                    </td>
                    <td>
                      <span className="font-mono text-[12.5px] font-semibold">{r.course_code}</span>
                      <span className="text-[11.5px] text-mute block">{r.course_description}</span>
                    </td>
                    <td className="text-center">
                      <span className={`stamp ${r.repeats > 0 ? 'text-fail border-fail' : 'text-mute'}`}>
                        {r.repeats}×&nbsp;repeated
                      </span>
                      {r.attempts > 1 && (
                        <div className="text-[10.5px] text-mute mt-1">{r.attempts} attempts</div>
                      )}
                    </td>
                    <td className="text-[12px] text-ink">
                      {r.sessions.length ? r.sessions.map((s) => s.name).join(', ') : r.last_session}
                    </td>
                    <td className="text-center">
                      <span className={`stamp ${statusChip(r.status)}`}>{r.status === 'cleared' ? `cleared${r.cleared_session ? ` in ${r.cleared_session}` : ''}` : r.status}</span>
                    </td>
                    <td className="text-[12px] text-mute">{r.remark || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}

      {/* Extract a student's old records — the per-student counter check */}
      <Reveal>
        <div className="doc-sheet rounded-xl mt-4 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-line">
            <p className="font-display text-[17px] font-semibold text-ink flex items-center gap-2.5">
              <History size={16} className="text-mute" /> A student's recorded history
            </p>
            <p className="text-[12.5px] text-mute mt-1">
              Reads every old record back out of the database for one student — attempts, scores and
              whether each course was failed in an existing session.
            </p>
            <form onSubmit={fetchHistory} className="flex gap-3 mt-4 max-w-lg">
              <input className="field font-mono" placeholder="Matric number (e.g. A1/001)"
                value={lookupId} onChange={(e) => setLookupId(e.target.value)} />
              <Button type="submit" icon={Search} disabled={historyLoading || !lookupId.trim()}>
                {historyLoading ? 'Reading…' : 'Extract'}
              </Button>
            </form>
          </div>

          {historyError && (
            <div className="px-5 py-4 text-[13px] text-fail">{historyError}</div>
          )}
          {history && (
            <div className="px-5 py-5">
              <p className="text-[13px] mb-4">
                <span className="font-display font-semibold text-ink">{history.profile.name}</span>
                <span className="font-mono text-mute ml-3">{history.profile.matric_no}</span>
                {history.profile.level && <span className="text-mute ml-2">{history.profile.level}</span>}
              </p>

              {history.courses.length > 0 && (
                <table className="ledger mb-6">
                  <thead>
                    <tr><th>Course</th><th className="text-center">Attempts</th>
                      <th>Failed in sessions</th><th className="text-center">Standing</th></tr>
                  </thead>
                  <tbody>
                    {history.courses.map((c) => (
                      <tr key={c.course_code}>
                        <td>
                          <span className="font-mono text-[12.5px] font-semibold">{c.course_code}</span>
                          <span className="text-[11.5px] text-mute block">{c.course_description}</span>
                        </td>
                        <td className="text-center font-display font-semibold tabular-nums">
                          {c.attempts}{c.repeats > 0 && <span className="text-[11px] text-mute font-normal"> ({c.repeats} repeat{c.repeats === 1 ? '' : 's'})</span>}
                        </td>
                        <td className="text-[12px]">{c.failed_sessions.length ? c.failed_sessions.join(', ') : <span className="text-pass">—</span>}</td>
                        <td className="text-center">
                          <span className={`stamp ${c.status === 'cleared' ? 'text-pass border-pass' : c.status === 'active' ? 'text-fail border-fail' : 'text-mute'}`}>
                            {c.status === '-' ? 'not graded' : c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {history.sessions.map((s) => (
                <div key={s.session} className="mb-5">
                  <p className="text-[12px] font-semibold text-mute uppercase tracking-wide mb-2">{s.session}</p>
                  <table className="ledger">
                    <thead>
                      <tr><th>Course</th><th>Score</th><th className="text-center">Grade</th></tr>
                    </thead>
                    <tbody>
                      {s.results.map((res, i) => (
                        <tr key={i}>
                          <td className="font-mono text-[12.5px]">{res.course_code}</td>
                          <td className="font-mono text-[12.5px] tabular-nums">
                            {res.score < 0 ? res.grade : res.score}
                          </td>
                          <td className={`text-center stamp ${res.passed ? 'text-pass border-pass' : 'text-fail border-fail'}`}>
                            {res.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
