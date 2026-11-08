import React from 'react';
import { Volume2, VolumeX, Keyboard, History, Sparkles, Check, Copy } from 'lucide-react';
import { AngleMode } from '../types/calculator';

interface HeaderProps {
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  isSecondMode: boolean;
  onToggleSecondMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenKeyboardModal: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  isHistoryOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  angleMode,
  onToggleAngleMode,
  isSecondMode,
  onToggleSecondMode,
  soundEnabled,
  onToggleSound,
  onOpenKeyboardModal,
  onToggleHistory,
  historyCount,
  isHistoryOpen,
}) => {
  return (
    <header className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 mb-1 border-b border-slate-800/80">
      {/* Brand & Author */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shadow-inner">
          <span className="font-mono text-base tracking-tighter">JK</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
              Jay Kulariya
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 font-semibold tracking-wider">
                Scientific
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">Precision Mathematical Instrument</p>
        </div>
      </div>

      {/* Control Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Angle mode toggle */}
        <button
          onClick={onToggleAngleMode}
          aria-label={`Toggle Angle Mode, currently ${angleMode}`}
          className="flex items-center text-xs font-mono font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/70 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors"
        >
          <span className="text-slate-500 mr-1.5">MODE</span>
          <span className="text-cyan-400 font-semibold">{angleMode}</span>
        </button>

        {/* 2nd Function Toggle */}
        <button
          onClick={onToggleSecondMode}
          aria-label="Toggle 2nd functions"
          className={`text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
            isSecondMode
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20'
              : 'bg-slate-900 border-slate-700/70 text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          2nd
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Disable key click audio' : 'Enable key click audio'}
          title={soundEnabled ? 'Mute click sounds' : 'Unmute click sounds'}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700/70 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Keyboard Shortcuts Guide */}
        <button
          onClick={onOpenKeyboardModal}
          aria-label="View keyboard shortcuts"
          title="Keyboard shortcuts"
          className="p-2 rounded-lg bg-slate-900 border border-slate-700/70 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* History Toggle Button */}
        <button
          onClick={onToggleHistory}
          aria-label="Toggle calculation history panel"
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
            isHistoryOpen
              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-700/70 text-slate-300 hover:text-white hover:border-cyan-500/40'
          }`}
        >
          <History className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-cyan-900/60 text-cyan-300 text-[10px] font-mono rounded-full border border-cyan-700/50">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
