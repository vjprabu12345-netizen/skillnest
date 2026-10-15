import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  PlusCircle,
  Bookmark,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    addToast('You have been logged out successfully.', 'info');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
      isActive
        ? 'text-white bg-white/10 shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue via-brand-violet to-brand-pink p-[1.5px] shadow-glow-sm transition-transform group-hover:scale-105 duration-200">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-cyan group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Skill<span className="text-gradient">Nest</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
                Free Knowledge Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/explore" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-cyan" />
                Explore
              </span>
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                <span className="flex items-center gap-1.5 text-brand-pink font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  Admin
                </span>
              </NavLink>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/add-resource"
                  className="btn-primary text-xs sm:text-sm !py-2 !px-4 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Share Resource</span>
                </Link>

                <Link
                  to="/favourites"
                  className="p-2 text-slate-300 hover:text-white rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700/60 transition-colors"
                  title="Saved Favourites"
                  aria-label="Saved Favourites"
                >
                  <Bookmark className="w-4 h-4 text-violet-400" />
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-navy-850 border border-slate-700/80 hover:border-violet-500/50 transition-all text-sm font-medium"
                    aria-expanded={userDropdownOpen}
                  >
                    <span className="max-w-[110px] truncate text-slate-200">
                      {user?.name?.split(' ')[0]}
                    </span>
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-500/50"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-brand-cyan flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-navy-900 border border-slate-700/80 shadow-2xl p-2 z-50 backdrop-blur-xl"
                      >
                        <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {user?.email}
                          </p>
                          {user?.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              Admin Access
                            </span>
                          )}
                        </div>

                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-sky-400" />
                          <span>My Dashboard</span>
                        </Link>
                        <Link
                          to="/favourites"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-violet-400" />
                          <span>Saved Resources</span>
                        </Link>
                        <Link
                          to="/add-resource"
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-400" />
                          <span>Share Resource</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-pink-400 hover:bg-pink-500/10 rounded-xl transition-colors font-medium"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            <span>Admin Center</span>
                          </Link>
                        )}

                        <div className="border-t border-slate-800 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="btn-ghost text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm !py-2 !px-4"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-navy-850 border border-slate-700/60"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-slate-800 bg-navy-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3"
          >
            <div className="flex flex-col gap-1">
              <NavLink to="/explore" className={navLinkClass}>
                Explore Resources
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                About SkillNest
              </NavLink>
              <NavLink to="/contact" className={navLinkClass}>
                Contact Us
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin Panel
                </NavLink>
              )}
            </div>

            <div className="border-t border-slate-800 pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-2 py-1">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white">{user?.name}</div>
                      <div className="text-xs text-slate-400">{user?.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-sm text-slate-200 bg-navy-850 rounded-xl"
                  >
                    User Dashboard
                  </Link>
                  <Link
                    to="/favourites"
                    className="block px-3 py-2 text-sm text-slate-200 bg-navy-850 rounded-xl"
                  >
                    Favourite Resources
                  </Link>
                  <Link
                    to="/add-resource"
                    className="btn-primary w-full text-center text-sm !py-2"
                  >
                    Share Resource
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    className="btn-secondary text-sm text-center !py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm text-center !py-2.5"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
