import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Heart,
  ShieldCheck,
  Users,
  Compass,
  ArrowRight,
  Globe,
  Award,
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: <BookOpen className="w-6 h-6 text-brand-cyan" />,
      title: 'Free & Open Learning',
      description:
        'Knowledge should not be held behind arbitrary paywalls. We discover and index free, high-caliber resources for everyone.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Verified Quality',
      description:
        'Every resource is peer-reviewed by students and educators. Outdated or broken links are flagged and corrected quickly.',
    },
    {
      icon: <Users className="w-6 h-6 text-brand-violet" />,
      title: 'Community Driven',
      description:
        'SkillNest thrives on recommendations from developers who completed courses, read documentation, and landed jobs.',
    },
    {
      icon: <Globe className="w-6 h-6 text-brand-pink" />,
      title: 'Universal Access',
      description:
        'Engineered for learners everywhere, from aspiring software engineers in developing countries to self-taught career switchers.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Our Vision & Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Democratizing Tech Education Across the Globe
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          SkillNest is an open-access platform built to bridge the gap between motivated learners and the world's most valuable free educational resources.
        </p>
      </div>

      {/* The Problem & The Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-8 border border-slate-700/80 space-y-4">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
            The Problem
          </span>
          <h2 className="text-xl font-bold text-white">
            Information Overload and Paywalls
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The internet is overflowing with coding tutorials, blogs, and videos. But searching for true gems often leads to expensive paywalls, sponsored promotional content, or outdated material from 2017 that confuses beginners.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-slate-700/80 space-y-4">
          <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">
            The SkillNest Solution
          </span>
          <h2 className="text-xl font-bold text-white">
            Curated Free Curriculums in One Nest
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            SkillNest curates university-grade curricula (like Harvard CS50, University of Helsinki Full Stack Open), official documentation, and expert community guides. All organized with real reviews, search filters, and zero paywalls.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white">Our Core Principles</h2>
          <p className="text-xs text-slate-400 mt-1">
            Built by engineers and learners, designed for real growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 border border-slate-700/60 space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-navy-900 border border-slate-700/80 flex items-center justify-center">
                {v.icon}
              </div>
              <h3 className="text-base font-bold text-white">{v.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="glass-card rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-4 border border-violet-500/30">
        <h2 className="text-2xl font-bold text-white">Ready to begin learning?</h2>
        <p className="text-sm text-slate-300">
          Discover vetted roadmaps, save items to your personal library, and share educational materials you love.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/explore" className="btn-primary text-xs !py-3 !px-6">
            Explore Curated Resources
          </Link>
          <Link to="/register" className="btn-secondary text-xs !py-3 !px-6">
            Join the Community
          </Link>
        </div>
      </div>
    </div>
  );
}
