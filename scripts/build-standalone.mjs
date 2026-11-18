// =============================================================================
// KIT-GESPRO · GENERADOR DE VERSIÓN AUTÓNOMA (UN SOLO ARCHIVO HTML, SIN SERVIDOR)
// -----------------------------------------------------------------------------
// Empaqueta knowledge-base.mjs + ai-agent.mjs + un "backend" en el navegador
// (localStorage) que emula todas las rutas /api/* de server.mjs. El resultado
// se abre con doble clic en Safari / Chrome / Edge, sin Node ni conexión local.
// Uso: npm run build:standalone  →  dist/kit-gespro-cualidades-blandas.html
// =============================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const stripExports = (code) => code.replace(/^export\s+(async\s+function|function|const|let)\s/gm, "$1 ");

const kb = stripExports(read("src/knowledge-base.mjs"));
const agent = stripExports(read("src/ai-agent.mjs"));

// Backend del navegador: espejo de db.mjs + server.mjs
const browserBackend = String.raw`
  const STORE_KEY = "kit-gespro-gp13-v1";
  const DIRECTION_ORDER = { DIRECCION: 1, GERENCIA: 2, SUPERVISION: 3 };
  const COMPANY_ORDER = {
    cmqh9nb290000mrjuaolf17a2: 1,
    cmqra3no20000pubxhfsllnqd: 2,
    cmu6d5wib0000xzddjlektvus: 3
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const nowSql = () => new Date().toISOString().replace("T", " ").slice(0, 19);
  let memoryState = null;

  function seedState() {
    const ts = nowSql();
    return {
      version: 1,
      companies: GESPRO_COMPANIES.map((c) => ({
        id: c.id, name: c.name, industry: c.industry, country: c.country,
        description: c.description || "", createdAt: ts
      })),
      sources: SPECIALIZED_WEB_SOURCES.map((s) => ({
        id: s.id, title: s.title, institution: s.institution, authors: s.authors, year: s.year,
        url: s.url, domain: s.domain, category: s.category, summary: s.summary,
        key_findings: s.key_findings || [], methodological_rules: s.methodological_rules || [],
        verified: Boolean(s.verified), lastFetchedAt: ts, createdAt: ts
      })),
      competencies: SOFT_SKILL_COMPETENCIES.map((k) => ({
        id: k.id, code: k.code, name: k.name, cluster: k.cluster, clusterLabel: k.clusterLabel,
        framework: k.framework, onet_code: k.onet_code || "", description: k.description,
        why_relevant: k.why_relevant, applicable_directions: k.applicable_directions,
        bars_anchors: k.bars_anchors, observable_indicators: k.observable_indicators,
        source_ids: k.source_ids, sortIndex: k.sortIndex
      })),
      employees: SEED_EMPLOYEES.map((e) => ({
        id: e.id, gesproCompanyId: e.gesproCompanyId, name: e.name, email: e.email, title: e.title,
        department: e.department, hierarchy_level: e.hierarchy_level, managerId: e.managerId || null,
        avatar_initials: e.avatar_initials, tenure_months: e.tenure_months, mission: e.mission || "",
        isActive: 1, createdAt: ts
      })),
      cycles: SEED_CYCLES.map((cy) => ({
        id: cy.id, gesproCompanyId: cy.gesproCompanyId, name: cy.name, period: cy.period,
        status: cy.status, purpose: cy.purpose, anonymity_threshold: cy.anonymity_threshold,
        description: cy.description || "", createdAt: ts
      })),
      evaluations: SEED_EVALUATIONS.map((ev) => {
        const audit = auditEvaluationPsychometrics(ev.scores, ev.sbi_situation, ev.sbi_behavior, ev.sbi_impact);
        return {
          id: ev.id, cycleId: ev.cycleId, gesproCompanyId: ev.gesproCompanyId,
          evaluatorId: ev.evaluatorId, targetId: ev.targetId, direction: ev.direction,
          is_anonymous: Boolean(ev.is_anonymous), scores: ev.scores,
          sbi_situation: ev.sbi_situation, sbi_behavior: ev.sbi_behavior, sbi_impact: ev.sbi_impact,
          growth_suggestion: ev.growth_suggestion || "", overall_score: audit.overallScore,
          psychometric_flags: audit.flags, createdAt: ts
        };
      }),
      reports: []
    };
  }

  function loadState() {
    if (memoryState) return memoryState;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        memoryState = JSON.parse(raw);
        return memoryState;
      }
    } catch (e) { /* localStorage no disponible: se usa memoria */ }
    memoryState = seedState();
    persist();
    return memoryState;
  }

  function persist() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(memoryState));
    } catch (e) { /* modo privado o cuota excedida: los datos viven en memoria */ }
  }

  function resetDemoData() {
    try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* noop */ }
    memoryState = null;
    loadState();
  }

  const byCreatedDesc = (a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0);
  const uid = (prefix) => prefix + "-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

  function listCompanies() {
    return clone(loadState().companies).sort((a, b) => {
      const oa = COMPANY_ORDER[a.id] || 4, ob = COMPANY_ORDER[b.id] || 4;
      return oa !== ob ? oa - ob : a.name.localeCompare(b.name);
    });
  }

  function listSources() {
    return clone(loadState().sources).sort((a, b) => (b.year - a.year) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }

  function addSource(src) {
    const st = loadState();
    const existing = st.sources.find((s) => s.url === src.url);
    if (existing) {
      Object.assign(existing, {
        title: src.title, summary: src.summary, key_findings: src.key_findings || [],
        category: src.category, lastFetchedAt: nowSql()
      });
      persist();
      return existing.id;
    }
    st.sources.push({
      id: src.id, title: src.title, institution: src.institution, authors: src.authors, year: src.year,
      url: src.url, domain: src.domain, category: src.category, summary: src.summary,
      key_findings: src.key_findings || [], methodological_rules: src.methodological_rules || [],
      verified: true, lastFetchedAt: nowSql(), createdAt: nowSql()
    });
    persist();
    return src.id;
  }

  function listCompetencies() {
    return clone(loadState().competencies).sort((a, b) => a.sortIndex - b.sortIndex);
  }

  function listEmployees(companyId) {
    const all = clone(loadState().employees);
    if (!companyId) return all.sort((a, b) => a.name.localeCompare(b.name));
    return all
      .filter((e) => e.gesproCompanyId === companyId)
      .sort((a, b) => {
        const oa = DIRECTION_ORDER[a.hierarchy_level] || 4, ob = DIRECTION_ORDER[b.hierarchy_level] || 4;
        return oa !== ob ? oa - ob : a.name.localeCompare(b.name);
      });
  }

  function createEmployee(p) {
    const st = loadState();
    const id = p.id || uid("EMP");
    const initials = p.avatar_initials || String(p.name).split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
    const emp = {
      id, gesproCompanyId: p.gesproCompanyId, name: p.name,
      email: p.email || id.toLowerCase() + "@empresa.com", title: p.title, department: p.department,
      hierarchy_level: p.hierarchy_level || "OPERATIVO", managerId: p.managerId || null,
      avatar_initials: initials, tenure_months: Number(p.tenure_months || 12), mission: p.mission || "",
      isActive: 1, createdAt: nowSql()
    };
    st.employees.push(emp);
    persist();
    return clone(emp);
  }

  function listCycles(companyId) {
    const all = clone(loadState().cycles);
    return (companyId ? all.filter((c) => c.gesproCompanyId === companyId) : all).sort(byCreatedDesc);
  }

  function listEvaluations(companyId, targetId) {
    const st = loadState();
    const empById = {};
    st.employees.forEach((e) => { empById[e.id] = e; });
    return clone(st.evaluations)
      .filter((ev) => ev.gesproCompanyId === companyId && (!targetId || ev.targetId === targetId))
      .sort(byCreatedDesc)
      .map((ev) => {
        const ev1 = empById[ev.evaluatorId] || {};
        const tg = empById[ev.targetId] || {};
        return Object.assign(ev, {
          is_anonymous: Boolean(ev.is_anonymous),
          evaluatorName: ev1.name || null, evaluatorTitle: ev1.title || null, evaluatorLevel: ev1.hierarchy_level || null,
          targetName: tg.name || null, targetTitle: tg.title || null, targetLevel: tg.hierarchy_level || null,
          targetDepartment: tg.department || null
        });
      });
  }

  function createEvaluation(p) {
    const st = loadState();
    const id = uid("EV");
    const audit = auditEvaluationPsychometrics(p.scores, p.sbi_situation, p.sbi_behavior, p.sbi_impact);
    let cycleId = p.cycleId;
    if (!cycleId) {
      const cy = st.cycles.find((c) => c.gesproCompanyId === p.gesproCompanyId);
      if (cy) {
        cycleId = cy.id;
      } else {
        cycleId = uid("CYC");
        st.cycles.push({
          id: cycleId, gesproCompanyId: p.gesproCompanyId, name: "Ciclo 360° Activo", period: "2026-Q4",
          status: "OPEN", purpose: "DEVELOPMENTAL", anonymity_threshold: 2,
          description: "Ciclo generado automáticamente", createdAt: nowSql()
        });
      }
    }
    st.evaluations.push({
      id, cycleId, gesproCompanyId: p.gesproCompanyId, evaluatorId: p.evaluatorId, targetId: p.targetId,
      direction: p.direction, is_anonymous: p.is_anonymous !== false, scores: p.scores || {},
      sbi_situation: p.sbi_situation || "", sbi_behavior: p.sbi_behavior || "", sbi_impact: p.sbi_impact || "",
      growth_suggestion: p.growth_suggestion || "", overall_score: audit.overallScore,
      psychometric_flags: audit.flags, createdAt: nowSql()
    });
    persist();
    return { id, overallScore: audit.overallScore, psychometricFlags: audit.flags };
  }

  function saveAIReport(r) {
    const st = loadState();
    const id = uid("REP");
    st.reports.push({
      id, gesproCompanyId: r.gesproCompanyId, cycleId: r.cycleId || null,
      targetEmployeeId: r.targetEmployeeId || null, report_type: r.report_type || "INDIVIDUAL_360",
      summary: r.summary, metrics: r.metrics || {}, johari_matrix: r.johari_matrix || {},
      action_plan_30_60_90: r.action_plan_30_60_90 || {}, cited_sources: r.cited_sources || [],
      dossier_markdown: r.dossier_markdown, model: r.model || "kit-gespro-psychometric-ai-v2",
      createdAt: nowSql()
    });
    persist();
    return id;
  }

  function listAIReports(companyId) {
    return clone(loadState().reports).filter((r) => r.gesproCompanyId === companyId).sort(byCreatedDesc).slice(0, 25);
  }

  // ---------------- Router: espejo exacto de server.mjs ----------------
  async function handleApi(method, pathname, params, body) {
    if (method === "GET" && pathname === "/api/bootstrap") {
      const companies = listCompanies();
      const companyId = params.get("companyId") || (companies[0] && companies[0].id);
      const activeCompany = companies.find((c) => c.id === companyId) || companies[0];
      const employees = listEmployees(activeCompany.id);
      const cycles = listCycles(activeCompany.id);
      const evaluations = listEvaluations(activeCompany.id);
      const competencies = listCompetencies();
      const sources = listSources();
      const savedReports = listAIReports(activeCompany.id);
      const companyReport = generateCompanyAIReport(activeCompany, employees, evaluations, competencies, sources);
      return [200, { ok: true, companies, activeCompany, employees, cycles, evaluations, competencies, sources, savedReports, companyReport }];
    }
    if (method === "GET" && pathname === "/api/employee-report") {
      const companies = listCompanies();
      const companyId = params.get("companyId") || (companies[0] && companies[0].id);
      const employeeId = params.get("employeeId");
      const activeCompany = companies.find((c) => c.id === companyId) || companies[0];
      const allEmployees = listEmployees(activeCompany.id);
      const employee = allEmployees.find((e) => e.id === employeeId) || allEmployees[0];
      if (!employee) return [404, { ok: false, error: "Empleado no encontrado en esta empresa." }];
      const evaluations = listEvaluations(activeCompany.id, employee.id);
      const report = generateIndividualAIReport(employee, evaluations, listCompetencies(), listSources(), activeCompany, allEmployees);
      return [200, { ok: true, employee, evaluations, report }];
    }
    if (method === "POST" && pathname === "/api/evaluations") {
      if (!body.gesproCompanyId || !body.evaluatorId || !body.targetId || !body.direction) {
        return [400, { ok: false, error: "Faltan campos requeridos (gesproCompanyId, evaluatorId, targetId, direction)." }];
      }
      return [201, { ok: true, created: createEvaluation(body) }];
    }
    if (method === "POST" && pathname === "/api/employees") {
      if (!body.gesproCompanyId || !body.name || !body.title || !body.department) {
        return [400, { ok: false, error: "Nombre, cargo, departamento y empresa son obligatorios." }];
      }
      return [201, { ok: true, employee: createEmployee(body) }];
    }
    if (method === "POST" && pathname === "/api/ai/calibrate-sbi") {
      const result = calibrateFeedbackWithAI(body.rawText || "", body.direction || "UPWARD", body.targetName || "el colaborador", body.targetTitle || "su cargo");
      return [200, { ok: true, result }];
    }
    if (method === "POST" && pathname === "/api/ai/chat") {
      const companies = listCompanies();
      const activeCompany = companies.find((c) => c.id === body.gesproCompanyId) || companies[0];
      const reply = chatWithPsychometricAgent(body.question || "", activeCompany, listEmployees(activeCompany.id), listEvaluations(activeCompany.id), listCompetencies(), listSources());
      return [200, Object.assign({ ok: true }, reply)];
    }
    if (method === "POST" && pathname === "/api/sources/ingest") {
      if (!body.url) return [400, { ok: false, error: "Debe indicar una URL válida." }];
      const sourceObj = await ingestSpecializedWebsite(body.url, body.category || "FEEDBACK_360", body.customNotes || "");
      addSource(sourceObj);
      return [201, { ok: true, source: sourceObj, sources: listSources() }];
    }
    if (method === "POST" && pathname === "/api/reports/save") {
      const reportId = saveAIReport(body);
      return [201, { ok: true, reportId, savedReports: listAIReports(body.gesproCompanyId) }];
    }
    return [404, { ok: false, error: "Ruta no encontrada: " + pathname }];
  }

  async function apiRequest(method, url, bodyText) {
    const u = new URL(url, "http://kit-gespro.local");
    let body = {};
    if (bodyText) {
      try { body = JSON.parse(bodyText); } catch (e) { return [400, { ok: false, error: "JSON inválido" }]; }
    }
    try {
      return await handleApi(method.toUpperCase(), u.pathname, u.searchParams, body);
    } catch (err) {
      return [500, { ok: false, error: (err && err.message) || "Error interno" }];
    }
  }
`;

