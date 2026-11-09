import { motion } from 'framer-motion';
import {
  Upload, Database, FileSpreadsheet, ScrollText, ClipboardEdit,
  GraduationCap, ShieldCheck, ArrowRight, Lock, Printer, Globe2,
  Mail, Phone, MapPin, ChevronRight, Sparkles, RefreshCw,
  ExternalLink, Fingerprint, Printer as PrinterIcon,
} from 'lucide-react';
import jpLogo from '../assets/jasadplus_logo.png';
import jpLogoWhite from '../assets/jasadplus_logo_white.png';

const COMPANY = 'JasadPlus Services International Limited';

/* Brand colours taken from the corporate logo (RC 902237) */
const BLUE_DEEP = '#1b3a6b';   // deep corporate blue — backgrounds
const BLUE = '#2c5697';        // "Jasad" blue — primary
const BLUE_LIGHT = '#3e7cc4';  // accent blue
const RED = '#c8282c';         // "Plus" red — accents/CTAs

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
});

const features = [
  {
    icon: Upload,
    title: 'Database import in minutes',
    body: 'Bring in your result records from a Microsoft Access (.mdb) backup. Every student, course and score lands in a private staging copy you review before anything changes.',
  },
  {
    icon: Database,
    title: 'One home for every record',
    body: 'Departments, course catalogues, registrations and results live in a secure database per university. Your data is never mixed with another institution\'s.',
  },
  {
    icon: ClipboardEdit,
    title: 'Results entry made simple',
    body: 'Coursework and exam scores are keyed in once. Grades, grade points and class of pass are computed instantly on the official grading scale — A to F.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Departmental broadsheets',
    body: 'Generate the exact broadsheet your registry expects: merged course headers, CW/EX/Total/GP columns, semester status and GPA/CGPA summaries. Excel-ready.',
  },
  {
    icon: GraduationCap,
    title: 'University results sheets',
    body: 'The full departmental results sheet for senate — credit units earned and passed, grade-point totals, cumulative GPA, outstanding units and failed courses, student by student.',
  },
  {
    icon: ScrollText,
    title: 'Transcripts & results slips',
    body: 'Per-student transcripts across sessions and official session result slips, generated from the same records with no re-entry.',
  },
  {
    icon: RefreshCw,
    title: 'Carry-overs tracked automatically',
    body: 'Students who re-sit a session are identified and sectioned — carry-over lists build themselves from registration history.',
  },
  {
    icon: PrinterIcon,
    title: 'Print-ready official outputs',
    body: 'Broadsheets, departmental results, cover pages and student reports export as ready-to-sign Excel and PDF documents.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe by design',
    body: 'Imports are staged, verified and applied with an atomic replace; the previous database is preserved as a timestamped backup every time.',
  },
];

const steps = [
  {
    n: '01',
    icon: Upload,
    title: 'Upload your database',
    body: 'Bring in the .mdb / .accdb records file your institution already keeps and confirm its database password. Nothing on the live system changes yet.',
  },
  {
    n: '02',
    icon: Database,
    title: 'Review the staged import',
    body: 'The import builds a private staging database and shows you exactly what came across — student, department, course and result counts.',
  },
  {
    n: '03',
    icon: Sparkles,
    title: 'Apply & start working',
    body: 'Save & replace swaps staging in atomically, keeping the previous database as a backup. Score results, broadsheets and transcripts are then one click away.',
  },
];

const stats = [
  { k: '2009', v: 'in operation — IT solutions & records systems since' },
  { k: '2,547', v: 'students migrated in a single database import' },
  { k: '172,695', v: 'course records carried across intact' },
  { k: 'A–F', v: 'official grading scale with instant GPA & CGPA' },
];

