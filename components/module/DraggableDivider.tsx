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

  return (
    <div
      ref={dividerRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: `${position}%`,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: '#fff',
        cursor: 'col-resize',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: isDragging ? 'none' : 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = '#fff';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = '#fff';
        }
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#000',
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '-2px',
          pointerEvents: 'none',
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
        }}
      >
        ⋮⋮
      </div>
    </div>
  );
};
