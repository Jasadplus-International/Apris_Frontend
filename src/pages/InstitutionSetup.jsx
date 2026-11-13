import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database, Upload, CheckCircle2, AlertTriangle, Loader2,
  HardDriveDownload, ShieldCheck, Trash2,
} from 'lucide-react';
import { PageHeader, Button, Reveal } from '../components/ui';
import { API, APIReady, authFetch } from '../lib/api';
import { useInstitution, refreshInstitution, onInstitutionChanged } from '../lib/useInstitution';

const STEPS = ['password', 'database', 'sessions', 'departments', 'students', 'courses', 'registrations', 'carryovers', 'users', 'caches', 'done'];
const STEP_LABELS = {
  password: 'Verify access / read file',
  database: 'Create & bootstrap staging copy',
  sessions: 'Academic sessions',
  departments: 'Departments',
  students: 'Students & profiles',
  courses: 'Course catalogue',
  registrations: 'Registrations & results',
  carryovers: 'Carry-overs',
  users: 'User accounts',
  caches: 'Summaries & configs',
};

const COUNT_LABELS = [
  ['students', 'Students'], ['departments', 'Departments'], ['courses', 'Courses'],
  ['sessions', 'Sessions'], ['registrations', 'Registrations'], ['results', 'Results'],
  ['carryovers', 'Carry-overs'], ['users', 'Users'],
];

