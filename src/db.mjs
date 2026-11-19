// =============================================================================
// KIT-GESPRO · CAPA DE PERSISTENCIA COMPATIBLE CON ESQUEMA KIT
//   · PostgreSQL (producción): esquema `kit` compartido con gespro-costos,
//     activado cuando existe la variable DATABASE_URL.
//   · SQLite (node:sqlite): desarrollo local y pruebas sin infraestructura.
// Todas las funciones exportadas son asíncronas y devuelven objetos con la
// misma forma en ambos motores.
// =============================================================================

import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";
import {
  SPECIALIZED_WEB_SOURCES,
  SOFT_SKILL_COMPETENCIES,
  GESPRO_COMPANIES,
  SEED_EMPLOYEES,
  SEED_CYCLES,
  SEED_EVALUATIONS
} from "./knowledge-base.mjs";
import { auditEvaluationPsychometrics } from "./ai-agent.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PG_MIGRATION_FILE = path.resolve(__dirname, "../sql/kit_soft_skills_360_migration.sql");

// ── Utilidades ────────────────────────────────────────────────────────────────
const parseJson = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value; // JSONB ya decodificado por pg
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const newId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

// ── Drivers ───────────────────────────────────────────────────────────────────
// Interfaz común: { dialect, all(sql, params), get(sql, params), run(sql, params), tx(fn), close() }
// El SQL se escribe con marcadores `?` e identificadores camelCase entre comillas dobles,
// sintaxis válida en ambos motores.

async function createPostgresDriver() {
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    max: config.databasePoolMax,
    ssl: config.databaseSsl ? { rejectUnauthorized: config.databaseSslRejectUnauthorized } : undefined,
    application_name: "kit-gespro-gp13",
    options: "-c search_path=kit,public"
  });
  pool.on("error", (err) => {
    console.error("[db] Error inesperado en cliente PostgreSQL inactivo:", err.message);
  });

  const toPg = (sql) => {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  };
  const bind = (query) => ({
    dialect: "postgres",
    all: async (sql, params = []) => (await query(toPg(sql), params)).rows,
    get: async (sql, params = []) => (await query(toPg(sql), params)).rows[0],
    run: async (sql, params = []) => {
      await query(toPg(sql), params);
    }
  });

  const driver = {
    ...bind((text, values) => pool.query(text, values)),
    async exec(sqlText) {
      await pool.query(sqlText);
    },
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn(bind((text, values) => client.query(text, values)));
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    },
    close: () => pool.end()
  };
  return driver;
}

