'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  id: string;
  title: string;
  content: string;
  type?: 'text' | 'image' | 'video' | 'code';
}

interface ModuleContentPanelProps {
  currentSlide: Slide;
  slideIndex: number;
  totalSlides: number;
  direction: number;
}

export const ModuleContentPanel: React.FC<ModuleContentPanelProps> = ({
  currentSlide,
  slideIndex,
  totalSlides,
  direction,
}) => {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Slide counter */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#fff',
          border: '1px solid #fff',
          padding: '8px 16px',
          zIndex: 10,
        }}
      >
        [{slideIndex + 1} / {totalSlides}]
      </div>

      {/* Slide content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          position: 'relative',
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            style={{
              width: '100%',
              maxWidth: '800px',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
            }}
          >
            {/* Slide title */}
            <h1
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '36px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#fff',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              [{currentSlide.title}]
            </h1>

            {/* Slide content */}
            <div
              style={{
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: 1.6,
                color: '#fff',
                whiteSpace: 'pre-wrap',
              }}
            >
              {currentSlide.content}
            </div>

            {/* Type indicator */}
            {currentSlide.type && (
              <div
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#fff',
                  border: '1px solid #fff',
                  padding: '6px 12px',
                  alignSelf: 'flex-start',
                }}
              >
                [{currentSlide.type}]
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
