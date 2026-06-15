import { useState, useCallback, useRef, useEffect } from 'react';

export function useBarcode(onDetect: (barcode: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const SCAN_THRESHOLD_MS = 50;

  useEffect(() => {
    if (!isListening) return;

    const handler = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyTimeRef.current > SCAN_THRESHOLD_MS && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter' && bufferRef.current.length > 0) {
        e.preventDefault();
        onDetect(bufferRef.current);
        bufferRef.current = '';
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isListening, onDetect]);

  const startListening = useCallback(() => setIsListening(true), []);
  const stopListening = useCallback(() => {
    setIsListening(false);
    bufferRef.current = '';
  }, []);

  return { isListening, startListening, stopListening };
}
