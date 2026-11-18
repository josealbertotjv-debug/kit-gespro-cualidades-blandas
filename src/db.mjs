// =============================================================================
// KIT-GESPRO · CAPA DE PERSISTENCIA SQLITE (node:sqlite) COMPATIBLE CON ESQUEMA KIT
// =============================================================================

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
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
const DATA_DIR = path.resolve(__dirname, "../data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, "kit-cualidades-blandas.db");

export const db = new DatabaseSync(DB_PATH);

export function initDatabase() {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      country TEXT NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
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
      lastFetchedAt TEXT NOT NULL DEFAULT (datetime('now')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
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
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
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
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
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
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
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
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedIfEmpty();
}

function seedIfEmpty() {
  const countComp = db.prepare("SELECT COUNT(*) as c FROM companies").get().c;
  if (countComp === 0) {
    const insCompany = db.prepare(`
      INSERT INTO companies (id, name, industry, country, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const c of GESPRO_COMPANIES) {
      insCompany.run(c.id, c.name, c.industry, c.country, c.description || "");
    }
  }

  const countSources = db.prepare("SELECT COUNT(*) as c FROM soft_skill_sources").get().c;
  if (countSources === 0) {
    const insSource = db.prepare(`
      INSERT INTO soft_skill_sources (id, title, institution, authors, year, url, domain, category, summary, key_findings, methodological_rules, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of SPECIALIZED_WEB_SOURCES) {
      insSource.run(
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
      );
    }
  }

  const countSkills = db.prepare("SELECT COUNT(*) as c FROM soft_skill_competencies").get().c;
  if (countSkills === 0) {
    const insSkill = db.prepare(`
      INSERT INTO soft_skill_competencies (
        id, code, name, cluster, clusterLabel, framework, onet_code, description, why_relevant,
        applicable_directions, bars_anchors, observable_indicators, source_ids, sortIndex
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const k of SOFT_SKILL_COMPETENCIES) {
      insSkill.run(
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
      );
    }
  }

  const countEmp = db.prepare("SELECT COUNT(*) as c FROM soft_skill_employees").get().c;
  if (countEmp === 0) {
    const insEmp = db.prepare(`
      INSERT INTO soft_skill_employees (
        id, gesproCompanyId, name, email, title, department, hierarchy_level, managerId, avatar_initials, tenure_months, mission
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const e of SEED_EMPLOYEES) {
      insEmp.run(
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
      );
    }
  }

  const countCycles = db.prepare("SELECT COUNT(*) as c FROM soft_skill_cycles").get().c;
  if (countCycles === 0) {
    const insCycle = db.prepare(`
      INSERT INTO soft_skill_cycles (id, gesproCompanyId, name, period, status, purpose, anonymity_threshold, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const cy of SEED_CYCLES) {
      insCycle.run(
        cy.id,
        cy.gesproCompanyId,
        cy.name,
        cy.period,
        cy.status,
        cy.purpose,
        cy.anonymity_threshold,
        cy.description || ""
      );
    }
  }

  const countEvals = db.prepare("SELECT COUNT(*) as c FROM soft_skill_evaluations").get().c;
  if (countEvals === 0) {
    const insEval = db.prepare(`
      INSERT INTO soft_skill_evaluations (
        id, cycleId, gesproCompanyId, evaluatorId, targetId, direction, is_anonymous,
        scores, sbi_situation, sbi_behavior, sbi_impact, growth_suggestion, overall_score, psychometric_flags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ev of SEED_EVALUATIONS) {
      const audit = auditEvaluationPsychometrics(ev.scores, ev.sbi_situation, ev.sbi_behavior, ev.sbi_impact);
      insEval.run(
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
      );
    }
  }
}

export function listCompanies() {
  return db
    .prepare(
      "SELECT * FROM companies ORDER BY CASE id WHEN 'cmqh9nb290000mrjuaolf17a2' THEN 1 WHEN 'cmqra3no20000pubxhfsllnqd' THEN 2 WHEN 'cmu6d5wib0000xzddjlektvus' THEN 3 ELSE 4 END, name ASC"
    )
    .all();
}

export function listSources() {
  return db
    .prepare("SELECT * FROM soft_skill_sources ORDER BY year DESC, id ASC")
    .all()
    .map((r) => ({
      ...r,
      verified: Boolean(r.verified),
      key_findings: JSON.parse(r.key_findings || "[]"),
      methodological_rules: JSON.parse(r.methodological_rules || "[]")
    }));
}

export function addSource(src) {
  const existing = db.prepare("SELECT id FROM soft_skill_sources WHERE url = ?").get(src.url);
  if (existing) {
    db.prepare(`
      UPDATE soft_skill_sources
      SET title = ?, summary = ?, key_findings = ?, category = ?, lastFetchedAt = datetime('now')
      WHERE url = ?
    `).run(src.title, src.summary, JSON.stringify(src.key_findings || []), src.category, src.url);
    return existing.id;
  }
  db.prepare(`
    INSERT INTO soft_skill_sources (
      id, title, institution, authors, year, url, domain, category, summary, key_findings, methodological_rules, verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
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
  );
  return src.id;
}

export function listCompetencies() {
  return db
    .prepare("SELECT * FROM soft_skill_competencies ORDER BY sortIndex ASC")
    .all()
    .map((r) => ({
      ...r,
      applicable_directions: JSON.parse(r.applicable_directions || "[]"),
      bars_anchors: JSON.parse(r.bars_anchors || "{}"),
      observable_indicators: JSON.parse(r.observable_indicators || "[]"),
      source_ids: JSON.parse(r.source_ids || "[]")
    }));
}

export function listEmployees(gesproCompanyId) {
  const rows = gesproCompanyId
    ? db
        .prepare("SELECT * FROM soft_skill_employees WHERE gesproCompanyId = ? ORDER BY CASE hierarchy_level WHEN 'DIRECCION' THEN 1 WHEN 'GERENCIA' THEN 2 WHEN 'SUPERVISION' THEN 3 ELSE 4 END, name ASC")
        .all(gesproCompanyId)
    : db.prepare("SELECT * FROM soft_skill_employees ORDER BY name ASC").all();
  return rows;
}

export function createEmployee(payload) {
  const id = payload.id || `EMP-${Date.now().toString(36).toUpperCase()}`;
  const initials =
    payload.avatar_initials ||
    payload.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  db.prepare(`
    INSERT INTO soft_skill_employees (
      id, gesproCompanyId, name, email, title, department, hierarchy_level, managerId, avatar_initials, tenure_months, mission
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  );
  return db.prepare("SELECT * FROM soft_skill_employees WHERE id = ?").get(id);
}

export function listCycles(gesproCompanyId) {
  return gesproCompanyId
    ? db.prepare("SELECT * FROM soft_skill_cycles WHERE gesproCompanyId = ? ORDER BY createdAt DESC").all(gesproCompanyId)
    : db.prepare("SELECT * FROM soft_skill_cycles ORDER BY createdAt DESC").all();
}

export function listEvaluations(gesproCompanyId, targetId = null) {
  let sql = `
    SELECT ev.*,
           evalEmp.name as evaluatorName, evalEmp.title as evaluatorTitle, evalEmp.hierarchy_level as evaluatorLevel,
           targEmp.name as targetName, targEmp.title as targetTitle, targEmp.hierarchy_level as targetLevel, targEmp.department as targetDepartment
    FROM soft_skill_evaluations ev
    LEFT JOIN soft_skill_employees evalEmp ON evalEmp.id = ev.evaluatorId
    LEFT JOIN soft_skill_employees targEmp ON targEmp.id = ev.targetId
    WHERE ev.gesproCompanyId = ?
  `;
  const params = [gesproCompanyId];
  if (targetId) {
    sql += " AND ev.targetId = ?";
    params.push(targetId);
  }
  sql += " ORDER BY ev.createdAt DESC";

  return db
    .prepare(sql)
    .all(...params)
    .map((r) => ({
      ...r,
      is_anonymous: Boolean(r.is_anonymous),
      scores: JSON.parse(r.scores || "{}"),
      psychometric_flags: JSON.parse(r.psychometric_flags || "[]")
    }));
}

export function createEvaluation(payload) {
  const id = `EV-${Date.now().toString(36).toUpperCase()}`;
  const audit = auditEvaluationPsychometrics(
    payload.scores,
    payload.sbi_situation,
    payload.sbi_behavior,
    payload.sbi_impact
  );

  // Asegurar que exista un ciclo activo para la empresa
  let cycleId = payload.cycleId;
  if (!cycleId) {
    const cy = db
      .prepare("SELECT id FROM soft_skill_cycles WHERE gesproCompanyId = ? LIMIT 1")
      .get(payload.gesproCompanyId);
    if (cy) {
      cycleId = cy.id;
    } else {
      cycleId = `CYC-${Date.now().toString(36).toUpperCase()}`;
      db.prepare(`
        INSERT INTO soft_skill_cycles (id, gesproCompanyId, name, period, status, purpose, anonymity_threshold, description)
        VALUES (?, ?, 'Ciclo 360° Activo', '2026-Q4', 'OPEN', 'DEVELOPMENTAL', 2, 'Ciclo generado automáticamente')
      `).run(cycleId, payload.gesproCompanyId);
    }
  }

  db.prepare(`
    INSERT INTO soft_skill_evaluations (
      id, cycleId, gesproCompanyId, evaluatorId, targetId, direction, is_anonymous,
      scores, sbi_situation, sbi_behavior, sbi_impact, growth_suggestion, overall_score, psychometric_flags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  );

  return {
    id,
    overallScore: audit.overallScore,
    psychometricFlags: audit.flags
  };
}

export function saveAIReport(reportPayload) {
  const id = `REP-${Date.now().toString(36).toUpperCase()}`;
  db.prepare(`
    INSERT INTO soft_skill_ai_reports (
      id, gesproCompanyId, cycleId, targetEmployeeId, report_type, summary,
      metrics, johari_matrix, action_plan_30_60_90, cited_sources, dossier_markdown, model
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
  );
  return id;
}

export function listAIReports(gesproCompanyId) {
  return db
    .prepare("SELECT * FROM soft_skill_ai_reports WHERE gesproCompanyId = ? ORDER BY createdAt DESC LIMIT 25")
    .all(gesproCompanyId)
    .map((r) => ({
      ...r,
      metrics: JSON.parse(r.metrics || "{}"),
      johari_matrix: JSON.parse(r.johari_matrix || "{}"),
      action_plan_30_60_90: JSON.parse(r.action_plan_30_60_90 || "{}"),
      cited_sources: JSON.parse(r.cited_sources || "[]")
    }));
}