export default function InstitutionSetup() {
  const inst = useInstitution();

  const [stats, setStats] = useState(null);
  const [backups, setBackups] = useState([]);
  const [dumpFiles, setDumpFiles] = useState([]);
  const [backingUp, setBackingUp] = useState(false);
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedInfo, setAppliedInfo] = useState(null);
  const pollRef = useRef(null);

  const loadStats = async () => {
    try {
      const [st, bk] = await Promise.all([
        authFetch(`${API}/api/database/stats`).then(r => (r.ok ? r.json() : null)).catch(() => null),
        authFetch(`${API}/api/database/backups`).then(r => (r.ok ? r.json() : { databases: [], dumps: [] })).catch(() => ({ databases: [], dumps: [] })),
      ]);
      setStats(st);
      setBackups(Array.isArray(bk) ? bk.map(b => ({ name: b.name, size: b.size, dumpKind: 'import-swap' })) : (bk.databases || []).map(b => ({ ...b, dumpKind: 'import-swap' })));
      setDumpFiles(bk.dumps || []);
    } catch { setStats(null); }
  };

  const backupNow = async () => {
    setBackingUp(true);
    try {
      const r = await authFetch(`${API}/api/database/backup`, { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || 'Backup failed');
      setDumpFiles(d.dumps || []);
    } catch (e) { setError(String(e.message || e)); }
    finally { setBackingUp(false); }
  };

  useEffect(() => {
    APIReady.then(() => loadStats());
    return onInstitutionChanged(loadStats);
  }, []);

  useEffect(() => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await (await authFetch(`${API}/api/database/import/status/${jobId}`)).json();
        setJob(data);
        if (data.state === 'ready_to_apply' || data.state === 'failed' || data.state === 'applied') {
          clearInterval(pollRef.current);
        }
      } catch { /* transient while importing */ }
    }, 1500);
    return () => clearInterval(pollRef.current);
  }, [jobId]);

  const isWorkbook = !!file && /\.(xlsx|xlsm|xls)$/i.test(file.name || '');

  const startImport = async () => {
    setError(null); setJob(null); setJobId(null); setAppliedInfo(null);
    if (!file) { setError('Choose the records file — the Import Workbook (.xlsx) or a legacy .mdb database.'); return; }
    if (!isWorkbook && !password.trim()) { setError('Type the legacy database password first (only .mdb imports need one).'); return; }
    setStarting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (!isWorkbook) form.append('password', password || '');
      const response = await authFetch(`${API}/api/database/import`, { method: 'POST', body: form });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Import failed to start');
      }
      const data = await response.json();
      setJobId(data.job_id);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setStarting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await authFetch(`${API}/api/database/import-template`);
      if (!response.ok) throw new Error('Could not download the template');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ARPIS_Import_Workbook.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const apply = async () => {
    if (!jobId) return;
    setApplying(true); setError(null);
    try {
      const response = await authFetch(`${API}/api/database/apply/${jobId}`, { method: 'POST' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Apply failed');
      }
      const data = await response.json();
      setAppliedInfo(data);
      setJob(null); setJobId(null); setFile(null);
      await loadStats();
      refreshInstitution();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setApplying(false);
    }
  };

  const discard = async () => {
    if (!jobId) return;
    try {
      await authFetch(`${API}/api/database/discard/${jobId}`, { method: 'POST' });
    } catch { /* job may already be gone */ }
    setJob(null); setJobId(null); setFile(null);
  };

  const done = job?.state === 'ready_to_apply';
  const stepIndex = job ? STEPS.indexOf(job.step) : -1;

  return (
    <div>
      <PageHeader
        eyebrow="Onboarding"
        title="Institution"
        subtitle="Bring in the university's records with the ARPIS Import Workbook (Excel) or a legacy .mdb database. Everything is rebuilt into a private staging copy; current records stay in place until you save."
      />

      {error && (
        <div className="mb-5 rounded-xl border border-fail/25 bg-fail/5 text-fail px-5 py-4 text-sm flex items-center gap-2.5">
          <span className="stamp border-fail">!</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Import + progress */}
        <div className="space-y-6 min-w-0">
          <Reveal>
            <div className="bg-white border border-line rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold text-ink mb-1">Import records</h3>
              <p className="text-[12.5px] text-mute mb-5">
                Fill the <span className="font-semibold text-ink">ARPIS Import Workbook</span> (Excel — one sheet
                per table) or submit the institution's legacy <span className="font-mono text-[11.5px]">.mdb</span> file.
                Everything lands in a private staging copy first — the records below stay in place until you save.
              </p>

              {appliedInfo && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-xl border border-pass/30 bg-pass/5 px-5 py-4 text-sm flex items-start gap-3">
                  <ShieldCheck size={18} className="text-pass mt-0.5" />
                  <div>
                    <div className="font-semibold text-pass">Records replaced successfully</div>
                    <div className="text-mute mt-0.5">
                      {appliedInfo.registrations?.toLocaleString()} registrations · {appliedInfo.students?.toLocaleString()} students now live.
                      Previous database preserved as <span className="font-mono text-[11px]">{appliedInfo.backup}</span>.
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-mute mb-1.5">Records file — workbook (.xlsx) or legacy database (.mdb)</label>
                  <label className="field cursor-pointer flex items-center gap-2 text-[13px] hover:border-ink/25" style={{ paddingTop: 8, paddingBottom: 8 }}>
                    <Upload size={15} />
                    <span className={file ? 'text-ink' : 'text-mute'}>
                      {file ? file.name : 'Choose ARPIS_Import_Workbook.xlsx or a .mdb file…'}
                    </span>
                    <input type="file" accept=".xlsx,.xlsm,.xls,.mdb,.accdb" className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="max-w-[260px]">
                  <label className="block text-[12px] font-semibold text-mute mb-1.5">
                    Legacy .mdb password <span className="font-normal text-mute/70">(workbook imports don't need one)</span>
                  </label>
                  <input type="password" className="field font-mono text-[13px]" placeholder="Only for legacy .mdb files"
                    value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={startImport} icon={Database} disabled={starting || !!jobId}>
                    {starting ? 'Uploading…' : jobId ? 'Import running…' : 'Process records file'}
                  </Button>
                  <Button variant="ghost" onClick={downloadTemplate} icon={HardDriveDownload}>
                    Download the Import Workbook template
                  </Button>
                </div>
              </div>

              {job && (
                <div className="mt-6 border-t border-line pt-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    {job.state === 'running' && <Loader2 size={16} className="animate-spin text-seal" />}
                    {done && <CheckCircle2 size={16} className="text-pass" />}
                    {job.state === 'failed' && <AlertTriangle size={16} className="text-fail" />}
                    <span className="text-[13px] font-semibold text-ink">
                      {job.state === 'running' ? 'Processing into the staging copy…'
                       : done ? 'Staging copy ready — review the counts, then save to replace the records'
                       : job.state === 'applied' ? 'Applied.' : 'Import failed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {STEPS.map((s) => {
                      const idx = STEPS.indexOf(s);
                      const isDone = done || (stepIndex > idx && job.state === 'running');
                      const isCurrent = job.state === 'running' && job.step === s;
                      const isFailed = job.state === 'failed' && job.step === s;
                      return (
                        <div key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[12.5px] ${
                          isFailed ? 'border-fail/40 text-fail bg-fail/5'
                          : isDone ? 'border-pass/30 text-pass bg-pass/5'
                          : isCurrent ? 'border-seal/40 text-seal bg-seal/5'
                          : 'border-line text-mute'}`}>
                          {isDone ? <CheckCircle2 size={13} /> : isCurrent ? <Loader2 size={13} className="animate-spin" /> : isFailed ? <AlertTriangle size={13} /> : <span className="w-[13px] h-px bg-line" />}
                          {STEP_LABELS[s]}
                        </div>
                      );
                    })}
                  </div>

                  <pre className="text-[11px] font-mono text-mute whitespace-pre-wrap max-h-40 overflow-y-auto border border-line rounded-lg p-3 bg-[#fafbfd]">
                    {(job.log || []).join('\n')}
                  </pre>

                  {done && job.counts && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                        {COUNT_LABELS.map(([key, label]) => (
                          <div key={key} className="border border-line rounded-lg px-3 py-2.5">
                            <div className="font-display text-lg font-semibold text-ink tabular-nums">
                              {typeof job.counts[key] === 'number' ? job.counts[key].toLocaleString() : '—'}
                            </div>
                            <div className="text-[10.5px] text-mute">{label}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[12px] text-mute mb-4 flex items-center gap-2">
                        <AlertTriangle size={13} className="text-brass" />
                        Saving replaces the current records with these. A timestamped backup of the current database is kept automatically.
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={apply} icon={ShieldCheck} disabled={applying}>
                          {applying ? 'Replacing…' : 'Save & replace records'}
                        </Button>
                        <Button variant="ghost" onClick={discard} icon={Trash2} disabled={applying}>Discard</Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Current database card */}
        <Reveal delay={0.1} className="h-fit">
          <div className="bg-ink text-white rounded-2xl p-7 sticky top-0">
            <div className="flex items-center gap-3 mb-1">
              <HardDriveDownload size={17} className="text-brass" />
              <div className="font-display text-xl font-semibold">Current database</div>
            </div>
            <p className="text-white/55 text-[12.5px] mb-5">
              Serving <span className="text-white font-semibold">{inst.display_name || '…'}</span>
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-1">
              {(stats ? COUNT_LABELS : []).map(([key, label]) => (
                <div key={key} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
                  <div className="font-display text-lg font-semibold tabular-nums">
                    {typeof stats?.[key] === 'number' ? stats[key].toLocaleString() : stats ? '0' : '…'}
                  </div>
                  <div className="text-[10.5px] text-white/45">{label}</div>
                </div>
              ))}
            </div>
            {stats && (
              <div className="font-mono text-[10px] text-white/35 mt-3 mb-5 tracking-wide">
                {stats.database}
              </div>
            )}

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[11px] font-mono tracking-[0.14em] uppercase text-white/45">Backups</div>
                <button
                  onClick={backupNow}
                  disabled={backingUp}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-40"
                >
                  {backingUp ? <Loader2 size={12} className="animate-spin" /> : <HardDriveDownload size={12} />}
                  {backingUp ? 'Dumping…' : 'Back up now'}
                </button>
              </div>
              {(backups.length === 0 && dumpFiles.length === 0) ? (
                <div className="text-[11.5px] text-white/35">
                  None yet. Nightly dumps run automatically; one is also created on every Save &amp; replace.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {backups.map(b => (
                    <div key={b.name} className="flex items-center justify-between text-[11.5px]">
                      <span className="font-mono text-white/60 truncate">{b.name}</span>
                      <span className="text-white/35 ml-3 shrink-0">{b.size}</span>
                    </div>
                  ))}
                  {dumpFiles.map(d => (
                    <div key={`d-${d.name}`} className="flex items-center justify-between text-[11.5px]">
                      <span className="font-mono text-brass/80 truncate">{d.name}</span>
                      <span className="text-white/35 ml-3 shrink-0">{d.size}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[10px] text-white/25 mt-2 leading-relaxed">
                Dumps live in Documents\ARPIS Databases\backups\{inst.code || ''} — 14 per institution are kept.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}