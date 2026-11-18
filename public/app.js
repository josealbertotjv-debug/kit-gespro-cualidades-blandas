// =============================================================================
// KIT-GESPRO (GP-13) · LÓGICA DE INTERFAZ Y VISUALIZACIÓN PSICOMÉTRICA 360°
// =============================================================================

const state = {
  companies: [],
  activeCompany: null,
  employees: [],
  cycles: [],
  evaluations: [],
  competencies: [],
  sources: [],
  companyReport: null,
  selectedEmployeeId: null,
  currentEmployeeReport: null,
  activeTab: "panel",
  filterLevel: "ALL",
  evalScores: {}
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtScore(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "S/D";
  return Number(val).toFixed(2);
}

function levelBadgeClass(lvl) {
  if (lvl === "DIRECCION") return "accent";
  if (lvl === "GERENCIA") return "blue";
  if (lvl === "SUPERVISION") return "ok";
  return "";
}

function zoneBadgeClass(zoneCode) {
  if (zoneCode === "ZONA_APRENDIZAJE") return "ok";
  if (zoneCode === "ZONA_ANSIEDAD") return "crit";
  if (zoneCode === "ZONA_CONFORT") return "warn";
  return "crit";
}

function renderMarkdownSimple(md = "") {
  return esc(md)
    .replace(/^### (.*)$/gm, '<h4 style="margin:14px 0 6px;font-size:15px;color:var(--ink)">$1</h4>')
    .replace(/^## (.*)$/gm, '<h3 style="margin:18px 0 8px;font-size:17px;border-bottom:1px solid var(--line);padding-bottom:4px">$1</h3>')
    .replace(/^# (.*)$/gm, '<h2 style="margin:0 0 8px;font-size:20px;color:var(--accent)">$1</h2>')
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>")
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--mono);font-size:12px;background:var(--surface);padding:1px 5px;border-radius:4px;border:1px solid var(--line)">$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">$1 ↗</a>');
}

// ── Inicialización de Tema ────────────────────────────────────────────────────
// localStorage puede lanzar excepción (visores sandbox, modo privado, file:// restringido)
function safeGetItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSetItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

function initTheme() {
  const root = document.documentElement;
  const saved = safeGetItem("kit-gespro-theme");
  if (saved) {
    root.setAttribute("data-theme", saved);
  }
  $("#btnThemeToggle").addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", current);
    safeSetItem("kit-gespro-theme", current);
  });
}

// ── Navegación por Pestañas ───────────────────────────────────────────────────
function switchTab(tabName) {
  state.activeTab = tabName;
  $$(".nav-tab").forEach((btn) => {
    const active = btn.dataset.tab === tabName;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  ["panel", "evaluar", "reportes", "copiloto", "fuentes"].forEach((t) => {
    const sec = $(`#view-${t}`);
    if (sec) sec.hidden = t !== tabName;
  });
  if (tabName === "reportes" && state.selectedEmployeeId) {
    loadEmployeeReport(state.selectedEmployeeId);
  }
}

// ── Carga inicial de datos desde API ──────────────────────────────────────────
async function loadBootstrap(companyId = "") {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : "";
  const res = await fetch(`/api/bootstrap${query}`);
  const data = await res.json();
  if (!data.ok) return;

  state.companies = data.companies;
  state.activeCompany = data.activeCompany;
  state.employees = data.employees;
  state.cycles = data.cycles;
  state.evaluations = data.evaluations;
  state.competencies = data.competencies;
  state.sources = data.sources;
  state.companyReport = data.companyReport;

  if (!state.selectedEmployeeId || !state.employees.some((e) => e.id === state.selectedEmployeeId)) {
    state.selectedEmployeeId = state.employees[0]?.id || null;
  }

  // Inicializar puntajes BARS por defecto (4)
  state.competencies.forEach((c) => {
    if (!state.evalScores[c.id]) state.evalScores[c.id] = 4;
  });

  renderCompanySelector();
  renderDashboardPanel();
  renderEvaluationFormSetup();
  renderEmployeeSidebar();
  renderSourcesCatalog();

  if (state.selectedEmployeeId) {
    await loadEmployeeReport(state.selectedEmployeeId);
  }
}

function renderCompanySelector() {
  const sel = $("#companySelect");
  sel.innerHTML = state.companies
    .map(
      (c) =>
        `<option value="${esc(c.id)}" ${c.id === state.activeCompany?.id ? "selected" : ""}>${esc(c.name)} (${esc(c.country)})</option>`
    )
    .join("");
}

// ── 01 · Renderizado del Tablero Organizacional 360° ──────────────────────────
function renderDashboardPanel() {
  const comp = state.activeCompany;
  const rep = state.companyReport;
  if (!comp || !rep) return;

  $("#companyEyebrow").textContent = `KIT-GESPRO · ${comp.industry.toUpperCase()} · ${comp.country.toUpperCase()}`;
  $("#companyMainTitle").textContent = `${comp.name} — Evaluación 360° de Cualidades Blandas y Liderazgo`;
  $("#companyMainDesc").textContent = comp.description || "";

  const k = rep.globalKpis;
  $("#globalKpiGrid").innerHTML = `
    <div class="kpi-card">
      <div class="kpi-top">
        <span class="kpi-code">IGCB · GLOBAL EXTERNO</span>
        <span class="badge ${k.igcb >= 4.0 ? "ok" : k.igcb >= 3.6 ? "warn" : "crit"}">BARS 1–5</span>
      </div>
      <div class="kpi-value">${fmtScore(k.igcb)}</div>
      <div class="kpi-label">Índice Global de Cualidades Blandas</div>
      <div class="kpi-sub">${k.totalEvaluations} evaluaciones 360° en ${k.evaluatedEmployees}/${k.totalEmployees} colaboradores</div>
    </div>

    <div class="kpi-card">
      <div class="kpi-top">
        <span class="kpi-code">ILA · PROJECT OXYGEN</span>
        <span class="badge blue">Subordinados → Jefes</span>
      </div>
      <div class="kpi-value">${fmtScore(k.ila)}</div>
      <div class="kpi-label">Liderazgo Ascendente (Gerentes/Directores)</div>
      <div class="kpi-sub">Evaluación de empleados hacia sus superiores</div>
    </div>

    <div class="kpi-card">
      <div class="kpi-top">
        <span class="kpi-code">ISP · EDMONDSON (HBS)</span>
        <span class="badge ${k.isp >= 3.9 ? "ok" : "warn"}">7-Item Scale</span>
      </div>
      <div class="kpi-value">${fmtScore(k.isp)}</div>
      <div class="kpi-label">Índice de Seguridad Psicológica</div>
      <div class="kpi-sub">Apertura al error honesto y disenso técnico</div>
    </div>

    <div class="kpi-card">
      <div class="kpi-top">
        <span class="kpi-code">ICHP · HORIZONTAL</span>
        <span class="badge ok">Pares ↔ Pares</span>
      </div>
      <div class="kpi-value">${fmtScore(k.ichp)}</div>
      <div class="kpi-label">Cohesión y Colaboración entre Pares</div>
      <div class="kpi-sub">Escucha activa, coordinación y servicio interáreas</div>
    </div>

    <div class="kpi-card">
      <div class="kpi-top">
        <span class="kpi-code">AUTOCONCIENCIA · CREIO</span>
        <span class="badge ${k.meanAbsGap <= 0.45 ? "ok" : "warn"}">|Auto − Externo|</span>
      </div>
      <div class="kpi-value">±${fmtScore(k.meanAbsGap)}</div>
      <div class="kpi-label">Discrepancia Media de Percepción</div>
      <div class="kpi-sub">Menor brecha indica mayor calibración emocional</div>
    </div>
  `;

  // Tabla por nivel jerárquico
  const levelNames = {
    DIRECCION: "Dirección / Alta Gerencia",
    GERENCIA: "Gerencias de Área",
    SUPERVISION: "Supervisión / Coordinación",
    OPERATIVO: "Operativo / Especialistas"
  };

  $("#hierarchyTableBody").innerHTML = rep.byHierarchy
    .map((h) => {
      const gapStr =
        h.avgGap === null || h.avgGap === undefined
          ? "S/D"
          : `${h.avgGap >= 0 ? "+" : ""}${Number(h.avgGap).toFixed(2)}`;
      const gapBadge =
        h.avgGap !== null && h.avgGap >= 0.55
          ? `<span class="badge crit">${gapStr} (Punto ciego)</span>`
          : h.avgGap !== null && h.avgGap <= -0.35
          ? `<span class="badge blue">${gapStr} (Humildad)</span>`
          : `<span class="badge ok">${gapStr}</span>`;
      return `
        <tr>
          <td><span class="badge ${levelBadgeClass(h.level)}">${esc(levelNames[h.level] || h.level)}</span></td>
          <td class="num">${h.count}</td>
          <td class="num"><b>${fmtScore(h.externalAvg)}</b></td>
          <td class="num">${fmtScore(h.upwardAvg)}</td>
          <td class="num">${fmtScore(h.peerAvg)}</td>
          <td class="num">${gapBadge}</td>
        </tr>
      `;
    })
    .join("");

  // Matriz 2x2 de Edmondson (Seguridad Psicológica vs. Exigencia/Responsabilidad)
  renderEdmondsonMatrix(rep.employeeSummaries);

  // Alertas Psicométricas del Agente IA
  $("#riskCountBadge").textContent = `${rep.riskAlerts.length} alerta(s) detectadas`;
  if (rep.riskAlerts.length === 0) {
    $("#riskAlertsList").innerHTML = `
      <div style="padding:14px;border-radius:8px;background:var(--ok-soft);border:1px solid var(--ok-line);color:var(--ok)">
        <b>Sin alertas críticas de disonancia jerárquica:</b> Todos los líderes y equipos evaluados mantienen equilibrio conductual dentro de los parámetros esperados.
      </div>
    `;
  } else {
    $("#riskAlertsList").innerHTML = rep.riskAlerts
      .map(
        (r) => `
        <div style="padding:12px 14px;border-radius:8px;border:1px solid var(--${r.severity === "CRIT" ? "crit" : "warn"}-line);background:var(--${r.severity === "CRIT" ? "crit" : "warn"}-soft)">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px">
            <b style="font-size:13.5px">${esc(r.employeeName)} · <span style="font-weight:400;color:var(--ink-2)">${esc(r.title)}</span></b>
            <span class="badge ${r.severity === "CRIT" ? "crit" : "warn"}">${esc(r.type)}</span>
          </div>
          <p style="font-size:12.5px;color:var(--ink-2)">${esc(r.detail)}</p>
        </div>
      `
      )
      .join("");
  }

  // Barras de las 12 competencias
  $("#companyCompetenciesBars").innerHTML = rep.companyCompetencyAverages
    .map((c) => {
      const ext = c.externalAvg ?? 0;
      const pct = Math.min(100, Math.max(0, (ext / 5) * 100));
      return `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px">
            <span><b class="num" style="color:var(--accent)">${esc(c.code)}</b> · ${esc(c.name)}</span>
            <span class="num">Externo: <b>${fmtScore(c.externalAvg)}</b> · Auto: ${fmtScore(c.selfAvg)}</span>
          </div>
          <div class="progress-bar"><i style="width:${pct.toFixed(1)}%"></i></div>
        </div>
      `;
    })
    .join("");

  renderEmployeeRosterTable();
  $("#companyDossierContent").innerHTML = renderMarkdownSimple(rep.dossierMarkdown);
}

function renderEdmondsonMatrix(summaries = []) {
  const evaluated = summaries.filter((s) => s.counts.total > 0);
  const width = 500;
  const height = 270;
  const pad = 38;

  // Map score 2.0..5.0 to SVG coordinates
  const toX = (acc) => {
    const clamped = Math.max(2.0, Math.min(5.0, Number(acc || 3.5)));
    return pad + ((clamped - 2.0) / 3.0) * (width - pad * 2);
  };
  const toY = (ps) => {
    const clamped = Math.max(2.0, Math.min(5.0, Number(ps || 3.5)));
    return height - pad - ((clamped - 2.0) / 3.0) * (height - pad * 2);
  };

  const midX = toX(3.7);
  const midY = toY(3.65);

  const dots = evaluated
    .map((emp) => {
      const cx = toX(emp.accountabilityIndex);
      const cy = toY(emp.psychSafetyIndex);
      const isAnx = emp.edmondsonZone.code === "ZONA_ANSIEDAD";
      const fill = isAnx ? "#B91C1C" : "#047857";
      const initials = emp.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
      return `
        <g style="cursor:pointer" data-emp-jump="${esc(emp.id)}">
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="13" fill="${fill}" fill-opacity="0.18" stroke="${fill}" stroke-width="2"></circle>
          <text x="${cx.toFixed(1)}" y="${(cy + 4).toFixed(1)}" text-anchor="middle" font-size="10" font-family="IBM Plex Mono, monospace" font-weight="600" fill="currentColor">${esc(initials)}</text>
          <title>${esc(emp.name)} (${esc(emp.title)}) — Seguridad Psicológica: ${fmtScore(emp.psychSafetyIndex)} | Exigencia: ${fmtScore(emp.accountabilityIndex)} (${esc(emp.edmondsonZone.name)})</title>
        </g>
      `;
    })
    .join("");

  $("#edmondsonMatrixContainer").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)">
      <!-- Cuadrantes -->
      <rect x="${pad}" y="${pad}" width="${midX - pad}" height="${midY - pad}" fill="rgba(180,83,9,0.06)"></rect>
      <rect x="${midX}" y="${pad}" width="${width - pad - midX}" height="${midY - pad}" fill="rgba(4,120,87,0.09)"></rect>
      <rect x="${pad}" y="${midY}" width="${midX - pad}" height="${height - pad - midY}" fill="rgba(114,123,134,0.08)"></rect>
      <rect x="${midX}" y="${midY}" width="${width - pad - midX}" height="${height - pad - midY}" fill="rgba(185,28,28,0.08)"></rect>

      <!-- Líneas divisorias -->
      <line x1="${midX}" y1="${pad}" x2="${midX}" y2="${height - pad}" stroke="var(--line-2)" stroke-dasharray="4 4" stroke-width="1.5"></line>
      <line x1="${pad}" y1="${midY}" x2="${width - pad}" y2="${midY}" stroke="var(--line-2)" stroke-dasharray="4 4" stroke-width="1.5"></line>

      <!-- Etiquetas de Cuadrantes -->
      <text x="${pad + 8}" y="${pad + 16}" font-size="10" font-family="IBM Plex Mono, monospace" fill="var(--warn)">ZONA DE CONFORT</text>
      <text x="${width - pad - 8}" y="${pad + 16}" text-anchor="end" font-size="10" font-family="IBM Plex Mono, monospace" font-weight="600" fill="var(--ok)">ZONA DE APRENDIZAJE Y ALTO DESEMPEÑO</text>
      <text x="${pad + 8}" y="${height - pad - 8}" font-size="10" font-family="IBM Plex Mono, monospace" fill="var(--ink-3)">ZONA DE APATÍA</text>
      <text x="${width - pad - 8}" y="${height - pad - 8}" text-anchor="end" font-size="10" font-family="IBM Plex Mono, monospace" font-weight="600" fill="var(--crit)">ZONA DE ANSIEDAD (RIESGO SILENCIO)</text>

      <!-- Ejes -->
      <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="11" font-family="IBM Plex Sans, sans-serif" fill="var(--ink-2)">Exigencia de Estándares y Responsabilidad (CB-01 / CB-09) →</text>
      <text x="14" y="${height / 2}" text-anchor="middle" transform="rotate(-90 14 ${height / 2})" font-size="11" font-family="IBM Plex Sans, sans-serif" fill="var(--ink-2)">Seguridad Psicológica (CB-07) →</text>

      ${dots}
    </svg>
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--ink-3);margin-top:8px;flex-wrap:wrap;gap:6px">
      <span>Toque las iniciales de cualquier colaborador o líder en la matriz para abrir su Expediente IA 360°.</span>
      <span class="num">Fuente: Amy Edmondson (HBS, 1999)</span>
    </div>
  `;

  $$("[data-emp-jump]", $("#edmondsonMatrixContainer")).forEach((g) => {
    g.addEventListener("click", () => {
      state.selectedEmployeeId = g.getAttribute("data-emp-jump");
      switchTab("reportes");
    });
  });
}

function renderEmployeeRosterTable() {
  const rep = state.companyReport;
  if (!rep) return;

  const list = rep.employeeSummaries.filter(
    (e) => state.filterLevel === "ALL" || e.hierarchy_level === state.filterLevel
  );

  $("#employeeRosterBody").innerHTML = list
    .map((emp) => {
      return `
        <tr>
          <td>
            <div style="font-weight:600">${esc(emp.name)}</div>
            <div style="font-size:12px;color:var(--ink-3)">${esc(emp.title)}</div>
          </td>
          <td>${esc(emp.department)}</td>
          <td><span class="badge ${levelBadgeClass(emp.hierarchy_level)}">${esc(emp.hierarchy_level)}</span></td>
          <td class="num">${fmtScore(emp.dirAverages.SELF)}</td>
          <td class="num">${fmtScore(emp.dirAverages.PEER)}</td>
          <td class="num"><b>${fmtScore(emp.dirAverages.UPWARD)}</b></td>
          <td class="num">${fmtScore(emp.dirAverages.DOWNWARD)}</td>
          <td class="num"><b style="color:var(--accent)">${fmtScore(emp.dirAverages.EXTERNAL)}</b></td>
          <td><span class="badge ${zoneBadgeClass(emp.edmondsonZone.code)}">${esc(emp.edmondsonZone.name.split(" (")[0])}</span></td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn sm" type="button" data-open-report="${esc(emp.id)}">Expediente IA</button>
              <button class="btn sm primary" type="button" data-eval-target="${esc(emp.id)}">Evaluar 360°</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  $$("[data-open-report]", $("#employeeRosterBody")).forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedEmployeeId = btn.getAttribute("data-open-report");
      switchTab("reportes");
    });
  });

  $$("[data-eval-target]", $("#employeeRosterBody")).forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-eval-target");
      switchTab("evaluar");
      const targetSel = $("#evalTargetSelect");
      if (targetSel) {
        targetSel.value = targetId;
        autoDetectEvaluationVector();
      }
    });
  });
}

