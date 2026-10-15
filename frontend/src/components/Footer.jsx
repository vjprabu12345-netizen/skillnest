import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/80 bg-navy-950/90 pt-16 pb-12 mt-20 relative overflow-hidden">
      {/* Background radial gradient accent */}
      <div className="glow-orb-purple -top-40 left-1/2 -translate-x-1/2 opacity-25" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue via-brand-violet to-brand-pink p-[1.5px] shadow-glow-sm">
                <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                </div>
              </div>
              <span className="text-xl font-extrabold text-white">
                Skill<span className="text-gradient">Nest</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering self-learners, students, and engineers worldwide through high-quality, verified free learning resources.
            </p>
            <div className="text-xs text-brand-cyan font-medium flex items-center gap-1.5 pt-1">
              <span>Learn. Share. Grow.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Browse All Resources
                </Link>
              </li>
              <li>
                <Link to="/add-resource" className="hover:text-white transition-colors">
                  Share a Free Resource
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="hover:text-white transition-colors">
                  My Saved Library
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Mission & Values
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/explore?category=Full Stack Development" className="hover:text-white transition-colors">
                  Full Stack Development
                </Link>
              </li>
              <li>
                <Link to="/explore?category=React JS" className="hover:text-white transition-colors">
                  React JS Ecosystem
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Data Structures and Algorithms" className="hover:text-white transition-colors">
                  Data Structures & Algorithms
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Interview Preparation" className="hover:text-white transition-colors">
                  Interview Preparation
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Note */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Free Learning Pledge
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              SkillNest indexes only publicly accessible, free educational materials. We do not host paywalled or copyrighted content without authorization.
            </p>
            <div className="p-3 rounded-xl bg-navy-850/80 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">100% Free Knowledge:</span> Always accessible to anyone, anywhere.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} SkillNest. Designed with modern web standards for global learners.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">
              Contact
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors flex items-center gap-1"
            >
              Open Source <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
