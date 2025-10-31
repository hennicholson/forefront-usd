'use client';

import React, { useState } from 'react';
import { PlaygroundChat } from './PlaygroundChat';
import { PlaygroundCode } from './PlaygroundCode';
import { PlaygroundNotes } from './PlaygroundNotes';
import { PlaygroundQuiz } from './PlaygroundQuiz';

type Tab = 'chat' | 'code' | 'notes' | 'quiz';

interface ModuleContext {
  title: string;
  category: string;
  slideInfo?: {
    current: number;
    total: number;
  };
}

interface PlaygroundPanelProps {
  sessionId?: string;
  moduleContext?: ModuleContext;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export const PlaygroundPanel: React.FC<PlaygroundPanelProps> = ({
  sessionId,
  moduleContext,
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<Tab>('chat');

  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: Tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'chat', label: 'CHAT' },
    { id: 'code', label: 'CODE' },
    { id: 'notes', label: 'NOTES' },
    { id: 'quiz', label: 'QUIZ' },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900/30 backdrop-blur-md">
      {/* Tab navigation */}
      <div className="flex border-b border-zinc-800/50 p-2 gap-2 bg-zinc-900/50 backdrop-blur-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 rounded-lg px-3 py-3 cursor-pointer transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-800'
            }`}
            style={{
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
            }}
          >
            [{tab.label}]
          </button>
        ))}
      </div>

      {/* Module context display */}
      {moduleContext && (
        <div className="border-b border-zinc-800/50 px-5 py-3 flex justify-between items-center bg-zinc-900/30">
          <div
            style={{
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#fff',
            }}
          >
            [{moduleContext.category}] {moduleContext.title}
          </div>
          {moduleContext.slideInfo && (
            <div
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#fff',
                opacity: 0.7,
              }}
            >
              SLIDE {moduleContext.slideInfo.current}/{moduleContext.slideInfo.total}
            </div>
          )}
        </div>
      )}

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'chat' && <PlaygroundChat sessionId={sessionId} />}
        {activeTab === 'code' && <PlaygroundCode sessionId={sessionId} />}
        {activeTab === 'notes' && <PlaygroundNotes sessionId={sessionId} />}
        {activeTab === 'quiz' && (
          <PlaygroundQuiz sessionId={sessionId} moduleContext={moduleContext} />
        )}
      </div>
    </div>
  );
};
