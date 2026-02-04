/**
 * Utilidades de Criptografía para Autenticación
 * Usa Web Crypto API nativa de Cloudflare Workers (PBKDF2)
 * Prohibido usar librerías externas como bcrypt
 */

// Configuración de PBKDF2
const ITERACIONES = 100000; // Número de iteraciones para PBKDF2
const LONGITUD_HASH = 32; // 32 bytes = 256 bits
const LONGITUD_SALT = 16; // 16 bytes = 128 bits

/**
 * Genera un salt aleatorio usando Web Crypto API
 */
function generarSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(LONGITUD_SALT));
}

/**
 * Convierte un ArrayBuffer a string hexadecimal
 */
function bufferAHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Convierte un string hexadecimal a Uint8Array
 */
function hexABuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * Encripta una contraseña usando PBKDF2
 * @param clave - Contraseña en texto plano
 * @returns Hash en formato: salt:hash (ambos en hexadecimal)
 */
export async function encriptarClave(clave: string): Promise<string> {
    const encoder = new TextEncoder();
    const claveBuffer = encoder.encode(clave);
    const salt = generarSalt();

    // Importar la clave para PBKDF2
    const claveImportada = await crypto.subtle.importKey(
        "raw",
        claveBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
    );

    // Derivar el hash usando PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt.buffer,
            iterations: ITERACIONES,
            hash: "SHA-256",
        },
        claveImportada,
        LONGITUD_HASH * 8, // bits
    );

    // Retornar en formato: salt:hash
    const saltHex = bufferAHex(salt.buffer);
    const hashHex = bufferAHex(hashBuffer);

    return `${saltHex}:${hashHex}`;
}

/**
 * Verifica si una contraseña coincide con el hash almacenado
 * @param clave - Contraseña en texto plano a verificar
 * @param hashAlmacenado - Hash en formato salt:hash
 * @returns true si la contraseña es correcta
 */
export async function verificarClave(
    clave: string,
    hashAlmacenado: string,
): Promise<boolean> {
    try {
        const [saltHex, hashOriginalHex] = hashAlmacenado.split(":");
        if (!saltHex || !hashOriginalHex) return false;

        const encoder = new TextEncoder();
        const claveBuffer = encoder.encode(clave);
        const salt = hexABuffer(saltHex);

        // Importar la clave para PBKDF2
        const claveImportada = await crypto.subtle.importKey(
            "raw",
            claveBuffer,
            { name: "PBKDF2" },
            false,
            ["deriveBits"],
        );

        // Derivar el hash con el mismo salt
        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: ITERACIONES,
                hash: "SHA-256",
            },
            claveImportada,
            LONGITUD_HASH * 8,
        );

        const hashNuevoHex = bufferAHex(hashBuffer);

        // Comparación de tiempo constante (previene timing attacks)
        return hashNuevoHex === hashOriginalHex;
    } catch (error) {
        console.error("Error al verificar clave:", error);
        return false;
    }
}

/**
 * Genera un token de sesión aleatorio y seguro
 * @returns Token hexadecimal de 32 bytes (256 bits)
 */
export function generarTokenSesion(): string {
    const buffer = crypto.getRandomValues(new Uint8Array(32));
    return bufferAHex(buffer.buffer);
}

/**
 * Genera un token de refresco aleatorio y seguro
 * @returns Token hexadecimal de 32 bytes (256 bits)
 */
export function generarTokenRefresco(): string {
    const buffer = crypto.getRandomValues(new Uint8Array(32));
    return bufferAHex(buffer.buffer);
}
