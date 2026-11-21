import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Sparkles, Building2, Award } from 'lucide-react';
import DemoAccountSwitcher from '../components/DemoAccountSwitcher';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'org') navigate('/organization');
        else navigate('/wallet');
      } else {
        setError(res.message || 'Login failed. Invalid credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to VerifyX
          </h2>
          <p className="text-xs text-slate-400">
            Access your verified credential locker or institution issuance hub
          </p>
        </div>

        {/* Quick Demo Switcher Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
          <p className="text-xs text-amber-300 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Evaluating / Viva Demonstration?
          </p>
          <button
            onClick={() => setDemoModalOpen(true)}
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-mono transition-colors shadow-sm"
          >
            Open 1-Click Persona Switcher
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registrar@iiitbh.ac.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold font-mono shadow-glow-emerald transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <Link to="/register" className="text-xs text-emerald-400 hover:underline font-medium">
              Register New Organization / Student
            </Link>
          </div>
        </form>

      </div>

      <DemoAccountSwitcher isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
}
