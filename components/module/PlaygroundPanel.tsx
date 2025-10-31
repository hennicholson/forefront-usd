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

  const getTabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    backgroundColor: isActive ? '#fff' : '#000',
    border: '1px solid #fff',
    color: isActive ? '#000' : '#fff',
    fontFamily: "'Core Sans A 65 Bold', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: 'none',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#000',
      }}
    >
      {/* Tab navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #fff',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={getTabStyle(activeTab === tab.id)}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = '#333';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = '#000';
              }
            }}
          >
            [{tab.label}]
          </button>
        ))}
      </div>

      {/* Module context display */}
      {moduleContext && (
        <div
          style={{
            borderBottom: '1px solid #fff',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
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
