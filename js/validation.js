// js/validation.js
// Validation functions extracted from your existing code

/**
 * Validates password strength (from register.js)
 * Password must be 8-15 characters
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8 || password.length > 15) {
    return { valid: false, message: 'Password must be between 8-15 characters long' };
  }
  
  return { valid: true, message: 'Password is valid' };
}

/**
 * Validates email format (from register.js and profile.js)
 * Must contain @ and .
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!email.includes("@") || !email.includes(".")) {
    return { valid: false, message: 'Please enter a valid email' };
  }
  
  return { valid: true, message: 'Email is valid' };
}

/**
 * Validates recipe form data (from recipe.js)
 * All fields are required
 */
export function validateRecipeForm(title, content, category) {
  if (!title || !content) {
    return { valid: false, message: 'Please fill in all fields' };
  }
  
  if (!category || category === '') {
    return { valid: false, message: 'Please select a category' };
  }
  
  return { valid: true, message: 'Recipe data is valid' };
}