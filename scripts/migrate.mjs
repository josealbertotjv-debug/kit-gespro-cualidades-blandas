#!/usr/bin/env node
// =============================================================================
// KIT-GESPRO (GP-13) · MIGRACIÓN DE ESQUEMA (Y SEMILLA OPCIONAL)
//   npm run migrate | npm run seed
//     → aplica sql/kit_soft_skills_360_migration.sql (PostgreSQL) o el esquema SQLite,
//       carga los catálogos de referencia (empresas, competencias BARS, fuentes) y,
//       si SEED_DEMO_DATA=true y no hay evaluaciones, los datos de demostración.
// Requiere DATABASE_URL para PostgreSQL; sin ella opera sobre SQLite local.
// =============================================================================

import { initDatabase, closeDatabase, getDialect, listCompanies, listCompetencies, listSources } from "../src/db.mjs";

try {
  await initDatabase({ migrate: true, seed: true });
  const [companies, competencies, sources] = await Promise.all([listCompanies(), listCompetencies(), listSources()]);
  console.log(
    `✔ Migración aplicada (${getDialect()}) · empresas: ${companies.length} · competencias: ${competencies.length} · fuentes: ${sources.length}`
  );
} catch (err) {
  console.error("✖ Error aplicando la migración:", err.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
