/**
 * Middleware de Autenticación - El Portero
 * Intercepta todas las peticiones para validar sesiones y proteger rutas
 */

import { defineMiddleware } from "astro:middleware";
import { validarSesion, necesitaRenovacion, renovarSesion } from "./utils/sesion";

export const onRequest = defineMiddleware(async (context, next) => {
    const db = context.locals.runtime?.env?.DB;

    // Extraer token de sesión de las cookies
    const tokenSesion = context.cookies.get("session_token")?.value;

    // Si no hay token, el usuario es anónimo
    if (!tokenSesion) {
        context.locals.usuario = undefined;

        // Verificar si intenta acceder a rutas protegidas
        if (context.url.pathname.startsWith("/admin")) {
            // Silent Redirect - Redirigir sin explicaciones (estilo Apple)
            return context.redirect("/", 302);
        }

        return next();
    }

    // Validar la sesión en la base de datos
    let usuario = null;
    try {
        usuario = await validarSesion(db, tokenSesion);
    } catch (error) {
        console.warn("Session validation failed:", error);
        // Continuar sin sesión si la BD no está disponible
    }

    if (!usuario) {
        // Sesión inválida o expirada, limpiar cookie
        context.cookies.delete("session_token", {
            path: "/",
        });
        context.locals.usuario = undefined;

        // Silent Redirect si intenta acceder a admin
        if (context.url.pathname.startsWith("/admin")) {
            return context.redirect("/", 302);
        }

        return next();
    }

    // Inyectar usuario en locals para acceso en páginas
    context.locals.usuario = usuario;

    // Freshness Check: Verificar si la sesión necesita renovación
    if (db) {
        try {
            const refreshThreshold = context.locals.runtime?.env?.REFRESH_THRESHOLD_HOURS;
            const debeRenovar = await necesitaRenovacion(
                db,
                tokenSesion,
                parseInt(typeof refreshThreshold === 'string' ? refreshThreshold : "1"),
            );

            if (debeRenovar) {
                const sessionDays = context.locals.runtime?.env?.SESSION_EXPIRATION_DAYS;
                const diasExpiracion = parseInt(
                    typeof sessionDays === 'string' ? sessionDays : "7",
                );
                const nuevoToken = await renovarSesion(db, tokenSesion, diasExpiracion);

                if (nuevoToken) {
                    // Actualizar cookie con nuevo token
                    context.cookies.set("session_token", nuevoToken, {
                        httpOnly: true,
                        secure: import.meta.env.PROD, // Solo HTTPS en producción
                        sameSite: "strict",
                        maxAge: diasExpiracion * 24 * 60 * 60, // Convertir días a segundos
                        path: "/",
                    });
                }
            }
        } catch (error) {
            console.warn("Session refresh failed:", error);
            // Continuar sin renovar si hay error
        }
    }

    // Protección de rutas /admin/*
    if (context.url.pathname.startsWith("/admin")) {
        if (usuario.rol !== "admin") {
            // Silent Redirect - Usuario no tiene permisos de admin
            return context.redirect("/", 302);
        }
    }

    return next();
});