const engineScript = `
// Kit-GesPro GP-13 · Motor autónomo (knowledge-base + agente IA + backend local)
const KitGesProEngine = (() => {
${kb}
${agent}
${browserBackend}
  return {
    apiRequest, resetDemoData, STORE_KEY,
    SPECIALIZED_WEB_SOURCES, SOFT_SKILL_COMPETENCIES, GESPRO_COMPANIES
  };
})();
if (typeof window !== "undefined") {
  window.KitGesProEngine = KitGesProEngine;
  const nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || String(input);
    if (url.startsWith("/api/")) {
      const method = (init && init.method) || "GET";
      const bodyText = init && typeof init.body === "string" ? init.body : "";
      const [status, data] = await KitGesProEngine.apiRequest(method, url, bodyText);
      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }
    if (!nativeFetch) throw new Error("fetch no disponible");
    return nativeFetch(input, init);
  };
}
if (typeof module !== "undefined") module.exports = KitGesProEngine;
`;

const resetScript = `
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "↺ Restablecer datos demo";
  btn.title = "Borra los datos guardados en este navegador y recarga la demo original";
  btn.setAttribute("style", "position:fixed;right:14px;bottom:14px;z-index:9999;font:500 12px 'IBM Plex Sans',system-ui,sans-serif;padding:8px 12px;border-radius:999px;border:1px solid rgba(154,86,0,.45);background:rgba(255,255,255,.92);color:#9A5600;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.12)");
  btn.addEventListener("click", () => {
    if (confirm("¿Restablecer los datos de demostración? Se perderán las evaluaciones y reportes creados en este navegador.")) {
      window.KitGesProEngine.resetDemoData();
      location.reload();
    }
  });
  document.body.appendChild(btn);
});
`;

