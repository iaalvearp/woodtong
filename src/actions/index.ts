import { defineAction } from "astro:actions";
import { z } from "astro:schema";

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
            await db.prepare(
                "INSERT INTO Prospectos (nombre_completo, correo, telefono) VALUES (?, ?, ?)"
            )
                .bind(datos.nombreCompleto, datos.correoElectronico, datos.telefonoMovil || null)
                .run();

            return { exito: true, mensaje: "Cupón enviado correctamente" };
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

            if (sets.length === 0) return { actualizado: false, mensaje: "No hay cambios para actualizar" };

            query += sets.join(", ") + " WHERE id_mueble = ?";
            values.push(datos.idMueble);

            await db.prepare(query).bind(...values).run();

            return { actualizado: true, mensaje: "Inventario actualizado" };
        }
    })
};