async function createSqliteDriver() {
  const { DatabaseSync } = await import("node:sqlite");
  const dir = path.dirname(config.sqlitePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const sqlite = new DatabaseSync(config.sqlitePath);

  const driver = {
    dialect: "sqlite",
    all: async (sql, params = []) => sqlite.prepare(sql).all(...params),
    get: async (sql, params = []) => sqlite.prepare(sql).get(...params),
    run: async (sql, params = []) => {
      sqlite.prepare(sql).run(...params);
    },
    async exec(sqlText) {
      sqlite.exec(sqlText);
    },
    async tx(fn) {
      sqlite.exec("BEGIN");
      try {
        const result = await fn(driver);
        sqlite.exec("COMMIT");
        return result;
      } catch (err) {
        sqlite.exec("ROLLBACK");
        throw err;
      }
    },
    close: async () => sqlite.close()
  };
  return driver;
}

const SQLITE_SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS soft_skill_companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS soft_skill_sources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    institution TEXT NOT NULL,
    authors TEXT NOT NULL,
    year INTEGER NOT NULL,
    url TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    key_findings TEXT NOT NULL DEFAULT '[]',
    methodological_rules TEXT NOT NULL DEFAULT '[]',
    verified INTEGER NOT NULL DEFAULT 1,
    lastFetchedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS soft_skill_competencies (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    cluster TEXT NOT NULL,
    clusterLabel TEXT NOT NULL,
    framework TEXT NOT NULL,
    onet_code TEXT,
    description TEXT NOT NULL,
    why_relevant TEXT NOT NULL,
    applicable_directions TEXT NOT NULL DEFAULT '["SELF","PEER","UPWARD","DOWNWARD"]',
    bars_anchors TEXT NOT NULL DEFAULT '{}',
    observable_indicators TEXT NOT NULL DEFAULT '[]',
    source_ids TEXT NOT NULL DEFAULT '[]',
    sortIndex INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS soft_skill_employees (
    id TEXT PRIMARY KEY,
    gesproCompanyId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    hierarchy_level TEXT NOT NULL,
    managerId TEXT,
    avatar_initials TEXT NOT NULL,
    tenure_months INTEGER NOT NULL DEFAULT 12,
    mission TEXT,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS soft_skill_cycles (
    id TEXT PRIMARY KEY,
    gesproCompanyId TEXT NOT NULL,
    name TEXT NOT NULL,
    period TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    purpose TEXT NOT NULL DEFAULT 'DEVELOPMENTAL',
    anonymity_threshold INTEGER NOT NULL DEFAULT 2,
    description TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS soft_skill_evaluations (
    id TEXT PRIMARY KEY,
    cycleId TEXT NOT NULL,
    gesproCompanyId TEXT NOT NULL,
    evaluatorId TEXT NOT NULL,
    targetId TEXT NOT NULL,
    direction TEXT NOT NULL,
    is_anonymous INTEGER NOT NULL DEFAULT 1,
    scores TEXT NOT NULL DEFAULT '{}',
    sbi_situation TEXT NOT NULL,
    sbi_behavior TEXT NOT NULL,
    sbi_impact TEXT NOT NULL,
    growth_suggestion TEXT,
    overall_score REAL NOT NULL DEFAULT 0,
    psychometric_flags TEXT NOT NULL DEFAULT '[]',
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS soft_skill_ai_reports (
    id TEXT PRIMARY KEY,
    gesproCompanyId TEXT NOT NULL,
    cycleId TEXT,
    targetEmployeeId TEXT,
    report_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    metrics TEXT NOT NULL DEFAULT '{}',
    johari_matrix TEXT NOT NULL DEFAULT '{}',
    action_plan_30_60_90 TEXT NOT NULL DEFAULT '{}',
    cited_sources TEXT NOT NULL DEFAULT '[]',
    dossier_markdown TEXT NOT NULL,
    model TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

/** @type {Awaited<ReturnType<typeof createSqliteDriver>>} */
let db = null;

export function getDialect() {
  return db?.dialect || (config.databaseUrl ? "postgres" : "sqlite");
}

/**
 * Inicializa la conexión, aplica el esquema (si DB_AUTO_MIGRATE no es false)
 * y carga los catálogos de referencia + datos demo (si SEED_DEMO_DATA no es false).
 */
export async function initDatabase({ migrate = config.autoMigrate, seed = true } = {}) {
  if (db) return db;
  db = config.databaseUrl ? await createPostgresDriver() : await createSqliteDriver();

  if (migrate) {
    if (db.dialect === "postgres") {
      await db.exec(fs.readFileSync(PG_MIGRATION_FILE, "utf8"));
    } else {
      await db.exec(SQLITE_SCHEMA);
    }
  }
  if (seed) {
    await seedDatabase();
  }
  return db;
}

export async function closeDatabase() {
  if (!db) return;
  const current = db;
  db = null;
  await current.close();
}

export async function pingDatabase() {
  const row = await db.get("SELECT 1 AS ok");
  return Number(row?.ok) === 1;
}

async function seedDatabase() {
  await db.tx(async (t) => {
    // 1. Catálogos de referencia (siempre; ON CONFLICT permite agregar nuevos elementos en upgrades)
    for (const c of GESPRO_COMPANIES) {
      await t.run(
        `INSERT INTO soft_skill_companies (id, name, industry, country, description)
         VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        [c.id, c.name, c.industry, c.country, c.description || ""]
      );
    }

    for (const s of SPECIALIZED_WEB_SOURCES) {
      await t.run(
        `INSERT INTO soft_skill_sources (id, title, institution, authors, year, url, domain, category, summary, key_findings, methodological_rules, verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        [
          s.id,
          s.title,
          s.institution,
          s.authors,
          s.year,
          s.url,
          s.domain,
          s.category,
          s.summary,
          JSON.stringify(s.key_findings || []),
          JSON.stringify(s.methodological_rules || []),
          s.verified ? 1 : 0
        ]
      );
    }

    for (const k of SOFT_SKILL_COMPETENCIES) {
      await t.run(
        `INSERT INTO soft_skill_competencies (
           id, code, name, cluster, "clusterLabel", framework, onet_code, description, why_relevant,
           applicable_directions, bars_anchors, observable_indicators, source_ids, "sortIndex"
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        [
          k.id,
          k.code,
          k.name,
          k.cluster,
          k.clusterLabel,
          k.framework,
          k.onet_code || "",
          k.description,
          k.why_relevant,
          JSON.stringify(k.applicable_directions),
          JSON.stringify(k.bars_anchors),
          JSON.stringify(k.observable_indicators),
          JSON.stringify(k.source_ids),
          k.sortIndex
        ]
      );
    }

    // 2. Datos de demostración (solo si están habilitados y la base aún no tiene evaluaciones)
    if (!config.seedDemoData) return;
    const evalCount = Number((await t.get("SELECT COUNT(*) AS c FROM soft_skill_evaluations")).c);
    if (evalCount > 0) return;

    for (const e of SEED_EMPLOYEES) {
      await t.run(
        `INSERT INTO soft_skill_employees (
           id, "gesproCompanyId", name, email, title, department, hierarchy_level, "managerId", avatar_initials, tenure_months, mission
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        [
          e.id,
          e.gesproCompanyId,
          e.name,
          e.email,
          e.title,
          e.department,
          e.hierarchy_level,
          e.managerId,
          e.avatar_initials,
          e.tenure_months,
          e.mission || ""
        ]
      );
    }

    for (const cy of SEED_CYCLES) {
      await t.run(
        `INSERT INTO soft_skill_cycles (id, "gesproCompanyId", name, period, status, purpose, anonymity_threshold, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        [cy.id, cy.gesproCompanyId, cy.name, cy.period, cy.status, cy.purpose, cy.anonymity_threshold, cy.description || ""]
      );
    }

    for (const ev of SEED_EVALUATIONS) {
      const audit = auditEvaluationPsychometrics(ev.scores, ev.sbi_situation, ev.sbi_behavior, ev.sbi_impact);
      await t.run(
        `INSERT INTO soft_skill_evaluations (
           id, "cycleId", "gesproCompanyId", "evaluatorId", "targetId", direction, is_anonymous,
           scores, sbi_situation, sbi_behavior, sbi_impact, growth_suggestion, overall_score, psychometric_flags
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        [
          ev.id,
          ev.cycleId,
          ev.gesproCompanyId,
          ev.evaluatorId,
          ev.targetId,
          ev.direction,
          ev.is_anonymous ? 1 : 0,
          JSON.stringify(ev.scores),
          ev.sbi_situation,
          ev.sbi_behavior,
          ev.sbi_impact,
          ev.growth_suggestion || "",
          audit.overallScore,
          JSON.stringify(audit.flags)
        ]
      );
    }
  });
}

// ── Consultas de dominio ──────────────────────────────────────────────────────

export async function listCompanies() {
  return db.all(
    `SELECT * FROM soft_skill_companies
     ORDER BY CASE id WHEN 'cmqh9nb290000mrjuaolf17a2' THEN 1 WHEN 'cmqra3no20000pubxhfsllnqd' THEN 2 WHEN 'cmu6d5wib0000xzddjlektvus' THEN 3 ELSE 4 END, name ASC`
  );
}

export async function listSources() {
  const rows = await db.all("SELECT * FROM soft_skill_sources ORDER BY year DESC, id ASC");
  return rows.map((r) => ({
    ...r,
    verified: Boolean(r.verified),
    key_findings: parseJson(r.key_findings, []),
    methodological_rules: parseJson(r.methodological_rules, [])
  }));
}

export async function addSource(src) {
  const existing = await db.get("SELECT id FROM soft_skill_sources WHERE url = ?", [src.url]);
  if (existing) {
    await db.run(
      `UPDATE soft_skill_sources
       SET title = ?, summary = ?, key_findings = ?, category = ?, "lastFetchedAt" = CURRENT_TIMESTAMP
       WHERE url = ?`,
      [src.title, src.summary, JSON.stringify(src.key_findings || []), src.category, src.url]
    );
    return existing.id;
  }
  await db.run(
    `INSERT INTO soft_skill_sources (
       id, title, institution, authors, year, url, domain, category, summary, key_findings, methodological_rules, verified
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [
      src.id,
      src.title,
      src.institution,
      src.authors,
      src.year,
      src.url,
      src.domain,
      src.category,
      src.summary,
      JSON.stringify(src.key_findings || []),
      JSON.stringify(src.methodological_rules || [])
    ]
  );
  return src.id;
}

export async function listCompetencies() {
  const rows = await db.all(`SELECT * FROM soft_skill_competencies ORDER BY "sortIndex" ASC`);
  return rows.map((r) => ({
    ...r,
    applicable_directions: parseJson(r.applicable_directions, []),
    bars_anchors: parseJson(r.bars_anchors, {}),
    observable_indicators: parseJson(r.observable_indicators, []),
    source_ids: parseJson(r.source_ids, [])
  }));
}

const normalizeEmployee = (r) => (r ? { ...r, isActive: Boolean(r.isActive) } : r);

export async function listEmployees(gesproCompanyId) {
  const rows = gesproCompanyId
    ? await db.all(
        `SELECT * FROM soft_skill_employees WHERE "gesproCompanyId" = ?
         ORDER BY CASE hierarchy_level WHEN 'DIRECCION' THEN 1 WHEN 'GERENCIA' THEN 2 WHEN 'SUPERVISION' THEN 3 ELSE 4 END, name ASC`,
        [gesproCompanyId]
      )
    : await db.all("SELECT * FROM soft_skill_employees ORDER BY name ASC");
  return rows.map(normalizeEmployee);
}

export async function createEmployee(payload) {
  const id = payload.id || newId("EMP");
  const initials =
    payload.avatar_initials ||
    payload.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  await db.run(
    `INSERT INTO soft_skill_employees (
       id, "gesproCompanyId", name, email, title, department, hierarchy_level, "managerId", avatar_initials, tenure_months, mission
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payload.gesproCompanyId,
      payload.name,
      payload.email || `${id.toLowerCase()}@empresa.com`,
      payload.title,
      payload.department,
      payload.hierarchy_level || "OPERATIVO",
      payload.managerId || null,
      initials,
      Number(payload.tenure_months || 12),
      payload.mission || ""
    ]
  );
  return normalizeEmployee(await db.get("SELECT * FROM soft_skill_employees WHERE id = ?", [id]));
}

export async function listCycles(gesproCompanyId) {
  return gesproCompanyId
    ? db.all(`SELECT * FROM soft_skill_cycles WHERE "gesproCompanyId" = ? ORDER BY "createdAt" DESC`, [gesproCompanyId])
    : db.all(`SELECT * FROM soft_skill_cycles ORDER BY "createdAt" DESC`);
}

export async function listEvaluations(gesproCompanyId, targetId = null) {
  let sql = `
    SELECT ev.*,
           evalEmp.name AS "evaluatorName", evalEmp.title AS "evaluatorTitle", evalEmp.hierarchy_level AS "evaluatorLevel",
           targEmp.name AS "targetName", targEmp.title AS "targetTitle", targEmp.hierarchy_level AS "targetLevel", targEmp.department AS "targetDepartment"
    FROM soft_skill_evaluations ev
    LEFT JOIN soft_skill_employees evalEmp ON evalEmp.id = ev."evaluatorId"
    LEFT JOIN soft_skill_employees targEmp ON targEmp.id = ev."targetId"
    WHERE ev."gesproCompanyId" = ?
  `;
  const params = [gesproCompanyId];
  if (targetId) {
    sql += ` AND ev."targetId" = ?`;
    params.push(targetId);
  }
  sql += ` ORDER BY ev."createdAt" DESC`;

  const rows = await db.all(sql, params);
  return rows.map((r) => ({
    ...r,
    overall_score: Number(r.overall_score),
    is_anonymous: Boolean(r.is_anonymous),
    scores: parseJson(r.scores, {}),
    psychometric_flags: parseJson(r.psychometric_flags, [])
  }));
}

export async function createEvaluation(payload) {
  const id = newId("EV");
  const audit = auditEvaluationPsychometrics(
    payload.scores,
    payload.sbi_situation,
    payload.sbi_behavior,
    payload.sbi_impact
  );

  await db.tx(async (t) => {
    // Asegurar que exista un ciclo activo para la empresa
    let cycleId = payload.cycleId;
    if (!cycleId) {
      const cy = await t.get(`SELECT id FROM soft_skill_cycles WHERE "gesproCompanyId" = ? LIMIT 1`, [
        payload.gesproCompanyId
      ]);
      if (cy) {
        cycleId = cy.id;
      } else {
        cycleId = newId("CYC");
        await t.run(
          `INSERT INTO soft_skill_cycles (id, "gesproCompanyId", name, period, status, purpose, anonymity_threshold, description)
           VALUES (?, ?, 'Ciclo 360° Activo', '2026-Q4', 'OPEN', 'DEVELOPMENTAL', 2, 'Ciclo generado automáticamente')`,
          [cycleId, payload.gesproCompanyId]
        );
      }
    }

    await t.run(
      `INSERT INTO soft_skill_evaluations (
         id, "cycleId", "gesproCompanyId", "evaluatorId", "targetId", direction, is_anonymous,
         scores, sbi_situation, sbi_behavior, sbi_impact, growth_suggestion, overall_score, psychometric_flags
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        cycleId,
        payload.gesproCompanyId,
        payload.evaluatorId,
        payload.targetId,
        payload.direction,
        payload.is_anonymous !== false ? 1 : 0,
        JSON.stringify(payload.scores || {}),
        payload.sbi_situation || "",
        payload.sbi_behavior || "",
        payload.sbi_impact || "",
        payload.growth_suggestion || "",
        audit.overallScore,
        JSON.stringify(audit.flags)
      ]
    );
  });

  return {
    id,
    overallScore: audit.overallScore,
    psychometricFlags: audit.flags
  };
}

export async function saveAIReport(reportPayload) {
  const id = newId("REP");
  await db.run(
    `INSERT INTO soft_skill_ai_reports (
       id, "gesproCompanyId", "cycleId", "targetEmployeeId", report_type, summary,
       metrics, johari_matrix, action_plan_30_60_90, cited_sources, dossier_markdown, model
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      reportPayload.gesproCompanyId,
      reportPayload.cycleId || null,
      reportPayload.targetEmployeeId || null,
      reportPayload.report_type || "INDIVIDUAL_360",
      reportPayload.summary,
      JSON.stringify(reportPayload.metrics || {}),
      JSON.stringify(reportPayload.johari_matrix || {}),
      JSON.stringify(reportPayload.action_plan_30_60_90 || {}),
      JSON.stringify(reportPayload.cited_sources || []),
      reportPayload.dossier_markdown,
      reportPayload.model || "kit-gespro-psychometric-ai-v2"
    ]
  );
  return id;
}

export async function listAIReports(gesproCompanyId) {
  const rows = await db.all(
    `SELECT * FROM soft_skill_ai_reports WHERE "gesproCompanyId" = ? ORDER BY "createdAt" DESC LIMIT 25`,
    [gesproCompanyId]
  );
  return rows.map((r) => ({
    ...r,
    metrics: parseJson(r.metrics, {}),
    johari_matrix: parseJson(r.johari_matrix, {}),
    action_plan_30_60_90: parseJson(r.action_plan_30_60_90, {}),
    cited_sources: parseJson(r.cited_sources, [])
  }));
}
