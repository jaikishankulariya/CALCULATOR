import React from 'react';
import { AngleMode } from '../types/calculator';

interface KeypadProps {
  onInput: (char: string) => void;
  onOperator: (op: string) => void;
  onFunction: (fn: string) => void;
  onConstant: (c: string) => void;
  onParenthesis: (p: '(' | ')') => void;
  onEquals: () => void;
  onClear: () => void;
  onAllClear: () => void;
  onBackspace: () => void;
  onNegate: () => void;
  onPercent: () => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  memoryHasValue: boolean;
  isSecondMode: boolean;
  angleMode: AngleMode;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInput,
  onOperator,
  onFunction,
  onConstant,
  onParenthesis,
  onEquals,
  onClear,
  onAllClear,
  onBackspace,
  onNegate,
  onPercent,
  onMemoryAction,
  memoryHasValue,
  isSecondMode,
}) => {
  // Common key style helpers
  const baseKey =
    'relative flex items-center justify-center font-medium rounded-xl transition-all duration-100 active:scale-95 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';

  const numKey =
    `${baseKey} h-12 sm:h-14 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-mono text-lg sm:text-xl border border-slate-800/80 hover:border-slate-700 shadow-sm`;

  const opKey =
    `${baseKey} h-12 sm:h-14 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 font-mono text-xl border border-cyan-800/40 hover:border-cyan-600/60 shadow-sm`;

  const sciKey =
    `${baseKey} h-11 sm:h-12 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-mono text-sm sm:text-base border border-slate-800/70 hover:border-slate-700 shadow-sm`;

  const memKey = (active: boolean) =>
    `${baseKey} h-8 text-xs font-mono font-semibold px-1 rounded-lg border ${
      active
        ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50 hover:bg-indigo-900/60'
        : 'bg-slate-950/50 text-slate-500 border-slate-800/50 hover:text-slate-300 hover:bg-slate-900'
    }`;

  const controlKey =
    `${baseKey} h-12 sm:h-14 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 font-mono text-base sm:text-lg border border-rose-800/40 hover:border-rose-600/60 shadow-sm`;

  const equalsKey =
    `${baseKey} h-12 sm:h-14 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold font-mono text-2xl shadow-lg shadow-cyan-500/20 active:shadow-none border border-cyan-300/40`;

  return (
    <div className="w-full flex flex-col gap-2.5 mt-3">
      {/* Memory Function Bar */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        <button
          onClick={() => onMemoryAction('MC')}
          disabled={!memoryHasValue}
          aria-label="Clear Memory"
          className={memKey(memoryHasValue)}
        >
          MC
        </button>
        <button
          onClick={() => onMemoryAction('MR')}
          disabled={!memoryHasValue}
          aria-label="Recall Memory"
          className={memKey(memoryHasValue)}
        >
          MR
        </button>
        <button
          onClick={() => onMemoryAction('M+')}
          aria-label="Memory Add"
          className={memKey(true)}
        >
          M+
        </button>
        <button
          onClick={() => onMemoryAction('M-')}
          aria-label="Memory Subtract"
          className={memKey(true)}
        >
          M-
        </button>
        <button
          onClick={() => onMemoryAction('MS')}
          aria-label="Memory Store"
          className={memKey(true)}
        >
          MS
        </button>
      </div>

      {/* Scientific Functions Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5 sm:gap-2">
        {/* Trig functions */}
        <button
          onClick={() => onFunction(isSecondMode ? 'asin(' : 'sin(')}
          aria-label={isSecondMode ? 'Arcsine function' : 'Sine function'}
          className={sciKey}
        >
          {isSecondMode ? 'sin⁻¹' : 'sin'}
        </button>
        <button
          onClick={() => onFunction(isSecondMode ? 'acos(' : 'cos(')}
          aria-label={isSecondMode ? 'Arccosine function' : 'Cosine function'}
          className={sciKey}
        >
          {isSecondMode ? 'cos⁻¹' : 'cos'}
        </button>
        <button
          onClick={() => onFunction(isSecondMode ? 'atan(' : 'tan(')}
          aria-label={isSecondMode ? 'Arctangent function' : 'Tangent function'}
          className={sciKey}
        >
          {isSecondMode ? 'tan⁻¹' : 'tan'}
        </button>
        <button
          onClick={() => onConstant('π')}
          aria-label="Constant Pi"
          className={sciKey}
        >
          π
        </button>
        <button
          onClick={() => onConstant('e')}
          aria-label="Constant Euler's e"
          className={sciKey}
        >
          e
        </button>

        {/* Second row of scientific */}
        <button
          onClick={() => (isSecondMode ? onFunction('exp(') : onFunction('ln('))}
          aria-label={isSecondMode ? 'Exponential e to the x' : 'Natural logarithm'}
          className={sciKey}
        >
          {isSecondMode ? 'eˣ' : 'ln'}
        </button>
        <button
          onClick={() => (isSecondMode ? onOperator('10^') : onFunction('log('))}
          aria-label={isSecondMode ? '10 to the power of x' : 'Logarithm base 10'}
          className={sciKey}
        >
          {isSecondMode ? '10ˣ' : 'log'}
        </button>
        <button
          onClick={() => (isSecondMode ? onOperator('^2') : onFunction('sqrt('))}
          aria-label={isSecondMode ? 'Square power' : 'Square root'}
          className={sciKey}
        >
          {isSecondMode ? 'x²' : '√'}
        </button>
        <button
          onClick={() => (isSecondMode ? onFunction('cbrt(') : onOperator('^'))}
          aria-label={isSecondMode ? 'Cube root' : 'Power x to y'}
          className={sciKey}
        >
          {isSecondMode ? '³√' : 'xʸ'}
        </button>
        <button
          onClick={() => (isSecondMode ? onFunction('abs(') : onOperator('!'))}
          aria-label={isSecondMode ? 'Absolute value' : 'Factorial'}
          className={sciKey}
        >
          {isSecondMode ? '|x|' : 'x!'}
        </button>
      </div>

      {/* Main Standard Keypad */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {/* Row 1: Clear, Backspace, Mod/Percent, Divide */}
        <button
          onClick={onAllClear}
          aria-label="All Clear"
          className={controlKey}
        >
          AC
        </button>
        <button
          onClick={onBackspace}
          aria-label="Backspace"
          className={controlKey}
        >
          ⌫
        </button>
        <button
          onClick={onPercent}
          aria-label="Modulo or percentage"
          className={opKey}
        >
          %
        </button>
        <button
          onClick={() => onOperator('÷')}
          aria-label="Divide"
          className={opKey}
        >
          ÷
        </button>

        {/* Row 2: 7 8 9 × */}
        <button
          onClick={() => onInput('7')}
          aria-label="Digit 7"
          className={numKey}
        >
          7
        </button>
        <button
          onClick={() => onInput('8')}
          aria-label="Digit 8"
          className={numKey}
        >
          8
        </button>
        <button
          onClick={() => onInput('9')}
          aria-label="Digit 9"
          className={numKey}
        >
          9
        </button>
        <button
          onClick={() => onOperator('×')}
          aria-label="Multiply"
          className={opKey}
        >
          ×
        </button>

        {/* Row 3: 4 5 6 - */}
        <button
          onClick={() => onInput('4')}
          aria-label="Digit 4"
          className={numKey}
        >
          4
        </button>
        <button
          onClick={() => onInput('5')}
          aria-label="Digit 5"
          className={numKey}
        >
          5
        </button>
        <button
          onClick={() => onInput('6')}
          aria-label="Digit 6"
          className={numKey}
        >
          6
        </button>
        <button
          onClick={() => onOperator('-')}
          aria-label="Subtract"
          className={opKey}
        >
          −
        </button>

        {/* Row 4: 1 2 3 + */}
        <button
          onClick={() => onInput('1')}
          aria-label="Digit 1"
          className={numKey}
        >
          1
        </button>
        <button
          onClick={() => onInput('2')}
          aria-label="Digit 2"
          className={numKey}
        >
          2
        </button>
        <button
          onClick={() => onInput('3')}
          aria-label="Digit 3"
          className={numKey}
        >
          3
        </button>
        <button
          onClick={() => onOperator('+')}
          aria-label="Add"
          className={opKey}
        >
          +
        </button>

        {/* Row 5: Parentheses, 0, ., = */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            onClick={() => onParenthesis('(')}
            aria-label="Left Parenthesis"
            className={`${sciKey} h-12 sm:h-14 text-base font-semibold`}
          >
            (
          </button>
          <button
            onClick={() => onParenthesis(')')}
            aria-label="Right Parenthesis"
            className={`${sciKey} h-12 sm:h-14 text-base font-semibold`}
          >
            )
          </button>
        </div>
        <button
          onClick={() => onInput('0')}
          aria-label="Digit 0"
          className={numKey}
        >
          0
        </button>
        <button
          onClick={() => onInput('.')}
          aria-label="Decimal Point"
          className={numKey}
        >
          .
        </button>
        <button
          onClick={onEquals}
          aria-label="Equals calculate"
          className={equalsKey}
        >
          =
        </button>
      </div>
    </div>
  );
};
