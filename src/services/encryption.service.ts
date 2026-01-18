import crypto from 'crypto';
import { config } from '../config';

export class EncryptionService {
    private algorithm = 'aes-256-gcm';
    private key: Buffer;

    constructor() {
        // In production, this should be from environment variable
        const secret = config.jwt.secret || 'fallback-encryption-key';
        this.key = crypto.scryptSync(secret, 'salt', 32);
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = (cipher as crypto.CipherGCM).getAuthTag();

        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    decrypt(encryptedData: string): string {
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        (decipher as crypto.DecipherGCM).setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    hash(text: string): string {
        return crypto.createHash('sha256').update(text).digest('hex');
    }
}

export default new EncryptionService();
