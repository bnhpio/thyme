'use node';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
} from 'node:crypto';
import { promisify } from 'node:util';
import type { Address } from 'viem';

const scryptAsync = promisify(scrypt);

export async function encryptPrivateKey(
  privateKey: string,
  masterKey: string,
): Promise<string> {
  try {
    // Generate a random salt
    const salt = randomBytes(16);

    // Derive key from master key using scrypt
    const key = (await scryptAsync(masterKey, salt, 32)) as Buffer;

    // Generate random IV
    const iv = randomBytes(16);

    // Create cipher
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    // Encrypt the private key
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine salt + iv + encrypted data
    const combined =
      salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;

    return combined;
  } catch (error) {
    throw new Error(
      `Failed to encrypt private key: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function decryptPrivateKey(
  encryptedPrivateKey: string,
  masterKey: string,
): Promise<Address> {
  try {
    // Split the combined data
    const parts = encryptedPrivateKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted private key format');
    }

    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    // Derive key from master key using scrypt
    const key = (await scryptAsync(masterKey, salt, 32)) as Buffer;

    // Create decipher
    const decipher = createDecipheriv('aes-256-cbc', key, iv);

    // Decrypt the private key
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted as Address;
  } catch (error) {
    throw new Error(
      `Failed to decrypt private key: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
