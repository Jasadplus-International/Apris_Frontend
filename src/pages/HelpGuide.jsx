import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LifeBuoy, Upload, ClipboardEdit, FileSpreadsheet, ScrollText, Users,
  ShieldCheck, KeyRound, Database, ChevronDown, ChevronUp, Building2,
} from 'lucide-react';

const BRAND_BLUE = '#2c5697';
const RED = '#c8282c';

const SECTIONS = [
  {
    title: 'Getting oriented',
    icon: Building2,
    body: [{
      h: 'The two names, and who is who',
      p: 'ARPIS is the product — the results processing platform you are using right now. JasadPlus Services International Limited is the company that builds and operates it. Both names appear throughout the app: ARPIS on every working screen, JasadPlus under it ("ARPIS is a product of JasadPlus Services International").',
    }],
  },
  {
    title: 'Bringing your records in',
    icon: Upload,
    body: [{
      h: 'Institution → Import records',
      p: 'Download the ARPIS Import Workbook (branded Excel file, one sheet per table). Fill DEPARTMENTS, SESSIONS, STUDENTS, COURSES and REGISTRATIONS first, then RESULTS (marks only — grades are computed for you). Upload it; the platform builds a private staging copy and shows you exactly what came across. "Save & replace" goes live and keeps a timestamped backup of the previous database — "Discard" drops the staging copy harmlessly.',
      next: 'Legacy .mdb files from the old ARPIS desktop software are also accepted where the Access ODBC driver is installed.',
    }],
  },
  {
    title: 'Running a session',
    icon: ClipboardEdit,
    body: [
      { h: 'Registration', p: 'Register a whole level for a session in bulk. Courses already passed with a score of 40+ are blocked automatically from re-registration.' },
      { h: 'Result Entry', p: 'Pick a session and course, type coursework (max 30) and exam (max 70). Totals and grades compute as you type; marks under 40 raise a carry-over automatically. Every change is recorded in the Change history panel — who changed what, and when.' },
      { h: 'Carry-overs', p: 'The Carry-overs page tracks failed courses and re-sits across sessions without any spreadsheet work.' },
    ],
  },
  {
    title: 'Official paperwork',
    icon: FileSpreadsheet,
    body: [
      { h: 'BroadSheet Manager', p: 'Pick a department, session, level and courses, then generate the three-file official bundle: departmental broadsheet, cover page and summary sheet. Downloaded as Excel, formatted for the registry.' },
      { h: 'Transcripts', p: 'Search a matric number for the full official transcript across every session, per-session result slips, and print-ready PDF versions of both (the PDF buttons on the page).' },
    ],
  },
  {
    title: 'People and access',
    icon: Users,
    body: [
      { h: 'User accounts', p: 'Admins and Developers create staff accounts with four roles: Admin, Developer, Lecturer, Standard. Reset passwords, change roles, deactivate leavers (the last active Admin of an institution can never be demoted or locked out).' },
      { h: 'Your two-factor sign-in', p: 'In User accounts → "My sign-in security": scan the QR code with any authenticator app (Google Authenticator, Microsoft Authenticator, Authy), enter one code to switch MFA on. From then on, sign-in asks for a 6-digit code after your password. Disable it the same way with one confirming code.' },
    ],
  },
  {
    title: 'Safety net',
    icon: ShieldCheck,
    body: [{
      h: 'Backups & institution control',
      p: 'Nightly backups run automatically for every institution (14 dumps kept each), on top of the backup taken at every record replacement. Institution pages show both lists and a "Back up now" button. Administrators of an institution may also run a backup on demand.',
    }],
  },
];

export default function HelpGuide({ myRole }) {
  const [open, setOpen] = useState(0);

  const toggle = (i) => setOpen(open === i ? -1 : i);

  return (
    <div>
      <div className="bg-ink text-white rounded-xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{ background: RED }}>
            <LifeBuoy size={19} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight">Help guide</h1>
            <p className="text-[12px] text-white/55 mt-0.5">
              ARPIS — a product of JasadPlus Services International · how to run every part of the platform
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-w-3xl">
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="doc-sheet rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f8fafd] transition-colors"
            >
              <span className="inline-flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: '#e8eef8' }}>
                  <section.icon size={17} style={{ color: BRAND_BLUE }} strokeWidth={2} />
                </span>
                <span className="font-display text-[16px] font-semibold text-ink">{section.title}</span>
              </span>
              {open === i ? <ChevronUp size={15} className="text-mute shrink-0" /> : <ChevronDown size={15} className="text-mute shrink-0" />}
            </button>
            {open === i && (
              <div className="px-5 pb-5 pt-2 space-y-4 border-t border-line">
                {section.body.map((entry) => (
                  <div key={entry.h}>
                    <h3 className="font-semibold text-[13.5px] text-ink">{entry.h}</h3>
                    <p className="text-[13px] text-mute leading-relaxed mt-1">{entry.p}</p>
                    {entry.next && (
                      <p className="text-[12px] text-mute leading-relaxed mt-2 flex items-start gap-2">
                        <Database size={13} className="mt-0.5 shrink-0" /> {entry.next}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 doc-sheet rounded-xl p-5 text-[12px] text-mute leading-relaxed max-w-3xl">
        <p>
          <b className="text-ink">Still stuck?</b> Contact the platform team —
          JasadPlus Services International Limited (RC 902237), 9 Ajasa Street, Onikan, Lagos Island ·
          0705 199 0250 · info@jasadplus.com. <i>ValuePlus Services Guaranteed.</i>
        </p>
      </div>
    </div>
  );
}
