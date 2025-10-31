'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DraggableDivider } from './DraggableDivider';
import { ModuleContentPanel } from './ModuleContentPanel';
import { PlaygroundPanel } from './PlaygroundPanel';
import { ShortcutsModal } from './ShortcutsModal';

interface Slide {
  id: string;
  title: string;
  content: string;
  type?: 'text' | 'image' | 'video' | 'code';
}

interface ModuleData {
  id: string;
  title: string;
  category: string;
  slides: Slide[];
}

interface ModuleOverlayProps {
  module: any;
  moduleIndex: number;
  totalModules: number;
  onExit: () => void;
}

export const ModuleOverlay: React.FC<ModuleOverlayProps> = ({ module, moduleIndex, totalModules, onExit }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [splitRatio, setSplitRatio] = useState(50);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'notes' | 'quiz'>('chat');

  // Create session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch('/api/playground/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moduleId: module.moduleId,
            slideIndex: currentSlideIndex
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSessionId(data.sessionId);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };

    createSession();
  }, [module.id]);

  // Load split ratio from localStorage
  useEffect(() => {
    const savedRatio = localStorage.getItem('module_split_ratio');
    if (savedRatio) {
      setSplitRatio(parseFloat(savedRatio));
    }
  }, []);

  // Save split ratio to localStorage
  const handleSplitChange = useCallback((ratio: number) => {
    setSplitRatio(ratio);
    localStorage.setItem('module_split_ratio', ratio.toString());
  }, []);

  // Navigation handlers
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < module.slides.length - 1) {
      setDirection(1);
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, module.slides.length]);

  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setDirection(-1);
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC - Close
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
        } else {
          onExit();
        }
        return;
      }

      // Arrow keys - Navigate slides
      if (e.key === 'ArrowRight') {
        goToNextSlide();
        return;
      }
      if (e.key === 'ArrowLeft') {
        goToPreviousSlide();
        return;
      }

      // CMD/CTRL shortcuts
      if (e.metaKey || e.ctrlKey) {
        // CMD + /
        if (e.key === '/') {
          e.preventDefault();
          setShowShortcuts((prev) => !prev);
          return;
        }

        // CMD + K
        if (e.key === 'k') {
          e.preventDefault();
          setShowShortcuts(true);
          return;
        }

        // CMD + 1-4 (Tab switching)
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('chat');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          setActiveTab('code');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          setActiveTab('notes');
          return;
        }
        if (e.key === '4') {
          e.preventDefault();
          setActiveTab('quiz');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, onExit, goToNextSlide, goToPreviousSlide]);

  const currentSlide = module.slides[currentSlideIndex];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 px-5 py-5 flex justify-between items-center relative z-[2]">
        <div
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#fff',
          }}
        >
          [{module.category}] {module.title}
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {module.slides.map((_: any, index: number) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full border border-white transition-all duration-300 ${
                index === currentSlideIndex ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onExit}
          className="bg-transparent border border-white text-white rounded-lg px-4 py-2 cursor-pointer transition-all duration-300 hover:bg-white hover:text-black"
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          [CLOSE]
        </button>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, position: 'relative', zIndex: 2, overflow: 'hidden' }}>
        {/* Left panel - Module content */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${splitRatio}%`,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <ModuleContentPanel
            currentSlide={currentSlide}
            slideIndex={currentSlideIndex}
            totalSlides={module.slides.length}
            direction={direction}
          />
        </div>

        {/* Divider */}
        <DraggableDivider initialPosition={splitRatio} onPositionChange={handleSplitChange} />

        {/* Right panel - Playground */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `calc(${splitRatio}% + 4px)`,
            width: `calc(${100 - splitRatio}% - 4px)`,
            height: '100%',
            borderLeft: '1px solid #fff',
          }}
        >
          <PlaygroundPanel
            sessionId={sessionId || undefined}
            moduleContext={{
              title: module.title,
              category: module.category,
              slideInfo: {
                current: currentSlideIndex + 1,
                total: module.slides.length,
              },
            }}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border-t border-zinc-800/50 px-5 py-5 flex justify-between items-center relative z-[2]">
        <button
          onClick={goToPreviousSlide}
          disabled={currentSlideIndex === 0}
          className={`bg-transparent border border-white text-white rounded-lg px-4 py-2 transition-all duration-300 ${
            currentSlideIndex === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white hover:text-black'
          }`}
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          [← PREVIOUS]
        </button>

        <button
          onClick={() => setShowShortcuts(true)}
          className="bg-transparent border border-white text-white rounded-lg px-4 py-2 cursor-pointer transition-all duration-300 hover:bg-white hover:text-black"
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          [SHORTCUTS]
        </button>

        <button
          onClick={goToNextSlide}
          disabled={currentSlideIndex === module.slides.length - 1}
          className={`bg-transparent border border-white text-white rounded-lg px-4 py-2 transition-all duration-300 ${
            currentSlideIndex === module.slides.length - 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white hover:text-black'
          }`}
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          [NEXT →]
        </button>
      </div>

      {/* Shortcuts modal */}
      <ShortcutsModal isOpen={showShortcuts} onExit={() => setShowShortcuts(false)} />
    </div>
  );
};
