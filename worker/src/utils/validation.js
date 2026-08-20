// worker/src/utils/validation.js
// Server-side validation — NEVER trust frontend input

const ALLOWED_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * Validates a full name string.
 */
export function validateFullName(name) {
  if (!name || typeof name !== 'string') {
    return 'Full name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
  if (trimmed.length > 100) return 'Full name must not exceed 100 characters.';
  // Only allow letters, spaces, dots, hyphens
  if (!/^[A-Za-z\s.\-']+$/.test(trimmed)) {
    return 'Full name contains invalid characters.';
  }
  return null;
}

/**
 * Validates age — must be integer 1–120.
 */
export function validateAge(age) {
  const num = Number(age);
  if (!age && age !== 0) return 'Age is required.';
  if (!Number.isInteger(num)) return 'Age must be a whole number.';
  if (num < 1 || num > 120) return 'Age must be between 1 and 120.';
  return null;
}

/**
 * Validates Indian mobile number — exactly 10 digits.
 */
export function validateMobileNumber(mobile) {
  if (!mobile || typeof mobile !== 'string') return 'Mobile number is required.';
  const trimmed = mobile.trim();
  if (!/^[6-9]\d{9}$/.test(trimmed)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  return null;
}

/**
 * Validates blood group against allowed values.
 */
export function validateBloodGroup(bg) {
  if (!bg) return 'Blood group is required.';
  if (!ALLOWED_BLOOD_GROUPS.includes(bg)) {
    return `Blood group must be one of: ${ALLOWED_BLOOD_GROUPS.join(', ')}.`;
  }
  return null;
}

/**
 * Validates city name.
 */
export function validateCity(city) {
  if (!city || typeof city !== 'string') return 'City is required.';
  const trimmed = city.trim();
  if (trimmed.length < 2) return 'City must be at least 2 characters.';
  if (trimmed.length > 100) return 'City name is too long.';
  if (!/^[A-Za-z\s.\-']+$/.test(trimmed)) {
    return 'City contains invalid characters.';
  }
  return null;
}

/**
 * Validates uploaded image file.
 * Returns null on success, error message on failure.
 */
export function validateImageFile(file) {
  if (!file) return 'Profile photo is required.';
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Photo must be JPG, JPEG, PNG, or WEBP.';
  }
  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    return 'Photo must not exceed 5 MB.';
  }
  return null;
}

/**
 * Runs all validations on the registration payload.
 * Returns an object of { field: errorMessage } or null if all valid.
 */
export function validateRegistration(data, file) {
  const errors = {};

  const nameErr = validateFullName(data.fullName);
  if (nameErr) errors.fullName = nameErr;

  const ageErr = validateAge(data.age);
  if (ageErr) errors.age = ageErr;

  const mobileErr = validateMobileNumber(data.mobileNumber);
  if (mobileErr) errors.mobileNumber = mobileErr;

  const bgErr = validateBloodGroup(data.bloodGroup);
  if (bgErr) errors.bloodGroup = bgErr;

  const cityErr = validateCity(data.city);
  if (cityErr) errors.city = cityErr;

  const photoErr = validateImageFile(file);
  if (photoErr) errors.photo = photoErr;

  return Object.keys(errors).length > 0 ? errors : null;
}
