/**
 * Scientific Calculator Math Engine
 * Robust tokenizer & recursive descent evaluator for mathematical expressions
 */

import { AngleMode } from '../types/calculator';

export interface EvaluationResult {
  success: boolean;
  value?: number;
  formatted?: string;
  error?: string;
}

// Factorial calculation with safety bounds
export function factorial(n: number): number {
  if (!Number.isFinite(n)) return NaN;
  if (n < 0 || Math.floor(n) !== n) return NaN;
  if (n > 170) return Infinity; // Limit for standard IEEE 754
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Truncate floating point noise (e.g. 0.1 + 0.2 = 0.3)
export function cleanPrecision(num: number): number {
  if (!Number.isFinite(num)) return num;
  // Handle near-zero results from trig operations
  if (Math.abs(num) < 1e-14) return 0;
  // Use 12 significant digits for rounding precision artifacts
  return parseFloat(num.toPrecision(12));
}

export function formatNumber(val: number): string {
  if (Number.isNaN(val)) return 'Error';
  if (!Number.isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';

  const cleaned = cleanPrecision(val);
  const abs = Math.abs(cleaned);

  // If very large or very small, use scientific notation
  if ((abs >= 1e12 || (abs > 0 && abs < 1e-7)) && abs !== 0) {
    return cleaned.toExponential(6).replace(/e\+?/, 'e');
  }

  // Format with standard precision up to 10 decimal places
  let str = cleaned.toString();
  if (str.includes('.')) {
    // Truncate excess trailing zeros
    str = parseFloat(cleaned.toFixed(10)).toString();
  }
  return str;
}

// Token definitions
type TokenType =
  | 'NUMBER'
  | 'IDENT'
  | 'PLUS'
  | 'MINUS'
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'POWER'
  | 'PERCENT'
  | 'FACTORIAL'
  | 'LPAREN'
  | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(rawExpr: string): Token[] {
  // Normalize symbols
  const expr = rawExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/mod/gi, '%')
    .trim();

  const rawTokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/\d|\./.test(char)) {
      let numStr = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      // Handle scientific notation e.g. 1.2e5 or 1.2e-5
      if (
        i < expr.length &&
        (expr[i] === 'e' || expr[i] === 'E') &&
        i + 1 < expr.length &&
        /[\d+-]/.test(expr[i + 1])
      ) {
        numStr += expr[i];
        i++;
        if (expr[i] === '+' || expr[i] === '-') {
          numStr += expr[i];
          i++;
        }
        while (i < expr.length && /\d/.test(expr[i])) {
          numStr += expr[i];
          i++;
        }
      }
      rawTokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let identStr = '';
      while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) {
        identStr += expr[i];
        i++;
      }
      rawTokens.push({ type: 'IDENT', value: identStr.toLowerCase() });
      continue;
    }

    switch (char) {
      case '+':
        rawTokens.push({ type: 'PLUS', value: '+' });
        i++;
        break;
      case '-':
        rawTokens.push({ type: 'MINUS', value: '-' });
        i++;
        break;
      case '*':
        rawTokens.push({ type: 'MULTIPLY', value: '*' });
        i++;
        break;
      case '/':
        rawTokens.push({ type: 'DIVIDE', value: '/' });
        i++;
        break;
      case '^':
        rawTokens.push({ type: 'POWER', value: '^' });
        i++;
        break;
      case '%':
        rawTokens.push({ type: 'PERCENT', value: '%' });
        i++;
        break;
      case '!':
        rawTokens.push({ type: 'FACTORIAL', value: '!' });
        i++;
        break;
      case '(':
        rawTokens.push({ type: 'LPAREN', value: '(' });
        i++;
        break;
      case ')':
        rawTokens.push({ type: 'RPAREN', value: ')' });
        i++;
        break;
      default:
        // Skip unknown or error
        i++;
        break;
    }
  }

  // Insert implicit multiplication tokens
  const tokens: Token[] = [];
  for (let k = 0; k < rawTokens.length; k++) {
    const curr = rawTokens[k];
    const prev = k > 0 ? rawTokens[k - 1] : null;

    if (prev) {
      // (prev is NUMBER or RPAREN or CONSTANT/IDENT or FACTORIAL) AND (curr is LPAREN or IDENT or NUMBER)
      const prevCanMultiply =
        prev.type === 'NUMBER' ||
        prev.type === 'RPAREN' ||
        prev.type === 'FACTORIAL' ||
        (prev.type === 'IDENT' && (prev.value === 'pi' || prev.value === 'e' || prev.value === 'ans'));

      const currCanBeMultiplied =
        curr.type === 'LPAREN' ||
        curr.type === 'IDENT' ||
        (curr.type === 'NUMBER' && prev.type === 'FACTORIAL');

      if (prevCanMultiply && currCanBeMultiplied) {
        tokens.push({ type: 'MULTIPLY', value: '*' });
      }
    }
    tokens.push(curr);
  }

  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos = 0;
  private angleMode: AngleMode;
  private ans: number;

  constructor(tokens: Token[], angleMode: AngleMode = 'DEG', ans = 0) {
    this.tokens = tokens;
    this.angleMode = angleMode;
    this.ans = ans;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.peek();
    if (!token) return false;
    if (token.type !== type) return false;
    if (value !== undefined && token.value !== value) return false;
    this.pos++;
    return true;
  }

  public parse(): number {
    if (this.tokens.length === 0) return 0;
    const result = this.expression();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token '${this.tokens[this.pos].value}'`);
    }
    return result;
  }

  private expression(): number {
    return this.additive();
  }

  private additive(): number {
    let left = this.multiplicative();
    while (true) {
      if (this.match('PLUS')) {
        left = left + this.multiplicative();
      } else if (this.match('MINUS')) {
        left = left - this.multiplicative();
      } else {
        break;
      }
    }
    return left;
  }

  private multiplicative(): number {
    let left = this.power();
    while (true) {
      if (this.match('MULTIPLY')) {
        left = left * this.power();
      } else if (this.match('DIVIDE')) {
        const right = this.power();
        if (right === 0) {
          throw new Error('Cannot divide by zero');
        }
        left = left / right;
      } else if (this.match('PERCENT')) {
        const right = this.power();
        if (right === 0) throw new Error('Modulo by zero');
        left = left % right;
      } else {
        break;
      }
    }
    return left;
  }

  private power(): number {
    const left = this.unary();
    if (this.match('POWER')) {
      const right = this.power(); // Right-associative exponentiation
      return Math.pow(left, right);
    }
    return left;
  }

  private unary(): number {
    if (this.match('PLUS')) {
      return this.unary();
    }
    if (this.match('MINUS')) {
      return -this.unary();
    }
    return this.factorial();
  }

  private factorial(): number {
    let val = this.primary();
    while (this.match('FACTORIAL')) {
      if (val < 0 || Math.floor(val) !== val) {
        throw new Error('Factorial only for non-negative integers');
      }
      val = factorial(val);
    }
    return val;
  }

  private toRadians(angle: number): number {
    return this.angleMode === 'DEG' ? (angle * Math.PI) / 180 : angle;
  }

  private fromRadians(rad: number): number {
    return this.angleMode === 'DEG' ? (rad * 180) / Math.PI : rad;
  }

  private primary(): number {
    const token = this.peek();
    if (!token) {
      throw new Error('Unexpected end of expression');
    }

    if (token.type === 'NUMBER') {
      this.consume();
      const n = parseFloat(token.value);
      if (Number.isNaN(n)) throw new Error(`Invalid number: ${token.value}`);
      return n;
    }

    if (token.type === 'LPAREN') {
      this.consume();
      const val = this.expression();
      if (!this.match('RPAREN')) {
        throw new Error("Missing closing parenthesis ')'");
      }
      return val;
    }

    if (token.type === 'IDENT') {
      const name = token.value.toLowerCase();
      this.consume();

      // Check constants
      if (name === 'pi' || name === 'π') return Math.PI;
      if (name === 'e') return Math.E;
      if (name === 'ans') return this.ans;

      // Must be a function call, expect '('
      if (!this.match('LPAREN')) {
        throw new Error(`Expected '(' after function '${name}'`);
      }

      const arg = this.expression();

      if (!this.match('RPAREN')) {
        throw new Error(`Missing ')' after function '${name}' argument`);
      }

      return this.evalFunction(name, arg);
    }

    throw new Error(`Unexpected token: '${token.value}'`);
  }

  private evalFunction(name: string, arg: number): number {
    switch (name) {
      case 'sin': {
        const rad = this.toRadians(arg);
        // Clean degree quadrant exact zeros
        if (this.angleMode === 'DEG' && arg % 180 === 0) return 0;
        return Math.sin(rad);
      }
      case 'cos': {
        const rad = this.toRadians(arg);
        if (this.angleMode === 'DEG' && (arg - 90) % 180 === 0) return 0;
        return Math.cos(rad);
      }
      case 'tan': {
        if (this.angleMode === 'DEG' && (arg - 90) % 180 === 0) {
          throw new Error('Tangent undefined at 90° + k·180°');
        }
        if (this.angleMode === 'DEG' && arg % 180 === 0) return 0;
        const rad = this.toRadians(arg);
        return Math.tan(rad);
      }
      case 'asin': {
        if (arg < -1 || arg > 1) throw new Error('Domain error for asin (-1 to 1)');
        return this.fromRadians(Math.asin(arg));
      }
      case 'acos': {
        if (arg < -1 || arg > 1) throw new Error('Domain error for acos (-1 to 1)');
        return this.fromRadians(Math.acos(arg));
      }
      case 'atan': {
        return this.fromRadians(Math.atan(arg));
      }
      case 'sinh':
        return Math.sinh(arg);
      case 'cosh':
        return Math.cosh(arg);
      case 'tanh':
        return Math.tanh(arg);
      case 'sqrt':
        if (arg < 0) throw new Error('Cannot take square root of negative number');
        return Math.sqrt(arg);
      case 'cbrt':
        return Math.cbrt(arg);
      case 'log':
      case 'log10':
        if (arg <= 0) throw new Error('Domain error: log argument must be > 0');
        return Math.log10(arg);
      case 'ln':
        if (arg <= 0) throw new Error('Domain error: ln argument must be > 0');
        return Math.log(arg);
      case 'abs':
        return Math.abs(arg);
      case 'exp':
        return Math.exp(arg);
      default:
        throw new Error(`Unknown function: '${name}'`);
    }
  }
}

/**
 * Main evaluation entry point
 */
export function evaluateExpression(
  expression: string,
  angleMode: AngleMode = 'DEG',
  ans = 0
): EvaluationResult {
  if (!expression || expression.trim() === '') {
    return { success: true, value: 0, formatted: '0' };
  }

  try {
    const tokens = tokenize(expression);
    const parser = new Parser(tokens, angleMode, ans);
    const rawVal = parser.parse();
    const val = cleanPrecision(rawVal);
    const formatted = formatNumber(val);

    return {
      success: true,
      value: val,
      formatted,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Calculation error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Live preview calculation helper that doesn't complain about trailing open parenthesis
 * or trailing operators when typing live
 */
export function getLivePreview(
  expression: string,
  angleMode: AngleMode = 'DEG',
  ans = 0
): string | null {
  if (!expression || expression.trim() === '') return null;

  // If ends with an operator, strip trailing operators/open parens for live preview
  let sanitized = expression.trim();
  while (/[+\-*/^%(\s]$/.test(sanitized)) {
    sanitized = sanitized.slice(0, -1).trim();
  }

  // Count unclosed parentheses and auto-close for preview
  const openCount = (sanitized.match(/\(/g) || []).length;
  const closeCount = (sanitized.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    sanitized += ')'.repeat(openCount - closeCount);
  }

  if (!sanitized) return null;

  const result = evaluateExpression(sanitized, angleMode, ans);
  if (result.success && result.formatted !== undefined && result.formatted !== 'Error') {
    return result.formatted;
  }
  return null;
}
