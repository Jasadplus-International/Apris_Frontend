import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import StudentRegistry from './pages/StudentRegistry';
import BroadSheetManager from './pages/BroadSheetManager';
import ResultEntry from './pages/ResultEntry';
import StudentTranscript from './pages/StudentTranscript';
import StudentSessionSlip from './pages/StudentSessionSlip';
import DepartmentManager from './pages/DepartmentManager';
import CourseManager from './pages/CourseManager';
import CourseRegistration from './pages/CourseRegistration';
import InstitutionSetup from './pages/InstitutionSetup';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import { useInstitutionVersion } from './lib/useInstitution';

/* Crash guard: a broken page must never blank the whole app */
class ErrorBoundary extends Component {
  state = { error: null, info: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { this.setState({ info }); }
  render() {
    if (this.state.error) {
      return (
        <div className="p-10 max-w-3xl">
          <div className="doc-sheet rounded-xl p-8">
            <p className="font-display text-xl font-semibold text-seal mb-3">This page hit an error</p>
            <pre className="text-[12px] font-mono text-ink whitespace-pre-wrap border border-line rounded-lg p-4 bg-[#fafbfd]">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <pre className="text-[10.5px] font-mono text-mute mt-3 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {String(this.state.info?.componentStack || '')}
            </pre>
            <p className="text-[12px] text-mute mt-4">The error is also in the browser console (F12 → Console). Copy it to fix precisely.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  // 'landing' = public site, 'signin' = the sign-in screen, 'app' = the platform
  const [view, setView] = useState('landing');
  const [activePage, setActivePage] = useState('dashboard');
  const [slipData, setSlipData] = useState({ studentId: '', sessionId: '' });
  const instVersion = useInstitutionVersion(); // pages remount when the university changes

  // Dashboard workflow shortcuts navigate via custom event
  useEffect(() => {
    const off = (e) => setActivePage(e.detail);
    window.addEventListener('arpis-navigate', off);
    return () => window.removeEventListener('arpis-navigate', off);
  }, []);

  if (view === 'landing' || activePage === 'landing') {
    return <Landing onEnter={() => { setView('signin'); setActivePage('dashboard'); }} />;
  }

  if (view === 'signin') {
    return (
      <SignIn
        onSignedIn={() => { setView('app'); setActivePage('dashboard'); }}
        onBack={() => { setView('landing'); setActivePage('dashboard'); }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-paper font-sans">
      <Sidebar
        setActivePage={setActivePage}
        activePage={activePage}
        setSlipData={setSlipData}
        onSignOut={() => { setSlipData({ studentId: '', sessionId: '' }); setView('signin'); setActivePage('dashboard'); }}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 xl:p-10 max-w-[1400px] mx-auto min-h-full">
          <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage + (slipData.sessionId || '') + String(instVersion)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {activePage === 'dashboard' && <DashboardHome />}
              {activePage === 'students' && <StudentRegistry />}
              {activePage === 'results' && <ResultEntry />}
              {activePage === 'broadsheet' && <BroadSheetManager />}
              {activePage === 'departments' && <DepartmentManager />}
              {activePage === 'courses' && <CourseManager />}
              {activePage === 'registration' && <CourseRegistration />}
              {activePage === 'institution' && <InstitutionSetup />}
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
            </motion.div>
          </AnimatePresence>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default App;
