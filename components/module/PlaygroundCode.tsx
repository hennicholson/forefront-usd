'use client';

import React, { useState } from 'react';

interface PlaygroundCodeProps {
  sessionId?: string;
}

export const PlaygroundCode: React.FC<PlaygroundCodeProps> = ({ sessionId }) => {
  const [code, setCode] = useState('// Write your JavaScript code here\nconsole.log("Hello, World!");');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('');

    // Capture console.log output
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      logs.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      logs.push('[ERROR] ' + args.map(arg => String(arg)).join(' '));
      originalError(...args);
    };

    console.warn = (...args) => {
      logs.push('[WARN] ' + args.map(arg => String(arg)).join(' '));
      originalWarn(...args);
    };

    try {
      // Execute code
      // Note: Using eval is dangerous in production. This is for prototype only.
      const result = eval(code);

      if (result !== undefined) {
        logs.push('=> ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
      }

      setOutput(logs.join('\n') || '[No output]');
    } catch (error) {
      setOutput('[ERROR] ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setIsRunning(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRunCode();
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
        <span>[CODE EDITOR]</span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          [CMD+ENTER TO RUN]
        </span>
      </div>

      {/* Code editor */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyPress}
        spellCheck={false}
        style={{
          flex: 1,
          backgroundColor: '#000',
          border: '1px solid #fff',
          color: '#fff',
          fontFamily: "'Courier New', monospace",
          fontSize: '14px',
          padding: '16px',
          resize: 'none',
          outline: 'none',
          lineHeight: 1.5,
        }}
      />

      {/* Run button */}
      <button
        onClick={handleRunCode}
        disabled={isRunning}
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
          cursor: isRunning ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isRunning ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isRunning) {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#000';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#000';
          e.currentTarget.style.color = '#fff';
        }}
      >
        {isRunning ? '[RUNNING...]' : '[RUN CODE]'}
      </button>

      {/* Output display */}
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
          [OUTPUT]
        </div>
        <div
          style={{
            backgroundColor: '#000',
            border: '1px solid #fff',
            color: '#fff',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
            padding: '16px',
            minHeight: '150px',
            maxHeight: '300px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
          }}
        >
          {output || '[Run code to see output]'}
        </div>
      </div>
    </div>
  );
};
