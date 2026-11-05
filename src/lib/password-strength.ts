export type PasswordStrengthLevel = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordVerdict {
  /** 0–4, the index into the five levels. */
  score: number;
  strength: PasswordStrengthLevel;
  /** One line under the meter — why it scored this way. */
  message?: string;
}

const LEVELS: PasswordStrengthLevel[] = ['very-weak', 'weak', 'fair', 'good', 'strong'];

/** Exact matches only, compared case-insensitively. */
const COMMON = ['123456', 'password', 'qwerty', 'admin', 'welcome', '123123', 'abc123', 'letmein', 'asdfgh', 'zxcvbn', '12345', '09876'];

export const MIN_PASSWORD_LENGTH = 8;

/**
 * VCP's password score, 0–4: length (8–11 → +1, 12+ → +2), plus one point for each character kind beyond the first
 * (lower, upper, number, special), minus 2 for a common password, clamped to 0–4. It is advice for a meter, never a gate:
 * the only rules a password has to meet are `MIN_PASSWORD_LENGTH` and matching its confirmation.
 */
export function scorePassword(password: string): PasswordVerdict {
  const length = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((kind) => kind.test(password)).length;
  const common = COMMON.includes(password.toLowerCase());
  const score = Math.max(0, Math.min(4, length + Math.max(0, kinds - 1) - (common ? 2 : 0)));
  const message = common
    ? 'Your password contains common patterns'
    : score < 2
      ? 'Your password is too simple'
      : undefined;
  return { score, strength: LEVELS[score], message };
}
