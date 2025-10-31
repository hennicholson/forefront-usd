'use client';

import React from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onExit: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onExit }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'ESC', description: 'Close modal or panel' },
    { key: '← →', description: 'Navigate slides' },
    { key: 'CMD + K', description: 'Quick shortcuts menu' },
    { key: 'CMD + /', description: 'Toggle shortcuts panel' },
    { key: 'CMD + 1', description: 'Switch to Chat tab' },
    { key: 'CMD + 2', description: 'Switch to Code tab' },
    { key: 'CMD + 3', description: 'Switch to Notes tab' },
    { key: 'CMD + 4', description: 'Switch to Quiz tab' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onExit}
    >
      <div
        style={{
          backgroundColor: '#000',
          border: '1px solid #fff',
          padding: '40px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#fff',
              margin: 0,
            }}
          >
            [KEYBOARD SHORTCUTS]
          </h2>
          <button
            onClick={onExit}
            style={{
              background: 'transparent',
              border: '1px solid #fff',
              color: '#fff',
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#fff';
            }}
          >
            [X]
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid #fff',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                const keyEl = e.currentTarget.querySelector('.key') as HTMLElement;
                const descEl = e.currentTarget.querySelector('.desc') as HTMLElement;
                if (keyEl) keyEl.style.color = '#000';
                if (descEl) descEl.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                const keyEl = e.currentTarget.querySelector('.key') as HTMLElement;
                const descEl = e.currentTarget.querySelector('.desc') as HTMLElement;
                if (keyEl) keyEl.style.color = '#fff';
                if (descEl) descEl.style.color = '#fff';
              }}
            >
              <span
                className="key"
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#fff',
                  transition: 'color 0.2s ease',
                }}
              >
                [{shortcut.key}]
              </span>
              <span
                className="desc"
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#fff',
                  transition: 'color 0.2s ease',
                }}
              >
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