// ── 02 · Formulario de Evaluación 360° con Escalas BARS y Calibrador SBI ────
function renderEvaluationFormSetup() {
  const evalSel = $("#evalEvaluatorSelect");
  const targSel = $("#evalTargetSelect");

  const optionsHtml = state.employees
    .map((e) => `<option value="${esc(e.id)}">${esc(e.name)} — ${esc(e.title)} (${esc(e.hierarchy_level)})</option>`)
    .join("");

  evalSel.innerHTML = optionsHtml;
  targSel.innerHTML = optionsHtml;

  // Por defecto: un empleado o gerente evalúa al Director o Gerente (Evaluación Ascendente UPWARD)
  if (state.employees.length >= 2) {
    evalSel.value = state.employees[1].id;
    targSel.value = state.employees[0].id;
  }

  autoDetectEvaluationVector();
  renderBarsCompetencyCards();
}

function autoDetectEvaluationVector() {
  const evaluatorId = $("#evalEvaluatorSelect").value;
  const targetId = $("#evalTargetSelect").value;
  const evaluator = state.employees.find((e) => e.id === evaluatorId);
  const target = state.employees.find((e) => e.id === targetId);
  const dirSelect = $("#evalDirectionSelect");

  const rankOrder = { OPERATIVO: 1, SUPERVISION: 2, GERENCIA: 3, DIRECCION: 4 };

  if (evaluator && target) {
    if (evaluator.id === target.id) {
      dirSelect.value = "SELF";
    } else if (
      evaluator.managerId === target.id ||
      rankOrder[evaluator.hierarchy_level] < rankOrder[target.hierarchy_level]
    ) {
      dirSelect.value = "UPWARD";
    } else if (
      target.managerId === evaluator.id ||
      rankOrder[evaluator.hierarchy_level] > rankOrder[target.hierarchy_level]
    ) {
      dirSelect.value = "DOWNWARD";
    } else {
      dirSelect.value = "PEER";
    }
  }
  updateVectorHintUI();
}

