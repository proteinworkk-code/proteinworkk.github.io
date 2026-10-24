/**
 * Verified trainer profiles. EMPTY ON PURPOSE.
 *
 * The homepage "Meet your coaches" section renders only entries with `verified: true`.
 * Add real people only: name, role, photo, certifications with issuing bodies, years of experience
 * and a short bio in their own words. Never invent or "sample" a profile.
 * Put photos in public/images/trainers/ and reference them as "/images/trainers/name.jpg".
 */
export interface Trainer {
  name: string;
  role: string;
  photo?: string;
  photoAlt?: string;
  credentials: string[];
  experience: string;
  approach: string;
  verified: boolean;
}

export const trainers: Trainer[] = [];
