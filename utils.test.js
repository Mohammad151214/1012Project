import { describe, it, expect } from "vitest";
import { add, subtract, multiply, divide, isEven, isValidEmail, capitalize } from "./utils.js";

describe('test of add function', () => {
  it('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  })
  
  it('should handle negative numbers', () => {
    expect(add(-1, 5)).toBe(4);
  })
})

describe('test of subtract function', () => {
  it('should subtract two numbers correctly', () => {
    expect(subtract(5, 3)).toBe(2);
  })
  
  it('should handle negative results', () => {
    expect(subtract(3, 5)).toBe(-2);
  })
})

describe('test of multiply function', () => {
  it('should multiply two numbers correctly', () => {
    expect(multiply(4, 3)).toBe(12);
  })
  
  it('should handle zero', () => {
    expect(multiply(5, 0)).toBe(0);
  })
})

describe('test of divide function', () => {
  it('should divide two numbers correctly', () => {
    expect(divide(10, 2)).toBe(5);
  })
  
  it('should throw error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
  })
})

describe('test of isEven function', () => {
  it('should return true for even numbers', () => {
    expect(isEven(4)).toBe(true);
    expect(isEven(0)).toBe(true);
  })
  
  it('should return false for odd numbers', () => {
    expect(isEven(3)).toBe(false);
    expect(isEven(7)).toBe(false);
  })
})

describe('test of isValidEmail function', () => {
  it('should return true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user@domain.co.uk')).toBe(true);
  })
  
  it('should return false for invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('missing@dot')).toBe(false);
    expect(isValidEmail('nodomain.com')).toBe(false);
  })
})

describe('test of capitalize function', () => {
  it('should capitalize first letter and lowercase rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
  })
  
  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('');
  })
})

