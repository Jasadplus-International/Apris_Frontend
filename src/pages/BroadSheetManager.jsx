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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [deptRes, sessRes, courseRes, levelRes] = await Promise.all([
          fetch('http://localhost:8000/api/departments').catch(() => null),
          fetch('http://localhost:8000/api/results/sessions').catch(() => null),
          fetch('http://localhost:8000/api/courses').catch(() => null),
          fetch('http://localhost:8000/api/levels').catch(() => null)
        ]);

        const deptData = deptRes && deptRes.ok ? await deptRes.json() : [];
        const sessData = sessRes && sessRes.ok ? await sessRes.json() : [];
        const courseData = courseRes && courseRes.ok ? await courseRes.json() : [];
        const levelData = levelRes && levelRes.ok ? await levelRes.json() : [];

        setDepartments(Array.isArray(deptData) ? deptData : []);
        setSessions(Array.isArray(sessData) ? sessData : []);
        setCourses(Array.isArray(courseData) ? courseData : []);
        setLevels(Array.isArray(levelData) ? levelData : []);
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleDownload = async () => {
    if (!config.deptId || !config.sessionId || !config.level) {
      alert("Please select a Department, Session, and Level.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/api/reports/download-broadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: config.deptId,
          session_id: config.sessionId,
          level: config.level,
          course_ids: selectedCourses,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BroadSheet_${config.deptId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to generate BroadSheet"));
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
          <label className="block text-sm font-medium text-slate-700">Select Courses</label>
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
            {(!courses || courses.length === 0) && <p className="text-slate-400 italic text-sm col-span-full text-center">No courses available</p>}
          </div>
          <p className="text-xs text-slate-400 italic">Select one or more courses to include in the BroadSheet.</p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className={`w-full mt-8 py-3 rounded-lg font-bold transition shadow-lg ${
            isGenerating
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
          }`}>
          {isGenerating ? 'Generating Excel File...' : 'Generate & Download BroadSheet'}
        </button>
      </div>
    </div>
  );
}
