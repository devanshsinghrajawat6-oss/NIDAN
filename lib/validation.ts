/**
 * Form Validation & Regulatory Calculation Utilities for NIDANA CTMS
 * Aligned with CDSCO GCP Inspection Checklist & Schedule Y / NDCTR Compensation Guidelines
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
  return null;
}

/**
 * Validates Subject Age (0 to 120 years).
 */
export function validateAge(age: number | string): string | null {
  if (age === undefined || age === null || age === "") return null; // optional if age derived from DOB
  const val = Number(age);
  if (isNaN(val) || val < 0 || val > 120) {
    return "Age must be a valid number between 0 and 120 years.";
  }
  return null;
}

/**
 * Validates 10-digit Indian phone number or international contact string.
 */
export function validateContactNumber(phone: string): string | null {
  if (!phone || !phone.trim()) return null; // optional
  const trimmed = phone.trim();
  if (!/^[+0-9\s\-]{10,15}$/.test(trimmed)) {
    return "Contact Number must be a valid 10-digit phone number (e.g. +91 98765 43210 or 9876543210).";
  }
  return null;
}

/**
 * Validates ABHA ID (Ayushman Bharat Digital Health ID - 14 digits or XX-XXXX-XXXX-XXXX format).
 */
export function validateAbhaId(abha: string): string | null {
  if (!abha || !abha.trim()) return null; // optional
  const trimmed = abha.trim();
  const pattern = /^(\d{14}|\d{2}-\d{4}-\d{4}-\d{4})$/;
  if (!pattern.test(trimmed)) {
    return "ABHA ID must be 14 digits (e.g. 12-3456-7890-1234 or 12345678901234).";
  }
  return null;
}

/**
 * Validates baseline vitals parameters.
 */
export function validateVitals(vitals: {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulseRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}): string | null {
  if (!vitals) return null;

  if (vitals.bloodPressureSystolic !== undefined && vitals.bloodPressureSystolic !== null) {
    if (vitals.bloodPressureSystolic < 50 || vitals.bloodPressureSystolic > 250) {
      return "Systolic Blood Pressure must be between 50 and 250 mmHg.";
    }
  }
  if (vitals.bloodPressureDiastolic !== undefined && vitals.bloodPressureDiastolic !== null) {
    if (vitals.bloodPressureDiastolic < 30 || vitals.bloodPressureDiastolic > 150) {
      return "Diastolic Blood Pressure must be between 30 and 150 mmHg.";
    }
  }
  if (vitals.pulseRate !== undefined && vitals.pulseRate !== null) {
    if (vitals.pulseRate < 30 || vitals.pulseRate > 220) {
      return "Pulse Rate must be between 30 and 220 bpm.";
    }
  }
  if (vitals.temperature !== undefined && vitals.temperature !== null) {
    if (vitals.temperature < 90 || vitals.temperature > 110) {
      return "Body Temperature must be between 90°F and 110°F.";
    }
  }
  if (vitals.weight !== undefined && vitals.weight !== null) {
    if (vitals.weight < 1 || vitals.weight > 300) {
      return "Weight must be between 1 and 300 kg.";
    }
  }
  if (vitals.height !== undefined && vitals.height !== null) {
    if (vitals.height < 30 || vitals.height > 250) {
      return "Height must be between 30 and 250 cm.";
    }
  }
  return null;
}

/**
 * CDSCO Workmen Compensation Act Age Factors (Annexure 1)
 */
export const WORKMEN_COMPENSATION_AGE_FACTORS: Record<number, number> = {
  16: 228.54, 17: 227.49, 18: 226.38, 19: 225.22, 20: 224.00,
  21: 222.71, 22: 221.37, 23: 219.95, 24: 218.47, 25: 216.91,
  26: 215.28, 27: 213.57, 28: 211.79, 29: 209.92, 30: 207.98,
  31: 205.95, 32: 203.85, 33: 201.66, 34: 199.40, 35: 197.06,
  36: 194.64, 37: 192.14, 38: 189.56, 39: 186.90, 40: 184.17,
  41: 181.37, 42: 178.49, 43: 175.54, 44: 172.52, 45: 169.44,
  46: 166.29, 47: 163.07, 48: 159.80, 49: 156.47, 50: 153.09,
  51: 149.67, 52: 146.20, 53: 142.68, 54: 139.13, 55: 135.56,
  56: 131.95, 57: 128.33, 58: 124.70, 59: 121.05, 60: 117.41,
  61: 113.77, 62: 110.14, 63: 106.52, 64: 102.93, 65: 99.37
};

/**
 * Gets Workmen Compensation Age Factor for given age.
 */
export function getAgeFactor(age: number): number {
  if (age <= 16) return 228.54;
  if (age >= 65) return 99.37;
  const roundedAge = Math.floor(age);
  return WORKMEN_COMPENSATION_AGE_FACTORS[roundedAge] || 99.37;
}

/**
 * Calculates Statutory Compensation for Clinical Trial SAE / Death per CDSCO Formula:
 * Compensation = (B * F * R) / 99.37
 * Where B = 800,000 INR (Base Amount)
 * F = Factor based on age (Workmen Compensation Act)
 * R = Risk Factor (0.50, 1.0, 2.0, 3.0, 4.0)
 * Exception: If expected mortality is 90% or more within 30 days, fixed compensation = ₹2,000,000 (2 Lacs).
 */
export function calculateStatutoryCompensation(
  age: number,
  riskFactor: number = 4.0,
  is30DayMortalityHigh: boolean = false
): { compensation: number; factorF: number; baseAmount: number; riskFactor: number; formulaString: string } {
  const baseAmount = 800000; // Rs 8 Lacs

  if (is30DayMortalityHigh) {
    return {
      compensation: 200000,
      factorF: getAgeFactor(age),
      baseAmount,
      riskFactor,
      formulaString: "Fixed Compensation for expected mortality >= 90% in 30 days: ₹2,00,000"
    };
  }

  const F = getAgeFactor(age);
  const R = [0.5, 1.0, 2.0, 3.0, 4.0].includes(riskFactor) ? riskFactor : 4.0;
  const comp = Math.round((baseAmount * F * R) / 99.37);

  return {
    compensation: comp,
    factorF: F,
    baseAmount,
    riskFactor: R,
    formulaString: `(₹${baseAmount.toLocaleString('en-IN')} × ${F} × ${R}) / 99.37 = ₹${comp.toLocaleString('en-IN')}`
  };
}

