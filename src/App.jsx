import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import StudentRegistry from './pages/StudentRegistry';
import BroadSheetManager from './pages/BroadSheetManager';
import ResultEntry from './pages/ResultEntry';
import StudentTranscript from './pages/StudentTranscript';
import StudentSessionSlip from './pages/StudentSessionSlip';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [slipData, setSlipData] = useState({ studentId: '', sessionId: '' });

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar
        setActivePage={setActivePage}
        activePage={activePage}
        setSlipData={setSlipData}
      />

      <main className="flex-1 overflow-y-auto p-8">
        {activePage === 'dashboard' && <DashboardHome />}
        {activePage === 'students' && <StudentRegistry />}
        {activePage === 'results' && <ResultEntry />}
        {activePage === 'broadsheet' && <BroadSheetManager />}
        {activePage === 'transcript' && (
          <StudentTranscript
            setSlipData={setSlipData}
            setActivePage={setActivePage}
          />
        )}
        {activePage === 'session-slip' && (
          <StudentSessionSlip
            studentId={slipData.studentId}
            sessionId={slipData.sessionId}
            onBack={() => setActivePage('transcript')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
