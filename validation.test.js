// tests/validation.test.js
import { describe, it, expect } from 'vitest';
import { validatePassword, validateEmail, validateRecipeForm } from './js/validation.js';

describe('Password Validation', () => {
  it('should accept valid password (8-15 characters)', () => {
    const result = validatePassword('password123');
    expect(result.valid).toBe(true);
  });

  it('should reject password less than 8 characters', () => {
    const result = validatePassword('short');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('8-15 characters');
  });

  it('should reject password more than 15 characters', () => {
    const result = validatePassword('thispasswordistoolong');
    expect(result.valid).toBe(false);
  });

  it('should reject empty password', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
  });

  it('should accept password exactly 8 characters', () => {
    const result = validatePassword('12345678');
    expect(result.valid).toBe(true);
  });

  it('should accept password exactly 15 characters', () => {
    const result = validatePassword('123456789012345');
    expect(result.valid).toBe(true);
  });
});

describe('Email Validation', () => {
  it('should accept valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result.valid).toBe(true);
  });

  it('should reject email without @', () => {
    const result = validateEmail('testexample.com');
    expect(result.valid).toBe(false);
  });

  it('should reject email without dot', () => {
    const result = validateEmail('test@examplecom');
    expect(result.valid).toBe(false);
  });

  it('should reject empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
  });

  it('should accept email with subdomain', () => {
    const result = validateEmail('user@mail.example.com');
    expect(result.valid).toBe(true);
  });
});

describe('Recipe Form Validation', () => {
  it('should accept valid recipe data', () => {
    const result = validateRecipeForm('Pasta', 'Cook pasta...', 'dinner');
    expect(result.valid).toBe(true);
  });

  it('should reject missing title', () => {
    const result = validateRecipeForm('', 'Content here', 'lunch');
    expect(result.valid).toBe(false);
  });

  it('should reject missing content', () => {
    const result = validateRecipeForm('Title', '', 'breakfast');
    expect(result.valid).toBe(false);
  });

  it('should reject missing category', () => {
    const result = validateRecipeForm('Title', 'Content', '');
    expect(result.valid).toBe(false);
  });

  it('should reject all missing fields', () => {
    const result = validateRecipeForm('', '', '');
    expect(result.valid).toBe(false);
  });
});