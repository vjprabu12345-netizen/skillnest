import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to SkillNest!', 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card w-full max-w-md p-8 sm:p-10 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-blue via-brand-violet to-brand-pink p-[1.5px] shadow-glow-sm">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-cyan" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Sign in to SkillNest
          </h1>
          <p className="text-xs text-slate-400">
            Access your saved resources, reviews, and community library.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-300 font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Password</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-sm !py-3 flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Buttons */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            One-Click Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@skillnest.org', 'Admin@123456')}
              className="px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-violet-950/50 border border-slate-700 hover:border-violet-500/50 text-[11px] text-slate-300 hover:text-white transition-colors"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('learner@skillnest.org', 'Learner@123456')}
              className="px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-sky-950/50 border border-slate-700 hover:border-sky-500/50 text-[11px] text-slate-300 hover:text-white transition-colors"
            >
              🎓 Learner Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-cyan hover:underline font-semibold">
            Join SkillNest Free
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
