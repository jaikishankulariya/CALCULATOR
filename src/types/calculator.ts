export type AngleMode = 'DEG' | 'RAD';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  angleMode: AngleMode;
}

export type ButtonAction =
  | { type: 'digit'; value: string }
  | { type: 'operator'; value: string; display: string }
  | { type: 'function'; value: string; display: string }
  | { type: 'constant'; value: string; display: string }
  | { type: 'parenthesis'; value: '(' | ')' }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'allClear' }
  | { type: 'backspace' }
  | { type: 'negate' }
  | { type: 'percent' }
  | { type: 'toggleAngle' }
  | { type: 'toggleSecond' }
  | { type: 'memory'; action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS' };
