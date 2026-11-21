import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Code2, Award, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-navy-950/90 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-100 tracking-tight">
                Verify<span className="text-emerald-400">X</span> Credential Network
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              An enterprise-grade, cryptographically verifiable digital certificate issuance and verification platform built with Ed25519 PKI digital signatures, RFC 8785 JSON canonicalization, and Merkle tree batch proofs.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
                Major 4th-Year Capstone Project
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                IIIT Bhagalpur
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/verify" className="hover:text-emerald-400 transition-colors">
                  Public QR & PDF Verification
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="hover:text-emerald-400 transition-colors">
                  Student Credential Locker
                </Link>
              </li>
              <li>
                <Link to="/organization" className="hover:text-emerald-400 transition-colors">
                  Institution Issuance Hub
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors">
                  Security & Audit Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Cryptographic Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Security Standards
            </h4>
            <ul className="space-y-1.5 text-xs font-mono text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Ed25519 (RFC 8032)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>JCS Canonical (RFC 8785)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>SHA-256 (FIPS 180-4)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Binary Merkle Trees</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} VerifyX. All cryptographic credentials tamper-evident by design.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="hover:text-slate-300 transition-colors">
              Viva & Architecture Guide
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Academic Excellence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
