-- =============================================================================
-- KIT-GESPRO · MÓDULO GP-13: EVALUACIÓN 360° DE CUALIDADES BLANDAS Y LIDERAZGO
-- Esquema PostgreSQL compatible con josealbertotjv-debug/gespro-costos (schema kit)
-- =============================================================================

-- El esquema se crea solo si falta: CREATE SCHEMA IF NOT EXISTS exige permiso CREATE sobre la
-- base de datos incluso cuando ya existe, y el rol de la app (kit_gp13) no lo tiene.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'kit') THEN
    CREATE SCHEMA kit;
  END IF;
END
$$;

-- 1. Fuentes web especializadas y literatura científica verificada (RAG Corpus)
CREATE TABLE IF NOT EXISTS kit.soft_skill_sources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    institution TEXT NOT NULL,
    authors TEXT NOT NULL,
    year INTEGER NOT NULL,
    url TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL,
    category TEXT NOT NULL, -- 'TAXONOMIA', 'LIDERAZGO_ASCENDENTE', 'FEEDBACK_360', 'INTELIGENCIA_EMOCIONAL', 'SEGURIDAD_PSICOLOGICA', 'PSICOMETRIA_BARS'
    summary TEXT NOT NULL,
    key_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    methodological_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    "lastFetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Catálogo de Competencias y Cualidades Blandas con Escalas BARS (1 a 5)
CREATE TABLE IF NOT EXISTS kit.soft_skill_competencies (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    cluster TEXT NOT NULL, -- 'INTRAPERSONAL', 'HORIZONTAL_PARES', 'LIDERAZGO_ASCENDENTE', 'TRANSVERSAL_DIRECTIVO'
    framework TEXT NOT NULL,
    onet_code TEXT,
    description TEXT NOT NULL,
    why_relevant TEXT NOT NULL,
    applicable_directions JSONB NOT NULL DEFAULT '["SELF","PEER","UPWARD","DOWNWARD"]'::jsonb,
    bars_anchors JSONB NOT NULL DEFAULT '{}'::jsonb,
    observable_indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Plantilla Organizacional para Evaluación 360° (vinculada a kit.org_positions y public.companies)
CREATE TABLE IF NOT EXISTS kit.soft_skill_employees (
    id TEXT PRIMARY KEY,
    "gesproCompanyId" TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    hierarchy_level TEXT NOT NULL, -- 'OPERATIVO', 'SUPERVISION', 'GERENCIA', 'DIRECCION'
    "managerId" TEXT REFERENCES kit.soft_skill_employees(id) ON DELETE SET NULL,
    avatar_initials TEXT NOT NULL,
    tenure_months INTEGER NOT NULL DEFAULT 12,
    mission TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ciclos de Evaluación 360° por Empresa
CREATE TABLE IF NOT EXISTS kit.soft_skill_cycles (
    id TEXT PRIMARY KEY,
    "gesproCompanyId" TEXT NOT NULL,
    name TEXT NOT NULL,
    period TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'CLOSED', 'CALIBRATING'
    purpose TEXT NOT NULL DEFAULT 'DEVELOPMENTAL',
    anonymity_threshold INTEGER NOT NULL DEFAULT 2,
    description TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Evaluaciones Multifuente 360° (Autoevaluación, Pares, Subordinados->Superiores, Superiores->Subordinados)
CREATE TABLE IF NOT EXISTS kit.soft_skill_evaluations (
    id TEXT PRIMARY KEY,
    "cycleId" TEXT NOT NULL REFERENCES kit.soft_skill_cycles(id) ON DELETE CASCADE,
    "gesproCompanyId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL REFERENCES kit.soft_skill_employees(id) ON DELETE CASCADE,
    "targetId" TEXT NOT NULL REFERENCES kit.soft_skill_employees(id) ON DELETE CASCADE,
    direction TEXT NOT NULL, -- 'SELF', 'PEER', 'UPWARD', 'DOWNWARD'
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "COMP-01": 4, "COMP-02": 5, ... }
    sbi_situation TEXT NOT NULL,
    sbi_behavior TEXT NOT NULL,
    sbi_impact TEXT NOT NULL,
    growth_suggestion TEXT,
    overall_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    psychometric_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Expedientes y Reportes Generados por el Agente de IA (Individuales y Organizacionales)
CREATE TABLE IF NOT EXISTS kit.soft_skill_ai_reports (
    id TEXT PRIMARY KEY,
    "gesproCompanyId" TEXT NOT NULL,
    "cycleId" TEXT,
    "targetEmployeeId" TEXT, -- NULL cuando es reporte global de empresa
    report_type TEXT NOT NULL, -- 'INDIVIDUAL_360', 'COMPANY_DIAGNOSTIC', 'LEADERSHIP_AUDIT'
    summary TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    johari_matrix JSONB NOT NULL DEFAULT '{}'::jsonb,
    action_plan_30_60_90 JSONB NOT NULL DEFAULT '{}'::jsonb,
    cited_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    dossier_markdown TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'kit-gespro-psychometric-ai-v2',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Catálogo de empresas del ecosistema GesPro habilitadas para GP-13
--    (id = "gesproCompanyId" = public.companies.id en gespro-costos / auditoria-estrategica)
CREATE TABLE IF NOT EXISTS kit.soft_skill_companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Evolución de esquema (idempotente) para instalaciones previas
ALTER TABLE kit.soft_skill_competencies ADD COLUMN IF NOT EXISTS "clusterLabel" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_soft_skill_emp_company ON kit.soft_skill_employees("gesproCompanyId");
CREATE INDEX IF NOT EXISTS idx_soft_skill_eval_target ON kit.soft_skill_evaluations("targetId", "cycleId");
CREATE INDEX IF NOT EXISTS idx_soft_skill_eval_company ON kit.soft_skill_evaluations("gesproCompanyId", "cycleId");
