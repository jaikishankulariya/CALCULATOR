import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Copy,
  Check,
  Download,
  RotateCcw,
  CornerDownLeft,
  Search,
  X,
} from 'lucide-react';
import { HistoryItem } from '../types/calculator';

interface HistoryLogProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onRestoreExpression: (expr: string) => void;
  onInsertResult: (val: string) => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({
  history,
  isOpen,
  onClose,
  onClearHistory,
  onRestoreExpression,
  onInsertResult,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter(
    (item) =>
      item.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyItem = async (item: HistoryItem) => {
    try {
      await navigator.clipboard.writeText(`${item.expression} = ${item.result}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Ignore
    }
  };

  const handleCopyAll = async () => {
    if (history.length === 0) return;
    const text = history
      .map(
        (item) =>
          `[${new Date(item.timestamp).toLocaleTimeString()}] ${item.expression} = ${item.result} (${item.angleMode})`
      )
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // Ignore
    }
  };

  const handleExportText = () => {
    if (history.length === 0) return;
    const text =
      `Jay Kulariya Scientific Calculator - Calculation History Log\n` +
      `Exported: ${new Date().toLocaleString()}\n` +
      `------------------------------------------------------------\n\n` +
      history
        .map(
          (item) =>
            `${new Date(item.timestamp).toLocaleDateString()} ${new Date(
              item.timestamp
            ).toLocaleTimeString()} [${item.angleMode}]: ${item.expression} = ${item.result}`
        )
        .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jay-kulariya-calculator-history-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (ts: number) => {
    const now = Date.now();
    const diffSec = Math.floor((now - ts) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Calculation History Log"
    >
      <div className="relative w-full max-w-xl max-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Calculation History Log
              </h2>
              <p className="text-xs text-slate-400">
                {history.length} {history.length === 1 ? 'record' : 'records'} saved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleCopyAll}
                  aria-label="Copy all calculation history"
                  title="Copy all calculations"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                >
                  {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleExportText}
                  aria-label="Download history as text file"
                  title="Export history text file"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              aria-label="Close calculation history modal"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {history.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past equations or numbers..."
              className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* History Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
                <HistoryIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">No calculations recorded yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Perform calculations with the keypad or keyboard. All results and expressions will be logged here.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No calculations found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 transition-all flex flex-col gap-2"
              >
                {/* Header row: time & angle mode */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="text-cyan-400 font-medium">{item.angleMode}</span>
                    <span>·</span>
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </span>

                  {/* Item Actions */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyItem(item)}
                      aria-label="Copy this calculation"
                      title="Copy equation"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      aria-label="Delete this history entry"
                      title="Delete entry"
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expression */}
                <div className="text-xs font-mono text-slate-400 overflow-x-auto whitespace-nowrap">
                  {item.expression}
                </div>

                {/* Result & Reusable action triggers */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/50">
                  <div className="text-lg font-mono font-bold text-cyan-300 overflow-x-auto">
                    = {item.result}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onInsertResult(item.result);
                        onClose();
                      }}
                      title="Insert this result into current calculation"
                      aria-label="Use result"
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-cyan-300 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                    >
                      <CornerDownLeft className="w-3 h-3" />
                      <span>Use Result</span>
                    </button>
                    <button
                      onClick={() => {
                        onRestoreExpression(item.expression);
                        onClose();
                      }}
                      title="Reload this expression into calculator"
                      aria-label="Restore expression"
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-cyan-300 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reload</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        {history.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between">
            {confirmClear ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-xs text-rose-400 font-medium">Clear entire history?</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setConfirmClear(true)}
                  aria-label="Clear all calculation history"
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors px-2 py-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
                <div className="text-[11px] text-slate-500 font-mono">
                  Saved locally in browser
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
