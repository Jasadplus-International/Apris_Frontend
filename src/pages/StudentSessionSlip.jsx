import React, { useState, useEffect } from 'react';

const StudentSessionSlip = ({ studentId, sessionId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSlip = async () => {
      try {
        // Use the updated transcript endpoint with session_id filter
        const response = await fetch(`http://localhost:8000/api/academic/transcript/${studentId}?session_id=${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch session record');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && sessionId) {
      fetchSlip();
    }
  }, [studentId, sessionId]);

  if (loading) return <div className="text-center py-10">Loading result slip...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!data) return <div className="text-center py-10">No data available.</div>;

  // We expect only one session in the list because of the backend filter
  const sessionData = data.sessions[0];

  if (!sessionData) {
    return <div className="text-center py-10">No results found for this session.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium transition"
      >
        ← Back to Full Transcript
      </button>

      <div className="bg-white p-10 rounded-lg shadow-lg border border-slate-200">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 uppercase mb-2">Sessional Result Slip</h1>
          <p className="text-slate-500 italic">{sessionData.session}</p>
          <div className="mt-4 h-1 w-32 bg-blue-600 mx-auto"></div>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-6 mb-10 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Student Name</p>
            <p className="text-lg font-bold text-slate-800">{data.profile.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Matriculation Number</p>
            <p className="text-lg font-bold text-slate-800">{data.profile.matric_no}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Department</p>
            <p className="text-lg font-bold text-slate-800">{data.profile.department}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Date of Issue</p>
            <p className="text-lg font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 mb-10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase text-slate-600 font-semibold">
                <th className="p-3 border-b">Course Code</th>
                <th className="p-3 border-b">Course Title</th>
                <th className="p-3 border-b text-center">Units</th>
                <th className="p-3 border-b text-center">Score</th>
                <th className="p-3 border-b text-center">Grade</th>
                <th className="p-3 border-b text-center">Point</th>
              </tr>
            </thead>
            <tbody>
              {sessionData.results.map((res, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-sm">{res.course_code}</td>
                  <td className="p-3 text-sm text-slate-600">{res.description}</td>
                  <td className="p-3 text-center text-sm">{res.units}</td>
                  <td className="p-3 text-center text-sm">{res.score}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      res.grade === 'F' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {res.grade}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">{res.point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Box */}
        <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-indigo-600 font-semibold uppercase">Session GPA</p>
            <p className="text-4xl font-black text-indigo-900">{sessionData.gpa}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-600 font-semibold uppercase">Total Units Registered</p>
            <p className="text-2xl font-bold text-indigo-900">{sessionData.total_units}</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 no-print">
        <button
          onClick={() => window.print()}
          className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900 transition shadow-md"
        >
          Print Result Slip
        </button>
      </div>
    </div>
  );
};

export default StudentSessionSlip;
