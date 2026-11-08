import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardModal: React.FC<KeyboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 - 9, .', action: 'Input numbers and decimals' },
    { key: '+, -, *, /', action: 'Standard arithmetic operators' },
    { key: 'Enter or =', action: 'Evaluate / Calculate expression' },
    { key: 'Backspace', action: 'Delete last character' },
    { key: 'Escape or C', action: 'Clear current expression (AC)' },
    { key: '( and )', action: 'Add parentheses' },
    { key: '^', action: 'Exponentiation (Power xʸ)' },
    { key: '%', action: 'Modulo operation' },
    { key: '!', action: 'Factorial function' },
    { key: 's, c, t', action: 'sin, cos, tan functions' },
    { key: 'l, g', action: 'ln (natural log) and log (base 10)' },
    { key: 'q or r', action: 'Square root (sqrt)' },
    { key: 'p, e', action: 'Constants π and Euler’s e' },
    { key: 'd', action: 'Toggle DEG / RAD angle mode' },
    { key: 'h', action: 'Open Calculation History' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
    >
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">Type directly on your physical keyboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-2">
          {shortcuts.map((sc, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-900/60 transition-colors border border-transparent hover:border-slate-800"
            >
              <kbd className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 font-mono text-xs text-cyan-300 font-semibold shadow-inner">
                {sc.key}
              </kbd>
              <span className="text-xs text-slate-300 text-right">{sc.action}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-900/40 border-t border-slate-800 text-center text-xs text-slate-500">
          Press any key while the calculator is open to start calculating
        </div>
      </div>
    </div>
  );
};
