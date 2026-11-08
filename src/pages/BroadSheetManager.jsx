import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet, BookOpenText, Layers, FileText, Loader2, Download, Eye, ListChecks,
} from 'lucide-react';
import { PageHeader, Button, Spinner, EmptyState, Reveal } from '../components/ui';
import { API } from '../lib/api';
import { useInstitution } from '../lib/useInstitution';

export default function BroadSheetManager() {
  const inst = useInstitution();
  const [config, setConfig] = useState({ deptId: '', sessionId: '', level: '', semester: '' });
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [courseQuery, setCourseQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [deptRes, sessRes, levelRes] = await Promise.all([
          fetch(`${API}/api/departments`).then(r => (r.ok ? r.json() : [])),
          fetch(`${API}/api/results/sessions`).then(r => (r.ok ? r.json() : [])),
          fetch(`${API}/api/levels`).then(r => (r.ok ? r.json() : [])),
        ]);
        setDepartments(Array.isArray(deptRes) ? deptRes : []);
        setSessions(Array.isArray(sessRes) ? sessRes : []);
        setLevels(Array.isArray(levelRes) ? levelRes : []);
      } catch (err) { console.error('Loading error:', err); }
      finally { setIsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!config.deptId || !config.sessionId || !config.level) return;
    (async () => {
      try {
        const params = new URLSearchParams({
          department_id: config.deptId, session_id: config.sessionId,
          level: config.level, semester: config.semester,
        });
        const res = await fetch(`${API}/api/results/courses-by-criteria?${params.toString()}`);
        if (res.ok) setCourses(await res.json());
      } catch (err) { console.error('Error loading filtered courses:', err); }
    })();
  }, [config.deptId, config.sessionId, config.level]);

  const toggleCourse = (courseId) =>
    setSelectedCourses(prev => prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]);

  const selectAll = () => setSelectedCourses(courses.map(c => c.id).filter(Boolean));

  const runPreview = async () => {
    if (!config.deptId || !config.sessionId || !config.level) { setError('Select a department, session and level first.'); return; }
    setIsPreviewing(true); setError(null);
    try {
      const params = new URLSearchParams({
        department_id: config.deptId, session_id: config.sessionId,
        level: config.level, semester: config.semester,
      });
      const response = await fetch(`${API}/api/reports/preview-broadsheet?${params.toString()}`);
      if (response.ok) setPreviewData(await response.json());
      else setError('Preview failed on the server.');
    } catch { setError('Network error while fetching the preview.'); }
    finally { setIsPreviewing(false); }
  };

  const handleDownload = async () => {
    if (!config.deptId || !config.sessionId || !config.level) { setError('Select a department, session and level first.'); return; }
    setIsGenerating(true); setError(null);
    try {
      const response = await fetch(`${API}/api/reports/download-report-bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: config.deptId,
          session_id: config.sessionId,
          level: config.level,
          course_ids: selectedCourses,
          semester: config.semester || null,
        }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ReportBundle_${config.deptId}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const err = await response.json();
        setError('Bundle failed: ' + (err.detail || 'unknown server error'));
      }
    } catch { setError('Network error while generating the bundle.'); }
    finally { setIsGenerating(false); }
  };

  const sel = (k) => (e) => setConfig({ ...config, [k]: e.target.value });
  const visibleCourses = courses.filter(c =>
    !courseQuery || `${c.code} ${c.description}`.toLowerCase().includes(courseQuery.toLowerCase()));

  if (isLoading) return <Spinner label="Loading report configurations…" />;

  return (
    <div>
      <PageHeader
        eyebrow="Reports"
        title="BroadSheet Manager"
        subtitle="Official report generation — the exact three-file bundle the legacy ARPIS software produced."
        actions={inst.logo_url ? (
          <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2">
            <img src={`${API}${inst.logo_url}`} alt="" className="h-7 w-auto object-contain" />
            <span className="font-display text-sm font-semibold text-ink">{inst.caps_name}</span>
          </div>
        ) : null}
      />

      {error && (
        <div className="mb-5 rounded-xl border border-fail/25 bg-fail/5 text-fail px-5 py-4 text-sm flex items-center gap-2.5">
          <span className="stamp border-fail">!</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: selection grid */}
        <div className="space-y-6 min-w-0">
          <Reveal>
            <div className="bg-white border border-line rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold text-ink mb-5">Report criteria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-mute mb-1.5">Department</label>
                  <select className="field" value={config.deptId} onChange={sel('deptId')}>
                    <option value="">Select department…</option>
                    <option value="ALL">All departments (whole university)</option>
                    {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-mute mb-1.5">Academic session</label>
                  <select className="field" value={config.sessionId} onChange={sel('sessionId')}>
                    <option value="">Select session…</option>
                    {(sessions || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-mute mb-1.5">Academic level</label>
                  <select className="field" value={config.level} onChange={sel('level')}>
                    <option value="">Select level…</option>
                    {(levels || []).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-mute mb-1.5">Semester</label>
                  <select className="field" value={config.semester} onChange={sel('semester')}>
                    <option value="">Whole session</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="bg-white border border-line rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-display text-lg font-semibold text-ink">Courses</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input className="field py-2 w-56 text-[13px]" placeholder="Filter courses…" value={courseQuery} onChange={(e) => setCourseQuery(e.target.value)} />
                  </div>
                  <button onClick={selectAll} className="text-[12.5px] font-semibold text-seal hover:underline">Select all</button>
                  <button
                    onClick={async () => {
                      // Load the course preset saved in the legacy BroadSheet_Courses table
                      const params = new URLSearchParams({
                        session: config.sessionId, semester: config.semester || '',
                        level: config.level, department: config.deptId,
                      });
                      const res = await fetch(`${API}/api/reports/broadsheet-configs?${params.toString()}`);
                      const cfgs = await res.json();
                      if (Array.isArray(cfgs) && cfgs.length) {
                        const codes = cfgs[0].courses || [];
                        const ids = courses.filter(c => codes.includes(c.code)).map(c => c.id);
                        setSelectedCourses(ids);
                        setError(ids.length ? null : 'Preset found but none of its courses match the registered list.');
                      } else {
                        setError('No saved course list for this dept / session / semester / level.');
                      }
                    }}
                    className="text-[12.5px] font-semibold text-ink hover:text-seal inline-flex items-center gap-1.5"
                  >
                    <ListChecks size={14} /> Load legacy preset
                  </button>
                  <button onClick={() => setSelectedCourses([])} className="text-[12.5px] font-semibold text-mute hover:text-ink">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {(visibleCourses || []).map(c => {
                  const active = selectedCourses.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCourse(c.id)}
                      className={`text-left p-3 rounded-lg border transition-colors ${active ? 'border-seal bg-seal/5' : 'border-line hover:border-ink/20 hover:bg-paper/60'}`}
                    >
                      <div className={`font-mono text-[12.5px] font-semibold ${active ? 'text-seal' : 'text-ink'}`}>{c.code}</div>
                      <div className="text-[11px] text-mute mt-0.5 line-clamp-1">{c.description}</div>
                    </button>
                  );
                })}
                {(!courses || courses.length === 0) && (
                  <div className="col-span-full text-center text-[13px] text-mute italic py-8">
                    No courses registered for this department, session and level.
                  </div>
                )}
              </div>
              <p className="text-[11.5px] text-mute mt-4">
                {selectedCourses.length} of {courses.length} selected — the broadsheet prints one 5-column block per course.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right: bundle card */}
        <Reveal delay={0.14} className="h-fit">
          <div className="bg-ink text-white rounded-2xl p-7 sticky top-0 shadow-[0_18px_40px_-18px_rgba(16,30,56,0.5)]">
            <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-white/45 mb-1">The bundle</div>
            <div className="font-display text-2xl font-semibold mb-1">Three official files</div>
            <p className="text-white/55 text-[12.5px] mb-5">One download, exactly matching the legacy report set:</p>
            <ul className="space-y-3.5 mb-7">
              {[
                { icon: BookOpenText, t: 'BroadSheet', d: 'RESULTS FOR… detailed register' },
                { icon: Layers, t: 'Summary', d: 'Pass/fail + carry-over lists' },
                { icon: FileText, t: 'Cover Page', d: 'University seal cover sheet' },
              ].map((f, i) => (
                <motion.li key={f.t} className="flex items-start gap-3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/8 text-brass mt-0.5"><f.icon size={15} /></span>
                  <span>
                    <span className="block text-[13px] font-semibold">{f.t}</span>
                    <span className="block text-[11px] text-white/40">{f.d}</span>
                  </span>
                </motion.li>
              ))}
            </ul>

            <div className="space-y-3">
              <Button variant="ghost" icon={Eye} onClick={runPreview} disabled={isPreviewing || isGenerating} className="w-full justify-center !bg-white/8 !border-white/15 !text-white hover:!bg-white/12">
                {isPreviewing ? 'Preparing…' : 'Preview'}
              </Button>
              <button
                onClick={handleDownload}
                disabled={isGenerating || isPreviewing}
                className="w-full relative overflow-hidden inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-seal text-white hover:bg-seal-2 active:scale-[0.98] transition disabled:opacity-55 shadow-[0_10px_22px_-8px_rgba(138,40,55,0.7)]"
              >
                {isGenerating ? (
                  <><Loader2 size={16} className="animate-spin" /> Generating bundle…</>
                ) : (
                  <><Download size={16} /> Generate report bundle</>
                )}
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Preview table */}
      <AnimatePresence>
        {previewData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="doc-sheet rounded-xl mt-8 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h3 className="font-display text-lg font-semibold text-ink">Broadsheet preview</h3>
              <div className="font-mono text-[11px] text-mute tracking-widest uppercase">
                {previewData.students?.length || 0} students · {previewData.courses?.length || 0} courses
              </div>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Matric No</th>
                    <th>Name</th>
                    {(previewData.courses || []).map(c => (
                      <th key={c.id} className="text-center">{c.code}</th>
                    ))}
                    <th className="text-center">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.students?.length > 0 ? previewData.students.map((s, idx) => (
                    <tr key={idx}>
                      <td className="font-mono text-[12px]">{s.matric_no}</td>
                      <td>{s.name}</td>
                      {previewData.courses.map(c => {
                        const r = s.results.find(x => x.course_code === c.code);
                        const failed = r && r.total !== 'ABS' && typeof r.total !== 'string' && r.total < 40;
                        return (
                          <td key={c.id} className={`text-center font-mono text-[11.5px] tabular-nums ${failed ? 'text-fail font-semibold' : 'text-mute'}`}>
                            {r ? `${r.cw}/${r.ex}/${r.total}` : '—'}
                          </td>
                        );
                      })}
                      <td className={`text-center font-display font-semibold ${s.gpa === '' ? 'text-mute/40' : ''}`}>{s.gpa === '' ? '—' : s.gpa}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={(previewData.courses?.length || 0) + 3}>
                      <EmptyState icon={FileSpreadsheet} title="No data for this selection"
                        hint="Try another session or level where students have registrations." />
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}