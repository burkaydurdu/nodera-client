export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordRule = "length" | "letter" | "digit" | "symbol";

export const PASSWORD_RULES: PasswordRule[] = ["length", "letter", "digit", "symbol"];

export type PasswordCheck = Record<PasswordRule, boolean>;

/** Mirrors the backend rule: 8–128 chars, at least one letter, one digit and one symbol. */
export function checkPassword(password: string): PasswordCheck {
  return {
    length: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
    letter: /\p{L}/u.test(password),
    digit: /\d/.test(password),
    symbol: /[^\p{L}\d\s]/u.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  return Object.values(checkPassword(password)).every(Boolean);
}
