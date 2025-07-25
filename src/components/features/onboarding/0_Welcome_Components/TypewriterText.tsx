'use client';

import React, { useState, useEffect } from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface TypewriterTextProps extends Omit<TypographyProps, 'children'> {
  text: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
  onComplete?: () => void;
  skipAnimation?: boolean; // For testing purposes
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 100,
  delay = 0,
  showCursor = true,
  onComplete,
  skipAnimation = false,
  ...typographyProps
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursorBlink, setShowCursorBlink] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timeouts: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];
    
    if (skipAnimation) {
      if (isMounted) {
        setDisplayText(text);
        setCurrentIndex(text.length);
        setIsComplete(true);
        setShowCursorBlink(false);
        onComplete?.();
      }
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        if (isMounted) {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }
      }, currentIndex === 0 ? delay : speed);
      
      timeouts.push(timeout);
    } else if (!isComplete && isMounted) {
      setIsComplete(true);
      onComplete?.();
      
      // Start cursor blinking after completion
      if (showCursor) {
        const blinkInterval = setInterval(() => {
          if (isMounted) {
            setShowCursorBlink(prev => !prev);
          }
        }, 530);
        
        intervals.push(blinkInterval);
      }
    }
    
    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [currentIndex, text, speed, delay, onComplete, showCursor, isComplete, skipAnimation]);

  return (
    <Typography 
      {...typographyProps}
      sx={{
        fontFamily: 'monospace',
        ...typographyProps.sx,
      }}
    >
      {displayText}
      {showCursor && (
        <span
          style={{
            opacity: showCursorBlink ? 1 : 0,
            transition: 'opacity 0.1s ease-in-out',
            color: '#2196F3',
            fontWeight: 'normal',
          }}
        >
          |
        </span>
      )}
    </Typography>
  );
}; 