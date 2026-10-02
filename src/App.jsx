import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import StudentRegistry from './pages/StudentRegistry';
import BroadSheetManager from './pages/BroadSheetManager';
import ResultEntry from './pages/ResultEntry';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar setActivePage={setActivePage} activePage={activePage} />

      <main className="flex-1 overflow-y-auto p-8">
        {activePage === 'dashboard' && <DashboardHome />}
        {activePage === 'students' && <StudentRegistry />}
        {activePage === 'results' && <ResultEntry />}
        {activePage === 'broadsheet' && <BroadSheetManager />}
      </main>
    </div>
  );
}

export default App;
