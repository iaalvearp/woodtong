/// &lt;reference path="../.astro/types.d.ts" /&gt;
/// &lt;reference types="astro/client" /&gt;
/// &lt;reference types="@cloudflare/workers-types" /&gt;

type D1Database = import("@cloudflare/workers-types").D1Database;

type Runtime = import("@astrojs/cloudflare").Runtime<{
    DB: D1Database;
    ADMIN_PASSWORD?: string;
    SESSION_EXPIRATION_DAYS?: string;
    REFRESH_THRESHOLD_HOURS?: string;
}>;

declare namespace App {
    interface Locals extends Runtime {
        usuario?: {
            id_usuario: number;
            correo: string;
            rol: "cliente" | "admin";
        };
    }
}