function updateVectorHintUI() {
  const dir = $("#evalDirectionSelect").value;
  const evaluator = state.employees.find((e) => e.id === $("#evalEvaluatorSelect").value);
  const target = state.employees.find((e) => e.id === $("#evalTargetSelect").value);

  const labels = {
    UPWARD: {
      badge: "Vector UPWARD · Subordinado evalúa a Superior / Gerente / Director",
      hint: `<b>Evaluación Ascendente hacia ${esc(target?.name || "Superior")} (${esc(target?.title || "")}):</b> Mide liderazgo psicológico seguro (Amy Edmondson, 1999), coaching sin microgestión, escucha activa y justicia en decisiones (Google Project Oxygen — <i>rework.withgoogle.com</i>). Sus respuestas se procesan bajo resguardo confidencial.`
    },
    PEER: {
      badge: "Vector PEER · Evaluación Horizontal entre Compañeros",
      hint: `<b>Evaluación Horizontal entre Pares (${esc(evaluator?.name || "")} → ${esc(target?.name || "")}):</b> Evalúa colaboración transversal, cumplimiento de acuerdos, escucha activa y resolución constructiva de desacuerdos (O*NET Social Skills & CREIO).`
    },
    DOWNWARD: {
      badge: "Vector DOWNWARD · Superior / Gerente evalúa a Subordinado",
      hint: `<b>Evaluación Descendente (${esc(evaluator?.name || "")} → ${esc(target?.name || "")}):</b> Evalúa responsabilidad y fiabilidad (Conscientiousness — Dudley et al., 2006), adaptabilidad al feedback y pensamiento crítico en el puesto.`
    },
    SELF: {
      badge: "Vector SELF · Autoevaluación para Contraste en Ventana de Johari",
      hint: `<b>Autoevaluación de ${esc(target?.name || "")}:</b> Sus puntajes se contrastarán matemáticamente con los de sus pares, subordinados y superiores para detectar Fortalezas Visibles, Talentos Ocultos y Puntos Ciegos (CREIO Accurate Self-Assessment).`
    }
  };

  const info = labels[dir] || labels.PEER;
  $("#detectedVectorBadge").textContent = info.badge;
  $("#vectorMethodologicalHint").innerHTML = info.hint;
}

