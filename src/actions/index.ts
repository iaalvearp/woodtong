import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { encriptarClave, verificarClave } from "../utils/criptografia";
import { crearSesion, eliminarSesionPorToken } from "../utils/sesion";

export const server = {
    // Acción para captar prospectos desde el Modal
    registrarProspecto: defineAction({
        input: z.object({
            nombreCompleto: z.string().min(2, "El nombre es muy corto"),
            correoElectronico: z.string().email("Correo no válido"),
            telefonoMovil: z.string().optional(),
        }),
        handler: async (datos, contexto) => {
            const db = contexto.locals.runtime.env.DB;

            // Insertar en Cloudflare D1
            await db
                .prepare(
                    "INSERT INTO Prospectos (nombre_completo, correo, telefono) VALUES (?, ?, ?)",
                )
                .bind(
                    datos.nombreCompleto,
                    datos.correoElectronico,
                    datos.telefonoMovil || null,
                )
                .run();

            return { exito: true, mensaje: "Cupón enviado correctamente" };
        },
    }),

    // Acción para iniciar sesión
    iniciarSesion: defineAction({
        input: z.object({
            correo: z.string().email("Correo no válido"),
            clave: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        }),
        handler: async (datos, contexto) => {
            const db = contexto.locals.runtime.env.DB;

            // Buscar usuario en la base de datos
            const usuario = await db
                .prepare("SELECT * FROM Usuarios WHERE correo = ?")
                .bind(datos.correo)
                .first();

            if (!usuario) {
                throw new Error("Credenciales inválidas");
            }

            // Verificar la contraseña
            const claveValida = await verificarClave(
                datos.clave,
                usuario.clave_encriptada as string,
            );

            if (!claveValida) {
                throw new Error("Credenciales inválidas");
            }

            // Crear sesión en la base de datos
            const diasExpiracion = parseInt(
                contexto.locals.runtime.env.SESSION_EXPIRATION_DAYS || "7",
            );
            const { tokenSesion } = await crearSesion(
                db,
                usuario.id_usuario as number,
                diasExpiracion,
            );

            // Establecer cookie segura
            contexto.cookies.set("session_token", tokenSesion, {
                httpOnly: true, // No accesible desde JavaScript
                secure: import.meta.env.PROD, // Solo HTTPS en producción
                sameSite: "strict", // Protección CSRF
                maxAge: diasExpiracion * 24 * 60 * 60, // Convertir días a segundos
                path: "/",
            });

            return {
                exito: true,
                usuario: {
                    correo: usuario.correo as string,
                    rol: usuario.rol as string,
                },
            };
        },
    }),

    // Acción para cerrar sesión
    cerrarSesion: defineAction({
        input: z.object({}),
        handler: async (_datos, contexto) => {
            const tokenSesion = contexto.cookies.get("session_token")?.value;

            if (tokenSesion) {
                const db = contexto.locals.runtime.env.DB;
                // Eliminar sesión de la base de datos
                await eliminarSesionPorToken(db, tokenSesion);
            }

            // Limpiar cookie
            contexto.cookies.delete("session_token", {
                path: "/",
            });

            return { exito: true };
        },
    }),

    // Acción para registrar un nuevo usuario (solo admin puede crear usuarios)
    registrarUsuario: defineAction({
        input: z.object({
            correo: z.string().email("Correo no válido"),
            clave: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
            rol: z.enum(["cliente", "admin"]).default("cliente"),
        }),
        handler: async (datos, contexto) => {
            const db = contexto.locals.runtime.env.DB;
            const usuario = contexto.locals.usuario;

            // Solo admin puede crear usuarios
            if (!usuario || usuario.rol !== "admin") {
                throw new Error("No tienes permisos para crear usuarios");
            }

            // Verificar si el correo ya existe
            const usuarioExistente = await db
                .prepare("SELECT id_usuario FROM Usuarios WHERE correo = ?")
                .bind(datos.correo)
                .first();

            if (usuarioExistente) {
                throw new Error("El correo ya está registrado");
            }

            // Encriptar contraseña
            const claveEncriptada = await encriptarClave(datos.clave);

            // Insertar usuario
            await db
                .prepare(
                    "INSERT INTO Usuarios (correo, clave_encriptada, rol) VALUES (?, ?, ?)",
                )
                .bind(datos.correo, claveEncriptada, datos.rol)
                .run();

            return { exito: true, mensaje: "Usuario creado correctamente" };
        },
    }),

    // Acción para el Panel de Admin (Edición Inline)
    actualizarInventario: defineAction({
        input: z.object({
            idMueble: z.number(),
            nuevoPrecio: z.number().optional(),
            nuevoNombre: z.string().optional(),
            nuevaCategoria: z.string().optional(),
        }),
        handler: async (datos, contexto) => {
            const db = contexto.locals.runtime.env.DB;
            const usuario = contexto.locals.usuario;

            // Validación de rol: Solo admin puede actualizar inventario
            if (!usuario || usuario.rol !== "admin") {
                throw new Error("No tienes permisos para actualizar el inventario");
            }

            let query = "UPDATE Muebles SET ";
            const sets = [];
            const values = [];

            if (datos.nuevoNombre) {
                sets.push("nombre = ?");
                values.push(datos.nuevoNombre);
            }
            if (datos.nuevoPrecio !== undefined) {
                sets.push("precio = ?");
                values.push(datos.nuevoPrecio);
            }
            if (datos.nuevaCategoria) {
                sets.push("categoria = ?");
                values.push(datos.nuevaCategoria);
            }

            if (sets.length === 0)
                return {
                    actualizado: false,
                    mensaje: "No hay cambios para actualizar",
                };

            query += sets.join(", ") + " WHERE id_mueble = ?";
            values.push(datos.idMueble);

            await db.prepare(query).bind(...values).run();

            return { actualizado: true, mensaje: "Inventario actualizado" };
        },
    }),
};
