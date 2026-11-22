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
      id: 'sarwpati',
      role: 'student',
      name: 'Sarwpati Kumar (Lead)',
      email: 'sarwpati.kumar@iiitbh.ac.in',
      password: 'Password123!',
      org: 'Roll No: 220101099 (3 Multi-Issuer Credentials)',
      icon: Award,
      color: 'amber',
      badge: 'Certified Graduate',
      desc: 'Student digital locker: ServiceNow CSA, AWS Solutions Architect, and Google Cloud credentials.',
      targetRoute: '/wallet',
    },
    {
      id: 'iiitbh',
      role: 'org',
      name: 'IIIT Bhagalpur Exam Cell',
      email: 'registrar@iiitbh.ac.in',
      password: 'Password123!',
      org: 'Indian Institute of Information Technology Bhagalpur',
      icon: Building2,
      color: 'emerald',
      badge: 'University Issuer',
      desc: 'Issue B.Tech degrees, batch Merkle tree convocation credentials, and handle disciplinary revocations.',
      targetRoute: '/organization',
    },
    {
      id: 'snow',
      role: 'org',
      name: 'ServiceNow Credentials',
      email: 'certifications@servicenow.com',
      password: 'Password123!',
      org: 'ServiceNow, Inc.',
      icon: Building2,
      color: 'cyan',
      badge: 'Enterprise Issuer',
      desc: 'Issue certified system administrator credentials with Ed25519 asymmetric cryptographic signatures.',
      targetRoute: '/organization',
    },
    {
      id: 'aws',
      role: 'org',
      name: 'Amazon Web Services (AWS)',
      email: 'training@amazon.com',
      password: 'Password123!',
      org: 'AWS Training & Certification',
      icon: Building2,
      color: 'amber',
      badge: 'Cloud Issuer',
      desc: 'Issue role-based professional cloud certifications and manage recertification validity windows.',
      targetRoute: '/organization',
    },
    {
      id: 'stanford',
      role: 'org',
      name: 'Stanford Center for Prof. Dev.',
      email: 'scpd-support@stanford.edu',
      password: 'Password123!',
      org: 'Stanford University (Online)',
      icon: Building2,
      color: 'rose',
      badge: 'Global Ivy Issuer',
      desc: 'Issue graduate engineering certificates and artificial intelligence executive credentials.',
      targetRoute: '/organization',
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
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">Live Demo Persona Switcher</h3>
              <p className="text-xs text-slate-400">1-click switch between 5 verified institutions & student roles for your presentation</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            const isSelected = switching === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => handleQuickLogin(acc)}
                className="group relative cursor-pointer p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {acc.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px]">{acc.org}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {acc.badge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {acc.desc}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono">
                  <span className="text-slate-500">{acc.email}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {isSelected ? 'Logging in...' : 'Select'} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
