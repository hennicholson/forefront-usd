'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PlaygroundNotesProps {
  sessionId?: string;
}

export const PlaygroundNotes: React.FC<PlaygroundNotesProps> = ({ sessionId }) => {
  const [notes, setNotes] = useState('');
  const [review, setReview] = useState('');
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const storageKey = sessionId ? `notes_${sessionId}` : 'notes_default';
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [sessionId]);

  // Auto-save to localStorage
  const saveNotes = useCallback((value: string) => {
    const storageKey = sessionId ? `notes_${sessionId}` : 'notes_default';
    localStorage.setItem(storageKey, value);
  }, [sessionId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveNotes(notes);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [notes, saveNotes]);

  const handleGetReview = async () => {
    if (!notes.trim()) {
      setError('Please write some notes first');
      return;
    }

    setIsLoadingReview(true);
    setError(null);

    try {
      const response = await fetch('/api/playground/review-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get review');
      }

      const data = await response.json();
      setReview(data.review);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoadingReview(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#000',
        padding: '20px',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          fontSize: '14px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>[NOTES]</span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          [AUTO-SAVED]
        </span>
      </div>

      {/* Notes textarea */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Take notes here..."
        style={{
          flex: 1,
          backgroundColor: '#000',
          border: '1px solid #fff',
          color: '#fff',
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          fontSize: '14px',
          padding: '16px',
          resize: 'none',
          outline: 'none',
          lineHeight: 1.6,
        }}
      />

      {/* Review button */}
      <button
        onClick={handleGetReview}
        disabled={isLoadingReview || !notes.trim()}
        style={{
          backgroundColor: '#000',
          border: '1px solid #fff',
          color: '#fff',
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: '12px',
          cursor: isLoadingReview || !notes.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isLoadingReview || !notes.trim() ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isLoadingReview && notes.trim()) {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#000';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#000';
          e.currentTarget.style.color = '#fff';
        }}
      >
        {isLoadingReview ? '[REVIEWING...]' : '[GET AI REVIEW]'}
      </button>

      {/* Error display */}
      {error && (
        <div
          style={{
            border: '1px solid #ff0000',
            color: '#ff0000',
            padding: '12px',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          [ERROR: {error}]
        </div>
      )}

      {/* Review display */}
      {review && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            [AI REVIEW]
          </div>
          <div
            style={{
              border: '1px solid #fff',
              padding: '16px',
              fontFamily: "'Core Sans A 65 Bold', sans-serif",
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#fff',
              whiteSpace: 'pre-wrap',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {review}
          </div>
        </div>
      )}
    </div>
  );
};
