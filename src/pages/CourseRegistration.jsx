import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PageHeader, Button, EmptyState, Spinner, Reveal } from '../components/ui';
import { API } from '../lib/api';

/**
 * Course Registration — the legacy "bulk register a level for a session" screen.
 * Posts to POST /api/academic/bulk-register, which enforces the legacy
 * already-passed guard (a course cannot be re-registered after a >= 40 score).
 */
export default function CourseRegistration() {
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [deptId, setDeptId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [level, setLevel] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [d, s, l] = await Promise.all([
          fetch(`${API}/api/departments`).then(r => (r.ok ? r.json() : [])),
          fetch(`${API}/api/results/sessions`).then(r => (r.ok ? r.json() : [])),
          fetch(`${API}/api/levels`).then(r => (r.ok ? r.json() : [])),
        ]);
        setDepartments(Array.isArray(d) ? d : []);
        setSessions(Array.isArray(s) ? s : []);
        setLevels(Array.isArray(l) ? l : []);
      } catch { setError('Could not load configuration from the records server.'); }
    })();
  }, []);

  useEffect(() => {
    if (!deptId || !sessionId || !level) return;
    (async () => {
      try {
        const params = new URLSearchParams({ department_id: deptId, session_id: sessionId, level });
        const data = await (await fetch(`${API}/api/results/courses-by-criteria?${params.toString()}`)).json();
        setCourses(Array.isArray(data) ? data : []);
      } catch { setCourses([]); }
    })();
  }, [deptId, sessionId, level]);

  useEffect(() => {
    if (!level) return;
    (async () => {
      try {
        const data = await (await fetch(`${API}/api/students`)).json();
        setStudents(Array.isArray(data) ? data.filter(s => s.level === level) : []);
      } catch { setStudents([]); }
    })();
  }, [level]);
  useEffect(() => { setSelectAllStudents(false); setSelectedStudents([]); }, [students]);

  const filteredStudents = students.filter(s =>
    !studentQuery || `${s.matric_no} ${s.surname} ${s.first_name}`.toLowerCase().includes(studentQuery.toLowerCase()));

  const toggleCourse = (id) =>
    setSelectedCourses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleStudent = (id) =>
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleRegister = async () => {
    if (!sessionId || !selectedCourses.length || !selectedStudents.length) {
      setError('Select a session, at least one course and at least one student.');
      return;
    }
    setRegistering(true); setError(null); setResult(null);
    try {
      const response = await fetch(`${API}/api/academic/bulk-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_ids: selectedStudents,
          course_ids: selectedCourses,
          session_id: sessionId,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.detail || 'Registration failed');
      }
      const data = await response.json();
      setResult(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Capture"
        title="Course Registration"
        subtitle="Register a level for a session — the legacy already-passed guard keeps any course re-registration blocked after a ≥ 40 score."
      />

      {error && (
        <div className="mb-5 rounded-xl border border-fail/25 bg-fail/5 text-fail px-5 py-4 text-sm flex items-center gap-2.5">
          <span className="stamp border-fail">!</span> {error}
        </div>
      )}

      {result && (
        <div className="mb-5 rounded-xl border border-pass/30 bg-pass/5 px-5 py-4 text-sm flex items-start gap-3">
          <CheckCircle2 size={18} className="text-pass mt-0.5" />
          <div>
            <div className="font-semibold text-pass">Registration complete</div>
            <div className="text-mute mt-0.5">{result.registered} registered · {result.skipped_passed} skipped (already passed the legacy guard){result.errors?.length ? ` · ${result.errors.length} errors` : ''}.</div>
          </div>
        </div>
      )}

      <Reveal>
        <div className="bg-white border border-line rounded-xl p-6 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Department</label>
              <select className="field" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
                <option value="">Select department…</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Session</label>
              <select className="field" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                <option value="">Select session…</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Level</label>
              <select className="field" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Select level…</option>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="bg-white border border-line rounded-xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-ink">Courses for this registration</h3>
            <div className="font-mono text-[11px] text-mute tracking-widest uppercase">{selectedCourses.length} selected</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {courses.map(c => (
              <button key={c.id} onClick={() => toggleCourse(c.id)}
                className={`text-left p-3 rounded-lg border transition-colors ${selectedCourses.includes(c.id) ? 'border-seal bg-seal/5' : 'border-line hover:border-ink/20'}`}>
                <div className={`font-mono text-[12.5px] font-semibold ${selectedCourses.includes(c.id) ? 'text-seal' : 'text-ink'}`}>{c.code}</div>
                <div className="text-[11px] text-mute mt-0.5 line-clamp-1">{c.description}</div>
              </button>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full text-center text-[13px] text-mute italic py-6">
                Choose department, session and level — registered courses will appear here.
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="doc-sheet rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h3 className="font-display text-lg font-semibold text-ink">Students at this level</h3>
            <div className="flex items-center gap-4">
              <div className="w-56">
                <input className="field py-2 text-[13px]" placeholder="Search students…" value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} />
              </div>
              <button className="text-[12.5px] font-semibold text-seal hover:underline"
                onClick={() => setSelectAllStudents(!selectAllStudents)}>
                {selectAllStudents ? 'Clear all' : 'Select all'}
              </button>
            </div>
          </div>
          {filteredStudents.length === 0 ? (
            <EmptyState icon={UserPlus} title="No students" hint="Pick a department and level with enrolled students." />
          ) : (
            <div className="max-h-[45vh] overflow-y-auto">
              <table className="ledger">
                <thead>
                  <tr>
                    <th className="w-10">
                      <input type="checkbox" className="accent-[#8a2837]"
                        checked={selectAllStudents}
                        onChange={(e) => {
                          setSelectAllStudents(e.target.checked);
                          setSelectedStudents(e.target.checked ? students.map(s => s.id) : []);
                        }} />
                    </th>
                    <th>Matric No</th>
                    <th>Name</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => {
                    const checked = selectAllStudents || selectedStudents.includes(s.id);
                    return (
                      <tr key={s.id}>
                        <td>
                          <input type="checkbox" className="accent-[#8a2837]" checked={checked}
                            onChange={() => toggleStudent(s.id)} />
                        </td>
                        <td className="font-mono text-[12.5px]">{s.matric_no}</td>
                        <td>{`${s.surname} ${s.first_name}`.trim()}</td>
                        <td className="text-mute font-mono text-[12px]">{s.level}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Reveal>

      <div className="sticky bottom-4 mt-6">
        <div className="bg-ink text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-[0_18px_40px_-18px_rgba(16,30,56,0.5)]">
          <div className="text-[13px]">
            <span className="text-white/55">{selectedStudents.length} students ×</span>{' '}
            <span className="text-white/55">{selectedCourses.length} courses</span>
            <span className="ml-3 font-mono text-[11px] text-white/35 tracking-widest uppercase">session {sessions.find(s => s.id === sessionId)?.name || '—'}</span>
          </div>
          <Button onClick={handleRegister} icon={UserPlus} disabled={registering}>
            {registering ? 'Registering…' : 'Execute registration'}
          </Button>
        </div>
      </div>
    </div>
  );
}