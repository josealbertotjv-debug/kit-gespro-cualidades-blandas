// =============================================================================
// KIT-GESPRO (GP-13) · SERVIDOR HTTP + API REST Y MOTOR DE IA PSICOMÉTRICA
// Puerto por defecto: 4500 (variable PORT)
// =============================================================================

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";
import {
  initDatabase,
  closeDatabase,
  pingDatabase,
  getDialect,
  listCompanies,
  listSources,
  addSource,
  listCompetencies,
  listEmployees,
  createEmployee,
  listCycles,
  listEvaluations,
  createEvaluation,
  saveAIReport,
  listAIReports
} from "./db.mjs";
import {
  generateIndividualAIReport,
  generateCompanyAIReport,
  calibrateFeedbackWithAI,
  chatWithPsychometricAgent,
  ingestSpecializedWebsite
} from "./ai-agent.mjs";
import { assertPublicUrl, createGuardedFetch } from "./net-guard.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public");
const PKG = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"));
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const guardedFetch = createGuardedFetch({ allowPrivateHosts: config.ingestAllowPrivateHosts });

await initDatabase();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    `frame-ancestors ${config.frameAncestors}`,
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ")
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function corsHeaders(req) {
  if (!config.corsOrigin) return {};
  if (config.corsOrigin === "*") {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
  }
  const allowed = config.corsOrigin.split(",").map((o) => o.trim());
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      Vary: "Origin"
    };
  }
  return {};
}

function sendJson(req, res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS,
    ...corsHeaders(req)
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, "Payload demasiado grande"));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new HttpError(400, "JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

/** Autenticación HTTP Basic opcional (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD). */
function isAuthorized(req) {
  if (!config.basicAuthUser || !config.basicAuthPassword) return true;
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const sep = decoded.indexOf(":");
  if (sep < 0) return false;
  return safeEqual(decoded.slice(0, sep), config.basicAuthUser) && safeEqual(decoded.slice(sep + 1), config.basicAuthPassword);
}

async function resolveActiveCompany(companyId) {
  const companies = await listCompanies();
  const activeCompany = companies.find((c) => c.id === companyId) || companies[0];
  if (!activeCompany) {
    throw new HttpError(503, "No hay empresas GesPro registradas en kit.soft_skill_companies.");
  }
  return { companies, activeCompany };
}

async function handleApi(req, res, urlObj) {
  const { pathname } = urlObj;

  // 1. GET /api/bootstrap
  if (req.method === "GET" && pathname === "/api/bootstrap") {
    const { companies, activeCompany } = await resolveActiveCompany(urlObj.searchParams.get("companyId"));
    const [employees, cycles, evaluations, competencies, sources, savedReports] = await Promise.all([
      listEmployees(activeCompany.id),
      listCycles(activeCompany.id),
      listEvaluations(activeCompany.id),
      listCompetencies(),
      listSources(),
      listAIReports(activeCompany.id)
    ]);
    const companyReport = generateCompanyAIReport(activeCompany, employees, evaluations, competencies, sources);

    return sendJson(req, res, 200, {
      ok: true,
      companies,
      activeCompany,
      employees,
      cycles,
      evaluations,
      competencies,
      sources,
      savedReports,
      companyReport
    });
  }

  // 2. GET /api/employee-report
  if (req.method === "GET" && pathname === "/api/employee-report") {
    const { activeCompany } = await resolveActiveCompany(urlObj.searchParams.get("companyId"));
    const employeeId = urlObj.searchParams.get("employeeId");
    const allEmployees = await listEmployees(activeCompany.id);
    const employee = allEmployees.find((e) => e.id === employeeId) || allEmployees[0];
    if (!employee) {
      return sendJson(req, res, 404, { ok: false, error: "Empleado no encontrado en esta empresa." });
    }
    const [evaluations, competencies, sources] = await Promise.all([
      listEvaluations(activeCompany.id, employee.id),
      listCompetencies(),
      listSources()
    ]);

    const report = generateIndividualAIReport(employee, evaluations, competencies, sources, activeCompany, allEmployees);

    return sendJson(req, res, 200, { ok: true, employee, evaluations, report });
  }

  // 3. POST /api/evaluations
  if (req.method === "POST" && pathname === "/api/evaluations") {
    const body = await readJsonBody(req);
    if (!body.gesproCompanyId || !body.evaluatorId || !body.targetId || !body.direction) {
      return sendJson(req, res, 400, {
        ok: false,
        error: "Faltan campos requeridos (gesproCompanyId, evaluatorId, targetId, direction)."
      });
    }
    const created = await createEvaluation(body);
    return sendJson(req, res, 201, { ok: true, created });
  }

  // 4. POST /api/employees
  if (req.method === "POST" && pathname === "/api/employees") {
    const body = await readJsonBody(req);
    if (!body.gesproCompanyId || !body.name || !body.title || !body.department) {
      return sendJson(req, res, 400, {
        ok: false,
        error: "Nombre, cargo, departamento y empresa son obligatorios."
      });
    }
    const employee = await createEmployee(body);
    return sendJson(req, res, 201, { ok: true, employee });
  }

  // 5. POST /api/ai/calibrate-sbi
  if (req.method === "POST" && pathname === "/api/ai/calibrate-sbi") {
    const body = await readJsonBody(req);
    const result = calibrateFeedbackWithAI(
      body.rawText || "",
      body.direction || "UPWARD",
      body.targetName || "el colaborador",
      body.targetTitle || "su cargo"
    );
    return sendJson(req, res, 200, { ok: true, result });
  }

  // 6. POST /api/ai/chat
  if (req.method === "POST" && pathname === "/api/ai/chat") {
    const body = await readJsonBody(req);
    const { activeCompany } = await resolveActiveCompany(body.gesproCompanyId);
    const [employees, evaluations, competencies, sources] = await Promise.all([
      listEmployees(activeCompany.id),
      listEvaluations(activeCompany.id),
      listCompetencies(),
      listSources()
    ]);

    const reply = chatWithPsychometricAgent(body.question || "", activeCompany, employees, evaluations, competencies, sources);
    return sendJson(req, res, 200, { ok: true, ...reply });
  }

  // 7. POST /api/sources/ingest
  if (req.method === "POST" && pathname === "/api/sources/ingest") {
    const body = await readJsonBody(req);
    if (!body.url) {
      return sendJson(req, res, 400, { ok: false, error: "Debe indicar una URL válida." });
    }
    let sourceObj;
    try {
      if (!config.ingestAllowPrivateHosts) await assertPublicUrl(body.url);
      sourceObj = await ingestSpecializedWebsite(body.url, body.category || "FEEDBACK_360", body.customNotes || "", {
        fetchImpl: guardedFetch
      });
    } catch (err) {
      throw new HttpError(400, err.message);
    }
    await addSource(sourceObj);
    return sendJson(req, res, 201, { ok: true, source: sourceObj, sources: await listSources() });
  }

  // 8. POST /api/reports/save
  if (req.method === "POST" && pathname === "/api/reports/save") {
    const body = await readJsonBody(req);
    if (!body.gesproCompanyId || !body.summary || !body.dossier_markdown) {
      return sendJson(req, res, 400, {
        ok: false,
        error: "Faltan campos requeridos (gesproCompanyId, summary, dossier_markdown)."
      });
    }
    const reportId = await saveAIReport(body);
    return sendJson(req, res, 201, { ok: true, reportId, savedReports: await listAIReports(body.gesproCompanyId) });
  }

  return sendJson(req, res, 404, { ok: false, error: "Ruta de API no encontrada." });
}

function serveStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400);
    return res.end("Bad request");
  }
  const filePath = decoded === "/" ? path.join(PUBLIC_DIR, "index.html") : path.join(PUBLIC_DIR, decoded);
  const resolvedPath = path.resolve(filePath);
  if (resolvedPath !== PUBLIC_DIR && !resolvedPath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  const target =
    fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile() ? resolvedPath : path.join(PUBLIC_DIR, "index.html"); // Fallback SPA

  if (!fs.existsSync(target)) {
    res.writeHead(404);
    return res.end("Not found");
  }
  const ext = path.extname(target).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    ...SECURITY_HEADERS
  });
  if (req.method === "HEAD") return res.end();
  return fs.createReadStream(target).pipe(res);
}

