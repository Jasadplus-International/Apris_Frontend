import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, CheckCircle2, Loader2, Lock, User, Mail, School } from 'lucide-react';
import { API, APIReady } from '../lib/api';
import jpLogoWhite from '../assets/jasadplus_logo_white.png';

const RED = '#c8282c';
const BLUE_DEEP = '#1b3a6b';
const BLUE = '#2c5697';

export default function RegisterInstitution({ onDone, onBack }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (password !== confirm) { setError('The two passwords do not match.'); return; }
    setBusy(true); setError('');
    try {
      await APIReady;
      const r = await fetch(`${API}/api/database/register-institution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institution_name: name, admin_username: username.trim(),
          admin_password: password, contact_email: email.trim(),
        }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.detail || 'Registration could not be submitted.'); return; }
      setDone(data);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen font-sans relative overflow-hidden" style={{ background: `linear-gradient(150deg, ${BLUE_DEEP} 0%, ${BLUE} 82%, #3e7cc4 130%)` }}>
        <div aria-hidden className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="doc-sheet rounded-2xl p-8 mt-36">
            <CheckCircle2 size={44} style={{ color: '#1f7a4d' }} strokeWidth={1.8} />
            <h1 className="font-display text-2xl font-semibold text-ink tracking-tight mt-4">Registration received</h1>
            <p className="text-[14px] text-mute mt-3 leading-relaxed">
              <strong className="text-ink">{done.code && done.code.replace(/-/g, ' ')}</strong> — your
              institution's private records database is prepared and waiting for approval.
            </p>
            <div className="mt-4 rounded-xl border border-line bg-[#fafbfd] px-4 py-3 text-[13px] text-mute leading-relaxed">
              <div className="flex items-start gap-2.5">
                <School size={15} className="mt-0.5 shrink-0" style={{ color: BLUE }} />
                <span>
                  The platform team, <strong className="text-ink">JasadPlus Services International</strong>,
                  verifies and approves new institutions shortly after signup. You will then be able to
                  sign in with the admin account:
                </span>
              </div>
            </div>
            <div className="mt-3 font-mono text-[13.5px] text-ink bg-white border border-line rounded-lg px-4 py-2.5">
              {username}
            </div>
            <button
              onClick={onDone}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold px-6 py-3.5 text-[14.5px] transition-opacity hover:opacity-90 shadow-lg"
              style={{ background: RED }}
            >
              <Lock size={15} /> Back to sign in
            </button>
          </motion.div>
          <div className="mt-auto py-8 text-center">
            <p className="text-[10.5px] font-mono tracking-[0.2em] uppercase text-white/40">
              A service of JasadPlus Services International
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans relative overflow-hidden" style={{ background: `linear-gradient(150deg, ${BLUE_DEEP} 0%, ${BLUE} 82%, #3e7cc4 130%)` }}>
      <div aria-hidden className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col">
        <div className="pt-16 pb-10">
          <button onClick={onBack || onDone} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-[13px] transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <motion.img
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            src={jpLogoWhite} alt="JasadPlus Services International" className="mt-8 h-12 object-contain"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          className="doc-sheet rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 pb-5 border-b border-line">
            <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: BLUE }}>
              <Building2 size={19} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink tracking-tight">Register your institution</h1>
              <p className="text-[12px] text-mute mt-0.5">Get the platform for your university or college</p>
            </div>
          </div>

          <form onSubmit={submit} className="pt-6 space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Institution name</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input autoFocus className="field icon" placeholder="e.g. Federal College of Education (Technical), Akoka"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Registry admin username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input className="field icon" placeholder="e.g. registry_admin"
                  value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-mute mb-1.5">Admin password</label>
                <input type="password" className="field" placeholder="8+ characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-mute mb-1.5">Confirm password</label>
                <input type="password" className="field" placeholder="Repeat password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Contact email <span className="font-normal text-mute/70">(optional)</span></label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input type="email" className="field icon" placeholder="registry@institution.edu.ng"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            {error && (
              <div className="text-[12.5px] rounded-lg px-3 py-2.5" style={{ background: '#fdecec', color: '#a4241e', border: '1px solid #f5c6c4' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !name.trim() || !username.trim() || !password}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold px-6 py-3.5 text-[14.5px] transition-opacity hover:opacity-90 disabled:opacity-45 shadow-lg"
              style={{ background: RED }}
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Building2 size={16} />}
              {busy ? 'Provisioning…' : 'Register institution'}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-mute leading-relaxed">
            Your institution's records database is prepared immediately and held for approval by the
            platform team, <strong className="text-ink">JasadPlus Services International</strong>. No other
            university can see your institution, and your data never leaves your own database.
          </p>
        </motion.div>

        <div className="mt-auto py-8 text-center">
          <p className="text-[10.5px] font-mono tracking-[0.2em] uppercase text-white/40">
            A service of JasadPlus Services International
          </p>
        </div>
      </div>
    </div>
  );
}
