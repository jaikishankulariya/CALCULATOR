import React, { useRef, useEffect, useState } from 'react';
import { Copy, Check, Delete, ArrowRight } from 'lucide-react';
import { AngleMode } from '../types/calculator';

interface DisplayProps {
  expression: string;
  result: string;
  livePreview: string | null;
  angleMode: AngleMode;
  isSecondMode: boolean;
  memoryValue: number;
  error: string | null;
  onClear: () => void;
  onBackspace: () => void;
  onSelectResult: (val: string) => void;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  livePreview,
  angleMode,
  isSecondMode,
  memoryValue,
  error,
  onClear,
  onBackspace,
  onSelectResult,
}) => {
  const [copied, setCopied] = useState(false);
  const exprContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll expression to right as user types
  useEffect(() => {
    if (exprContainerRef.current) {
      exprContainerRef.current.scrollLeft = exprContainerRef.current.scrollWidth;
    }
  }, [expression]);

  const handleCopy = async () => {
    const textToCopy = result !== '0' && result !== '' ? result : expression;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
    }
  };

  // Determine font size based on length of display text
  const isCalculated = result !== '0' && result !== '';
  const mainText = error ? error : (isCalculated ? result : (expression || '0'));
  const textLength = mainText.length;
  let textSizeClass = 'text-3xl sm:text-4xl';
  if (textLength > 18) {
    textSizeClass = 'text-xl sm:text-2xl';
  } else if (textLength > 12) {
    textSizeClass = 'text-2xl sm:text-3xl';
  }

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#0a0f1d] to-[#060913] border border-slate-800/90 p-4 sm:p-5 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[155px]">
      {/* Top Status & Indicators Row */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 border-b border-slate-800/50 pb-2">
        <div className="flex items-center gap-2">
          {/* Angle mode */}
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/70 text-cyan-400 font-semibold tracking-wider text-[11px]">
            {angleMode}
          </span>

          {/* 2nd Function Flag */}
          {isSecondMode && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-[11px]">
              2ND
            </span>
          )}

          {/* Memory Flag */}
          {memoryValue !== 0 && (
            <span
              title={`Memory Stored: ${memoryValue}`}
              className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-semibold text-[11px] flex items-center gap-1"
            >
              <span>M</span>
              <span className="text-[10px] text-indigo-400">({memoryValue})</span>
            </span>
          )}
        </div>

        {/* Action icons: Copy & Backspace */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            aria-label="Copy result to clipboard"
            title="Copy value"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-medium">
                <Check className="w-3.5 h-3.5" /> Copied
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          {expression.length > 0 && (
            <button
              onClick={onBackspace}
              aria-label="Delete last character"
              title="Backspace"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Delete className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expression Trail (Top line) */}
      <div
        ref={exprContainerRef}
        className="w-full overflow-x-auto whitespace-nowrap text-right text-slate-400 font-mono text-sm sm:text-base tracking-wide py-1 scrollbar-none min-h-[28px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isCalculated ? expression : (expression ? '' : <span className="opacity-0">0</span>)}
      </div>

      {/* Main Large Display (Result or Current Typed Expression) */}
      <div className="flex flex-col items-end justify-center w-full mt-1">
        <div
          className={`font-mono font-bold tracking-tight text-right w-full overflow-x-auto whitespace-nowrap transition-all ${textSizeClass} ${
            error ? 'text-rose-400' : 'text-slate-100'
          }`}
          style={{ scrollbarWidth: 'none' }}
        >
          {mainText}
        </div>

        {/* Live dynamic preview when expression is unfinished */}
        {!error && livePreview && livePreview !== mainText && (
          <div className="flex items-center gap-1 text-xs font-mono text-cyan-400/90 mt-1">
            <span className="text-slate-500 text-[11px] font-sans">Live preview:</span>
            <span className="font-semibold">{livePreview}</span>
          </div>
        )}
      </div>
    </div>
  );
};
