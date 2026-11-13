import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowLeft, Loader2, GraduationCap } from 'lucide-react';
import { API, APIReady, authFetch } from '../lib/api';
import { refreshInstitution } from '../lib/useInstitution';
import jpLogoWhite from '../assets/jasadplus_logo_white.png';

const RED = '#c8282c';
const BLUE_DEEP = '#1b3a6b';
const BLUE = '#2c5697';

export default function SignIn({ onSignedIn, onBack, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password || busy) return;
    setBusy(true);
    setError('');
    try {
      await APIReady;
      const body = new URLSearchParams({ username: username.trim(), password, grant_type: 'password' });
      const r = await authFetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!r.ok) {
        const detail = await r.json().catch(() => null);
        setError(detail?.detail || 'Incorrect username or password.');
        return;
      }
      const data = await r.json();
      // Keep the session client-side; the server has already locked onto the
      // university that owns this account. SuperAdmin sees the platform tools.
      try {
        localStorage.setItem('arpis_token', data.access_token);
        localStorage.setItem('arpis_role', data.role || '');
      } catch {}
      await refreshInstitution();
      onSignedIn(data);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden" style={{ background: `linear-gradient(150deg, ${BLUE_DEEP} 0%, ${BLUE} 82%, #3e7cc4 130%)` }}>
      {/* ledger grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }}
      />

      <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col">
        {/* top */}
        <div className="pt-16 pb-10">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-[13px] transition-colors">
            <ArrowLeft size={14} /> Back to home
          </button>
          <motion.img
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            src={jpLogoWhite} alt="JasadPlus Services International" className="mt-8 h-12 object-contain"
          />
        </div>

        {/* card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          className="doc-sheet rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 pb-5 border-b border-line">
            <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: BLUE }}>
              <GraduationCap size={19} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink tracking-tight">Sign in</h1>
              <p className="text-[12px] text-mute mt-0.5">Enter your institution account</p>
            </div>
          </div>

          <form onSubmit={submit} className="pt-6 space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  autoFocus
                  className="field icon"
                  placeholder="e.g. corona_admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  type="password"
                  className="field icon"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="text-[12.5px] rounded-lg px-3 py-2.5" style={{ background: '#fdecec', color: '#a4241e', border: '1px solid #f5c6c4' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !username.trim() || !password}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold px-6 py-3.5 text-[14.5px] transition-opacity hover:opacity-90 disabled:opacity-45 shadow-lg"
              style={{ background: RED }}
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Lock size={15} />}
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-mute leading-relaxed">
            Your account is issued by your institution&rsquo;s registry. If you have forgotten
            your password, contact your institution&rsquo;s administrator.
          </p>
        </motion.div>

        {/* Public self-service onboarding */}
        <button
          onClick={onRegister}
          className="mt-5 w-full text-center text-[13px] text-white/60 hover:text-white transition-colors"
        >
          New institution? <span className="underline decoration-2" style={{ textDecorationColor: RED }}>Register your university</span>
        </button>

        <div className="mt-auto py-8 text-center">
          <p className="text-[10.5px] font-mono tracking-[0.2em] uppercase text-white/40">
            A service of JasadPlus Services International
          </p>
        </div>
      </div>
    </div>
  );
}
