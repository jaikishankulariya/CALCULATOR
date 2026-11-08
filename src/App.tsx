/**
 * Jay Kulariya Scientific Calculator
 * Precision scientific calculator with advanced functions, dark mode, and calculation history log.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { HistoryLog } from './components/HistoryLog';
import { KeyboardModal } from './components/KeyboardModal';
import { AngleMode, HistoryItem } from './types/calculator';
import { evaluateExpression, getLivePreview } from './utils/calculatorEngine';
import { playKeyClick } from './utils/audio';

const STORAGE_KEYS = {
  HISTORY: 'jk_calc_history_v1',
  ANGLE_MODE: 'jk_calc_angle_mode',
  SOUND: 'jk_calc_sound_enabled',
  MEMORY: 'jk_calc_memory_value',
};

export default function App() {
  // Calculator state
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [lastAnswer, setLastAnswer] = useState<number>(0);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modes & options
  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANGLE_MODE);
      return saved === 'RAD' ? 'RAD' : 'DEG';
    } catch {
      return 'DEG';
    }
  });

  const [isSecondMode, setIsSecondMode] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Memory register
  const [memory, setMemory] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMORY);
      return saved ? parseFloat(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // History log
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore
    }
    return [];
  });

  // Modal visibility
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANGLE_MODE, angleMode);
    } catch {
      // Ignore
    }
  }, [angleMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled.toString());
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORY, memory.toString());
    } catch {
      // Ignore
    }
  }, [memory]);

  // Live preview computation
  const livePreview = useMemo(() => {
    if (error || !expression || isEvaluated) return null;
    return getLivePreview(expression, angleMode, lastAnswer);
  }, [expression, angleMode, lastAnswer, error, isEvaluated]);

  // Play click
  const clickSound = useCallback(() => {
    playKeyClick(soundEnabled);
  }, [soundEnabled]);

  // Handlers for calculator buttons
  const handleInput = useCallback(
    (char: string) => {
      clickSound();
      setError(null);

      if (isEvaluated) {
        // If typing a digit after '=', start new expression unless it's a decimal point on 0
        if (char === '.') {
          setExpression('0.');
        } else {
          setExpression(char);
        }
        setResult('0');
        setIsEvaluated(false);
        return;
      }

      setExpression((prev) => {
        // Prevent double decimals in the current token
        if (char === '.') {
          const parts = prev.split(/[\s+\-×*÷/^%()]+/);
          const lastPart = parts[parts.length - 1];
          if (lastPart.includes('.')) {
            return prev;
          }
          if (!lastPart) {
            return prev + '0.';
          }
        }
        return prev + char;
      });
    },
    [isEvaluated, clickSound]
  );

  const handleOperator = useCallback(
    (op: string) => {
      clickSound();
      setError(null);

      if (isEvaluated) {
        // Continue from previous result
        setExpression(result + ' ' + op + ' ');
        setIsEvaluated(false);
        return;
      }

      setExpression((prev) => {
        if (!prev) {
          if (op === '-') return '-';
          return '0 ' + op + ' ';
        }

        // If expression ends with an operator, replace it
        if (/ [+\-×*÷/^%] $/.test(prev)) {
          return prev.slice(0, -3) + ' ' + op + ' ';
        }

        return prev + ' ' + op + ' ';
      });
    },
    [isEvaluated, result, clickSound]
  );

  const handleFunction = useCallback(
    (fn: string) => {
      clickSound();
      setError(null);

      if (isEvaluated) {
        setExpression(fn);
        setResult('0');
        setIsEvaluated(false);
        return;
      }

      setExpression((prev) => prev + fn);
    },
    [isEvaluated, clickSound]
  );

  const handleConstant = useCallback(
    (c: string) => {
      clickSound();
      setError(null);

      if (isEvaluated) {
        setExpression(c);
        setResult('0');
        setIsEvaluated(false);
        return;
      }

      setExpression((prev) => prev + c);
    },
    [isEvaluated, clickSound]
  );

  const handleParenthesis = useCallback(
    (p: '(' | ')') => {
      clickSound();
      setError(null);

      if (isEvaluated) {
        if (p === '(') {
          setExpression('(');
          setResult('0');
          setIsEvaluated(false);
          return;
        }
      }

      setExpression((prev) => prev + p);
    },
    [isEvaluated, clickSound]
  );

  const handleBackspace = useCallback(() => {
    clickSound();
    setError(null);

    if (isEvaluated) {
      setExpression('');
      setResult('0');
      setIsEvaluated(false);
      return;
    }

    setExpression((prev) => {
      if (!prev) return '';

      // Check if ending with a function name like 'asin(', 'sin(', 'sqrt(', etc.
      const fnMatch = prev.match(/([a-z0-9_]+|[³ʸ]√)\($/i);
      if (fnMatch) {
        return prev.slice(0, -fnMatch[0].length);
      }

      // Check if ending with an operator padded with spaces e.g. " + "
      if (/ [+\-×*÷/^%] $/.test(prev)) {
        return prev.slice(0, -3);
      }

      return prev.slice(0, -1);
    });
  }, [isEvaluated, clickSound]);

  const handleClear = useCallback(() => {
    clickSound();
    setExpression('');
    setError(null);
  }, [clickSound]);

  const handleAllClear = useCallback(() => {
    clickSound();
    setExpression('');
    setResult('0');
    setError(null);
    setIsEvaluated(false);
  }, [clickSound]);

  const handleNegate = useCallback(() => {
    clickSound();
    setError(null);

    if (isEvaluated && result !== '0' && result !== 'Error') {
      const num = parseFloat(result);
      if (!Number.isNaN(num)) {
        const negated = (-num).toString();
        setResult(negated);
        setExpression(negated);
      }
      return;
    }

    setExpression((prev) => {
      if (!prev) return '-';
      if (prev.startsWith('-(') && prev.endsWith(')')) {
        return prev.slice(2, -1);
      }
      return `-(${prev})`;
    });
  }, [isEvaluated, result, clickSound]);

  const handlePercent = useCallback(() => {
    clickSound();
    setError(null);
    setExpression((prev) => (prev ? prev + ' % ' : '0 % '));
  }, [clickSound]);

  // Main evaluation trigger
  const handleEquals = useCallback(() => {
    clickSound();
    if (!expression || expression.trim() === '') return;

    // Automatically close unbalanced opening parentheses before evaluating
    let exprToEval = expression.trim();
    const openCount = (exprToEval.match(/\(/g) || []).length;
    const closeCount = (exprToEval.match(/\)/g) || []).length;
    if (openCount > closeCount) {
      exprToEval += ')'.repeat(openCount - closeCount);
    }

    const evalRes = evaluateExpression(exprToEval, angleMode, lastAnswer);

    if (evalRes.success && evalRes.value !== undefined && evalRes.formatted !== undefined) {
      setResult(evalRes.formatted);
      setLastAnswer(evalRes.value);
      setIsEvaluated(true);
      setError(null);

      // Save to history log if not trivial single number repeat
      if (exprToEval !== evalRes.formatted) {
        const newItem: HistoryItem = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          expression: exprToEval,
          result: evalRes.formatted,
          timestamp: Date.now(),
          angleMode,
        };
        setHistory((prev) => [newItem, ...prev].slice(0, 100));
      }
    } else {
      setError(evalRes.error || 'Syntax Error');
      setIsEvaluated(false);
    }
  }, [expression, angleMode, lastAnswer, clickSound]);

  // Memory Actions
  const handleMemoryAction = useCallback(
    (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
      clickSound();
      switch (action) {
        case 'MC':
          setMemory(0);
          break;
        case 'MR':
          if (memory !== 0) {
            handleInput(memory.toString());
          }
          break;
        case 'MS': {
          const currentVal = parseFloat(result) || (expression ? evaluateExpression(expression, angleMode, lastAnswer).value || 0 : 0);
          setMemory(currentVal);
          break;
        }
        case 'M+': {
          const currentVal = parseFloat(result) || (expression ? evaluateExpression(expression, angleMode, lastAnswer).value || 0 : 0);
          setMemory((prev) => prev + currentVal);
          break;
        }
        case 'M-': {
          const currentVal = parseFloat(result) || (expression ? evaluateExpression(expression, angleMode, lastAnswer).value || 0 : 0);
          setMemory((prev) => prev - currentVal);
          break;
        }
      }
    },
    [memory, result, expression, angleMode, lastAnswer, handleInput, clickSound]
  );

  // History Actions
  const handleRestoreExpression = useCallback((expr: string) => {
    setExpression(expr);
    setResult('0');
    setError(null);
    setIsEvaluated(false);
  }, []);

  const handleInsertResult = useCallback((val: string) => {
    setExpression((prev) => prev + val);
    setError(null);
    setIsEvaluated(false);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside modal input fields
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleInput('.');
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '^') {
        e.preventDefault();
        handleOperator('^');
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercent();
      } else if (e.key === '!' && !e.shiftKey) {
        e.preventDefault();
        handleOperator('!');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        handleParenthesis(e.key as '(' | ')');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleAllClear();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleFunction(isSecondMode ? 'asin(' : 'sin(');
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleFunction(isSecondMode ? 'atan(' : 'tan(');
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleFunction('ln(');
      } else if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        handleFunction('log(');
      } else if (e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleFunction('sqrt(');
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleConstant('π');
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleConstant('e');
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'));
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleInput,
    handleOperator,
    handleFunction,
    handleConstant,
    handleParenthesis,
    handleEquals,
    handleBackspace,
    handleAllClear,
    handlePercent,
    isSecondMode,
  ]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-[20%] right-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Calculator Container */}
      <main className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-cyan-950/20">
        {/* Branded Header */}
        <Header
          angleMode={angleMode}
          onToggleAngleMode={() => setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))}
          isSecondMode={isSecondMode}
          onToggleSecondMode={() => setIsSecondMode((prev) => !prev)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onOpenKeyboardModal={() => setIsKeyboardModalOpen(true)}
          onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
          historyCount={history.length}
          isHistoryOpen={isHistoryOpen}
        />

        {/* Display Screen */}
        <Display
          expression={expression}
          result={result}
          livePreview={livePreview}
          angleMode={angleMode}
          isSecondMode={isSecondMode}
          memoryValue={memory}
          error={error}
          onClear={handleClear}
          onBackspace={handleBackspace}
          onSelectResult={(val) => setExpression(val)}
        />

        {/* Keypad */}
        <Keypad
          onInput={handleInput}
          onOperator={handleOperator}
          onFunction={handleFunction}
          onConstant={handleConstant}
          onParenthesis={handleParenthesis}
          onEquals={handleEquals}
          onClear={handleClear}
          onAllClear={handleAllClear}
          onBackspace={handleBackspace}
          onNegate={handleNegate}
          onPercent={handlePercent}
          onMemoryAction={handleMemoryAction}
          memoryHasValue={memory !== 0}
          isSecondMode={isSecondMode}
          angleMode={angleMode}
        />

        {/* Subtle Footer attribution */}
        <footer className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Engineered by Jay Kulariya</span>
          <span>v2.4 · IEEE 754</span>
        </footer>
      </main>

      {/* Calculation History Modal */}
      <HistoryLog
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onClearHistory={handleClearHistory}
        onRestoreExpression={handleRestoreExpression}
        onInsertResult={handleInsertResult}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardModal
        isOpen={isKeyboardModalOpen}
        onClose={() => setIsKeyboardModalOpen(false)}
      />
    </div>
  );
}
