import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, FileSearch, Printer, ChevronRight } from 'lucide-react';
import { PageHeader, Button, Spinner, EmptyState, Reveal } from '../components/ui';
import { API, authFetch } from '../lib/api';
import { useInstitution } from '../lib/useInstitution';



export default function StudentTranscript({ setSlipData, setActivePage }) {
  const inst = useInstitution();
  const [studentId, setStudentId] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTranscript = async () => {
    if (!studentId.trim()) return;
    setIsLoading(true); setError(null);
    try {
      // encodeURIComponent handles the slashes in matric numbers (e.g., 13/PDBED/30287)
      const response = await authFetch(`${API}/api/academic/transcript/${encodeURIComponent(studentId)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }
      setData(await response.json());
    } catch (err) {
      setError(`Network/system error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const standing = (cgpa) =>
    cgpa >= 4.5 ? 'First Class' : cgpa >= 3.5 ? 'Second Class Upper'
    : cgpa >= 2.4 ? 'Second Class Lower' : 'Pass';

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="Transcripts"
        subtitle="Official per-student academic transcript with sessional GPA and cumulative standing."
      />

      <Reveal>
        <div className="bg-white border border-line rounded-xl p-5 flex flex-wrap gap-4 items-end mb-6">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Student matric number</label>
            <input
              type="text"
              className="field font-mono"
              placeholder="Enter matric no and press Enter…"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTranscript()}
            />
          </div>
          <Button icon={FileSearch} onClick={fetchTranscript} disabled={isLoading}>
            {isLoading ? 'Searching…' : 'Get transcript'}
          </Button>
        </div>
      </Reveal>

      {error && (
        <div className="mb-5 rounded-xl border border-fail/25 bg-fail/5 text-fail px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {isLoading && <Spinner label="Fetching academic records…" />}

      {data && (
        <Reveal>
          <div className="doc-sheet rounded-xl p-10 print:shadow-none print:border-none">
            {/* Institutional header */}
            <div className="text-center border-b-2 border-ink pb-6 mb-8">
              <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-mute mb-2">{inst.caps_name || 'ARPIS'} · ARPIS</div>
              <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">Official Academic Transcript</h1>
            </div>

            {/* Student profile grid */}
            <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
              <div className="space-y-2">
                <p><span className="font-semibold text-mute text-[12px]">Student name</span> — {data.profile.name}</p>
                <p><span className="font-semibold text-mute text-[12px]">Matriculation no</span> — <span className="font-mono">{data.profile.matric_no}</span></p>
              </div>
              <div className="space-y-2 text-right">
                <p><span className="font-semibold text-mute text-[12px]">Department</span> — {data.profile.department}</p>
                <p><span className="font-semibold text-mute text-[12px]">Date of issue</span> — {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Academic sessions */}
            <div className="space-y-12">
              {data.sessions.map((sess, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-line pb-2">
                    <h2 className="font-display text-lg font-semibold text-ink">{sess.session}</h2>
                    <button
                      onClick={() => { setSlipData({ studentId, sessionId: sess.session }); setActivePage('session-slip'); }}
                    >
                      <span className="group inline-flex items-center gap-1 text-[12px] font-semibold text-seal hover:gap-2 transition-all print:hidden">
                        Sessional slip <ChevronRight size={13} />
                      </span>
                    </button>
                  </div>
                  <table className="ledger">
                    <thead>
                      <tr>
                        <th>Course code</th>
                        <th>Course title</th>
                        <th className="text-center">Unit</th>
                        <th className="text-center">Score</th>
                        <th className="text-center">Grade</th>
                        <th className="text-center">Point</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sess.results.map((res, rIdx) => (
                        <tr key={rIdx}>
                          <td className="font-mono text-[12.5px]">{res.course_code}</td>
                          <td>{res.description}</td>
                          <td className="text-center tabular-nums">{res.units}</td>
                          <td className="text-center tabular-nums">{res.score}</td>
                          <td className="text-center font-semibold">{res.grade}</td>
                          <td className="text-center tabular-nums">{res.grade_point}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold bg-[#fafbfd]">
                        <td colSpan="2" className="p-2.5 text-right text-[12px] text-mute">Session total units</td>
                        <td className="p-2.5 text-center tabular-nums">{sess.total_units}</td>
                        <td colSpan="2" className="p-2.5 text-right text-[12px] text-mute">Session GPA</td>
                        <td className="p-2.5 text-center tabular-nums font-semibold">{sess.gpa}</td>
                      </tr>
                    </tfoot>
                  </table>
                </motion.div>
              ))}
            </div>

            {/* Final summary */}
            <div className="mt-12 rounded-xl bg-ink text-white p-7 flex justify-between items-center shadow-[0_18px_40px_-18px_rgba(16,30,56,0.5)]">
              <div>
                <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/45">Cumulative GPA</p>
                <p className="font-display text-5xl font-semibold tabular-nums mt-1"><span className="">{data.cgpa}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/45">Academic standing</p>
                <p className="font-display text-2xl font-semibold text-brass mt-1">{standing(data.cgpa)}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="ghost" icon={Printer} onClick={() => window.print()} className="print:hidden">Print</Button>
            </div>
          </div>
        </Reveal>
      )}

      {!data && !isLoading && (
        <div className="doc-sheet rounded-xl">
          <EmptyState icon={ScrollText} title="No transcript loaded" hint="Enter a student matric number above to pull the official record." />
        </div>
      )}
    </div>
  );
}