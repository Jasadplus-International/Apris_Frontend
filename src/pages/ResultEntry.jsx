import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, AlertTriangle, History } from 'lucide-react';
import { PageHeader, Spinner, EmptyState, Reveal } from '../components/ui';
import { API, authFetch } from '../lib/api';


const gradeColor = (g) =>
  g === 'F' ? 'text-fail border-fail' : g === 'E' ? 'text-amber-700 border-amber-500' : 'text-pass border-pass';

export default function ResultEntry() {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [students, setStudents] = useState([]);
  const [changes, setChanges] = useState([]);
  const [showChanges, setShowChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChanges = async () => {
    if (!selectedCourse) { setChanges([]); return; }
    try {
      const r = await authFetch(`${API}/api/results/change-log?course_id=${selectedCourse}`);
      setChanges(r.ok ? await r.json() : []);
    } catch { setChanges([]); }
  };

  useEffect(() => { fetchSessions(); }, []);

  const fetchCourses = async (sessionId) => {
    try {
      // Only courses that actually have registrations in this session,
      // with their registered-student count (keeps the dropdown meaningful)
      const q = sessionId ? `?session_id=${sessionId}` : '';
      const res = await authFetch(`${API}/api/results/courses-with-regs${q}`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching courses:', e);
      setCourses([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await (await authFetch(`${API}/api/results/sessions`)).json();
      setSessions(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) setSelectedSession(data[0].id);
    } catch (e) {
      console.error('Error fetching sessions:', e);
      setSessions([]);
    }
  };

  useEffect(() => {
    if (selectedCourse && selectedSession) { fetchStudents(); fetchChanges(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, selectedSession]);

  useEffect(() => {
    if (selectedSession) {
      setSelectedCourse('');
      fetchCourses(selectedSession);
    } else {
      setCourses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession]);

  const fetchStudents = async () => {
    setLoading(true); setError(null);
    try {
      const response = await authFetch(`${API}/api/results/students-by-course?course_id=${selectedCourse}&session_id=${selectedSession}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setStudents(list.map(s => ({ ...s, course_work: s.course_work || 0, exam_score: s.exam_score || 0 })));
    } catch (e) {
      console.error('Error fetching students:', e);
      setStudents([]);
      setError('Failed to load students. Confirm the records server is running on port 8000.');
    }
    setLoading(false);
  };

  const handleScoreChange = async (regId, field, value) => {
    const numValue = parseFloat(value) || 0;
    const updatedStudents = students.map(s =>
      s.registration_id === regId ? { ...s, [field]: numValue } : s);
    setStudents(updatedStudents);

    // Guard: strict 0–100 numeric range per the legacy validation
    if (numValue < 0 || numValue > 100) return;

    try {
      const student = updatedStudents.find(s => s.registration_id === regId);
      await authFetch(`${API}/api/results/save-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: regId, course_work: student.course_work, exam_score: student.exam_score }),
      });
      // refresh the audit panel shortly after an actual change lands
      const wasChanged = students.some(s2 =>
        s2.registration_id === regId &&
        (s2.course_work !== student.course_work || s2.exam_score !== student.exam_score));
      if (wasChanged) setTimeout(fetchChanges, 400);
    } catch (e) { console.error('Autosave failed:', e); }
  };

  const calculatePreviewGrade = (cw, exam) => {
    const t = (cw || 0) + (exam || 0);
    if (t >= 70) return 'A'; if (t >= 60) return 'B'; if (t >= 50) return 'C';
    if (t >= 45) return 'D'; if (t >= 40) return 'E'; return 'F';
  };

  return (
    <div>
      <PageHeader
        eyebrow="Capture"
        title="Result Entry"
        subtitle="Score capture with live totals and grades. Marks below 40 raise a carry-over automatically."
      />

      {error && (
        <div className="mb-5 rounded-xl border border-fail/25 bg-fail/5 text-fail px-5 py-4 text-sm flex items-center gap-2.5">
          <AlertTriangle size={17} /> {error}
        </div>
      )}

      <Reveal>
        <div className="bg-white border border-line rounded-xl p-5 mb-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Academic session</label>
            <select className="field" value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
              <option value="">Select session…</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Course</label>
            <select className="field" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">
                {courses.length === 0
                  ? 'No courses with registrations in this session'
                  : 'Select course…'}
              </option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.description} ({c.registered} registered)
                </option>
              ))}
            </select>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <Spinner label="Loading registered students…" />
      ) : students.length === 0 ? (
        <Reveal>
          <div className="doc-sheet rounded-xl">
            <EmptyState icon={ClipboardList}
              title={selectedCourse ? 'No students in this course session' : 'No course selected'}
              hint={selectedCourse
                ? 'No registrations for this course in the chosen session — try another course or session.'
                : 'Sessions without registrations are excluded — pick a different session above.'} />
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="doc-sheet rounded-xl overflow-hidden">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Matric No</th>
                  <th>Student name</th>
                  <th>Course work <span className="text-[10px] font-normal text-mute">(max 30)</span></th>
                  <th>Exam <span className="text-[10px] font-normal text-mute">(max 70)</span></th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <motion.tr
                    key={s.registration_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5), duration: 0.3 }}
                  >
                    <td className="font-mono text-[12.5px] text-ink font-medium">{s.matric_no}</td>
                    <td>{s.name}</td>
                    <td className="w-36">
                      <input type="number" min="0" max="30"
                        className="field font-mono text-[13px] py-1.5"
                        value={s.course_work}
                        onChange={(e) => handleScoreChange(s.registration_id, 'course_work', e.target.value)}
                      />
                    </td>
                    <td className="w-36">
                      <input type="number" min="0" max="70"
                        className="field font-mono text-[13px] py-1.5"
                        value={s.exam_score}
                        onChange={(e) => handleScoreChange(s.registration_id, 'exam_score', e.target.value)}
                      />
                    </td>
                    <td className="text-center font-display font-semibold text-[15px] tabular-nums">
                      {(s.course_work || 0) + (s.exam_score || 0)}
                    </td>
                    <td className="text-center">
                      <span className={`stamp ${gradeColor(calculatePreviewGrade(s.course_work, s.exam_score))}`}>
                        {calculatePreviewGrade(s.course_work, s.exam_score)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      )}

      {/* Change history — the audit trail */}
      {selectedCourse && (
        <Reveal>
          <div className="doc-sheet rounded-xl mt-5 overflow-hidden">
            <button
              onClick={() => setShowChanges(!showChanges)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#f8fafd] transition-colors"
            >
              <span className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-ink">
                <History size={15} className="text-mute" />
                Change history
                {changes.length > 0 && (
                  <span className="stamp text-mute" style={{ color: '#5d6b82' }}>{changes.length}</span>
                )}
              </span>
              <span className="text-[12px] text-mute">{showChanges ? 'Hide' : 'Show'}</span>
            </button>
            {showChanges && (
              changes.length === 0 ? (
                <div className="px-5 pb-4 text-[12.5px] text-mute">
                  No mark changes recorded for this course yet — edits made here appear with who made them and when.
                </div>
              ) : (
                <table className="ledger">
                  <thead>
                    <tr><th>When</th><th>Student</th><th>Course</th><th>Old</th><th>New</th><th>Changed by</th></tr>
                  </thead>
                  <tbody>
                    {changes.map((c, i) => (
                      <tr key={i}>
                        <td className="text-[12px] text-mute whitespace-nowrap">{new Date(c.changed_at).toLocaleString()}</td>
                        <td className="text-[12.5px]"><span className="font-mono text-mute mr-2">{c.matric_no}</span>{c.name}</td>
                        <td className="text-[12.5px] font-mono">{c.course}</td>
                        <td className="font-mono text-[12.5px] text-mute tabular-nums">{c.old[0]} / {c.old[1]}</td>
                        <td className="font-mono text-[12.5px] font-semibold text-ink tabular-nums">{c.new[0]} / {c.new[1]}</td>
                        <td className="text-[12.5px]">{c.by === 'bulk-import' ? <span className="stamp text-mute">bulk import</span> : c.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}