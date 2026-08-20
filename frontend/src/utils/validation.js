// frontend/src/utils/validation.js
// Zod validation schemas for the registration form

import { z } from 'zod';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required.')
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name must not exceed 100 characters.')
    .trim()
    .regex(/^[A-Za-z\s.\-']+$/, 'Full name can only contain letters, spaces, dots, and hyphens.'),

  age: z
    .string()
    .min(1, 'Age is required.')
    .refine((val) => !isNaN(Number(val)) && Number.isInteger(Number(val)), 'Age must be a whole number.')
    .refine((val) => Number(val) >= 1 && Number(val) <= 120, 'Age must be between 1 and 120.'),

  mobileNumber: z
    .string()
    .min(1, 'Mobile number is required.')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number (starts with 6-9).'),

  bloodGroup: z
    .string()
    .min(1, 'Blood group is required.')
    .refine((val) => BLOOD_GROUPS.includes(val), 'Please select a valid blood group.'),

  city: z
    .string()
    .min(1, 'City is required.')
    .min(2, 'City must be at least 2 characters.')
    .max(100, 'City name is too long.')
    .trim()
    .regex(/^[A-Za-z\s.\-']+$/, 'City name can only contain letters, spaces, and hyphens.'),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

/**
 * Validates a photo file on the frontend before upload.
 */
export function validatePhotoFile(file) {
  if (!file) return 'Profile photo is required.';
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) return 'Photo must be JPG, JPEG, PNG, or WEBP.';
  if (file.size > 5 * 1024 * 1024) return 'Photo must not exceed 5 MB.';
  return null;
}
