
import React, { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?';

export default function DecryptedText({ text, className = '', duration = 1200, step = 30 }) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef();
  const timeoutRef = useRef();
  const loopTimeoutRef = useRef();

  useEffect(() => {
    function startAnimation() {
      let frame = 0;
      let revealed = Array(text.length).fill(false);
      let chars = text.split('');
      setDisplay(''.padEnd(text.length, ' '));
      intervalRef.current = setInterval(() => {
        let newChars = chars.map((c, i) => {
          if (revealed[i]) return c;
          if (Math.random() < frame / (duration / step)) {
            revealed[i] = true;
            return c;
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        });
        setDisplay(newChars.join(''));
        frame++;
        if (revealed.every(Boolean)) {
          clearInterval(intervalRef.current);
          // הפעל מחדש את האנימציה אחרי 3.5 שניות (3500ms)
          loopTimeoutRef.current = setTimeout(startAnimation, 3500);
        }
      }, step);
    }
    timeoutRef.current = setTimeout(startAnimation, 1500);
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
      clearTimeout(loopTimeoutRef.current);
    };
  }, [text, duration, step]);

  // קובע רוחב קבוע לפי אורך הטקסט המקורי (ch) ומונע קפיצות ע"י השלמת רווחים
  const fixedWidth = `${text.length}ch`;
  // תמיד מציג מחרוזת באורך קבוע, רווחים מוחלפים ב-\u00A0
  const paddedDisplay = (display + ' '.repeat(text.length)).slice(0, text.length).replace(/ /g, '\u00A0');
  return (
    <span
      className={`font-mono tracking-wider ${className}`}
      style={{
        display: 'inline-block',
        width: fixedWidth,
        minWidth: fixedWidth,
        maxWidth: fixedWidth,
        textAlign: 'start',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap'
      }}
    >
      {paddedDisplay}
    </span>
  );
}
