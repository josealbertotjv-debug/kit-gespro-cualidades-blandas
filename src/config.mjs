// =============================================================================
// KIT-GESPRO (GP-13) · CONFIGURACIÓN POR VARIABLES DE ENTORNO
// Ver .env.example para la descripción de cada variable.
// =============================================================================

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bool = (value, fallback) => {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

export const config = Object.freeze({
  env: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  host: process.env.HOST || "0.0.0.0",
  port: Number(process.env.PORT || 4500),

  // Base de datos: si DATABASE_URL está definida se usa PostgreSQL (esquema kit de gespro-costos);
  // de lo contrario se usa SQLite local (desarrollo / pruebas).
  databaseUrl: process.env.DATABASE_URL || "",
  databaseSsl: bool(process.env.DATABASE_SSL, false),
  databaseSslRejectUnauthorized: bool(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED, true),
  databasePoolMax: Number(process.env.DATABASE_POOL_MAX || 10),
  sqlitePath: process.env.SQLITE_PATH || path.resolve(__dirname, "../data/kit-cualidades-blandas.db"),
  autoMigrate: bool(process.env.DB_AUTO_MIGRATE, true),
  seedDemoData: bool(process.env.SEED_DEMO_DATA, true),

  // Seguridad HTTP
  corsOrigin: process.env.CORS_ORIGIN || "*",
  frameAncestors: (process.env.FRAME_ANCESTORS || "self")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => (/^'?(self|none)'?$/i.test(t) ? `'${t.replace(/'/g, "").toLowerCase()}'` : t))
    .join(" "),
  basicAuthUser: process.env.BASIC_AUTH_USER || "",
  basicAuthPassword: process.env.BASIC_AUTH_PASSWORD || "",
  ingestAllowPrivateHosts: bool(process.env.INGEST_ALLOW_PRIVATE_HOSTS, false)
});