function renderBarsCompetencyCards() {
  const container = $("#barsCompetenciesContainer");
  container.innerHTML = state.competencies
    .map((comp) => {
      const currentVal = state.evalScores[comp.id] || 4;
      const buttons = [1, 2, 3, 4, 5]
        .map((lvl) => {
          const anchor = comp.bars_anchors[String(lvl)] || "";
          const selClass = Number(currentVal) === lvl ? "selected" : "";
          return `
            <button type="button" class="bars-opt ${selClass}" data-comp-id="${esc(comp.id)}" data-level="${lvl}">
              <span class="lvl">Nivel ${lvl} ${lvl === 1 ? "· Riesgo" : lvl === 3 ? "· Competente" : lvl === 5 ? "· Excepcional" : ""}</span>
              <span class="anchor-text">${esc(anchor)}</span>
            </button>
          `;
        })
        .join("");

      return `
        <div class="bars-card">
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div>
              <span class="eyebrow" style="margin-bottom:2px">${esc(comp.clusterLabel)} · ${esc(comp.framework)}</span>
              <h4 style="font-size:15px"><span class="num" style="color:var(--accent)">${esc(comp.code)}</span> · ${esc(comp.name)}</h4>
            </div>
            <span class="badge accent num" id="scoreBadge-${esc(comp.id)}">Nivel seleccionado: ${currentVal} / 5</span>
          </div>
          <p style="font-size:12.5px;color:var(--ink-2);margin-top:4px">${esc(comp.description)}</p>
          <div class="bars-scale-buttons">${buttons}</div>
        </div>
      `;
    })
    .join("");

  $$(".bars-opt", container).forEach((btn) => {
    btn.addEventListener("click", () => {
      const compId = btn.getAttribute("data-comp-id");
      const lvl = Number(btn.getAttribute("data-level"));
      state.evalScores[compId] = lvl;

      $$(`.bars-opt[data-comp-id="${compId}"]`, container).forEach((b) => {
        b.classList.toggle("selected", Number(b.getAttribute("data-level")) === lvl);
      });
      const badge = $(`#scoreBadge-${compId}`);
      if (badge) badge.textContent = `Nivel seleccionado: ${lvl} / 5`;
      updateLiveAverageScore();
    });
  });

  updateLiveAverageScore();
}

function updateLiveAverageScore() {
  const vals = Object.values(state.evalScores).map(Number);
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  $("#liveAvgScoreReadout").textContent = `Promedio BARS: ${avg.toFixed(2)} / 5.00`;
}

// ── 03 · Expediente IA Individual, Radar SVG y Ventana de Johari ──────────────
function renderEmployeeSidebar() {
  $("#empSidebarCount").textContent = `${state.employees.length} personas`;
  const list = $("#reportEmployeeList");
  list.innerHTML = state.employees
    .map((emp) => {
      const active = emp.id === state.selectedEmployeeId ? "active" : "";
      return `
        <button type="button" class="emp-item ${active}" data-select-emp="${esc(emp.id)}">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${esc(emp.avatar_initials)}</div>
            <div>
              <div style="font-weight:600;font-size:13.5px;color:var(--ink)">${esc(emp.name)}</div>
              <div style="font-size:11.5px;color:var(--ink-3)">${esc(emp.title)}</div>
            </div>
          </div>
          <span class="badge ${levelBadgeClass(emp.hierarchy_level)}">${esc(emp.hierarchy_level)}</span>
        </button>
      `;
    })
    .join("");

  $$("[data-select-emp]", list).forEach((btn) => {
    btn.addEventListener("click", () => {
      const empId = btn.getAttribute("data-select-emp");
      state.selectedEmployeeId = empId;
      renderEmployeeSidebar();
      loadEmployeeReport(empId);
    });
  });
}

async function loadEmployeeReport(employeeId) {
  if (!state.activeCompany || !employeeId) return;
  const res = await fetch(
    `/api/employee-report?companyId=${encodeURIComponent(state.activeCompany.id)}&employeeId=${encodeURIComponent(employeeId)}`
  );
  const data = await res.json();
  if (!data.ok) return;

  state.currentEmployeeReport = data;
  renderEmployeeReportView(data);
}

