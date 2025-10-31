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
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 mb-4 relative shadow-2xl">
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 bg-transparent text-gray-400 hover:text-red-500 hover:bg-red-500/20 rounded-lg px-2 py-1 cursor-pointer transition-all duration-300"
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          ✕
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
        className="w-full min-h-[100px] bg-black/50 border border-zinc-800 rounded-xl text-white px-3 py-3 mb-3 resize-vertical outline-none focus:border-zinc-700 transition-all duration-300"
        style={{
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          fontSize: '14px',
        }}
      />

      {/* Model selector and Generate button */}
      <div className="flex gap-3 mb-4">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as Model)}
          className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white px-3 py-3 cursor-pointer outline-none transition-all duration-300 hover:bg-zinc-800"
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
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
          className={`bg-white text-black rounded-lg px-6 py-3 transition-all duration-300 ${
            isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-200'
          }`}
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {isLoading ? '[GENERATING...]' : '[GENERATE]'}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div
          className="border border-red-500/50 bg-red-500/10 text-red-500 rounded-lg px-3 py-3 mb-4"
          style={{
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
        <div className="flex flex-col gap-4">
          {/* Score meter */}
          <div>
            <div
              className="text-white mb-2"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              [PROMPT SCORE: {result.score}/100]
            </div>
            <div className="w-full h-3 bg-black/50 border border-zinc-800 rounded-lg overflow-hidden relative">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${result.score}%`,
                  background: `linear-gradient(90deg, ${getScoreColor(result.score)}, ${getScoreColor(result.score)}dd)`,
                  boxShadow: `0 0 12px ${getScoreColor(result.score)}80`,
                }}
              />
            </div>
          </div>

          {/* Feedback */}
          <div>
            <div
              className="text-white mb-2"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              [AI FEEDBACK]
            </div>
            <div
              className="bg-black/50 border border-zinc-800 rounded-xl px-3 py-3 text-white"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              {result.feedback}
            </div>
          </div>

          {/* Result */}
          <div>
            <div
              className="text-white mb-2"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              [RESULT]
            </div>
            <div
              className="bg-black/50 border border-zinc-800 rounded-xl px-3 py-3 text-white whitespace-pre-wrap font-mono"
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '12px',
                lineHeight: 1.5,
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
