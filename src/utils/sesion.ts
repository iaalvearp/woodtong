/**
 * Utilidades para Gestión de Sesiones
 * Maneja la creación, validación y limpieza de sesiones en D1
 */

import type { D1Database } from "@cloudflare/workers-types";
import { generarTokenSesion, generarTokenRefresco } from "./criptografia";

export interface Sesion {
    id_sesion: number;
    id_usuario: number;
    token_sesion: string;
    token_refresco: string;
    expiracion: string;
    fecha_creacion: string;
}

export interface Usuario {
    id_usuario: number;
    correo: string;
    rol: "cliente" | "admin";
}

/**
 * Crea una nueva sesión en la base de datos
 * @param db - Instancia de D1 Database
 * @param idUsuario - ID del usuario
 * @param diasExpiracion - Días hasta que expire la sesión (por defecto 7)
 * @returns Objeto con tokens de sesión y refresco
 */
export async function crearSesion(
    db: D1Database,
    idUsuario: number,
    diasExpiracion: number = 7,
): Promise<{ tokenSesion: string; tokenRefresco: string }> {
    const tokenSesion = generarTokenSesion();
    const tokenRefresco = generarTokenRefresco();

    // Calcular fecha de expiración
    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + diasExpiracion);

    await db
        .prepare(
            `INSERT INTO Sesiones (id_usuario, token_sesion, token_refresco, expiracion)
       VALUES (?, ?, ?, ?)`,
        )
        .bind(idUsuario, tokenSesion, tokenRefresco, expiracion.toISOString())
        .run();

    return { tokenSesion, tokenRefresco };
}

/**
 * Valida un token de sesión y retorna la información del usuario
 * @param db - Instancia de D1 Database
 * @param tokenSesion - Token de sesión a validar
 * @returns Usuario si la sesión es válida, null si no
 */
export async function validarSesion(
    db: D1Database,
    tokenSesion: string,
): Promise<Usuario | null> {
    const resultado = await db
        .prepare(
            `SELECT 
        s.id_sesion,
        s.expiracion,
        u.id_usuario,
        u.correo,
        u.rol
      FROM Sesiones s
      INNER JOIN Usuarios u ON s.id_usuario = u.id_usuario
      WHERE s.token_sesion = ?`,
        )
        .bind(tokenSesion)
        .first();

    if (!resultado) return null;

    // Verificar si la sesión ha expirado
    const expiracion = new Date(resultado.expiracion as string);
    const ahora = new Date();

    if (ahora > expiracion) {
        // Sesión expirada, eliminarla
        await eliminarSesion(db, resultado.id_sesion as number);
        return null;
    }

    return {
        id_usuario: resultado.id_usuario as number,
        correo: resultado.correo as string,
        rol: resultado.rol as "cliente" | "admin",
    };
}

/**
 * Verifica si una sesión está cerca de expirar y necesita renovación
 * @param db - Instancia de D1 Database
 * @param tokenSesion - Token de sesión a verificar
 * @param horasUmbral - Horas antes de expiración para considerar renovación (por defecto 1)
 * @returns true si necesita renovación
 */
export async function necesitaRenovacion(
    db: D1Database,
    tokenSesion: string,
    horasUmbral: number = 1,
): Promise<boolean> {
    const resultado = await db
        .prepare(`SELECT expiracion FROM Sesiones WHERE token_sesion = ?`)
        .bind(tokenSesion)
        .first();

    if (!resultado) return false;

    const expiracion = new Date(resultado.expiracion as string);
    const ahora = new Date();
    const diferenciaHoras =
        (expiracion.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    return diferenciaHoras < horasUmbral;
}

/**
 * Renueva una sesión existente generando nuevos tokens
 * @param db - Instancia de D1 Database
 * @param tokenSesionAntiguo - Token de sesión actual
 * @param diasExpiracion - Días hasta que expire la nueva sesión
 * @returns Nuevo token de sesión o null si falla
 */
export async function renovarSesion(
    db: D1Database,
    tokenSesionAntiguo: string,
    diasExpiracion: number = 7,
): Promise<string | null> {
    const sesion = await db
        .prepare(`SELECT id_sesion, id_usuario FROM Sesiones WHERE token_sesion = ?`)
        .bind(tokenSesionAntiguo)
        .first();

    if (!sesion) return null;

    const nuevoTokenSesion = generarTokenSesion();
    const nuevoTokenRefresco = generarTokenRefresco();

    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + diasExpiracion);

    await db
        .prepare(
            `UPDATE Sesiones 
       SET token_sesion = ?, token_refresco = ?, expiracion = ?
       WHERE id_sesion = ?`,
        )
        .bind(
            nuevoTokenSesion,
            nuevoTokenRefresco,
            expiracion.toISOString(),
            sesion.id_sesion,
        )
        .run();

    return nuevoTokenSesion;
}

/**
 * Elimina una sesión de la base de datos
 * @param db - Instancia de D1 Database
 * @param idSesion - ID de la sesión a eliminar
 */
export async function eliminarSesion(
    db: D1Database,
    idSesion: number,
): Promise<void> {
    await db
        .prepare(`DELETE FROM Sesiones WHERE id_sesion = ?`)
        .bind(idSesion)
        .run();
}

/**
 * Elimina una sesión por su token
 * @param db - Instancia de D1 Database
 * @param tokenSesion - Token de la sesión a eliminar
 */
export async function eliminarSesionPorToken(
    db: D1Database,
    tokenSesion: string,
): Promise<void> {
    await db
        .prepare(`DELETE FROM Sesiones WHERE token_sesion = ?`)
        .bind(tokenSesion)
        .run();
}

/**
 * Limpia todas las sesiones expiradas de la base de datos
 * @param db - Instancia de D1 Database
 * @returns Número de sesiones eliminadas
 */
export async function limpiarSesionesExpiradas(
    db: D1Database,
): Promise<number> {
    const ahora = new Date().toISOString();
    const resultado = await db
        .prepare(`DELETE FROM Sesiones WHERE expiracion < ?`)
        .bind(ahora)
        .run();

    return resultado.meta.changes;
}