const safe = (code) => code.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "<\\!--");

let html = read("public/index.html");
const css = read("public/styles.css");
const appJs = read("public/app.js");

// Aviso visible mientras carga. Si el visor no ejecuta JavaScript (Vista Rápida de macOS,
// vista previa de Archivos en iPhone, visores de correo), el mensaje queda a la vista
// con instrucciones. Si ocurre un error, se muestra el detalle para diagnosticarlo.
const bootBanner = `
<div id="kitBootBanner" style="position:fixed;left:0;right:0;top:0;z-index:10000;padding:14px 18px;background:#FFF4E5;border-bottom:2px solid #9A5600;color:#3a2600;font:500 14px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
  <b>Cargando Kit-GesPro · Cualidades Blandas 360°…</b><br>
  <span id="kitBootMsg">Si este aviso no desaparece en unos segundos, su visor no está ejecutando JavaScript
  (por ejemplo, la <b>Vista Rápida</b> de macOS, la vista previa de <b>Archivos</b> en iPhone o un visor de correo).
  Abra el archivo directamente con <b>Safari</b>: en Mac, clic derecho sobre el archivo → <b>Abrir con</b> → <b>Safari</b>.</span>
</div>
<noscript><div style="padding:16px;background:#fde8e8;color:#7a1010;font:600 15px system-ui">JavaScript está desactivado. Actívelo en Safari → Ajustes → Seguridad → "Activar JavaScript".</div></noscript>`;