export const server = http.createServer(async (req, res) => {
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = urlObj.pathname;

    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders(req));
      return res.end();
    }

    // Health check (sin autenticación) para Docker / balanceador / monitoreo
    if (pathname === "/healthz" || pathname === "/api/health") {
      let dbOk = false;
      try {
        dbOk = await pingDatabase();
      } catch {
        dbOk = false;
      }
      return sendJson(req, res, dbOk ? 200 : 503, {
        ok: dbOk,
        service: PKG.name,
        version: PKG.version,
        database: getDialect(),
        uptimeSeconds: Math.round(process.uptime())
      });
    }

    if (!isAuthorized(req)) {
      res.writeHead(401, {
        "WWW-Authenticate": 'Basic realm="Kit-GesPro GP-13", charset="UTF-8"',
        "Content-Type": "text/plain; charset=utf-8"
      });
      return res.end("Autenticación requerida");
    }

    if (pathname.startsWith("/api/")) {
      return await handleApi(req, res, urlObj);
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" });
      return res.end("Method not allowed");
    }
    return serveStatic(req, res, pathname);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status >= 500) {
      console.error(`[http] ${req.method} ${req.url} →`, err);
    }
    if (res.headersSent) return res.end();
    const message = status >= 500 && config.isProduction ? "Error interno del servidor" : err.message || "Error interno del servidor";
    sendJson(req, res, status, { ok: false, error: message });
  }
});

function shutdown(signal) {
  console.log(`[server] ${signal} recibido · cerrando conexiones...`);
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  server.close(async () => {
    await closeDatabase().catch(() => {});
    process.exit(0);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (config.isProduction && (!config.basicAuthUser || !config.basicAuthPassword)) {
    console.warn(
      "[server] ADVERTENCIA: NODE_ENV=production sin BASIC_AUTH_USER/BASIC_AUTH_PASSWORD. " +
        "Asegure la autenticación en el proxy inverso (Nginx) o en el SSO de GesPro."
    );
  }
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  server.listen(config.port, config.host, () => {
    console.log(
      `Kit-GesPro (GP-13 Cualidades Blandas 360° + Agente IA) activo en http://${config.host}:${config.port} · BD: ${getDialect()} · entorno: ${config.env}`
    );
  });
}
