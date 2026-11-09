import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button, Spinner } from '../components/ui';
import { API, authFetch } from '../lib/api';



export default function StudentSessionSlip({ studentId, sessionId, onBack }) {
  const inst = useInstitution();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlip = async () => {
      if (!studentId || !sessionId) {
        setError('Missing student or session information.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await authFetch(`${API}/api/academic/transcript/${studentId}?session_id=${sessionId}`);
        if (!response.ok) throw new Error(await response.text());
        setData(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, sessionId]);

  if (isLoading) return <Spinner label="Generating sessional slip…" />;

  if (error) {
    return (
      <div className="text-center p-10 doc-sheet rounded-xl max-w-xl mx-auto">
        <p className="text-fail font-medium mb-5">{error}</p>
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Back to transcript</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack} className="group inline-flex items-center gap-2 text-[13px] font-semibold text-mute hover:text-seal transition-colors print:hidden">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> Back to transcript
      </button>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-12 rounded-sm shadow-lg border border-slate-300 text-slate-900 print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-mute mb-2">{inst.caps_name || 'ARPIS'} · ARPIS</div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight">Sessional Result Slip</h1>
        </div>

        {/* Profile */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="space-y-1">
            <p><span className="font-semibold text-mute text-[12px]">Student</span> — {data.profile.name}</p>
            <p><span className="font-semibold text-mute text-[12px]">Matric no</span> — <span className="font-mono">{data.profile.matric_no}</span></p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="font-semibold text-mute text-[12px]">Department</span> — {data.profile.department}</p>
            <p><span className="font-semibold text-mute text-[12px]">Session</span> — {data.sessions[0]?.session}</p>
          </div>
        </div>

        {/* Results table */}
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 border-y border-slate-300">
            <tr>
              <th className="p-2 font-semibold uppercase text-[11px] tracking-wider text-slate-600">Code</th>
              <th className="p-2 font-semibold uppercase text-[11px] tracking-wider text-slate-600">Course title</th>
              <th className="p-2 font-semibold uppercase text-[11px] tracking-wider text-slate-600 text-center">Unit</th>
              <th className="p-2 font-semibold uppercase text-[11px] tracking-wider text-slate-600 text-center">Score</th>
              <th className="p-2 font-semibold uppercase text-[11px] tracking-wider text-slate-600 text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.sessions[0]?.results.map((res, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="p-2 font-mono">{res.course_code}</td>
                <td className="p-2">{res.description}</td>
                <td className="p-2 text-center">{res.units}</td>
                <td className="p-2 text-center">{res.score}</td>
                <td className="p-2 text-center font-bold">{res.grade}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-slate-50">
              <td colSpan="2" className="p-2 text-right uppercase text-[11px] tracking-wider">Session GPA</td>
              <td colSpan="3" className="p-2 text-center font-display text-lg">{data.sessions[0]?.gpa}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-[11px] italic text-slate-400">This is an electronically generated document and does not require a signature.</p>
          <Button variant="ghost" icon={Printer} onClick={() => window.print()} className="print:hidden">Print</Button>
        </div>
      </motion.div>
    </div>
  );
}