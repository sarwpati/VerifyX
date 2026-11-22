import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-[#0f172a] text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand & Mini Note */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-200">
              Verify<span className="text-emerald-400">X</span> Network
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">Ed25519 Cryptographic Verification</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/verify" className="hover:text-emerald-400 transition-colors">
              Verify
            </Link>
            <Link to="/wallet" className="hover:text-emerald-400 transition-colors">
              Student Locker
            </Link>
            <Link to="/organization" className="hover:text-emerald-400 transition-colors">
              Institution Hub
            </Link>
            <Link to="/admin" className="hover:text-emerald-400 transition-colors">
              Audit Logs
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
