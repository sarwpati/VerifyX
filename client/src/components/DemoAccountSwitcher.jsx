import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, Award, Sparkles, Check, ArrowRight, X } from 'lucide-react';

export default function DemoAccountSwitcher({ isOpen, onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(null);

  if (!isOpen) return null;

  const accounts = [
    {
      id: 'admin',
      role: 'admin',
      name: 'Security Administrator',
      email: 'admin@verifyx.io',
      password: 'Password123!',
      org: 'VerifyX Root Authority',
      icon: ShieldCheck,
      color: 'purple',
      badge: 'Admin Shield',
      desc: 'Inspect network-wide audit logs, approve/suspend institutions, and analyze anti-tamper security threats.',
      targetRoute: '/admin',
    },
    {
      id: 'iiitbh',
      role: 'org',
      name: 'IIIT Bhagalpur Examination Cell',
      email: 'registrar@iiitbh.ac.in',
      password: 'Password123!',
      org: 'Indian Institute of Information Technology Bhagalpur',
      icon: Building2,
      color: 'emerald',
      badge: 'Academic Issuer',
      desc: 'Issue single & Merkle-anchored batch degree certificates, design custom templates, and manage revocations.',
      targetRoute: '/organization',
    },
    {
      id: 'gca',
      role: 'org',
      name: 'Google Cloud Certifications',
      email: 'credentials@googlecloud.academy',
      password: 'Password123!',
      org: 'Google Cloud Academy',
      icon: Building2,
      color: 'cyan',
      badge: 'Enterprise Issuer',
      desc: 'Enterprise credential issuer with dedicated Ed25519 PKI keypair and cloud certification workflows.',
      targetRoute: '/organization',
    },
    {
      id: 'snow',
      role: 'org',
      name: 'ServiceNow Credential Authority',
      email: 'certifications@servicenow.com',
      password: 'Password123!',
      org: 'ServiceNow, Inc.',
      icon: Building2,
      color: 'cyan',
      badge: 'Workflow Issuer',
      desc: 'Enterprise workflow & IT automation certification authority with dedicated Ed25519 PKI signatures.',
      targetRoute: '/organization',
    },
    {
      id: 'sarwpati',
      role: 'student',
      name: 'Sarwpati Kumar',
      email: 'sarwpati.kumar@iiitbh.ac.in',
      password: 'Password123!',
      org: 'Roll No: 220101099 (ServiceNow CSA Certified)',
      icon: Award,
      color: 'amber',
      badge: 'CSA Certified Holder',
      desc: 'View ServiceNow Certified System Administrator (CSA) credential, 1-click LinkedIn export & signed PDF.',
      targetRoute: '/wallet',
    },
    {
      id: 'student',
      role: 'student',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@iiitbh.ac.in',
      password: 'Password123!',
      org: 'Roll No: 220101001 (B.Tech CSE)',
      icon: Award,
      color: 'amber',
      badge: 'Academic Holder',
      desc: 'Student digital locker: view credentials, 1-click "Add to LinkedIn", and download authentic signed PDFs.',
      targetRoute: '/wallet',
    },
  ];

  const handleQuickLogin = async (acc) => {
    try {
      setSwitching(acc.id);
      const res = await login(acc.email, acc.password);
      if (res.success) {
        onClose();
        navigate(acc.targetRoute);
      }
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Live Demo Persona Switcher</h3>
              <p className="text-xs text-slate-400">Instantly switch roles to test VerifyX capabilities during presentations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            const isSelected = switching === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => handleQuickLogin(acc)}
                className="group relative p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                      acc.color === 'purple' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                      acc.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                      acc.color === 'cyan' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' :
                      'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {acc.badge}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>

                  <h4 className="font-semibold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {acc.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{acc.email}</p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {acc.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">Password: Password123!</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    {isSelected ? 'Logging in...' : 'Select Role'} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>All accounts are pre-configured with active Ed25519 PKI cryptographic credentials.</span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
