'use client';

import React, { useState } from 'react';

interface PlaygroundPromptBlockProps {
  onDelete?: () => void;
  sessionId?: string;
}

type Model = 'claude' | 'chatgpt' | 'gemini' | 'deepseek';

interface PromptResult {
  score: number;
  feedback: string;
  result: string;
}

export const PlaygroundPromptBlock: React.FC<PlaygroundPromptBlockProps> = ({
  onDelete,
  sessionId,
}) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<Model>('claude');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#00ff00'; // green
    if (score >= 60) return '#ffff00'; // yellow
    if (score >= 40) return '#ffa500'; // orange
    return '#ff0000'; // red
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/playground/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt result');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #fff',
        padding: '20px',
        marginBottom: '16px',
        backgroundColor: '#000',
        position: 'relative',
      }}
    >
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: '1px solid #fff',
            color: '#fff',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            padding: '4px 8px',
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
      )}

      {/* Label */}
      <div
        style={{
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#fff',
          marginBottom: '12px',
        }}
      >
        [PROMPT TESTER]
      </div>

      {/* Prompt textarea */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        style={{
          width: '100%',
          minHeight: '100px',
          backgroundColor: '#000',
          border: '1px solid #fff',
          color: '#fff',
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          fontSize: '14px',
          padding: '12px',
          marginBottom: '12px',
          resize: 'vertical',
          outline: 'none',
        }}
      />

      {/* Model selector and Generate button */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as Model)}
          style={{
            flex: 1,
            backgroundColor: '#000',
            border: '1px solid #fff',
            color: '#fff',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '12px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="claude">[CLAUDE]</option>
          <option value="chatgpt">[CHATGPT]</option>
          <option value="gemini">[GEMINI]</option>
          <option value="deepseek">[DEEPSEEK]</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          style={{
            backgroundColor: '#000',
            border: '1px solid #fff',
            color: '#fff',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '12px 24px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000';
            e.currentTarget.style.color = '#fff';
          }}
        >
          {isLoading ? '[GENERATING...]' : '[GENERATE]'}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            border: '1px solid #ff0000',
            color: '#ff0000',
            padding: '12px',
            marginBottom: '16px',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          [ERROR: {error}]
        </div>
      )}

      {/* Result display */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Score meter */}
          <div>
            <div
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              [PROMPT SCORE: {result.score}/100]
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                border: '1px solid #fff',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${result.score}%`,
                  height: '100%',
                  backgroundColor: getScoreColor(result.score),
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Feedback */}
          <div>
            <div
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              [AI FEEDBACK]
            </div>
            <div
              style={{
                border: '1px solid #fff',
                padding: '12px',
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '12px',
                lineHeight: 1.5,
                color: '#fff',
              }}
            >
              {result.feedback}
            </div>
          </div>

          {/* Result */}
          <div>
            <div
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              [RESULT]
            </div>
            <div
              style={{
                border: '1px solid #fff',
                padding: '12px',
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '12px',
                lineHeight: 1.5,
                color: '#fff',
                whiteSpace: 'pre-wrap',
              }}
            >
              {result.result}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
