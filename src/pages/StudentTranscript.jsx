import React, { useState, useEffect } from 'react';

export default function StudentTranscript({ setSlipData, setActivePage }) {
  const [studentId, setStudentId] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTranscript = async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);
    try {
      // encodeURIComponent handles the slashes in matric numbers (e.g., 13/PDBED/30287)
      const encodedId = encodeURIComponent(studentId);
      const response = await fetch(`http://localhost:8000/api/academic/transcript/${encodedId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(`Network/System Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-slate-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Fetching academic records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="block text-sm font-medium text-slate-700">Student ID / UUID</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            placeholder="Enter Student UUID..."
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
        </div>
        <button
          onClick={fetchTranscript}
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition shadow-md"
        >
          Generate Transcript
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="bg-white p-10 rounded-sm shadow-lg border border-slate-300 text-slate-900 print:shadow-none print:border-none">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-wide">Official Academic Transcript</h1>
            <p className="text-lg text-slate-600 mt-1">University Management System (ARPIS)</p>
          </div>

          {/* Student Profile Grid */}
          <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
            <div className="space-y-2">
              <p><span className="font-bold uppercase">Student Name:</span> {data.profile.name}</p>
              <p><span className="font-bold uppercase">Matriculation No:</span> {data.profile.matric_no}</p>
            </div>
            <div className="space-y-2 text-right">
              <p><span className="font-bold uppercase">Department:</span> {data.profile.department}</p>
              <p><span className="font-bold uppercase">Date of Issue:</span> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Academic Sessions */}
          <div className="space-y-12">
            {data.sessions.map((sess, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-400 pb-2">
                  <h2 className="text-xl font-bold text-slate-800 uppercase">Session: {sess.session}</h2>
                  <button
                    onClick={() => {
                      setSlipData({ studentId, sessionId: sess.session });
                      setActivePage('session-slip');
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded border border-slate-300 transition print:hidden"
                  >
                    View Sessional Slip
                  </button>
                </div>

                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-300">
                      <th className="p-2 font-bold uppercase">Course Code</th>
                      <th className="p-2 font-bold uppercase">Course Title</th>
                      <th className="p-2 font-bold uppercase text-center">Unit</th>
                      <th className="p-2 font-bold uppercase text-center">Score</th>
                      <th className="p-2 font-bold uppercase text-center">Grade</th>
                      <th className="p-2 font-bold uppercase text-center">Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sess.results.map((res, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 font-mono">{res.course_code}</td>
                        <td className="p-2">{res.description}</td>
                        <td className="p-2 text-center">{res.units}</td>
                        <td className="p-2 text-center">{res.score}</td>
                        <td className="p-2 text-center font-bold">{res.grade}</td>
                        <td className="p-2 text-center">{res.grade_point}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-slate-50">
                      <td colSpan="2" className="p-2 text-right uppercase">Session Total Units:</td>
                      <td className="p-2 text-center">{sess.total_units}</td>
                      <td colSpan="2" className="p-2 text-right uppercase">Session GPA:</td>
                      <td className="p-2 text-center text-blue-700">{sess.gpa}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}
          </div>

          {/* Final Summary */}
          <div className="mt-12 p-6 bg-slate-50 border-t-4 border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 uppercase font-bold">Cumulative Grade Point Average</p>
              <p className="text-4xl font-black text-slate-900">{data.cgpa}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 uppercase font-bold">Academic Standing</p>
              <p className="text-xl font-bold text-blue-800">
                {data.cgpa >= 4.5 ? 'First Class' : data.cgpa >= 3.5 ? 'Second Class Upper' : data.cgpa >= 2.4 ? 'Second Class Lower' : 'Pass'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
