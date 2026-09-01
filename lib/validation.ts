/**
 * Form Validation Utilities for NIDANA CTMS
 */

/**
 * Validates person names (e.g., Principal Investigator, Patient Name, Witness Name).
 * Rejects numbers, special symbols, and empty input.
 */
export function validatePersonName(name: string, fieldName = "Name"): string | null {
  if (!name || !name.trim()) {
    return `${fieldName} is required.`;
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return `${fieldName} must be at least 2 characters long.`;
  }
  if (/\d/.test(trimmed)) {
    return `${fieldName} cannot contain numbers. Please enter a valid name.`;
  }
  // Allow Unicode letters (English + Hindi/Devanagari), spaces, dots, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\.\-\'\,\–\u0900-\u097F]+$/;
  if (!nameRegex.test(trimmed)) {
    return `${fieldName} contains invalid characters. Only letters, spaces, and standard punctuation (dots, hyphens) are allowed.`;
  }
  return null;
}

/**
 * Validates title / text fields (e.g., Trial Title, Formulation Name, Event Description).
 * Prevents purely numeric inputs and enforces minimum length.
 */
export function validateText(text: string, fieldName = "Field", minLength = 3): string | null {
  if (!text || !text.trim()) {
    return `${fieldName} is required.`;
  }
  const trimmed = text.trim();
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long.`;
  }
  if (/^\d+$/.test(trimmed)) {
    return `${fieldName} cannot consist of only numbers. Please enter a descriptive text.`;
  }
  return null;
}

/**
 * Validates reference IDs and codes (e.g., Trial ID, Subject ID, CTRI Registration, IEC Number).
 */
export function validateIdCode(id: string, fieldName = "ID"): string | null {
  if (!id || !id.trim()) {
    return `${fieldName} is required.`;
  }
  const trimmed = id.trim();
  if (trimmed.length < 2) {
    return `${fieldName} must be at least 2 characters.`;
  }
  if (/^\d+$/.test(trimmed)) {
    return `${fieldName} should include a letter or prefix (e.g., T-1004, SUB-001) rather than just digits.`;
  }
  if (!/^[a-zA-Z0-9\/\-\_\.\s]+$/.test(trimmed)) {
    return `${fieldName} contains invalid characters. Use alphanumeric characters, hyphens, and slashes.`;
  }
  return null;
}

/**
 * Validates positive numeric fields (e.g., Enrollment Target, Threshold Days).
 */
export function validatePositiveNumber(num: number | string, fieldName = "Value"): string | null {
  const val = Number(num);
  if (isNaN(val) || val <= 0) {
    return `${fieldName} must be a positive number greater than zero.`;
  }
  if (!Number.isInteger(val)) {
    return `${fieldName} must be a whole integer.`;
  }
  return null;
}
