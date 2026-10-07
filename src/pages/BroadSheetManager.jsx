import React, { useState, useEffect } from 'react';

export default function BroadSheetManager() {
  const [config, setConfig] = useState({
    deptId: '',
    sessionId: '',
    level: '',
  });
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [deptRes, sessRes, levelRes] = await Promise.all([
          fetch('http://localhost:8000/api/departments').catch(() => null),
          fetch('http://localhost:8000/api/results/sessions').catch(() => null),
          fetch('http://localhost:8000/api/levels').catch(() => null)
        ]);

        const deptData = deptRes && deptRes.ok ? await deptRes.json() : [];
        const sessData = sessRes && sessRes.ok ? await sessRes.json() : [];
        const levelData = levelRes && levelRes.ok ? await levelRes.json() : [];

        setDepartments(Array.isArray(deptData) ? deptData : []);
        setSessions(Array.isArray(sessData) ? sessData : []);
        setLevels(Array.isArray(levelData) ? levelData : []);
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadFilteredCourses = async () => {
      if (!config.deptId || !config.sessionId || !config.level) return;

      try {
        const params = new URLSearchParams({
          department_id: config.deptId,
          session_id: config.sessionId,
          level: config.level
        });
        const res = await fetch(`http://localhost:8000/api/results/courses-by-criteria?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Error loading filtered courses:", err);
      }
    };
    loadFilteredCourses();
  }, [config.deptId, config.sessionId, config.level]);

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handlePreview = async () => {
    if (!config.deptId || !config.sessionId || !config.level) {
      alert("Please select a Department, Session, and Level.");
      return;
    }

    setIsGenerating(true);
    try {
      const params = new URLSearchParams({
        department_id: config.deptId,
        session_id: config.sessionId,
        level: config.level
      });
      const response = await fetch(`http://localhost:8000/api/reports/preview-broadsheet?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      } else {
        alert("Error generating preview.");
      }
    } catch (error) {
      console.error("Preview error:", error);
      alert("Network error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!config.deptId || !config.sessionId || !config.level) {
      alert("Please select a Department, Session, and Level.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/api/reports/download-report-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: config.deptId,
          session_id: config.sessionId,
          level: config.level,
          course_ids: selectedCourses,
          programme_name: "PDECE_CCOE:PDE 1",
          level_code: "SETD/1",
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
        alert("Error: " + (err.detail || "Failed to generate Report Bundle"));
      }
    } catch (error) {
      alert("Network error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-slate-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">BroadSheet Generator</h1>
        <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Export to .xlsx
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Department</label>
            <select
              className="w-full p-2 border rounded-md bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={config.deptId}
              onChange={(e) => setConfig({...config, deptId: e.target.value})}>
              <option value="">Select Department...</option>
              {(departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Academic Session</label>
            <select
              className="w-full p-2 border rounded-md bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={config.sessionId}
              onChange={(e) => setConfig({...config, sessionId: e.target.value})}>
              <option value="">Select Session...</option>
              {(sessions || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Academic Level</label>
            <select
              className="w-full p-2 border rounded-md bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={config.level}
              onChange={(e) => setConfig({...config, level: e.target.value})}>
              <option value="">Select Level...</option>
              {(levels || []).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Select Courses</label>
            <span className="text-xs text-slate-400 italic">Only courses for the selected Department, Session and Level will show here.</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 border rounded-md bg-slate-50">
            {(courses || []).map(c => (
              <label key={c.id} className="flex items-center gap-3 p-2 bg-white border rounded hover:border-blue-400 cursor-pointer transition">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600"
                  checked={selectedCourses.includes(c.id)}
                  onChange={() => toggleCourse(c.id)}
                />
                <span className="text-sm text-slate-700 font-mono">{c.code} - {c.description}</span>
              </label>
            ))}
            {(!courses || courses.length === 0) && <p className="text-slate-400 italic text-sm col-span-full text-center">No courses available for the selected criteria.</p>}
          </div>
          <p className="text-xs text-slate-400 italic">Select one or more courses to include in the BroadSheet.</p>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handlePreview}
            disabled={isGenerating}
            className={`flex-1 py-3 rounded-lg font-bold transition shadow-md ${
              isGenerating
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}>
            {isGenerating ? 'Processing...' : 'Preview BroadSheet'}
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`flex-1 py-3 rounded-lg font-bold transition shadow-lg ${
              isGenerating
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}>
            {isGenerating ? 'Generating Excel File...' : 'Generate & Download BroadSheet'}
          </button>
        </div>
      </div>

      {previewData && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">BroadSheet Preview</h2>
          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-1">Matric No</th>
                <th className="border border-slate-300 p-1">Name</th>
                {previewData.courses.map(c => (
                  <th key={c.id} className="border border-slate-300 p-1 text-center">{c.code}</th>
                ))}
                <th className="border border-slate-300 p-1">GPA</th>
              </tr>
            </thead>
            <tbody>
              {previewData.students && previewData.students.length > 0 ? (
                previewData.students.map((s, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-1 text-xs">{s.matric_no}</td>
                    <td className="border border-slate-300 p-1 text-xs">{s.name}</td>
                    {previewData.courses.map(c => {
                      const res = s.results.find(r => r.course_code === c.code);
                      return (
                        <td key={c.id} className="border border-slate-300 p-1 text-center text-xs">
                          {res ? `${res.cw}/${res.ex}/${res.total}` : 'ABS'}
                        </td>
                      );
                    })}
                    <td className="border border-slate-300 p-1 text-center text-xs font-bold">{s.gpa}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={previewData.courses.length + 3} className="border border-slate-300 p-4 text-center text-slate-500 italic">
                    No data available for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
