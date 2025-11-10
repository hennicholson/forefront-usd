"use client";

import { useState, useEffect } from 'react';
import { X, Mail, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, Dithering } from "@paper-design/shaders-react";

interface Newsletter {
  id: number;
  week: number;
  date: string;
  title: string;
  content: {
    intro: string;
    excerpt?: string;
    image?: string;
    sections: {
      title: string;
      items: string[];
    }[];
    closing: string;
  };
  isCurrent: boolean;
}

interface NewsletterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterSelectorModal({ isOpen, onClose }: NewsletterSelectorModalProps) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNewsletters();
    }
  }, [isOpen]);

  const fetchNewsletters = async () => {
    try {
      const res = await fetch('/api/newsletters');
      if (res.ok) {
        const data = await res.json();
        setNewsletters(data);
      }
    } catch (err) {
      console.error('Error loading newsletters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterClick = (week: number) => {
    window.location.href = `/newsletter#week-${week}`;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] overflow-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="min-h-screen p-6 md:p-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 p-3 bg-zinc-900 hover:bg-white text-white hover:text-black rounded-lg transition-all duration-200 z-50"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="max-w-5xl mx-auto">
            {/* Header with Shader Background */}
            <div className="relative overflow-hidden rounded-2xl mb-8">
              <MeshGradient
                colors={["#5b00ff", "#00ffa3", "#ff9a00", "#ea00ff"]}
                swirl={0.55}
                distortion={0.85}
                speed={0.1}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              />
              <Dithering
                colors={["#ffffff", "#f2f2f2", "#eaeaea"]}
                intensity={0.18}
                shape="simplex"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/30" />

              <div className="relative p-8 md:p-12">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80 mb-3">
                  <Mail className="size-4" />
                  <p>Newsletter Archive</p>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Weekly AI Insights
                </h1>
                <p className="text-white/70 text-lg">
                  Select a newsletter edition to read
                </p>
              </div>
            </div>

            {/* Newsletter Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-zinc-500">Loading newsletters...</p>
                </div>
              </div>
            ) : newsletters.length === 0 ? (
              <div className="text-center py-20">
                <Mail size={48} className="text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Newsletters Yet</h3>
                <p className="text-zinc-500">
                  Check back soon for weekly AI insights and student discoveries!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsletters.map((newsletter, idx) => (
                  <motion.div
                    key={newsletter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative"
                  >
                    {/* Corner Squares */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                    <button
                      onClick={() => handleNewsletterClick(newsletter.week)}
                      className="w-full h-full text-left bg-gradient-to-b from-zinc-950/60 to-zinc-950/30 border border-zinc-800 backdrop-blur-sm rounded-lg p-6 transition-all duration-300 group-hover:border-white group-hover:shadow-xl group-hover:shadow-white/10"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-700 rounded-lg">
                          <Calendar size={14} />
                          <span className="text-xs font-semibold uppercase tracking-wider">Week {newsletter.week}</span>
                        </div>
                        {newsletter.isCurrent && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400 font-semibold">
                            <Sparkles size={12} />
                            Current
                          </div>
                        )}
                      </div>

                      {/* Image */}
                      {newsletter.content.image && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800">
                          <img
                            src={newsletter.content.image}
                            alt={newsletter.title}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                        {newsletter.title}
                      </h3>

                      {/* Date */}
                      <p className="text-sm text-zinc-500 mb-3">{newsletter.date}</p>

                      {/* Excerpt */}
                      <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                        {newsletter.content.excerpt || newsletter.content.intro}
                      </p>

                      {/* Read More */}
                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 group-hover:text-white transition-colors">
                        Read Newsletter
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* View All Link */}
            {newsletters.length > 0 && (
              <div className="mt-8 text-center">
                <a
                  href="/newsletter"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
                  onClick={onClose}
                >
                  View All Newsletters
                  <ArrowRight size={18} />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
