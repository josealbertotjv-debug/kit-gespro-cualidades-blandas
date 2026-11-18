// =============================================================================
// KIT-GESPRO (GP-13) · SERVIDOR HTTP + API REST Y MOTOR DE IA PSICOMÉTRICA
// Puerto por defecto: 4500
// =============================================================================

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  initDatabase,
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public");
const PORT = Number(process.env.PORT || 4500);

initDatabase();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error("Payload demasiado grande"));
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

export const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      return res.end();
    }

    const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = urlObj.pathname;

    // 1. GET /api/bootstrap
    if (req.method === "GET" && pathname === "/api/bootstrap") {
      const companies = listCompanies();
      const companyId = urlObj.searchParams.get("companyId") || companies[0]?.id;
      const activeCompany = companies.find((c) => c.id === companyId) || companies[0];
      const employees = listEmployees(activeCompany.id);
      const cycles = listCycles(activeCompany.id);
      const evaluations = listEvaluations(activeCompany.id);
      const competencies = listCompetencies();
      const sources = listSources();
      const savedReports = listAIReports(activeCompany.id);
      const companyReport = generateCompanyAIReport(activeCompany, employees, evaluations, competencies, sources);

      return sendJson(res, 200, {
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
      const companies = listCompanies();
      const companyId = urlObj.searchParams.get("companyId") || companies[0]?.id;
      const employeeId = urlObj.searchParams.get("employeeId");
      const activeCompany = companies.find((c) => c.id === companyId) || companies[0];
      const allEmployees = listEmployees(activeCompany.id);
      const employee = allEmployees.find((e) => e.id === employeeId) || allEmployees[0];
      if (!employee) {
        return sendJson(res, 404, { ok: false, error: "Empleado no encontrado en esta empresa." });
      }
      const evaluations = listEvaluations(activeCompany.id, employee.id);
      const competencies = listCompetencies();
      const sources = listSources();

      const report = generateIndividualAIReport(
        employee,
        evaluations,
        competencies,
        sources,
        activeCompany,
        allEmployees
      );

      return sendJson(res, 200, {
        ok: true,
        employee,
        evaluations,
        report
      });
    }

    // 3. POST /api/evaluations
    if (req.method === "POST" && pathname === "/api/evaluations") {
      const body = await readJsonBody(req);
      if (!body.gesproCompanyId || !body.evaluatorId || !body.targetId || !body.direction) {
        return sendJson(res, 400, {
          ok: false,
          error: "Faltan campos requeridos (gesproCompanyId, evaluatorId, targetId, direction)."
        });
      }
      const created = createEvaluation(body);
      return sendJson(res, 201, { ok: true, created });
    }

    // 4. POST /api/employees
    if (req.method === "POST" && pathname === "/api/employees") {
      const body = await readJsonBody(req);
      if (!body.gesproCompanyId || !body.name || !body.title || !body.department) {
        return sendJson(res, 400, {
          ok: false,
          error: "Nombre, cargo, departamento y empresa son obligatorios."
        });
      }
      const employee = createEmployee(body);
      return sendJson(res, 201, { ok: true, employee });
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
      return sendJson(res, 200, { ok: true, result });
    }

    // 6. POST /api/ai/chat
    if (req.method === "POST" && pathname === "/api/ai/chat") {
      const body = await readJsonBody(req);
      const companies = listCompanies();
      const activeCompany = companies.find((c) => c.id === body.gesproCompanyId) || companies[0];
      const employees = listEmployees(activeCompany.id);
      const evaluations = listEvaluations(activeCompany.id);
      const competencies = listCompetencies();
      const sources = listSources();

      const reply = chatWithPsychometricAgent(
        body.question || "",
        activeCompany,
        employees,
        evaluations,
        competencies,
        sources
      );
      return sendJson(res, 200, { ok: true, ...reply });
    }

    // 7. POST /api/sources/ingest
    if (req.method === "POST" && pathname === "/api/sources/ingest") {
      const body = await readJsonBody(req);
      if (!body.url) {
        return sendJson(res, 400, { ok: false, error: "Debe indicar una URL válida." });
      }
      const sourceObj = await ingestSpecializedWebsite(
        body.url,
        body.category || "FEEDBACK_360",
        body.customNotes || ""
      );
      addSource(sourceObj);
      return sendJson(res, 201, { ok: true, source: sourceObj, sources: listSources() });
    }

    // 8. POST /api/reports/save
    if (req.method === "POST" && pathname === "/api/reports/save") {
      const body = await readJsonBody(req);
      const reportId = saveAIReport(body);
      return sendJson(res, 201, { ok: true, reportId, savedReports: listAIReports(body.gesproCompanyId) });
    }

    // Archivos estáticos desde public/
    const filePath = pathname === "/" ? path.join(PUBLIC_DIR, "index.html") : path.join(PUBLIC_DIR, pathname);
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      const ext = path.extname(resolvedPath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      return fs.createReadStream(resolvedPath).pipe(res);
    }

    // Fallback SPA a index.html
    const indexPath = path.join(PUBLIC_DIR, "index.html");
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return fs.createReadStream(indexPath).pipe(res);
    }

    res.writeHead(404);
    res.end("Not found");
  } catch (err) {
    sendJson(res, 500, { ok: false, error: err.message || "Error interno del servidor" });
  }
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Kit-GesPro (GP-13 Cualidades Blandas 360° + Agente IA) activo en http://localhost:${PORT}`);
  });
}