function renderRadarSVG(breakdown = []) {
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 132;
  const n = breakdown.length || 12;

  const angleFor = (idx) => (Math.PI * 2 * idx) / n - Math.PI / 2;
  const pointFor = (idx, val) => {
    const r = (Math.max(0, Math.min(5, Number(val || 0))) / 5) * maxR;
    const a = angleFor(idx);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  // Anillos concéntricos 1 a 5
  const rings = [1, 2, 3, 4, 5]
    .map((lvl) => {
      const pts = breakdown.map((_, i) => pointFor(i, lvl).join(",")).join(" ");
      return `<polygon points="${pts}" fill="none" stroke="var(--line)" stroke-width="1"></polygon>`;
    })
    .join("");

  // Ejes y etiquetas CB-01..CB-12
  const axes = breakdown
    .map((c, i) => {
      const [x2, y2] = pointFor(i, 5);
      const [lx, ly] = pointFor(i, 5.85);
      return `
        <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--line)" stroke-width="1"></line>
        <text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" font-size="10.5" font-family="IBM Plex Mono, monospace" font-weight="600" fill="var(--ink-2)">${esc(c.code)}</text>
      `;
    })
    .join("");

  const hasExternal = breakdown.some((c) => c.externalScore !== null);
  const hasSelf = breakdown.some((c) => c.selfScore !== null);

  const extPolygon = hasExternal
    ? `<polygon points="${breakdown
        .map((c, i) => pointFor(i, c.externalScore ?? 3.5).join(","))
        .join(" ")}" fill="rgba(29, 78, 216, 0.20)" stroke="var(--blue)" stroke-width="2.4"></polygon>`
    : "";

  const selfPolygon = hasSelf
    ? `<polygon points="${breakdown
        .map((c, i) => pointFor(i, c.selfScore ?? 3.5).join(","))
        .join(" ")}" fill="rgba(154, 86, 0, 0.12)" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 3"></polygon>`
    : "";

  return `
    <svg viewBox="0 0 ${size} ${size}" style="width:100%;max-width:380px;height:auto;margin:0 auto;display:block">
      ${rings}
      ${axes}
      ${extPolygon}
      ${selfPolygon}
    </svg>
    <div style="display:flex;justify-content:center;gap:18px;font-size:12px;margin-top:8px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:6px"><i style="width:12px;height:3px;background:var(--blue);display:inline-block"></i> Observadores Externos (Pares / Subordinados / Superiores)</span>
      <span style="display:inline-flex;align-items:center;gap:6px"><i style="width:12px;height:3px;background:var(--accent);display:inline-block"></i> Autoevaluación (SELF)</span>
    </div>
  `;
}

function renderEmployeeReportView(data) {
  const { employee, evaluations, report } = data;
  const { metrics, johari_matrix, competency_breakdown, action_plan_30_60_90, cited_sources, dossier_markdown } = report;
  const { dirAverages, overallGap, edmondsonZone, counts } = metrics;

  const gapText =
    overallGap === null
      ? "S/D"
      : `${overallGap >= 0 ? "+" : ""}${overallGap.toFixed(2)} pts`;

  const container = $("#employeeReportMainArea");
  container.innerHTML = `
    <!-- Encabezado de Ficha 360° del Empleado/Líder -->
    <div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div style="display:flex;gap:14px;align-items:center">
          <div class="avatar" style="width:52px;height:52px;font-size:17px">${esc(employee.avatar_initials)}</div>
          <div>
            <span class="eyebrow" style="margin-bottom:2px">${esc(employee.department)} · ANTIGÜEDAD: ${employee.tenure_months} MESES</span>
            <h3 style="font-size:21px">${esc(employee.name)}</h3>
            <p style="color:var(--ink-2);font-size:13.5px">${esc(employee.title)} · <span class="badge ${levelBadgeClass(employee.hierarchy_level)}">${esc(employee.hierarchy_level)}</span></p>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="badge ${zoneBadgeClass(edmondsonZone.code)}">${esc(edmondsonZone.name)}</span>
          <button class="btn primary sm" type="button" id="btnEvalThisEmployee">Evaluar a ${esc(employee.name.split(" ")[0])} →</button>
        </div>
      </div>
      <p style="margin-top:12px;font-size:13px;color:var(--ink-2);padding-top:10px;border-top:1px solid var(--line)">
        <b>Misión del cargo:</b> ${esc(employee.mission || "Sin misión registrada.")}
      </p>

      <!-- Mini tira de puntajes por vector 360° -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;margin-top:14px">
        <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:7px;padding:10px 12px">
          <div style="font-family:var(--mono);font-size:10px;color:var(--ink-3)">PROMEDIO EXTERNO VALIDADO</div>
          <div class="num" style="font-size:22px;font-weight:700;color:var(--blue)">${fmtScore(dirAverages.EXTERNAL)} <span style="font-size:12px;font-weight:400">/ 5.0</span></div>
          <div style="font-size:11px;color:var(--ink-3)">${counts.total - counts.SELF} evaluador(es) externos</div>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:7px;padding:10px 12px">
          <div style="font-family:var(--mono);font-size:10px;color:var(--ink-3)">LIDERAZGO ASCENDENTE (UPWARD)</div>
          <div class="num" style="font-size:22px;font-weight:700">${fmtScore(dirAverages.UPWARD)}</div>
          <div style="font-size:11px;color:var(--ink-3)">${counts.UPWARD} subordinado(s)</div>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:7px;padding:10px 12px">
          <div style="font-family:var(--mono);font-size:10px;color:var(--ink-3)">ENTRE PARES (HORIZONTAL)</div>
          <div class="num" style="font-size:22px;font-weight:700">${fmtScore(dirAverages.PEER)}</div>
          <div style="font-size:11px;color:var(--ink-3)">${counts.PEER} compañero(s)</div>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:7px;padding:10px 12px">
          <div style="font-family:var(--mono);font-size:10px;color:var(--ink-3)">SUPERIOR DIRECTO (DOWNWARD)</div>
          <div class="num" style="font-size:22px;font-weight:700">${fmtScore(dirAverages.DOWNWARD)}</div>
          <div style="font-size:11px;color:var(--ink-3)">${counts.DOWNWARD} evaluación(es) de jefe</div>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:7px;padding:10px 12px">
          <div style="font-family:var(--mono);font-size:10px;color:var(--ink-3)">AUTOEVALUACIÓN Y BRECHA Δ</div>
          <div class="num" style="font-size:22px;font-weight:700;color:var(--accent)">${fmtScore(dirAverages.SELF)} <span style="font-size:12px">(${gapText})</span></div>
          <div style="font-size:11px;color:var(--ink-3)">Δ = Auto − Observadores</div>
        </div>
      </div>
    </div>

    <!-- Radar 360° + Matriz de Ventana de Johari -->
    <div class="grid-2" style="margin-bottom:0">
      <div class="card">
        <div class="card-header">
          <div>
            <span class="eyebrow">PERFIL PSICOMÉTRICO 12 EJES</span>
            <h3>Radar Multifuente 360° (Auto vs. Observadores)</h3>
          </div>
        </div>
        ${renderRadarSVG(competency_breakdown)}
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <span class="eyebrow">LUFT & INGHAM · CREIO SELF-AWARENESS</span>
            <h3>Ventana de Johari 360° (Mapa de Autoconciencia)</h3>
          </div>
        </div>
        <div class="johari-grid">
          <div class="johari-cell">
            <h4>1 · Área Abierta (Fortalezas) <span class="badge ok">${johari_matrix.openStrengths.length}</span></h4>
            <p class="sub">Reconocidas tanto por el evaluado como por sus pares/subordinados (≥ 3.90)</p>
            <div style="display:flex;flex-direction:column;gap:5px;font-size:12.5px">
              ${
                johari_matrix.openStrengths.length
                  ? johari_matrix.openStrengths
                      .map((c) => `<div><b class="num" style="color:var(--ok)">${esc(c.code)}</b> ${esc(c.name)} <span class="num">(${fmtScore(c.externalScore)})</span></div>`)
                      .join("")
                  : '<span style="color:var(--ink-3)">Sin competencias en este cuadrante</span>'
              }
            </div>
          </div>

          <div class="johari-cell">
            <h4>2 · Puntos Ciegos (Blind Spots) <span class="badge crit">${johari_matrix.blindSpots.length}</span></h4>
            <p class="sub">El evaluado se califica alto pero su entorno percibe brecha (Δ ≥ +0.55)</p>
            <div style="display:flex;flex-direction:column;gap:5px;font-size:12.5px">
              ${
                johari_matrix.blindSpots.length
                  ? johari_matrix.blindSpots
                      .map((c) => `<div><b class="num" style="color:var(--crit)">${esc(c.code)}</b> ${esc(c.name)} <span class="num">(Auto ${fmtScore(c.selfScore)} vs Ext ${fmtScore(c.externalScore)})</span></div>`)
                      .join("")
                  : '<span style="color:var(--ok)">Ningún punto ciego crítico detectado</span>'
              }
            </div>
          </div>

          <div class="johari-cell">
            <h4>3 · Talentos Ocultos (Humildad) <span class="badge blue">${johari_matrix.hiddenTalents.length}</span></h4>
            <p class="sub">El entorno valora al colaborador por encima de su propia autoevaluación</p>
            <div style="display:flex;flex-direction:column;gap:5px;font-size:12.5px">
              ${
                johari_matrix.hiddenTalents.length
                  ? johari_matrix.hiddenTalents
                      .map((c) => `<div><b class="num" style="color:var(--blue)">${esc(c.code)}</b> ${esc(c.name)} <span class="num">(Auto ${fmtScore(c.selfScore)} vs Ext ${fmtScore(c.externalScore)})</span></div>`)
                      .join("")
                  : '<span style="color:var(--ink-3)">Sin subestimaciones marcadas</span>'
              }
            </div>
          </div>

          <div class="johari-cell">
            <h4>4 · Zona Crítica Prioritaria <span class="badge warn">${johari_matrix.criticalZones.length}</span></h4>
            <p class="sub">Competencias con calificación externa menor a 3.60 para foco en PDI</p>
            <div style="display:flex;flex-direction:column;gap:5px;font-size:12.5px">
              ${
                johari_matrix.criticalZones.length
                  ? johari_matrix.criticalZones
                      .map((c) => `<div><b class="num" style="color:var(--warn)">${esc(c.code)}</b> ${esc(c.name)} <span class="num">(${fmtScore(c.externalScore)}/5.0)</span></div>`)
                      .join("")
                  : '<span style="color:var(--ok)">Todas las competencias superan el umbral 3.60</span>'
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plan de Desarrollo Individual 30-60-90 Días generado por IA -->
    <div class="card">
      <div class="card-header">
        <div>
          <span class="eyebrow">SMITHER, LONDON & REILLY (2005) · KLUGER & DENISI (1996) FIT</span>
          <h3>Plan de Desarrollo Individual (PDI 30-60-90 Días) Recomendado por el Agente IA</h3>
        </div>
        <span class="badge accent">Enfoque 100% Conductual</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">
        ${[action_plan_30_60_90.days30, action_plan_30_60_90.days60, action_plan_30_60_90.days90]
          .map(
            (p) => `
            <div style="background:var(--surface-2);border:1px solid var(--line);border-radius:8px;padding:14px">
              <span class="eyebrow">${esc(p.phase)}</span>
              <h4 style="font-size:14.5px;margin-bottom:6px">${esc(p.focusCompetency)}</h4>
              <p style="font-size:12.5px;color:var(--ink-2);margin-bottom:8px">${renderMarkdownSimple(p.objective)}</p>
              <ul style="padding-left:16px;margin:0 0 10px;font-size:12.5px;display:flex;flex-direction:column;gap:5px">
                ${p.actions.map((a) => `<li>${renderMarkdownSimple(a)}</li>`).join("")}
              </ul>
              <div style="font-size:11.5px;padding-top:8px;border-top:1px solid var(--line);color:var(--ok)">
                <b>Indicador de éxito:</b> ${esc(p.measurableIndicator)}
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    </div>

    <!-- Evidencias Cualitativas SBI Recibidas -->
    <div class="card">
      <div class="card-header">
        <div>
          <span class="eyebrow">CENTER FOR CREATIVE LEADERSHIP (CCL.ORG) · MÉTODO SBI</span>
          <h3>Evidencias Conductuales Observadas (${evaluations.length} registros)</h3>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${evaluations
          .map(
            (ev) => `
            <div style="border:1px solid var(--line);border-radius:8px;padding:12px 14px;background:var(--surface-2)">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
                <div>
                  <span class="badge ${ev.direction === "UPWARD" ? "blue" : ev.direction === "PEER" ? "ok" : "accent"}">Vector ${esc(ev.direction)}</span>
                  <span style="font-size:12.5px;color:var(--ink-2);margin-left:6px">
                    ${ev.is_anonymous && ev.direction !== "SELF" ? "Evaluador Confidencial (Anónimo Agregado)" : esc(ev.evaluatorName || "Evaluador")}
                  </span>
                </div>
                <span class="num" style="font-weight:600">Promedio BARS: ${fmtScore(ev.overall_score)} / 5.00</span>
              </div>
              <div style="font-size:13px;display:grid;gap:4px">
                <div><b>S · Situación:</b> ${esc(ev.sbi_situation)}</div>
                <div><b>B · Conducta observable:</b> ${esc(ev.sbi_behavior)}</div>
                <div><b>I · Impacto:</b> ${esc(ev.sbi_impact)}</div>
                ${ev.growth_suggestion ? `<div style="color:var(--accent)"><b>Feedforward (Mejora sugerida):</b> ${esc(ev.growth_suggestion)}</div>` : ""}
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    </div>

    <!-- Expediente Completo en Markdown con Citas Verificadas -->
    <div class="card">
      <div class="card-header">
        <div>
          <span class="eyebrow">EXPEDIENTE TÉCNICO AUDITABLE · CITAS VERIFICADAS</span>
          <h3>Informe Completo del Agente de IA Psicométrica</h3>
        </div>
        <span class="badge ok">${cited_sources.length} fuentes científicas citadas</span>
      </div>
      <div class="dossier-box">${renderMarkdownSimple(dossier_markdown)}</div>
    </div>
  `;

  $("#btnEvalThisEmployee")?.addEventListener("click", () => {
    switchTab("evaluar");
    $("#evalTargetSelect").value = employee.id;
    autoDetectEvaluationVector();
  });
}

// ── 05 · Catálogo de Sitios Web Especializados (Base Científica RAG) ──────────
function renderSourcesCatalog() {
  $("#totalSourcesCountBadge").textContent = `${state.sources.length} sitios científicos indexados`;
  $("#sourcesCatalogGrid").innerHTML = state.sources
    .map(
      (s) => `
      <article class="card" style="display:flex;flex-direction:column;justify-content:space-between;gap:12px">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">
            <span class="badge accent">${esc(s.category)}</span>
            <span class="badge ok num">${esc(s.domain)} · ${s.year}</span>
          </div>
          <h3 style="font-size:15.5px;margin-bottom:4px">
            <a href="${esc(s.url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${esc(s.title)} ↗</a>
          </h3>
          <p style="font-size:12px;color:var(--ink-3);margin-bottom:8px">${esc(s.institution)} · ${esc(s.authors)}</p>
          <p style="font-size:13px;color:var(--ink-2);margin-bottom:10px">${esc(s.summary)}</p>

          <div style="border-top:1px solid var(--line);padding-top:8px">
            <span class="eyebrow" style="margin-bottom:4px">APORTES VERIFICADOS PARA EL AGENTE IA</span>
            <ul style="padding-left:16px;margin:0;font-size:12px;color:var(--ink-2);display:flex;flex-direction:column;gap:4px">
              ${(s.key_findings || []).map((f) => `<li>${esc(f)}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div style="padding-top:8px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center">
          <span class="num" style="font-size:11px;color:var(--ink-3)">ID: ${esc(s.id)}</span>
          <a href="${esc(s.url)}" target="_blank" rel="noopener" class="btn sm">Abrir Sitio Oficial ↗</a>
        </div>
      </article>
    `
    )
    .join("");
}

// ── Eventos de Interacción ────────────────────────────────────────────────────
function bindEvents() {
  // Cambio de pestaña
  $$(".nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Cambio de empresa
  $("#companySelect").addEventListener("change", (e) => {
    state.selectedEmployeeId = null;
    loadBootstrap(e.target.value);
  });

  // Filtro de nivel en tablero
  $("#filterLevelSelect").addEventListener("change", (e) => {
    state.filterLevel = e.target.value;
    renderEmployeeRosterTable();
  });

  // Botones rápidos del héroe
  $("#btnQuickEvaluate").addEventListener("click", () => switchTab("evaluar"));
  $("#btnGoToEvaluateFromHero").addEventListener("click", () => switchTab("evaluar"));

  $("#btnOpenCompanyDossier").addEventListener("click", () => {
    const card = $("#companyDossierCard");
    card.hidden = false;
    card.scrollIntoView({ behavior: "smooth" });
  });
  $("#btnCloseCompanyDossier").addEventListener("click", () => {
    $("#companyDossierCard").hidden = true;
  });
  $("#btnPrintCompanyDossier").addEventListener("click", () => window.print());
  $("#btnPrintEmployeeReport").addEventListener("click", () => window.print());

  // Guardar expediente IA en historial
  $("#btnSaveEmployeeReport").addEventListener("click", async () => {
    if (!state.currentEmployeeReport || !state.activeCompany) return;
    const { employee, report } = state.currentEmployeeReport;
    const res = await fetch("/api/reports/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gesproCompanyId: state.activeCompany.id,
        targetEmployeeId: employee.id,
        report_type: "INDIVIDUAL_360",
        summary: report.summary,
        metrics: report.metrics,
        johari_matrix: report.johari_matrix,
        action_plan_30_60_90: report.action_plan_30_60_90,
        cited_sources: report.cited_sources,
        dossier_markdown: report.dossier_markdown,
        model: report.model
      })
    });
    const out = await res.json();
    if (out.ok) {
      const btn = $("#btnSaveEmployeeReport");
      const prev = btn.textContent;
      btn.textContent = "✓ Expediente Guardado en Base de Datos";
      setTimeout(() => {
        btn.textContent = prev;
      }, 2500);
    }
  });

  // Selectores de evaluador y evaluado en pestaña 02
  $("#evalEvaluatorSelect").addEventListener("change", autoDetectEvaluationVector);
  $("#evalTargetSelect").addEventListener("change", autoDetectEvaluationVector);
  $("#evalDirectionSelect").addEventListener("change", updateVectorHintUI);

  // Calibrador IA SBI en pestaña 02
  $("#btnCalibrateSbiAi").addEventListener("click", async () => {
    const rawText = $("#rawFeedbackDraft").value;
    const direction = $("#evalDirectionSelect").value;
    const target = state.employees.find((e) => e.id === $("#evalTargetSelect").value);

    const res = await fetch("/api/ai/calibrate-sbi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText,
        direction,
        targetName: target?.name || "el evaluado",
        targetTitle: target?.title || "su cargo"
      })
    });
    const data = await res.json();
    if (data.ok && data.result) {
      const { calibrated, scientificRationale, auditFlags } = data.result;
      $("#sbiSituationInput").value = calibrated.situation;
      $("#sbiBehaviorInput").value = calibrated.behavior;
      $("#sbiImpactInput").value = calibrated.impact;
      $("#sbiGrowthInput").value = calibrated.growthSuggestion;

      const notice = $("#sbiAiCalibrationNotice");
      notice.hidden = false;
      const flagsHtml =
        auditFlags && auditFlags.length
          ? `<br><span style="color:var(--warn)"><b>Nota psicométrica:</b> ${auditFlags.map((f) => esc(f.label)).join(" · ")}</span>`
          : "";
      notice.innerHTML = `<b>✓ Calibrado por el Agente IA:</b> ${esc(scientificRationale)}${flagsHtml}`;
    }
  });

  // Envío del formulario de Evaluación 360°
  $("#evaluationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.activeCompany) return;

    const targetId = $("#evalTargetSelect").value;
    const payload = {
      gesproCompanyId: state.activeCompany.id,
      evaluatorId: $("#evalEvaluatorSelect").value,
      targetId,
      direction: $("#evalDirectionSelect").value,
      is_anonymous: $("#evalAnonSelect").value === "true",
      scores: { ...state.evalScores },
      sbi_situation: $("#sbiSituationInput").value,
      sbi_behavior: $("#sbiBehaviorInput").value,
      sbi_impact: $("#sbiImpactInput").value,
      growth_suggestion: $("#sbiGrowthInput").value
    };

    const res = await fetch("/api/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const out = await res.json();
    if (out.ok) {
      $("#evalSubmitFeedback").innerHTML =
        `<b>✓ Evaluación 360° registrada (ID: ${esc(out.created.id)}, Promedio BARS: ${fmtScore(out.created.overallScore)}/5.0).</b> Redirigiendo al Expediente IA actualizado...`;
      state.selectedEmployeeId = targetId;
      await loadBootstrap(state.activeCompany.id);
      setTimeout(() => {
        $("#evalSubmitFeedback").textContent = "";
        switchTab("reportes");
      }, 900);
    }
  });

  // Chat con el Consultor Agente IA
  const sendChatQuestion = async (questionText) => {
    if (!questionText.trim() || !state.activeCompany) return;
    const msgBox = $("#aiChatMessages");
    msgBox.innerHTML += `
      <div class="chat-bubble user">
        <div style="font-size:11px;font-family:var(--mono);color:var(--accent);margin-bottom:3px">USTED</div>
        <div>${esc(questionText)}</div>
      </div>
    `;
    msgBox.scrollTop = msgBox.scrollHeight;

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gesproCompanyId: state.activeCompany.id,
        question: questionText
      })
    });
    const data = await res.json();
    if (data.ok) {
      const cites = (data.citedSources || [])
        .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" class="badge accent">${esc(s.domain)} (${s.year}) ↗</a>`)
        .join(" ");
      msgBox.innerHTML += `
        <div class="chat-bubble agent">
          <div style="font-size:11px;font-family:var(--mono);color:var(--blue);margin-bottom:5px">AGENTE IA PSICOMÉTRICO KIT-GESPRO</div>
          <div style="line-height:1.6">${renderMarkdownSimple(data.answer)}</div>
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--line);display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            <span style="font-size:11px;color:var(--ink-3)">Fuentes verificadas:</span> ${cites}
          </div>
        </div>
      `;
      msgBox.scrollTop = msgBox.scrollHeight;
    }
  };

  $("#aiChatForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = $("#aiChatInput");
    const q = inp.value;
    inp.value = "";
    sendChatQuestion(q);
  });

  $$("[data-prompt]", $("#quickPromptsList")).forEach((btn) => {
    btn.addEventListener("click", () => {
      sendChatQuestion(btn.getAttribute("data-prompt"));
    });
  });

  // Ingestor Web en Vivo (Pestaña 05)
  $("#ingestSourceForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = $("#sourceUrlInput").value.trim();
    const category = $("#sourceCategoryInput").value;
    const customNotes = $("#sourceNotesInput").value.trim();
    const statusEl = $("#ingestStatusMsg");
    statusEl.hidden = false;
    statusEl.textContent = "Indexando y verificando contenido del sitio especializado...";

    const res = await fetch("/api/sources/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, category, customNotes })
    });
    const data = await res.json();
    if (data.ok) {
      state.sources = data.sources;
      renderSourcesCatalog();
      $("#sourceUrlInput").value = "";
      $("#sourceNotesInput").value = "";
      statusEl.innerHTML = `<b>✓ Sitio especializado incorporado al Agente IA:</b> ${esc(data.source.title)} (<code>${esc(data.source.domain)}</code>).`;
    } else {
      statusEl.innerHTML = `<span style="color:var(--crit)">Error: ${esc(data.error)}</span>`;
    }
  });

  $$("[data-quick-url]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("#sourceUrlInput").value = btn.getAttribute("data-quick-url");
      $("#sourceCategoryInput").value = btn.getAttribute("data-quick-cat");
      $("#sourceNotesInput").value = btn.getAttribute("data-quick-note");
      $("#ingestSourceForm").requestSubmit();
    });
  });

  // Modal de Alta de Empleado / Gerente / Director
  const openEmpModal = () => {
    const mgrSel = $("#newEmpManager");
    mgrSel.innerHTML =
      `<option value="">Sin jefe directo (Dirección General / Junta)</option>` +
      state.employees
        .map((e) => `<option value="${esc(e.id)}">${esc(e.name)} (${esc(e.title)})</option>`)
        .join("");
    $("#modalNewEmployee").hidden = false;
  };
  const closeEmpModal = () => {
    $("#modalNewEmployee").hidden = true;
  };
  $("#btnNewEmployeeModal").addEventListener("click", openEmpModal);
  $("#btnCloseEmployeeModal").addEventListener("click", closeEmpModal);
  $("#btnCancelEmployeeModal").addEventListener("click", closeEmpModal);

  $("#newEmployeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.activeCompany) return;
    const payload = {
      gesproCompanyId: state.activeCompany.id,
      name: $("#newEmpName").value.trim(),
      title: $("#newEmpTitle").value.trim(),
      department: $("#newEmpDept").value.trim(),
      hierarchy_level: $("#newEmpLevel").value,
      managerId: $("#newEmpManager").value || null,
      mission: $("#newEmpMission").value.trim()
    };
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const out = await res.json();
    if (out.ok) {
      closeEmpModal();
      $("#newEmployeeForm").reset();
      state.selectedEmployeeId = out.employee.id;
      await loadBootstrap(state.activeCompany.id);
    }
  });
}

// ── Inicialización ────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  bindEvents();
  await loadBootstrap();

  // Mensaje inicial de bienvenida en el Consultor IA
  const msgBox = $("#aiChatMessages");
  if (msgBox && msgBox.children.length === 0) {
    msgBox.innerHTML = `
      <div class="chat-bubble agent">
        <div style="font-size:11px;font-family:var(--mono);color:var(--blue);margin-bottom:5px">AGENTE IA PSICOMÉTRICO KIT-GESPRO</div>
        <div>
          Bienvenido al copiloto psicométrico de <b>Kit-GesPro (GP-13)</b>. Estoy nutrido con los marcos verificados de <b>O*NET OnLine</b>, <b>Consortium for Research on Emotional Intelligence in Organizations (CREIO)</b>, <b>Google Project Oxygen</b>, <b>Amy Edmondson (Harvard Business School)</b> y <b>Center for Creative Leadership (SBI)</b>.<br><br>
          Seleccione una consulta sugerida a la izquierda o pregunte por cualquier empleado, gerente o director para obtener un diagnóstico basado en evidencia.
        </div>
      </div>
    `;
  }
});
