import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="glass-card max-w-md p-10 rounded-3xl border border-slate-800 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-950/70 border border-violet-500/30 flex items-center justify-center text-brand-cyan shadow-glow-sm">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-white">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page you are looking for does not exist or has been moved to another nest.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/" className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
          <Link to="/explore" className="btn-secondary text-xs !py-2.5 !px-5 flex items-center gap-2">
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
