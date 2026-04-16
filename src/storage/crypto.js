/**
 * crypto.js — AES-GCM 256 encryption layer
 * Uses Web Crypto API (built-in, no dependencies)
 * OWASP 2023: PBKDF2/SHA-256 with 250 000 iterations
 */

const PBKDF2_ITERATIONS = 250_000;
const SALT_LENGTH = 16;   // bytes
const IV_LENGTH = 12;     // bytes (96-bit, optimal for AES-GCM)
const KEY_LENGTH = 256;   // bits

/**
 * Derive an AES-GCM key from a password using PBKDF2.
 * The returned key is non-extractable (cannot be exported from memory).
 */
export async function deriveKey(password, salt) {
  if (!crypto.subtle) {
    throw new Error('SECURE_CONTEXT_REQUIRED');
  }

  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false, // non-extractable
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt instanceof Uint8Array ? salt : new Uint8Array(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false, // non-extractable — never leaves memory
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a cryptographically random salt (16 bytes).
 * One salt per user, stored in the `auth` table.
 */
export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Encrypt arbitrary data with AES-GCM.
 * A fresh IV is generated on every call.
 *
 * @param {any} data — will be JSON-serialized before encryption
 * @param {CryptoKey} key
 * @returns {{ iv: number[], ciphertext: number[] }}
 */
export async function encrypt(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  return {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
  };
}

/**
 * Decrypt data previously encrypted with `encrypt()`.
 * Throws if the key is wrong or data is corrupted.
 *
 * @param {{ iv: number[], ciphertext: number[] }} encryptedData
 * @param {CryptoKey} key
 * @returns {any} — deserialized JSON
 */
export async function decrypt(encryptedData, key) {
  const iv = new Uint8Array(encryptedData.iv);
  const ciphertext = new Uint8Array(encryptedData.ciphertext);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plaintext));
}

/**
 * Validate password strength.
 * Rules: min 10 chars, at least one letter, one digit, one special character.
 */
export function validatePasswordStrength(password) {
  if (!password || password.length < 10) {
    return 'Hasło musi mieć co najmniej 10 znaków.';
  }
  if (!/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(password)) {
    return 'Hasło musi zawierać co najmniej jedną literę.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Hasło musi zawierać co najmniej jedną cyfrę.';
  }
  if (!/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9]/.test(password)) {
    return 'Hasło musi zawierać co najmniej jeden znak specjalny (np. !, @, #, $).';
  }
  return null; // null = valid
}
