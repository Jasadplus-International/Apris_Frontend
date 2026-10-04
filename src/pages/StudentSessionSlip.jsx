import React, { useState, useEffect } from 'react';

export default function StudentSessionSlip({ studentId, sessionId, onBack }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlip = async () => {
      if (!studentId || !sessionId) {
        setError("Missing student or session information.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:8000/api/academic/transcript/${studentId}?session_id=${sessionId}`);
        if (!response.ok) throw new Error(await response.text());
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlip();
  }, [studentId, sessionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-slate-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generating sessional slip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-200 rounded-md">Go Back</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition mb-4"
      >
        ← Back to Transcript
      </button>

      <div className="bg-white p-12 rounded-sm shadow-xl border border-slate-300 text-slate-900 print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Sessional Result Slip</h1>
          <p className="text-md text-slate-600 mt-1">University Management System (ARPIS)</p>
        </div>

        {/* Profile */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="space-y-1">
            <p><span className="font-bold uppercase">Student:</span> {data.profile.name}</p>
            <p><span className="font-bold uppercase">Matric No:</span> {data.profile.matric_no}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="font-bold uppercase">Dept:</span> {data.profile.department}</p>
            <p><span className="font-bold uppercase">Session:</span> {data.sessions[0]?.session}</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="space-y-4">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 border-y border-slate-300">
              <tr>
                <th className="p-2 font-bold uppercase">Code</th>
                <th className="p-2 font-bold uppercase">Course Title</th>
                <th className="p-2 font-bold uppercase text-center">Unit</th>
                <th className="p-2 font-bold uppercase text-center">Score</th>
                <th className="p-2 font-bold uppercase text-center">Grade</th>
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
                <td colSpan="2" className="p-2 text-right uppercase">Session GPA:</td>
                <td colSpan="3" className="p-2 text-center text-blue-700 text-lg">{data.sessions[0]?.gpa}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-12 text-center text-xs text-slate-400 italic">
          This is an electronically generated document and does not require a signature.
        </div>
      </div>
    </div>
  );
}
