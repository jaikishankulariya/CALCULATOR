import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateExpression,
  factorial,
  cleanPrecision,
  formatNumber,
  getLivePreview,
} from './calculatorEngine';

test('basic arithmetic calculations', () => {
  assert.equal(evaluateExpression('2 + 3').formatted, '5');
  assert.equal(evaluateExpression('10 - 4').formatted, '6');
  assert.equal(evaluateExpression('6 * 7').formatted, '42');
  assert.equal(evaluateExpression('6 × 7').formatted, '42');
  assert.equal(evaluateExpression('20 / 4').formatted, '5');
  assert.equal(evaluateExpression('20 ÷ 4').formatted, '5');
  assert.equal(evaluateExpression('14 % 4').formatted, '2');
  assert.equal(evaluateExpression('2 + 3 * 4').formatted, '14');
  assert.equal(evaluateExpression('(2 + 3) * 4').formatted, '20');
});

test('unary minus and floating point precision', () => {
  assert.equal(evaluateExpression('-5 + 3').formatted, '-2');
  assert.equal(evaluateExpression('3 * -4').formatted, '-12');
  assert.equal(evaluateExpression('0.1 + 0.2').formatted, '0.3');
  assert.equal(evaluateExpression('-(4 + 6)').formatted, '-10');
});

test('powers and roots', () => {
  assert.equal(evaluateExpression('2 ^ 3').formatted, '8');
  assert.equal(evaluateExpression('2 ^ 10').formatted, '1024');
  assert.equal(evaluateExpression('sqrt(144)').formatted, '12');
  assert.equal(evaluateExpression('cbrt(27)').formatted, '3');
});

test('factorials', () => {
  assert.equal(factorial(0), 1);
  assert.equal(factorial(5), 120);
  assert.equal(factorial(6), 720);
  assert.equal(evaluateExpression('5!').formatted, '120');
  assert.equal(evaluateExpression('3! + 4!').formatted, '30');
});

test('scientific and logarithmic functions', () => {
  assert.equal(evaluateExpression('log(100)').formatted, '2');
  assert.equal(evaluateExpression('log(1000)').formatted, '3');
  assert.equal(evaluateExpression('ln(e)').formatted, '1');
  assert.equal(evaluateExpression('abs(-42)').formatted, '42');
});

test('trigonometric functions in DEG and RAD modes', () => {
  // DEG mode
  assert.equal(evaluateExpression('sin(30)', 'DEG').formatted, '0.5');
  assert.equal(evaluateExpression('sin(90)', 'DEG').formatted, '1');
  assert.equal(evaluateExpression('sin(180)', 'DEG').formatted, '0');
  assert.equal(evaluateExpression('cos(0)', 'DEG').formatted, '1');
  assert.equal(evaluateExpression('cos(90)', 'DEG').formatted, '0');
  assert.equal(evaluateExpression('tan(45)', 'DEG').formatted, '1');
  assert.equal(evaluateExpression('asin(0.5)', 'DEG').formatted, '30');
  assert.equal(evaluateExpression('atan(1)', 'DEG').formatted, '45');

  // RAD mode
  assert.equal(evaluateExpression('sin(pi / 2)', 'RAD').formatted, '1');
  assert.equal(evaluateExpression('cos(pi)', 'RAD').formatted, '-1');
});

test('implicit multiplication', () => {
  assert.equal(evaluateExpression('2(3 + 4)').formatted, '14');
  assert.equal(evaluateExpression('(2)(3)').formatted, '6');
  assert.equal(evaluateExpression('2pi').value !== undefined && cleanPrecision(evaluateExpression('2pi').value!) === cleanPrecision(2 * Math.PI), true);
  assert.equal(evaluateExpression('3sin(30)', 'DEG').formatted, '1.5');
});

test('handles errors cleanly', () => {
  assert.equal(evaluateExpression('10 / 0').success, false);
  assert.equal(evaluateExpression('10 / 0').error, 'Cannot divide by zero');
  assert.equal(evaluateExpression('sqrt(-4)').success, false);
  assert.equal(evaluateExpression('sin(').success, false);
});

test('live preview helper', () => {
  assert.equal(getLivePreview('5 + 3 * '), '8');
  assert.equal(getLivePreview('2 * (3 + 4'), '14');
  assert.equal(getLivePreview('sin(30', 'DEG'), '0.5');
});
