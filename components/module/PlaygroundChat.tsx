'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlaygroundPromptBlock } from './PlaygroundPromptBlock';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface PlaygroundChatProps {
  sessionId?: string;
}

export const PlaygroundChat: React.FC<PlaygroundChatProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [promptBlocks, setPromptBlocks] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/playground/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error: Failed to get response',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addPromptBlock = () => {
    setPromptBlocks((prev) => [...prev, Date.now().toString()]);
  };

  const removePromptBlock = (id: string) => {
    setPromptBlocks((prev) => prev.filter((blockId) => blockId !== id));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#000',
      }}
    >
      {/* Messages container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
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
              [{message.role === 'user' ? 'YOU' : 'ASSISTANT'}]
            </div>
            <div
              style={{
                border: '1px solid #fff',
                padding: '12px',
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '14px',
                lineHeight: 1.5,
                color: '#fff',
                whiteSpace: 'pre-wrap',
              }}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignSelf: 'flex-start',
              maxWidth: '80%',
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
              [ASSISTANT]
            </div>
            <div
              style={{
                border: '1px solid #fff',
                padding: '12px',
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '14px',
                color: '#fff',
              }}
            >
              [THINKING...]
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt blocks */}
      {promptBlocks.length > 0 && (
        <div
          style={{
            padding: '0 20px 20px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {promptBlocks.map((blockId) => (
            <PlaygroundPromptBlock
              key={blockId}
              sessionId={sessionId}
              onDelete={() => removePromptBlock(blockId)}
            />
          ))}
        </div>
      )}

      {/* Input area */}
      <div
        style={{
          borderTop: '1px solid #fff',
          padding: '20px',
          display: 'flex',
          gap: '12px',
        }}
      >
        <button
          onClick={addPromptBlock}
          style={{
            backgroundColor: '#000',
            border: '1px solid #fff',
            color: '#fff',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000';
            e.currentTarget.style.color = '#fff';
          }}
        >
          +
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isLoading}
          style={{
            flex: 1,
            backgroundColor: '#000',
            border: '1px solid #fff',
            color: '#fff',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '14px',
            padding: '12px',
            outline: 'none',
          }}
        />

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            backgroundColor: '#000',
            border: '1px solid #fff',
            color: '#fff',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '0 24px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!isLoading && input.trim()) {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000';
            e.currentTarget.style.color = '#fff';
          }}
        >
          [SEND]
        </button>
      </div>
    </div>
  );
};
