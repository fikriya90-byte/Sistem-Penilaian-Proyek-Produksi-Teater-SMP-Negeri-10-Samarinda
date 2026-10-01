import { describe, it, expect } from 'vitest';
import { esc, sanitizeURL, safeRound, safeNum, overlaps } from '../src/core/utils.js';

describe('esc', () => {
  it('escapes HTML', () => {
    expect(esc('<script>')).toBe('&lt;script&gt;');
    expect(esc('a & b')).toBe('a &amp; b');
    expect(esc(null)).toBe('');
  });
});

describe('sanitizeURL', () => {
  it('blocks javascript:', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe('');
  });
  it('allows https', () => {
    expect(sanitizeURL('https://example.com')).toBe('https://example.com');
  });
  it('allows data:image', () => {
    expect(sanitizeURL('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });
});

describe('safeRound', () => {
  it('handles NaN', () => {
    expect(safeRound(NaN)).toBe(0);
    expect(safeRound('abc')).toBe(0);
  });
  it('rounds properly', () => {
    expect(safeRound(3.456)).toBe(3.46);
    expect(safeRound(3.5)).toBe(3.5);
  });
});

describe('safeNum', () => {
  it('returns fallback for invalid', () => {
    expect(safeNum('abc', 0)).toBe(0);
    expect(safeNum('3.5')).toBe(3.5);
  });
});

describe('overlaps', () => {
  it('detects overlap', () => {
    expect(overlaps('10:00', '12:00', '11:00', '13:00')).toBe(true);
    expect(overlaps('10:00', '12:00', '12:00', '14:00')).toBe(false);
  });
});