const errorScript = `
(function () {
  function show(msg) {
    var b = document.getElementById("kitBootBanner");
    var m = document.getElementById("kitBootMsg");
    if (!b || !m) return;
    b.style.display = "block";
    b.style.background = "#FDE8E8";
    b.style.borderBottomColor = "#B42318";
    m.textContent = "Ocurrió un error al iniciar: " + msg + " — Envíe este texto al equipo de soporte.";
  }
  window.__kitShowBootError = show;
  window.addEventListener("error", function (e) { show((e && e.message) || "error desconocido"); });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason; show((r && r.message) || String(r));
  });
})();
`;

const hideBannerScript = `
(function () {
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    var sel = document.getElementById("companySelect");
    if (sel && sel.options && sel.options.length > 0) {
      var b = document.getElementById("kitBootBanner");
      if (b) b.style.display = "none";
      clearInterval(timer);
    } else if (tries > 40 && window.__kitShowBootError) {
      clearInterval(timer);
      window.__kitShowBootError("la aplicación no terminó de cargar los datos (tiempo agotado).");
    }
  }, 250);
})();
`;

html = html.replace(/<body>/, () => `<body>\n${bootBanner}\n<script>\n${safe(errorScript)}\n</script>`);
html = html.replace(/<link rel="stylesheet" href="\/styles\.css">/, () => `<style>\n${css}\n</style>`);
html = html.replace(
  /<script type="module" src="\/app\.js"><\/script>/,
  () =>
    `<script>\n${safe(engineScript)}\n</script>\n<script>\n${safe(resetScript)}\n</script>\n` +
    `<script>\n(function () {\n"use strict";\n${safe(appJs)}\n})();\n</script>\n<script>\n${safe(hideBannerScript)}\n</script>`
);

if (html.includes('src="/app.js"') || html.includes('href="/styles.css"') || !html.includes("kitBootBanner")) {
  throw new Error("No se pudieron incrustar app.js, styles.css o el aviso de arranque en el HTML.");
}

const outDir = path.join(ROOT, "dist");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "kit-gespro-cualidades-blandas.html");
fs.writeFileSync(outFile, html);
fs.writeFileSync(path.join(outDir, "engine.standalone.js"), engineScript);
console.log(`✔ Versión autónoma generada: ${outFile} (${(html.length / 1024).toFixed(1)} KB)`);
