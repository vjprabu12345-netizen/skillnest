import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ShareModal({ isOpen, onClose, resource }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !resource) return null;

  const shareUrl = `${window.location.origin}/resources/${resource._id}`;
  const shareText = `Check out this free educational resource on SkillNest: ${resource.title}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-brand-cyan" />
              <h3 className="text-base font-bold text-white">Share Resource</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resource Title Preview */}
          <div className="my-4 p-3 rounded-xl bg-navy-950/60 border border-slate-800">
            <p className="text-xs text-brand-cyan font-medium">{resource.category}</p>
            <p className="text-sm font-semibold text-white truncate mt-0.5">
              {resource.title}
            </p>
          </div>

          {/* Copy Link Input */}
          <div className="space-y-1.5 mb-5">
            <label className="text-xs font-medium text-slate-400">Share Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="input-field text-xs py-2 text-slate-300 font-mono select-all"
              />
              <button
                onClick={handleCopy}
                className="btn-primary !py-2 !px-3 shrink-0 text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">Share to networks</p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  shareText
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-navy-850 hover:bg-sky-950/40 border border-slate-700 hover:border-sky-500/50 text-xs text-slate-200 hover:text-sky-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>X</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-navy-850 hover:bg-blue-950/40 border border-slate-700 hover:border-blue-500/50 text-xs text-slate-200 hover:text-blue-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                <span>LinkedIn</span>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `${shareText} ${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-navy-850 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/50 text-xs text-slate-200 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