const work = [
  {
    icon: GraduationCap,
    title: 'ARPIS for Colleges of Education',
    body: 'Customization and deployment of the web-based results processing platform, backward integration of previous results, and onsite user & administrative training.',
  },
  {
    icon: Fingerprint,
    title: 'Integrated student portals',
    body: 'Students\' Portal Management & Results Processing solutions — biometric records, fees, matriculation, course registration, results and transcripts.',
  },
  {
    icon: Fingerprint,
    title: 'National licensing platform',
    body: 'The National Boat Riders\' Online Licensing & Administration system for the Nigerian Inland Waterways Authority (NIWA) — QR-code verification, delivered Build-Operate-Transfer.',
  },
];

export default function Landing({ onEnter }) {
  return (
    <div className="min-h-screen font-sans" style={{ background: '#f4f7fb', color: '#16233c' }}>
      {/* ===== TOP BAR ===== */}
      <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10" style={{ background: BLUE_DEEP }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={jpLogoWhite} alt="JasadPlus Services International" className="h-11 object-contain" />
          <div className="hidden md:flex items-center gap-7 text-[13px] text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#onboarding" className="hover:text-white transition-colors">Onboarding</a>
            <a href="#company" className="hover:text-white transition-colors">Company</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-2 rounded-lg text-white text-[13px] font-semibold px-4 py-2.5 transition-opacity hover:opacity-90 shadow-lg"
            style={{ background: RED }}
          >
            <Lock size={14} /> Sign in
          </button>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(150deg, ${BLUE_DEEP} 0%, ${BLUE} 78%, ${BLUE_LIGHT} 130%)` }}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <motion.img {...fade(0)} src={jpLogoWhite} alt={COMPANY} className="h-20 md:h-24 object-contain" />

          <motion.p
            {...fade(0.06)}
            className="mt-8 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-mono tracking-[0.14em] uppercase"
            style={{ borderColor: 'rgba(255,255,255,0.35)', color: '#ffd7d8' }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: RED }} />
            ValuePlus services guaranteed
          </motion.p>

          <motion.h1
            {...fade(0.12)}
            className="font-display text-4xl md:text-6xl font-semibold leading-[1.08] tracking-tight mt-6 max-w-3xl"
          >
            Your institution&rsquo;s results,
            <span style={{ color: '#ffb3b5' }}> from registry desk to official sheet</span>
          </motion.h1>

          <motion.p {...fade(0.2)} className="mt-6 text-white/70 text-lg leading-relaxed max-w-2xl">
            {COMPANY} is a Lagos-based IT solutions company, and this is our results platform for
            universities, colleges of education and polytechnics. Enrol students, register courses, enter
            scores, and generate broadsheets, departmental results sheets, transcripts and session slips —
            computed, formatted and ready to sign.
          </motion.p>

          <motion.div {...fade(0.28)} className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={onEnter}
              className="inline-flex items-center gap-2.5 rounded-xl text-white font-semibold px-7 py-4 text-[15px] transition-opacity hover:opacity-90 shadow-xl shadow-black/25"
              style={{ background: RED }}
            >
              Sign in to your institution <ArrowRight size={17} />
            </button>
            <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-white/25 hover:border-white/50 text-white/85 hover:text-white px-7 py-4 text-[15px] transition-colors">
              Explore the platform <ChevronRight size={16} />
            </a>
          </motion.div>

          {/* mini ledger preview */}
          <motion.div {...fade(0.36)} className="mt-16 doc-sheet rounded-2xl overflow-hidden max-w-3xl">
            <div className="bg-[#fafbfd] border-b border-line px-5 py-3 flex items-center justify-between">
              <div className="text-[11px] font-mono tracking-wide text-mute uppercase">Departmental broadsheet · generated sheet</div>
              <div className="stamp" style={{ color: '#1f7a4d' }}>GPA verified</div>
            </div>
            <table className="ledger">
              <thead>
                <tr>
                  <th>S/NO</th><th>MATRIC NO</th><th>Name</th><th>PED 111 · CW</th><th>EX</th><th>T</th><th>GP</th><th>GPA</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>CCED/PDECE/24/001</td><td>OBI Martina</td><td>24</td><td>52</td><td>76</td><td>A</td><td className="font-semibold text-pass">4.72</td></tr>
                <tr><td>2</td><td>CCED/PDECE/24/002</td><td>OKAFOR Daniel</td><td>21</td><td>41</td><td>62</td><td>B</td><td className="font-semibold text-pass">3.88</td></tr>
                <tr><td>3</td><td>CCED/PDECE/24/003</td><td>EZE Grace</td><td>18</td><td>34</td><td>52</td><td>C</td><td className="font-semibold">3.15</td></tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-b border-line bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.k} {...fade(i * 0.06)}>
              <div className="font-display text-3xl font-semibold" style={{ color: RED }}>{s.k}</div>
              <div className="mt-1 text-[12.5px] text-mute leading-snug">{s.v}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== WHAT IT DOES ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div {...fade()} className="max-w-3xl">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase font-semibold" style={{ color: BLUE }}>Why JasadPlus</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink tracking-tight mt-3">
            One system your exam office, faculties and registry can finally agree on
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-mute">
            The platform is built to the official grading standards your institution already operates — the
            A–F scale, weighted GPA, cumulative CGPA and pass conditions as your exam officers know them.
            Import, entry and generation take minutes instead of days, and every output is formatted for the
            registry.
          </p>
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" id="features">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              {...fade((i % 3) * 0.08)}
              className="doc-sheet rounded-xl p-6 hover:-translate-y-0.5 transition-transform"
            >
              <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: BLUE }}>
                <f.icon size={19} className="text-white" strokeWidth={2} />
              </div>
              <h3 className="font-display text-[17px] font-semibold text-ink mt-4">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-mute">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ===== ONBOARDING ===== */}
      <section id="onboarding" style={{ background: BLUE_DEEP }}>
        <div className="text-white max-w-6xl mx-auto px-6 py-20">
          <motion.div {...fade()} className="max-w-2xl">
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase font-semibold" style={{ color: '#ffb3b5' }}>Onboarding</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-3">
              From records file to working platform in three steps
            </h2>
            <p className="mt-4 text-white/60 text-[15px] leading-relaxed">
              No data re-entry, no consultants on site. The import stage is supervised: you see exactly what
              was read from your file and confirm before it goes live.
            </p>
          </motion.div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div key={s.n} {...fade(i * 0.1)} className="rounded-2xl border border-white/10 p-7" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl grid place-items-center" style={{ background: RED }}>
                    <s.icon size={20} className="text-white" strokeWidth={2} />
                  </div>
                  <span className="font-display text-2xl font-semibold text-white/15">{s.n}</span>
                </div>
                <h3 className="font-display text-lg font-semibold mt-5">{s.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPANY ===== */}
      <section id="company" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <motion.div {...fade()}>
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase font-semibold" style={{ color: BLUE }}>The company</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink tracking-tight mt-3">
              Built by {COMPANY}
            </h2>
            <img src={jpLogo} alt={`${COMPANY} logo`} className="mt-5 h-20 object-contain" />
            <p className="mt-5 text-[15px] leading-relaxed text-mute">
              {COMPANY} (RC 902237) is a Lagos-based IT solutions company. Since 2009 the JasadPlus business
              has designed, built and operated information systems for Nigerian institutions — from biometric
              student record platforms to national licensing infrastructure — alongside high-volume document
              processing services.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-mute">
              The results platform is our flagship product for the education sector: accurate computation,
              fast turnaround and official-grade paperwork, delivered through a secure web platform that every
              university logs in to.
            </p>

            <h3 className="font-display text-lg font-semibold text-ink mt-10">Delivered work</h3>
            <ul className="mt-4 space-y-5">
              {work.map((w) => (
                <li key={w.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: '#e8eef8' }}>
                    <w.icon size={17} style={{ color: BLUE }} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="font-semibold text-[14.5px] text-ink">{w.title}</div>
                    <div className="text-[13px] text-mute leading-relaxed mt-0.5">{w.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fade(0.12)} className="doc-sheet rounded-2xl p-8" id="contact">
            <div className="flex items-center gap-3 pb-6 border-b border-line">
              <img src={jpLogo} alt="JasadPlus logo" className="h-14 object-contain" />
              <div>
                <div className="font-display font-semibold text-ink leading-tight">JasadPlus Services International</div>
                <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-mute">IT Solutions · RC 902237</div>
              </div>
            </div>
            <ul className="mt-6 space-y-5 text-[14px]">
              <li className="flex items-start gap-3.5">
                <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: RED }} />
                <div>
                  <div className="font-semibold text-ink">Head office</div>
                  <div className="text-mute leading-relaxed mt-0.5">9, Ajasa Street, behind Tafawa Balewa Square Complex, Onikan, Lagos Island, Lagos, Nigeria</div>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <Phone size={18} className="mt-0.5 shrink-0" style={{ color: RED }} />
                <div>
                  <div className="font-semibold text-ink">Speak with us</div>
                  <div className="text-mute mt-0.5">0813 100 9710 · 0709 006 1465 · +234 705 199 0250</div>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <Mail size={18} className="mt-0.5 shrink-0" style={{ color: RED }} />
                <div>
                  <div className="font-semibold text-ink">Email</div>
                  <div className="text-mute mt-0.5">info@jasadplus.com · sales@jasadplus.com</div>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <Globe2 size={18} className="mt-0.5 shrink-0" style={{ color: RED }} />
                <div>
                  <div className="font-semibold text-ink">Sectors</div>
                  <div className="text-mute mt-0.5">Education · Government &amp; Waterways · Banking · Hospitality · FMCG</div>
                </div>
              </li>
              <li className="flex items-start gap-3.5">
                <ExternalLink size={18} className="mt-0.5 shrink-0" style={{ color: RED }} />
                <div>
                  <div className="font-semibold text-ink">Social</div>
                  <a
                    href="https://www.facebook.com/JasadPlus/"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 mt-0.5 text-mute hover:text-[#2c5697] transition-colors"
                  >
                    facebook.com/JasadPlus <ExternalLink size={12} className="opacity-60" />
                  </a>
                </div>
              </li>
            </ul>
            <button
              onClick={onEnter}
              className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold px-6 py-4 text-[14.5px] transition-opacity hover:opacity-90"
              style={{ background: BLUE_DEEP }}
            >
              <Printer size={16} /> Your institution is already enrolled? Sign in
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section className="border-t border-line bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <motion.h2 {...fade()} className="font-display text-2xl md:text-3xl font-semibold text-ink tracking-tight">
            Your results, accurate to the last unit — every session.
          </motion.h2>
          <motion.p {...fade(0.08)} className="mt-3 text-mute text-[15px] max-w-xl mx-auto">
            Sign in to the platform to enter results, generate broadsheets and print official sheets for your institution.
          </motion.p>
          <motion.button
            {...fade(0.16)}
            onClick={onEnter}
            className="mt-8 inline-flex items-center gap-2.5 rounded-xl text-white font-semibold px-8 py-4 text-[15px] transition-opacity hover:opacity-90 shadow-lg"
            style={{ background: RED }}
          >
            Sign in <ArrowRight size={17} />
          </motion.button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: BLUE_DEEP }}>
        <div className="text-white/50 max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <img src={jpLogoWhite} alt={COMPANY} className="h-10 object-contain" />
          <div className="text-[11.5px] leading-relaxed md:text-right">
            <div className="text-white/80 font-medium">{COMPANY} — IT Solutions</div>
            <div className="mt-1">RC 902237 · 9 Ajasa Street, Onikan, Lagos · info@jasadplus.com</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
