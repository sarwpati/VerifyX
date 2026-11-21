import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Award,
  Layers,
  Key,
  Binary,
  ArrowRight,
  FileCheck,
  Cpu,
  CheckCircle2,
  Sparkles,
  Building2,
  Lock,
  FileText
} from 'lucide-react';
import DemoAccountSwitcher from '../components/DemoAccountSwitcher';

export default function Home() {
  const navigate = useNavigate();
  const [quickCertId, setQuickCertId] = useState('');
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (quickCertId.trim()) {
      navigate(`/verify/${quickCertId.trim().toUpperCase()}`);
    }
  };

  const sampleCerts = [
    { id: 'VX-SNOW-2026-7842', label: 'ServiceNow CSA (Sarwpati Kumar)', type: 'valid', desc: 'ServiceNow Certified System Administrator' },
    { id: 'VX-IIITBH-2026-1001', label: 'Valid Degree (Aarav Sharma)', type: 'valid', desc: 'B.Tech CSE - 9.42 CGPA' },
    { id: 'VX-IIITBH-2026-9999', label: 'Revoked Certificate (Malpractice)', type: 'revoked', desc: 'Revocation notice & audit trail' },
    { id: 'VX-GCA-2024-8888', label: 'Expired Certification', type: 'expired', desc: 'Google Cloud Associate Engineer' },
    { id: 'VX-IIITBH-2026-3001', label: 'Merkle Batch Anchored', type: 'batch', desc: 'Batch Merkle tree inclusion proof' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        
        {/* Background Glows & Grid */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-6 shadow-glow-emerald animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>IIIT Bhagalpur 4th-Year Capstone Major Project</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
            Cryptographically Verifiable <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Tamper-Evident Credentials
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate document fraud with <strong>Ed25519 Public Key Infrastructure (PKI)</strong>, 
            <strong> RFC 8785 JSON Canonicalization</strong>, and <strong>Merkle Tree Batch Proofs</strong>. 
            Issue once, verify anywhere with instant online QR scans and offline PDF tamper detection.
          </p>

          {/* Interactive Live Verifier Search Box */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form
              onSubmit={handleQuickVerify}
              className="p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-3 w-full px-4 py-2">
                <Search className="w-5 h-5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={quickCertId}
                  onChange={(e) => setQuickCertId(e.target.value)}
                  placeholder="Enter Certificate ID (e.g. VX-IIITBH-2026-1001)..."
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-glow-emerald transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Verify Credential</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Test Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Test Sample IDs:
              </span>
              {sampleCerts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/verify/${c.id}`)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
                    c.type === 'valid' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' :
                    c.type === 'revoked' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' :
                    c.type === 'expired' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20' :
                    'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                  }`}
                  title={`${c.label} - ${c.desc}`}
                >
                  {c.id} ({c.type})
                </button>
              ))}
            </div>
          </div>

          {/* Quick CTA Links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/organization"
              className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Institution Portal</span>
            </Link>
            <Link
              to="/wallet"
              className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Student Locker</span>
            </Link>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>1-Click Persona Switcher</span>
            </button>
          </div>

        </div>
      </section>

      {/* Feature Highlights: Why VerifyX is Super Strong */}
      <section className="py-16 bg-navy-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Engineering Architecture
            </h2>
            <p className="text-3xl font-extrabold text-white mt-2">
              Beyond Basic CRUD: True Cryptographic Security
            </p>
            <p className="text-sm text-slate-400 mt-3">
              Standard college projects store certificates as plain database rows with a QR link. VerifyX implements enterprise-grade mathematical security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Asymmetric Ed25519 PKI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each organization owns a public/private keypair. Payloads are canonicalized with RFC 8785 and digitally signed. Forgery is mathematically impossible even with database access.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 128-bit High-Security Elliptic Curve
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Merkle Tree Batch Issuance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Issue thousands of graduating student credentials at once via CSV. Anchors all certificates into a single binary Merkle Root with logarithmic inclusion verification proofs.
              </p>
              <div className="text-[11px] font-mono text-cyan-400 pt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> O(log N) Cryptographic Proofs
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Dual Verification Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify credentials in two modes: Instant mobile QR scan or offline/online PDF Drag-and-Drop Tamper Inspector that computes byte-level SHA-256 mismatches.
              </p>
              <div className="text-[11px] font-mono text-amber-400 pt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Offline & Online Tamper Detection
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Comparison Table: Standard vs VerifyX */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-100">
              Why Examiners Love VerifyX
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Direct technical comparison against ordinary final-year certificate projects
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-4">Feature Metric</th>
                  <th className="p-4 text-slate-400">Standard Final-Year Project</th>
                  <th className="p-4 text-emerald-400 font-bold bg-emerald-500/10">VerifyX Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-white font-sans">Cryptographic Core</td>
                  <td className="p-4 text-rose-400">None (Plain MongoDB ID lookup)</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-emerald-500/5">Asymmetric Ed25519 PKI Signatures</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white font-sans">JSON Canonicalization</td>
                  <td className="p-4 text-slate-500">Unspecified (Order bugs)</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-emerald-500/5">RFC 8785 (JCS Deterministic Hashing)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white font-sans">PDF Tamper Detection</td>
                  <td className="p-4 text-rose-400">Cannot detect altered PDFs</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-emerald-500/5">Drag-and-Drop SHA-256 Byte Inspector</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white font-sans">Batch Issuance Scale</td>
                  <td className="p-4 text-slate-500">Single entry only</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-emerald-500/5">CSV Upload with Merkle Tree Proofs</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white font-sans">Student Integration</td>
                  <td className="p-4 text-slate-500">Static download</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-emerald-500/5">DigiLocker-style Wallet + 1-Click LinkedIn</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white font-sans">Security Audit Trail</td>
                  <td className="p-4 text-rose-400">No logs</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-emerald-500/5">IP & Geolocation Anti-Fraud Analytics</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* Demo Switcher Modal */}
      <DemoAccountSwitcher isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />

    </div>
  );
}
