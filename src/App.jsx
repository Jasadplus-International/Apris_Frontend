import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import StudentRegistry from './pages/StudentRegistry';
import BroadSheetManager from './pages/BroadSheetManager';
import ResultEntry from './pages/ResultEntry';
import CarryOvers from './pages/CarryOvers';
import StudentTranscript from './pages/StudentTranscript';
import StudentSessionSlip from './pages/StudentSessionSlip';
import DepartmentManager from './pages/DepartmentManager';
import CourseManager from './pages/CourseManager';
import CourseRegistration from './pages/CourseRegistration';
import InstitutionSetup from './pages/InstitutionSetup';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import RegisterInstitution from './pages/RegisterInstitution';
import Approvals from './pages/Approvals';
import UsersManager from './pages/UsersManager';
import HelpGuide from './pages/HelpGuide';
import { useInstitutionVersion, refreshInstitution } from './lib/useInstitution';
import { API, authFetch } from './lib/api';

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
  const [menuOpen, setMenuOpen] = useState(false); // mobile drawer
  const [me, setMe] = useState(() => {
    // role + username, refreshed on every sign-in / restore
    let role = '';
    let username = '';
    try {
      role = localStorage.getItem('arpis_role') || '';
      const tok = localStorage.getItem('arpis_token');
      if (tok) {
        const payload = JSON.parse(atob(tok.split('.')[1]));
        username = payload.sub || '';
      }
    } catch {}
    return { role, username };
  });

  // Dashboard workflow shortcuts navigate via custom event
  useEffect(() => {
    const off = (e) => setActivePage(e.detail);
    const onExpired = () => { setSlipData({ studentId: '', sessionId: '' }); setView('signin'); setActivePage('dashboard'); };
    window.addEventListener('arpis-navigate', off);
    window.addEventListener('arpis-session-expired', onExpired);
    return () => {
      window.removeEventListener('arpis-navigate', off);
      window.removeEventListener('arpis-session-expired', onExpired);
    };
  }, []);

  // Session restore: a saved token resumes straight into the platform, with
  // the server re-locked to the university that owns the account.
  useEffect(() => {
    const boot = async () => {
      let token = null;
      try { token = localStorage.getItem('arpis_token'); } catch {}
      if (!token) return; // no session — stay on the public landing page
      try {
        const r = await authFetch(`${API}/api/auth/me`);
        if (!r.ok) { // expired/invalid — drop the stale session
          try { localStorage.removeItem('arpis_token'); localStorage.removeItem('arpis_role'); } catch {}
          return;
        }
        const userData = await r.json();
        try { localStorage.setItem('arpis_role', userData.role || ''); } catch {}
        setMe({ role: userData.role || '', username: userData.username || '' });
        if (userData.institution) {
          await refreshInstitution();
          setView('app');
        } else {
          // operator token — the console's default instance stands; enter as-is
          await refreshInstitution();
          setView('app');
        }
      } catch { /* backend down — landing stays until signed in */ }
    };
    boot();
  }, []);

  if (view === 'landing' || activePage === 'landing') {
    return <Landing onEnter={() => { setView('signin'); setActivePage('dashboard'); }} />;
  }

  if (view === 'signin') {
    return (
      <SignIn
        onSignedIn={() => {
          let username = ''; let role = '';
          try {
            role = localStorage.getItem('arpis_role') || '';
            username = JSON.parse(atob((localStorage.getItem('arpis_token') || '.').split('.')[1])).sub || '';
          } catch {}
          setMe({ role, username });
          setView('app'); setActivePage('dashboard');
        }}
        onBack={() => { setView('landing'); setActivePage('dashboard'); }}
        onRegister={() => setView('register')}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterInstitution
        onDone={() => setView('signin')}
        onBack={() => setView('signin')}
      />
    );
  }

  return (
    <div className="flex h-screen bg-paper font-sans">
      {/* mobile top bar with the drawer toggle */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-ink text-white h-12 flex items-center px-4 gap-3 shadow-lg">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="p-1.5 rounded-lg hover:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="font-display font-semibold tracking-tight text-[15px]">ARPIS</span>
        <span className="text-[9.5px] font-mono tracking-[0.18em] uppercase text-white/40">by JasadPlus</span>
      </div>
      {/* scrim behind the mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />
      <Sidebar
        setActivePage={setActivePage}
        activePage={activePage}
        setSlipData={setSlipData}
        menuOpen={menuOpen}
        onCloseMenu={() => setMenuOpen(false)}
        onSignOut={() => { setSlipData({ studentId: '', sessionId: '' }); setView('signin'); setActivePage('dashboard'); }}
      />

      <main className="flex-1 overflow-y-auto pt-12 md:pt-0">
        <div className="p-4 sm:p-6 xl:p-10 max-w-[1400px] mx-auto min-h-full">
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
              {activePage === 'carryovers' && <CarryOvers />}
              {activePage === 'broadsheet' && <BroadSheetManager />}
              {activePage === 'departments' && <DepartmentManager />}
              {activePage === 'courses' && <CourseManager />}
              {activePage === 'registration' && <CourseRegistration />}
              {activePage === 'institution' && <InstitutionSetup />}
              {activePage === 'approvals' && <Approvals />}
              {activePage === 'users' && (
                <UsersManager myRole={me.role} myUsername={me.username} />
              )}
              {activePage === 'help' && <HelpGuide myRole={me.role} />}
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
