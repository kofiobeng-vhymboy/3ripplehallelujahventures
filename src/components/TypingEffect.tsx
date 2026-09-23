import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface TextSegment {
  text: string;
  className?: string;
}

interface TypingEffectProps {
  segments: TextSegment[];
  className?: string;
  delay?: number;
  speed?: number;
  as?: React.ElementType;
}

export default function TypingEffect({ 
  segments, 
  className = "", 
  delay = 0, 
  speed = 40,
  as: Component = "span"
}: TypingEffectProps) {
  const [displayedSegments, setDisplayedSegments] = useState<TextSegment[]>(
    segments.map(s => ({ ...s, text: "" }))
  );
  const [started, setStarted] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started || currentSegmentIndex >= segments.length) return;

    const currentTarget = segments[currentSegmentIndex].text;
    const currentDisplayed = displayedSegments[currentSegmentIndex].text;

    if (currentDisplayed.length < currentTarget.length) {
      const timeout = setTimeout(() => {
        const nextText = currentTarget.slice(0, currentDisplayed.length + 1);
        setDisplayedSegments(prev => {
          const next = [...prev];
          next[currentSegmentIndex] = { ...next[currentSegmentIndex], text: nextText };
          return next;
        });
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Move to next segment
      setCurrentSegmentIndex(prev => prev + 1);
    }
  }, [displayedSegments, currentSegmentIndex, segments, started, speed]);

  const allDone = currentSegmentIndex >= segments.length;

  return (
    <Component className={className}>
      {displayedSegments.map((segment, idx) => (
        <span key={idx} className={segment.className}>
          {segment.text}
        </span>
      ))}
      {!allDone && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
        />
      )}
    </Component>
  );
}
