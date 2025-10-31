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
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col gap-2 max-w-[80%] ${
              message.role === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div
              className="text-white text-[10px]"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              [{message.role === 'user' ? 'YOU' : 'ASSISTANT'}]
            </div>
            <div
              className={`rounded-2xl px-4 py-3 text-white whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-zinc-800/50 border border-zinc-700/50'
                  : 'bg-blue-500/20 border border-blue-500/30'
              }`}
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col gap-2 self-start items-start max-w-[80%]">
            <div
              className="text-white text-[10px]"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              [ASSISTANT]
            </div>
            <div
              className="bg-blue-500/20 border border-blue-500/30 rounded-2xl px-4 py-3 text-white"
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '14px',
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
        <div className="px-5 pb-5 max-h-[300px] overflow-y-auto">
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
      <div className="border-t border-zinc-800/50 p-5 flex gap-3 bg-zinc-900/50 backdrop-blur-xl">
        <button
          onClick={addPromptBlock}
          className="w-12 h-12 rounded-full bg-white text-black text-xl font-bold cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 flex-shrink-0 flex items-center justify-center shadow-lg"
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
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
          className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white px-4 py-3 outline-none focus:border-zinc-600 transition-all duration-300"
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '14px',
          }}
        />

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className={`rounded-lg px-6 transition-all duration-300 flex-shrink-0 ${
            isLoading || !input.trim()
              ? 'bg-zinc-800/50 text-gray-500 cursor-not-allowed opacity-50'
              : 'bg-white text-black cursor-pointer hover:bg-gray-200'
          }`}
          style={{
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          [SEND]
        </button>
      </div>
    </div>
  );
};
