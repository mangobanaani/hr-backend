export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export class PasswordValidator {
  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];

    const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10);
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (
      process.env.PASSWORD_REQUIRE_UPPERCASE === 'true' &&
      !/[A-Z]/.test(password)
    ) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (
      process.env.PASSWORD_REQUIRE_LOWERCASE === 'true' &&
      !/[a-z]/.test(password)
    ) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (
      process.env.PASSWORD_REQUIRE_NUMBER === 'true' &&
      !/\d/.test(password)
    ) {
      errors.push('Password must contain at least one number');
    }

    if (
      process.env.PASSWORD_REQUIRE_SPECIAL === 'true' &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
