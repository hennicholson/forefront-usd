'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

interface DraggableDividerProps {
  initialPosition?: number;
  onPositionChange?: (position: number) => void;
}

export const DraggableDivider: React.FC<DraggableDividerProps> = ({
  initialPosition = 50,
  onPositionChange,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setPosition(50);
    onPositionChange?.(50);
  }, [onPositionChange]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const windowWidth = window.innerWidth;
      const newPosition = (e.clientX / windowWidth) * 100;

      // Constrain between 30% and 70%
      const constrainedPosition = Math.max(30, Math.min(70, newPosition));
      setPosition(constrainedPosition);
      onPositionChange?.(constrainedPosition);
    },
    [isDragging, onPositionChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={dividerRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute top-0 bottom-0 cursor-col-resize z-[100] flex items-center justify-center transition-all duration-300 group ${
        isDragging || isHovered ? 'w-1' : 'w-px'
      }`}
      style={{
        left: `${position}%`,
        backgroundColor: isDragging || isHovered ? 'rgba(113, 113, 122, 1)' : 'rgba(161, 161, 170, 0.3)',
        boxShadow: isDragging || isHovered ? '0 0 12px rgba(113, 113, 122, 0.5)' : 'none',
      }}
    >
      {/* Drag handle with arrows */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-700 rounded-lg px-2 py-3 transition-all duration-300 ${
          isHovered || isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
        style={{
          pointerEvents: 'none',
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          color: '#fff',
          fontSize: '12px',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        ↔
      </div>
    </div>
  );
};
