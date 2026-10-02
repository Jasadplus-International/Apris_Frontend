import React, { useState, useEffect } from 'react';

export default function ResultEntry() {
  const [courseId, setCourseId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    if (!courseId || !sessionId) {
      alert("Please select both a Course and a Session");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/results/students-by-course?course_id=${courseId}&session_id=${sessionId}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      alert("Error fetching student list.");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = async (regId, field, value) => {
    // Create a copy of the students list
    const updatedStudents = students.map(s => {
      if (s.registration_id === regId) {
        return { ...s, [field]: parseFloat(value) || 0 };
      }
      return s;
    });
    setStudents(updatedStudents);

    // Find the specific student to send the update to the backend
    const student = updatedStudents.find(s => s.registration_id === regId);

    try {
      const response = await fetch('http://localhost:8000/api/results/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: regId,
          course_work: student.course_work,
          exam_score: student.exam_score,
        }),
      });
      const data = await response.json();

      // Update the grade in the UI based on backend calculation
      setStudents(prev => prev.map(s =>
        s.registration_id === regId ? { ...s, grade: data.grade } : s
      ));
    } catch (error) {
      console.error("Failed to save score", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Result Entry</h1>
        <div className="flex space-x-3">
          <input
            placeholder="Course ID"
            className="p-2 border rounded-md"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
          <input
            placeholder="Session ID"
            className="p-2 border rounded-md"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
          <button
            onClick={fetchStudents}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Load Students
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-700">
              <th className="p-4 font-semibold">Matric No</th>
              <th className="p-4 font-semibold">Student Name</th>
              <th className="p-4 font-semibold">Course Work (40)</th>
              <th className="p-4 font-semibold">Exam Score (60)</th>
              <th className="p-4 font-semibold">Final Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center">Loading students...</td></tr>
            ) : students.length > 0 ? students.map((s) => (
              <tr key={s.registration_id} className="hover:bg-slate-50 transition">
                <td className="p-4 text-sm font-medium text-slate-900">{s.matric_no}</td>
                <td className="p-4 text-sm text-slate-600">{s.name}</td>
                <td className="p-4">
                  <input
                    type="number"
                    className="w-20 p-1 border rounded text-center"
                    value={s.course_work}
                    onChange={(e) => handleScoreChange(s.registration_id, 'course_work', e.target.value)}
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    className="w-20 p-1 border rounded text-center"
                    value={s.exam_score}
                    onChange={(e) => handleScoreChange(s.registration_id, 'exam_score', e.target.value)}
                  />
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    s.grade === 'A' ? 'bg-green-100 text-green-700' :
                    s.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {s.grade}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No results to display. Select course and session first.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
