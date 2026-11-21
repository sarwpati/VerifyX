import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Award,
  Building2,
  Lock,
  FileCheck,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import DemoAccountSwitcher from './DemoAccountSwitcher';

export default function Navbar() {
  const { user, organization, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-glow-emerald flex items-center justify-center transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    Verify<span className="text-emerald-400">X</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 font-medium">
                    PKI Credential Network
                  </span>
                </div>
              </Link>

              {/* Security Pill Badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Ed25519 • RFC 8785 • Merkle Proofs</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/verify"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/verify')
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Portal</span>
              </Link>

              <Link
                to="/wallet"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/wallet')
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Student Wallet</span>
              </Link>

              {isAuthenticated && user.role === 'org' && (
                <Link
                  to="/organization"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/organization')
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>Issuance Hub</span>
                </Link>
              )}

              {isAuthenticated && user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin')
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Admin Shield</span>
                </Link>
              )}

              <Link
                to="/docs"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/docs')
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Viva Guide</span>
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Quick Demo Switcher Button */}
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                title="Switch between Admin, IIITBH Registrar, and Student accounts"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>Demo Switcher</span>
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-200 line-clamp-1 max-w-[120px]">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">
                        {user.role === 'org' ? (organization?.code || 'ORG') : user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium shadow-glow-emerald transition-all transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Demo</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-navy-950 px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Verify Portal
            </Link>
            <Link
              to="/wallet"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Student Wallet
            </Link>
            {isAuthenticated && user.role === 'org' && (
              <Link
                to="/organization"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Issuance Hub
              </Link>
            )}
            {isAuthenticated && user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Admin Shield
              </Link>
            )}
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Viva & Architecture Guide
            </Link>
            <div className="pt-3 border-t border-slate-800">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                    <p className="text-xs text-emerald-400 uppercase font-mono">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded bg-rose-500/10 text-rose-300 text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-1/2 py-2 text-center rounded-lg bg-slate-800 text-slate-200 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-1/2 py-2 text-center rounded-lg bg-emerald-500 text-white text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Demo Switcher Modal */}
      <DemoAccountSwitcher isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </>
  );
}
