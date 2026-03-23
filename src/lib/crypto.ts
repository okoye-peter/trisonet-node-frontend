const ALGORITHM = 'AES-CBC';
const SECRET_KEY_TEXT = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'trisonet_paga_obfuscation_key_32';

/**
 * Decrypts text encrypted with AES-256-CBC (iv:encryptedHex format)
 */
export async function decrypt(encryptedData: string): Promise<string> {
    try {
        const [ivHex, dataHex] = encryptedData.split(':');
        if (!ivHex || !dataHex) throw new Error('Invalid encrypted data format');

        // Convert hex strings to Uint8Array
        const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const encryptedBuffer = new Uint8Array(dataHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

        // Prepare the key (must be 32 bytes for AES-256)
        const keyBuffer = new TextEncoder().encode(SECRET_KEY_TEXT.padEnd(32, '0')).slice(0, 32);
        
        const key = await window.crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: ALGORITHM, length: 256 },
            false,
            ['decrypt']
        );

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            encryptedBuffer
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Could not decrypt secure key');
    }
}
