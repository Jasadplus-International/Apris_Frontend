import React, { useState, useEffect } from 'react';

const StudentTranscript = ({ setSlipData, setActivePage }) => {
  const [studentId, setStudentId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTranscript = async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/academic/transcript/${studentId}`);
      if (!response.ok) throw new Error('Student not found or server error');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSlip = (sessionId) => {
    if (setSlipData) {
      setSlipData({ studentId, sessionId });
      setActivePage('session-slip');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Academic Transcript</h1>
        <div className="flex gap-2">
          <input
            className="border p-2 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter Student UUID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <button
            onClick={fetchTranscript}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Generate
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-10">Loading record...</div>}
      {error && <div className="bg-red-100 text-red-600 p-4 rounded-lg">{error}</div>}

      {data && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 uppercase">Official Academic Transcript</h2>
            <p className="text-slate-500 italic">Verified Academic Record of Student Performance</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
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

          {/* Session Groups */}
          <div className="space-y-8">
            {data.sessions.map((sess, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-center border-b-2 border-slate-200 pb-1">
                  <h3 className="text-lg font-bold text-slate-700">{sess.session}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500">Session GPA: {sess.gpa || 'N/A'}</span>
                    <button
                      onClick={() => handleViewSlip(sess.session)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition font-semibold"
                    >
                      View Slip
                    </button>
                  </div>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase text-slate-500 font-semibold bg-slate-50">
                      <th className="p-2 border-b">Course Code</th>
                      <th className="p-2 border-b">Course Title</th>
                      <th className="p-2 border-b text-center">Units</th>
                      <th className="p-2 border-b text-center">Score</th>
                      <th className="p-2 border-b text-center">Grade</th>
                      <th className="p-2 border-b text-center">Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sess.results.map((res, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-2 font-mono text-sm">{res.course_code}</td>
                        <td className="p-2 text-sm text-slate-600">{res.description}</td>
                        <td className="p-2 text-center text-sm">{res.units}</td>
                        <td className="p-2 text-center text-sm">{res.score}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            res.grade === 'F' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {res.grade}
                          </span>
                        </td>
                        <td className="p-2 text-center text-sm">{res.point}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Final Summary */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-600 font-semibold uppercase">Cumulative Grade Point Average</p>
              <p className="text-4xl font-black text-blue-900">{data.summary.cgpa.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-semibold uppercase">Total Units Earned</p>
              <p className="text-2xl font-bold text-blue-900">{data.summary.total_units}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTranscript;
