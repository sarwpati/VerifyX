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
    { id: 'VX-SNOW-2026-7842', label: 'ServiceNow CSA', type: 'valid' },
    { id: 'VX-IIITBH-2026-1001', label: 'B.Tech Degree', type: 'valid' },
    { id: 'VX-IIITBH-2026-9999', label: 'Revoked Demo', type: 'revoked' },
    { id: 'VX-GCA-2024-8888', label: 'Expired Demo', type: 'expired' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
        
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[200px] bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>IIIT Bhagalpur • VerifyX PKI Credential Network</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Cryptographically Verifiable <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Tamper-Proof Certificates
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Instant online verification with Ed25519 digital signatures and PDF tamper detection.
          </p>

          {/* Interactive Live Verifier Search Box */}
          <div className="mt-8 max-w-xl mx-auto">
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
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Quick test:</span>
              {sampleCerts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/verify/${c.id}`)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                    c.type === 'valid'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      : c.type === 'revoked'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick CTA Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
              <span>Institution Portal</span>
            </Link>
            <Link
              to="/wallet"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Student Wallet</span>
            </Link>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Personas</span>
            </button>
          </div>

        </div>
      </section>

      {/* Feature Highlights: Clean 3-Card Grid */}
      <section className="py-12 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-emerald-500/30 transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Ed25519 Signatures
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asymmetric cryptographic keypairs guarantee authenticity. Tamper-proof and mathematically verifiable.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/30 transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Merkle Tree Batching
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Issue thousands of credentials in batches with compact cryptographic root proofs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-500/30 transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                PDF Tamper Inspector
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload any PDF certificate to detect byte alterations, missing scanners, or unregistered issuers.
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
