// =============================================================================
// KIT-GESPRO (GP-13) · SUITE DE PRUEBAS INTEGRALES Y VERIFICACIÓN PSICOMÉTRICA
// =============================================================================

import assert from "node:assert/strict";
import { server } from "../src/server.mjs";
import { closeDatabase } from "../src/db.mjs";

const TEST_PORT = 4599;

async function runTests() {
  await new Promise((resolve) => server.listen(TEST_PORT, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    console.log("1. Verificando /api/bootstrap y carga de empresas de GesPro...");
    const bootRes = await fetch(`${baseUrl}/api/bootstrap`);
    assert.equal(bootRes.status, 200);
    const boot = await bootRes.json();
    assert.equal(boot.ok, true);
    assert.ok(boot.companies.length >= 4, "Deben existir al menos 4 empresas del ecosistema GesPro");
    assert.equal(boot.competencies.length, 12, "Deben existir las 12 competencias blandas con escala BARS");
    assert.ok(boot.sources.length >= 12, "Deben existir al menos 12 fuentes científicas verificadas");
    assert.ok(boot.companyReport.globalKpis.igcb > 0, "El IGCB debe calcularse correctamente");

    console.log("2. Verificando /api/employee-report para Director (Diego Morales - detección de punto ciego UPWARD)...");
    const repRes = await fetch(
      `${baseUrl}/api/employee-report?companyId=cmqh9nb290000mrjuaolf17a2&employeeId=EMP-NX-01`
    );
    assert.equal(repRes.status, 200);
    const repData = await repRes.json();
    assert.equal(repData.ok, true);
    assert.ok(repData.report.metrics.overallGap >= 0.55, "Debe detectar brecha de punto ciego (Self > External) en Diego Morales");
    assert.ok(repData.report.johari_matrix.blindSpots.length > 0, "Debe clasificar competencias en Puntos Ciegos de Johari");
    assert.equal(repData.report.metrics.edmondsonZone.code, "ZONA_ANSIEDAD", "Debe ubicar en Zona de Ansiedad de Edmondson");

    console.log("3. Verificando /api/employee-report para Gerente (Sofía Ramírez - Zona de Aprendizaje y Alto Desempeño)...");
    const sofiaRes = await fetch(
      `${baseUrl}/api/employee-report?companyId=cmqh9nb290000mrjuaolf17a2&employeeId=EMP-NX-02`
    );
    const sofiaData = await sofiaRes.json();
    assert.equal(sofiaData.ok, true);
    assert.equal(sofiaData.report.metrics.edmondsonZone.code, "ZONA_APRENDIZAJE");
    assert.ok(sofiaData.report.metrics.dirAverages.UPWARD >= 4.5, "Los subordinados evalúan a Sofía con ≥ 4.5 en UPWARD");

    console.log("4. Verificando Calibrador IA SBI (/api/ai/calibrate-sbi)...");
    const calRes = await fetch(`${baseUrl}/api/ai/calibrate-sbi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText: "El gerente interrumpe cuando le explicamos un atraso y es arrogante en las juntas",
        direction: "UPWARD",
        targetName: "Diego Morales",
        targetTitle: "Director Comercial"
      })
    });
    const calData = await calRes.json();
    assert.equal(calData.ok, true);
    assert.ok(calData.result.calibrated.situation.length > 20);
    assert.ok(calData.result.calibrated.behavior.length > 20);
    assert.ok(calData.result.calibrated.impact.length > 20);
    assert.ok(
      calData.result.auditFlags.some((f) => f.code === "ALERTA_FIT_JUICIO_PERSONAL"),
      "Debe detectar etiqueta de rasgo personal ('arrogante') según Kluger & DeNisi (1996)"
    );

    console.log("5. Verificando registro de nueva evaluación 360° (/api/evaluations)...");
    const evRes = await fetch(`${baseUrl}/api/evaluations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
        evaluatorId: "EMP-NX-06",
        targetId: "EMP-NX-07",
        direction: "PEER",
        is_anonymous: true,
        scores: {
          "COMP-01": 4,
          "COMP-02": 5,
          "COMP-03": 4,
          "COMP-04": 5,
          "COMP-05": 5,
          "COMP-06": 4,
          "COMP-07": 4,
          "COMP-08": 4,
          "COMP-09": 4,
          "COMP-10": 5,
          "COMP-11": 5,
          "COMP-12": 5
        },
        sbi_situation: "Durante la migración del cliente corporativo de Lima esta semana.",
        sbi_behavior: "Valeria documentó cada caso borde contable y nos acompañó en las pruebas de validación.",
        sbi_impact: "Cerramos el paso a producción en la mitad del tiempo previsto sin incidencias.",
        growth_suggestion: "Estandarizar su plantilla de levantamiento para todos los consultores nuevos."
      })
    });
    assert.equal(evRes.status, 201);
    const evData = await evRes.json();
    assert.equal(evData.ok, true);
    assert.ok(evData.created.overallScore >= 4.4);

    console.log("6. Verificando Consultor Agente IA (/api/ai/chat)...");
    const chatRes = await fetch(`${baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
        question: "Diagnostica el liderazgo ascendente de los gerentes y directores"
      })
    });
    const chatData = await chatRes.json();
    assert.equal(chatData.ok, true);
    assert.ok(chatData.answer.includes("Project Oxygen"));
    assert.ok(chatData.citedSources.length > 0);

    console.log("7. Verificando Nutridor Web en Vivo (/api/sources/ingest)...");
    const ingRes = await fetch(`${baseUrl}/api/sources/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://www.onetonline.org/help/online/skills",
        category: "TAXONOMIA",
        customNotes: "Guía oficial O*NET sobre habilidades blandas y transferibles."
      })
    });
    assert.equal(ingRes.status, 201);
    const ingData = await ingRes.json();
    assert.equal(ingData.ok, true);
    assert.equal(ingData.source.domain, "onetonline.org");

    console.log("8. Verificando health check (/healthz)...");
    const healthRes = await fetch(`${baseUrl}/healthz`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.ok, true);
    assert.ok(["sqlite", "postgres"].includes(health.database));

    console.log("9. Verificando defensa anti-SSRF del ingestor (metadatos de la nube / red privada)...");
    for (const blockedUrl of ["http://169.254.169.254/latest/meta-data/", "http://127.0.0.1:4599/healthz", "file:///etc/passwd"]) {
      const ssrfRes = await fetch(`${baseUrl}/api/sources/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: blockedUrl, category: "TAXONOMIA" })
      });
      assert.equal(ssrfRes.status, 400, `Debe rechazar ${blockedUrl}`);
    }

    console.log("10. Verificando cabeceras de seguridad y 404 de API...");
    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    assert.ok(rootRes.headers.get("content-security-policy")?.includes("default-src 'self'"));
    assert.equal(rootRes.headers.get("x-content-type-options"), "nosniff");
    const missingRes = await fetch(`${baseUrl}/api/no-existe`);
    assert.equal(missingRes.status, 404);

    console.log(`✓ TODAS LAS PRUEBAS DE KIT-GESPRO (GP-13 CUALIDADES BLANDAS 360° + AGENTE IA) PASARON EXITOSAMENTE · BD: ${health.database}.`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await closeDatabase();
  }
}

runTests().catch((err) => {
  console.error("FALLO EN PRUEBAS:", err);
  process.exit(1);
});
