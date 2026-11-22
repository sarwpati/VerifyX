import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Award,
  Layers,
  Key,
  ArrowRight,
  FileCheck,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2
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
    { id: 'VX-SNOW-2026-7842', label: 'ServiceNow CSA', type: 'valid', desc: 'Valid ServiceNow Credential' },
    { id: 'VX-AWS-2026-4401', label: 'AWS Solutions Architect', type: 'valid', desc: 'Valid AWS Cloud Credential' },
    { id: 'VX-STAN-2026-5502', label: 'Stanford AI Certificate', type: 'valid', desc: 'Valid Stanford Online Award' },
    { id: 'VX-IIITBH-2026-1001', label: 'IIITBH Degree', type: 'valid', desc: 'Valid Undergraduate Degree' },
    { id: 'VX-IIITBH-2026-9999', label: 'Revoked (Malpractice)', type: 'revoked', desc: 'Revocation with disciplinary cause' },
    { id: 'VX-GCA-2024-8888', label: 'Expired Cloud Cert', type: 'expired', desc: 'Expired after 3-year term' },
    { id: 'VX-IIITBH-2026-3001', label: 'Merkle Batch Anchored', type: 'batch', desc: 'Batch Convocation Root Proof' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-14 md:pt-14 md:pb-20">
        
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[200px] bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>IIIT Bhagalpur • VerifyX Multi-Institution Credential Network</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Cryptographically Verifiable <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Tamper-Proof Credentials
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Multi-institution PKI network issuing degrees & certifications with Ed25519 digital signatures and byte-level PDF tamper detection.
          </p>

          {/* Partner Institutions Pill Row */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Verified Issuers:</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-emerald-300">IIIT Bhagalpur</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-cyan-300">ServiceNow</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-amber-300">AWS</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-rose-300">Stanford Online</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-teal-300">Google Cloud</span>
          </div>

          {/* Interactive Live Verifier Search Box */}
          <div className="mt-7 max-w-xl mx-auto">
            <form
              onSubmit={handleQuickVerify}
              className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-2.5 w-full px-3 py-2">
                <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={quickCertId}
                  onChange={(e) => setQuickCertId(e.target.value)}
                  placeholder="Enter Certificate ID (e.g. VX-SNOW-2026-7842)..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-glow-emerald transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span>Verify</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Test Pills */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono mr-1">Sample Scenarios:</span>
              {sampleCerts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/verify/${c.id}`)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all border ${
                    c.type === 'valid'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      : c.type === 'revoked'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                      : c.type === 'expired'
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                  }`}
                  title={c.desc}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick CTA Links */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/verify"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verify PDF / ID</span>
            </Link>
            <Link
              to="/organization"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Institutions Hub</span>
            </Link>
            <Link
              to="/wallet"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Student Locker</span>
            </Link>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Switch 5 Demo Personas</span>
            </button>
          </div>

        </div>
      </section>

      {/* Feature Highlights: Clean 3-Card Grid */}
      <section className="py-10 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Feature 1 */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-emerald-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Multi-Tenant Ed25519 PKI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Universities and enterprise tech companies hold isolated keypairs. Forgery is mathematically impossible.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Merkle Tree Batch Issuance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Issue thousands of graduating credentials at convocation with compact O(log N) inclusion proofs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-500/30 transition-all space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Diagnostic Tamper & Failure Analysis
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provides actionable root-cause diagnostics if credentials are tampered, revoked, expired, or unlisted.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Demo Switcher Modal */}
      <DemoAccountSwitcher isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />

    </div>
  );
}
