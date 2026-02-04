#!/usr/bin/env bun
/**
 * Script para crear un usuario administrador
 * Uso: bun run scripts/crear-admin.ts <correo> <contraseña>
 */

import { encriptarClave } from "../src/utils/criptografia";

const args = process.argv.slice(2);

if (args.length < 2) {
    console.error("❌ Uso: bun run scripts/crear-admin.ts <correo> <contraseña>");
    process.exit(1);
}

const [correo, clave] = args;

async function crearAdmin() {
    try {
        console.log("🔐 Encriptando contraseña...");
        const claveEncriptada = await encriptarClave(clave);

        console.log("\n✅ Hash generado exitosamente!");
        console.log("\n📋 Ejecuta el siguiente comando SQL en tu base de datos D1:\n");
        console.log("--- Para D1 Local ---");
        console.log(
            `bun wrangler d1 execute woodtong --local --command="INSERT INTO Usuarios (correo, clave_encriptada, rol) VALUES ('${correo}', '${claveEncriptada}', 'admin');"`,
        );
        console.log("\n--- Para D1 Remoto ---");
        console.log(
            `bun wrangler d1 execute woodtong --command="INSERT INTO Usuarios (correo, clave_encriptada, rol) VALUES ('${correo}', '${claveEncriptada}', 'admin');"`,
        );
        console.log("\n");
    } catch (error) {
        console.error("❌ Error al crear admin:", error);
        process.exit(1);
    }
}

crearAdmin();
