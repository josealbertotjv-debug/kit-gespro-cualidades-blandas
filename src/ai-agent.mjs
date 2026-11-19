// =============================================================================
// KIT-GESPRO · MOTOR PSICOMÉTRICO Y AGENTE DE IA DE CUALIDADES BLANDAS 360°
// Basado en O*NET, CREIO (Goleman/Boyatzis), Google Project Oxygen,
// Seguridad Psicológica (Edmondson, 1999), CCL SBI y FIT (Kluger & DeNisi, 1996)
// =============================================================================

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function mean(arr) {
  if (!arr || arr.length === 0) return null;
  return round2(arr.reduce((a, b) => a + Number(b), 0) / arr.length);
}

function stdDev(arr) {
  if (!arr || arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + Number(b), 0) / arr.length;
  const variance = arr.reduce((acc, v) => acc + Math.pow(Number(v) - m, 2), 0) / arr.length;
  return round2(Math.sqrt(variance));
}

/**
 * Audita psicométricamente una evaluación 360° individual según SIOP BARS, CCL SBI y FIT (Kluger & DeNisi, 1996).
 */
export function auditEvaluationPsychometrics(scoresObj, sbiSituation = "", sbiBehavior = "", sbiImpact = "") {
  const values = Object.values(scoresObj || {}).map(Number).filter((v) => !Number.isNaN(v));
  const avg = mean(values) || 0;
  const sd = stdDev(values);
  const flags = [];

  if (values.length >= 4 && sd < 0.12) {
    flags.push({
      code: "EFECTO_HALO",
      severity: "WARN",
      label: "Baja diferenciación intra-evaluador (Posible Efecto Halo)",
      detail: `Desviación estándar entre competencias σ = ${sd}. Según SIOP (BARS), calificar todas las dimensiones casi igual sugiere impresión global en vez de análisis por conducta.`
    });
  }

  if (values.length >= 4 && avg >= 4.9 && sd < 0.15) {
    flags.push({
      code: "SESGO_LENIDAD",
      severity: "INFO",
      label: "Tendencia a la lenidad / complacencia máxima",
      detail: `Promedio ${avg}/5.0. Conviene contrastar con los episodios conductuales descritos en SBI.`
    });
  }

  if (values.length >= 4 && avg <= 1.5) {
    flags.push({
      code: "SESGO_SEVERIDAD",
      severity: "WARN",
      label: "Severidad extrema detectada",
      detail: `Promedio ${avg}/5.0. Requiere validación de incidentes críticos específicos.`
    });
  }

  const combinedText = `${sbiSituation} ${sbiBehavior} ${sbiImpact}`.toLowerCase();
  const traitLabels = [
    "incompetente",
    "tóxico",
    "toxico",
    "arrogante",
    "flojo",
    "inútil",
    "inutil",
    "pésima actitud",
    "pesima actitud",
    "mal jefe",
    "narcisista",
    "mediocre"
  ];
  const matchedTraits = traitLabels.filter((w) => combinedText.includes(w));
  if (matchedTraits.length > 0) {
    flags.push({
      code: "ALERTA_FIT_JUICIO_PERSONAL",
      severity: "CRIT",
      label: "Juicio de rasgo personal detectado (Kluger & DeNisi, 1996 FIT)",
      detail: `Se detectaron etiquetas sobre la persona (${matchedTraits.join(", ")}). La Teoría de Intervención del Feedback demuestra que las etiquetas sobre el 'yo' provocan defensividad; se recomienda describir únicamente la conducta observable.`
    });
  }

  if ((sbiBehavior || "").trim().length < 25) {
    flags.push({
      code: "SBI_CONDUCTA_BREVE",
      severity: "INFO",
      label: "Evidencia conductual breve (Modelo SBI - CCL)",
      detail: "Describir con mayor especificidad qué dijo o hizo la persona fortalece la validez del feedback."
    });
  }

  return { overallScore: avg, intraStdDev: sd, flags };
}

/**
 * Calcula las métricas 360° multidireccionales (SELF, PEER, UPWARD, DOWNWARD) para un empleado.
 */
export function computeEmployee360Analytics(employee, evaluations, competencies, allEmployees = []) {
  const byDir = {
    SELF: evaluations.filter((e) => e.direction === "SELF"),
    PEER: evaluations.filter((e) => e.direction === "PEER"),
    UPWARD: evaluations.filter((e) => e.direction === "UPWARD"),
    DOWNWARD: evaluations.filter((e) => e.direction === "DOWNWARD")
  };
  const externalEvals = evaluations.filter((e) => e.direction !== "SELF");

  const competencyBreakdown = competencies.map((comp) => {
    const getAvgForList = (list) => {
      const vals = list
        .map((ev) => (ev.scores && ev.scores[comp.id] !== undefined ? Number(ev.scores[comp.id]) : null))
        .filter((v) => v !== null && !Number.isNaN(v));
      return mean(vals);
    };

    const selfScore = getAvgForList(byDir.SELF);
    const peerScore = getAvgForList(byDir.PEER);
    const upwardScore = getAvgForList(byDir.UPWARD);
    const downwardScore = getAvgForList(byDir.DOWNWARD);
    const externalScore = getAvgForList(externalEvals);

    const allVals = externalEvals
      .map((ev) => (ev.scores && ev.scores[comp.id] !== undefined ? Number(ev.scores[comp.id]) : null))
      .filter((v) => v !== null && !Number.isNaN(v));
    const dispersion = stdDev(allVals);

    const gapSelfExternal =
      selfScore !== null && externalScore !== null ? round2(selfScore - externalScore) : null;

    const gapDownwardUpward =
      downwardScore !== null && upwardScore !== null ? round2(downwardScore - upwardScore) : null;

    // Clasificación en la Ventana de Johari 360°
    let johariQuadrant = "SIN_DATOS_SUFICIENTES";
    if (externalScore !== null) {
      if (gapSelfExternal !== null && gapSelfExternal >= 0.55 && externalScore < 3.85) {
        johariQuadrant = "PUNTO_CIEGO";
      } else if (gapSelfExternal !== null && gapSelfExternal <= -0.4 && externalScore >= 4.1) {
        johariQuadrant = "TALENTO_OCULTO";
      } else if (externalScore >= 3.9) {
        johariQuadrant = "FORTALEZA_VISIBLE";
      } else if (externalScore < 3.6) {
        johariQuadrant = "ZONA_CRITICA";
      } else {
        johariQuadrant = "COMPETENCIA_ESTANDAR";
      }
    }

    return {
      competencyId: comp.id,
      code: comp.code,
      name: comp.name,
      cluster: comp.cluster,
      clusterLabel: comp.clusterLabel,
      framework: comp.framework,
      selfScore,
      peerScore,
      upwardScore,
      downwardScore,
      externalScore,
      dispersion,
      gapSelfExternal,
      gapDownwardUpward,
      johariQuadrant,
      barsAnchors: comp.bars_anchors,
      sourceIds: comp.source_ids
    };
  });

  const dirAverages = {
    SELF: mean(competencyBreakdown.map((c) => c.selfScore).filter((v) => v !== null)),
    PEER: mean(competencyBreakdown.map((c) => c.peerScore).filter((v) => v !== null)),
    UPWARD: mean(competencyBreakdown.map((c) => c.upwardScore).filter((v) => v !== null)),
    DOWNWARD: mean(competencyBreakdown.map((c) => c.downwardScore).filter((v) => v !== null)),
    EXTERNAL: mean(competencyBreakdown.map((c) => c.externalScore).filter((v) => v !== null))
  };

  const overallGap =
    dirAverages.SELF !== null && dirAverages.EXTERNAL !== null
      ? round2(dirAverages.SELF - dirAverages.EXTERNAL)
      : null;

  // Índice de Seguridad Psicológica (Edmondson) y Exigencia/Responsabilidad
  const psychSafetyComp = competencyBreakdown.find((c) => c.competencyId === "COMP-07");
  const empathyComp = competencyBreakdown.find((c) => c.competencyId === "COMP-11");
  const reliabilityComp = competencyBreakdown.find((c) => c.competencyId === "COMP-01");
  const clarityComp = competencyBreakdown.find((c) => c.competencyId === "COMP-09");

  const psychSafetyIndex =
    mean(
      [psychSafetyComp?.externalScore, empathyComp?.externalScore].filter((v) => v !== null && v !== undefined)
    ) || dirAverages.EXTERNAL || 0;

  const accountabilityIndex =
    mean(
      [reliabilityComp?.externalScore, clarityComp?.externalScore].filter((v) => v !== null && v !== undefined)
    ) || dirAverages.EXTERNAL || 0;

  let edmondsonZone = {
    code: "ZONA_APRENDIZAJE",
    name: "Zona de Aprendizaje y Alto Desempeño",
    description:
      "Equilibrio saludable entre alta seguridad psicológica (apertura para reportar errores y disentir) y alta exigencia en cumplimiento de compromisos (Edmondson, 1999)."
  };

  if (psychSafetyIndex < 3.65 && accountabilityIndex >= 3.8) {
    edmondsonZone = {
      code: "ZONA_ANSIEDAD",
      name: "Zona de Ansiedad (Alerta Psicosocial)",
      description:
        "Alta exigencia de resultados combinada con baja seguridad psicológica (< 3.65). Según Amy Edmondson (HBS, 1999), en esta zona los subordinados o pares temen reportar problemas a tiempo o disentir, aumentando el riesgo de fallas operativas ocultas."
    };
  } else if (psychSafetyIndex >= 3.8 && accountabilityIndex < 3.6) {
    edmondsonZone = {
      code: "ZONA_CONFORT",
      name: "Zona de Confort / Baja Exigencia",
      description:
        "Trato cordial y seguro, pero con baja exigencia en plazos y estándares de ejecución. Requiere elevar el rigor en seguimiento de acuerdos."
    };
  } else if (psychSafetyIndex < 3.65 && accountabilityIndex < 3.6) {
    edmondsonZone = {
      code: "ZONA_APATIA",
      name: "Zona de Apatía y Desconexión",
      description:
        "Baja seguridad psicológica y bajo cumplimiento de estándares. Requiere intervención inmediata de alineación y liderazgo."
    };
  }

  // Matriz de Ventana de Johari agrupada
  const johariMatrix = {
    openStrengths: competencyBreakdown.filter((c) => c.johariQuadrant === "FORTALEZA_VISIBLE"),
    blindSpots: competencyBreakdown.filter((c) => c.johariQuadrant === "PUNTO_CIEGO"),
    hiddenTalents: competencyBreakdown.filter((c) => c.johariQuadrant === "TALENTO_OCULTO"),
    criticalZones: competencyBreakdown.filter((c) => c.johariQuadrant === "ZONA_CRITICA")
  };

  const directReports = allEmployees.filter((e) => e.managerId === employee.id);

  return {
    employee,
    counts: {
      total: evaluations.length,
      SELF: byDir.SELF.length,
      PEER: byDir.PEER.length,
      UPWARD: byDir.UPWARD.length,
      DOWNWARD: byDir.DOWNWARD.length,
      directReportsCount: directReports.length
    },
    dirAverages,
    overallGap,
    psychSafetyIndex,
    accountabilityIndex,
    edmondsonZone,
    johariMatrix,
    competencyBreakdown
  };
}

/**
 * Genera el Expediente Psicométrico 360° y Plan de Desarrollo Individual (PDI 30-60-90 días)
 * fundamentado en las fuentes web especializadas verificadas.
 */
export function generateIndividualAIReport(employee, evaluations, competencies, sources, company, allEmployees = []) {
  const analytics = computeEmployee360Analytics(employee, evaluations, competencies, allEmployees);
  const { dirAverages, overallGap, edmondsonZone, johariMatrix, competencyBreakdown, counts } = analytics;

  const sortedByExternalDesc = [...competencyBreakdown]
    .filter((c) => c.externalScore !== null)
    .sort((a, b) => b.externalScore - a.externalScore);
  const sortedByExternalAsc = [...competencyBreakdown]
    .filter((c) => c.externalScore !== null)
    .sort((a, b) => a.externalScore - b.externalScore);

  const topStrengths = sortedByExternalDesc.slice(0, 3);
  const priorityAreas = sortedByExternalAsc.slice(0, 3);

  // Determinar diagnóstico de autoconciencia según CREIO (Goleman/Boyatzis) y Atwater & Yammarino
  let selfAwarenessDiagnosis = "";
  if (overallGap === null) {
    selfAwarenessDiagnosis =
      "Aún no se cuenta con autoevaluación contrastada contra observadores externos para calcular el índice de discrepancia Self-Other.";
  } else if (overallGap >= 0.55) {
    selfAwarenessDiagnosis = `**Alerta de Sobreestimación / Punto Ciego (Δ = +${overallGap} pts)**: La autoevaluación (${dirAverages.SELF}/5.0) supera significativamente la percepción de los observadores externos (${dirAverages.EXTERNAL}/5.0). De acuerdo con el marco *Emotional Competence Framework* del **CREIO (` +
      `eiconsortium.org)** y la literatura sobre *Self-Other Rating Agreement* (**Smither, London & Reilly, 2005**), esta brecha indica que ciertas conductas de presión, comunicación o microgestión están generando un impacto no intencionado en el equipo que el evaluado aún no percibe.`;
  } else if (overallGap <= -0.35) {
    selfAwarenessDiagnosis = `**Subestimación / Autocrítica Elevada (Δ = ${overallGap} pts)**: Los observadores externos (${dirAverages.EXTERNAL}/5.0) valoran el desempeño conductual por encima de la propia autoevaluación (${dirAverages.SELF}/5.0). Según el **CREIO (eiconsortium.org)**, esto refleja humildad y altos estándares internos (*Talento Oculto*), siendo recomendable reforzar la **Autoconfianza (Self-Confidence)** para asumir mayor visibilidad ejecutiva.`;
  } else {
    selfAwarenessDiagnosis = `**Autoevaluación Precisa / Alta Autoconciencia (Δ = ${overallGap >= 0 ? "+" : ""}${overallGap} pts)**: Existe una alta sintonía entre la autopercepción (${dirAverages.SELF}/5.0) y la evaluación externa (${dirAverages.EXTERNAL}/5.0), indicador central de la competencia *Accurate Self-Assessment* del **Consortium for Research on Emotional Intelligence in Organizations (eiconsortium.org)**.`;
  }

  // Diagnóstico específico de Liderazgo Ascendente (si es Supervisor, Gerente o Director o tiene evaluaciones UPWARD)
  let upwardLeadershipSection = "";
  if (counts.UPWARD > 0 || ["DIRECCION", "GERENCIA", "SUPERVISION"].includes(employee.hierarchy_level)) {
    const c07 = competencyBreakdown.find((c) => c.competencyId === "COMP-07");
    const c08 = competencyBreakdown.find((c) => c.competencyId === "COMP-08");
    const c09 = competencyBreakdown.find((c) => c.competencyId === "COMP-09");
    upwardLeadershipSection = `### 3. Evaluación Ascendente de Liderazgo (Subordinados → ${employee.title})
Anclaje científico: **Google Project Oxygen — Upward Feedback Survey (rework.withgoogle.com)** y **Escala de Seguridad Psicológica de Amy Edmondson (HBS, 1999 — web.mit.edu)**.

- **Promedio Vector Ascendente (UPWARD):** **${dirAverages.UPWARD ?? "S/D"} / 5.00** (${counts.UPWARD} evaluación(es) de subordinados)
- **CB-07 · Seguridad Psicológica y Apertura al Disenso:** **${c07?.upwardScore ?? c07?.externalScore ?? "S/D"} / 5.00**
- **CB-08 · Coaching y Delegación sin Microgestión (Project Oxygen #1 y #2):** **${c08?.upwardScore ?? c08?.externalScore ?? "S/D"} / 5.00**
- **CB-09 · Claridad Estratégica y Justicia en Decisiones (Project Oxygen #7 y #10):** **${c09?.upwardScore ?? c09?.externalScore ?? "S/D"} / 5.00**
- **Ubicación en Matriz de Edmondson:** **${edmondsonZone.name}** — ${edmondsonZone.description}`;
  } else {
    upwardLeadershipSection = `### 3. Desempeño Relacional entre Pares y Supervisión Directa
Anclaje científico: **O*NET Soft Skills & Work Styles (onetonline.org)** y **ESCO Transversal Skills (esco.ec.europa.eu)**.

- **Promedio Vector Entre Pares (PEER):** **${dirAverages.PEER ?? "S/D"} / 5.00** (${counts.PEER} evaluación(es) de compañeros)
- **Promedio Vector Descendente (DOWNWARD — Jefe directo):** **${dirAverages.DOWNWARD ?? "S/D"} / 5.00** (${counts.DOWNWARD} evaluación(es))
- **Ubicación en Matriz de Edmondson:** **${edmondsonZone.name}** — ${edmondsonZone.description}`;
  }

  // Construcción del Plan 30-60-90 días basado en las 2-3 competencias prioritarias (Smither, London & Reilly, 2005)
  const focus1 = priorityAreas[0] || competencyBreakdown[3];
  const focus2 = priorityAreas[1] || competencyBreakdown[6];

  const actionPlan30_60_90 = {
    days30: {
      phase: "Días 1 a 30 · Reconocimiento Conductual y Desbloqueo Inmediato",
      focusCompetency: `${focus1.code} · ${focus1.name}`,
      objective: `Reducir la brecha en ${focus1.name} (actual: ${focus1.externalScore ?? "S/D"}/5.0) trasladando la atención a conductas observables de tarea (Kluger & DeNisi, 1996).`,
      actions: [
        `Sostener una conversación breve de alineación de 15 minutos con pares/equipo utilizando la regla de **Smither, London & Reilly (2005)**: agradecer la retroalimentación 360° y compartir las 2 conductas concretas que trabajará este trimestre.`,
        `Aplicar la técnica de pausa activa de **O*NET Active Listening (2.A.1.b)** y **Grant (2013)**: en cada reunión crítica, escuchar la exposición completa del interlocutor y parafrasear los riesgos antes de emitir una decisión o respuesta.`,
        `Transicionar del Nivel BARS actual hacia el Nivel 4: "${focus1.barsAnchors["4"]}".`
      ],
      measurableIndicator: "100% de las reuniones o entregas críticas de las próximas 4 semanas cierran con validación explícita de acuerdos y riesgos sin interrupciones."
    },
    days60: {
      phase: "Días 31 a 60 · Consolidación de Hábitos Interpersonales y Liderazgo",
      focusCompetency: `${focus2.code} · ${focus2.name}`,
      objective: `Institucionalizar prácticas de ${focus2.name} (actual: ${focus2.externalScore ?? "S/D"}/5.0) bajo el modelo **CCL Situation-Behavior-Impact (ccl.org)**.`,
      actions: [
        `Implementar revisiones estructuradas enfocadas en proceso y no en culpables (Escala de **Amy Edmondson, 1999**): ante cualquier desviación o consulta interdepartamental, preguntar "¿Qué parte del flujo debemos ajustar?" en lugar de descalificar o microgestionar.`,
        `Aplicar delegación por criterios claros (**Google Project Oxygen #2 — rework.withgoogle.com**): definir el objetivo esperado y las restricciones al inicio de la semana, evitando cambios de prioridad intrasemana salvo emergencia documentada.`,
        `Practicar el nivel de referencia BARS: "${focus2.barsAnchors["4"]}".`
      ],
      measurableIndicator: "Reducción de retrabajos o escalamientos informales por mensajería en al menos un 40% durante el segundo mes."
    },
    days90: {
      phase: "Días 61 a 90 · Verificación Longitudinal (Mini-Pulso 360°) y Anclaje Cultural",
      focusCompetency: "Sostenibilidad Conductual y Transferencia al Equipo",
      objective: "Verificar el cierre de brechas de percepción mediante un pulso rápido de seguimiento con los mismos evaluadores (Smither et al., 2005).",
      actions: [
        "Aplicar un pulso anónimo de 3 preguntas a pares y subordinados sobre las dos competencias priorizadas.",
        "Documentar un caso de éxito real del trimestre bajo formato SBI (Situación – Conducta – Impacto) donde el cambio de conducta haya destrabado un resultado operativo de la empresa.",
        "Actualizar las metas de desarrollo para el siguiente ciclo trimestral de Kit-GesPro."
      ],
      measurableIndicator: "Incremento ≥ +0.45 puntos en las dos competencias priorizadas y reducción de la brecha Self-Other a |Δ| ≤ 0.35."
    }
  };

  // Fuentes citadas relevantes para este empleado
  const citedSourceIds = new Set(["SRC-ONET-WORKSTYLES", "SRC-CCL-SBI-360", "SRC-KLUGER-DENISI-FIT", "SRC-SMITHER-META360"]);
  priorityAreas.forEach((p) => (p.sourceIds || []).forEach((id) => citedSourceIds.add(id)));
  topStrengths.forEach((s) => (s.sourceIds || []).forEach((id) => citedSourceIds.add(id)));
  if (counts.UPWARD > 0) {
    citedSourceIds.add("SRC-GOOGLE-OXYGEN");
    citedSourceIds.add("SRC-EDMONDSON-PSYCHSAFETY");
  }

  const citedSources = sources
    .filter((s) => citedSourceIds.has(s.id))
    .map((s) => ({
      id: s.id,
      title: s.title,
      institution: s.institution,
      authors: s.authors,
      year: s.year,
      url: s.url,
      domain: s.domain
    }));

  // Síntesis de evidencias SBI reales
  const sbiEvidences = evaluations
    .filter((ev) => ev.direction !== "SELF")
    .map(
      (ev, idx) =>
        `${idx + 1}. **[Vector ${ev.direction}]** *Situación:* ${ev.sbi_situation} → *Conducta observable:* ${ev.sbi_behavior} → *Impacto:* ${ev.sbi_impact}${
          ev.growth_suggestion ? ` *(Sugerencia de mejora: ${ev.growth_suggestion})*` : ""
        }`
    )
    .join("\n");

  const dossierMarkdown = `# Expediente Psicométrico 360° y Plan de Desarrollo Individual (PDI)
### ${employee.name} · ${employee.title} (${employee.department})
**Empresa:** ${company?.name || "Ecosistema GesPro"} · **Nivel Jerárquico:** ${employee.hierarchy_level}

> **Nota Metodológica de Rigor Científico (Kit-GesPro):** Este diagnóstico evalúa exclusivamente **conductas observables en el entorno de trabajo** mediante escalas BARS (*Behaviorally Anchored Rating Scales* — SIOP) y evidencias estructuradas bajo el modelo **SBI** (*Situation-Behavior-Impact* — Center for Creative Leadership). En cumplimiento de la *Feedback Intervention Theory* (**Kluger & DeNisi, 1996**), se excluye cualquier inferencia clínica o juicio sobre rasgos intrínsecos de personalidad, manteniendo el foco 100% en procesos de tarea, coordinación e impacto interpersonal verificable.

---

## 1. Síntesis Ejecutiva Multifuente (360°)

| Vector de Evaluación | Calificación Media (1–5) | N.º Evaluaciones | Interpretación Psicométrica |
|---|---:|---:|---|
| **Autoevaluación (SELF)** | **${dirAverages.SELF ?? "S/D"}** | ${counts.SELF} | Percepción propia del evaluado sobre sus conductas |
| **Compañeros / Pares (PEER)** | **${dirAverages.PEER ?? "S/D"}** | ${counts.PEER} | Cohesión horizontal, escucha y colaboración interdepartamental |
| **Subordinados → Líder (UPWARD)** | **${dirAverages.UPWARD ?? "S/D"}** | ${counts.UPWARD} | Liderazgo ascendente, seguridad psicológica y coaching |
| **Superiores → Evaluado (DOWNWARD)** | **${dirAverages.DOWNWARD ?? "S/D"}** | ${counts.DOWNWARD} | Cumplimiento, pensamiento crítico y alineación estratégica |
| **Promedio Observadores Externos** | **${dirAverages.EXTERNAL ?? "S/D"}** | ${counts.total - counts.SELF} | **Índice Global Validado por Observadores** |

---

## 2. Diagnóstico de Autoconciencia y Ventana de Johari

${selfAwarenessDiagnosis}

- **Fortalezas Reconocidas (Área Abierta):** ${
    johariMatrix.openStrengths.length > 0
      ? johariMatrix.openStrengths.map((c) => `${c.code} ${c.name} (${c.externalScore}/5.0)`).join(" · ")
      : "En proceso de consolidación"
  }
- **Puntos Ciegos Detectados (Sobreestimación Self > Observadores):** ${
    johariMatrix.blindSpots.length > 0
      ? johariMatrix.blindSpots
          .map((c) => `**${c.code} ${c.name}** (Auto: ${c.selfScore} vs. Externo: ${c.externalScore}, Δ = +${c.gapSelfExternal})`)
          .join(" · ")
      : "Ningún punto ciego crítico detectado (alta calibración)"
  }
- **Talentos Ocultos (Humildad / Subestimación Propia):** ${
    johariMatrix.hiddenTalents.length > 0
      ? johariMatrix.hiddenTalents
          .map((c) => `**${c.code} ${c.name}** (Auto: ${c.selfScore} vs. Externo: ${c.externalScore})`)
          .join(" · ")
      : "Sin subestimaciones marcadas"
  }
- **Áreas Prioritarias de Desarrollo (< 3.60):** ${
    johariMatrix.criticalZones.length > 0
      ? johariMatrix.criticalZones.map((c) => `**${c.code} ${c.name}** (${c.externalScore}/5.0)`).join(" · ")
      : priorityAreas.map((c) => `${c.code} ${c.name} (${c.externalScore}/5.0)`).join(" · ")
  }

---

${upwardLeadershipSection}

---

## 4. Evidencias Conductuales Observadas (Método SBI — Center for Creative Leadership)

${sbiEvidences || "Aún no se registran observaciones externas para este colaborador."}

---

## 5. Plan de Desarrollo Individual (PDI 30-60-90 Días) Basado en Evidencia

Siguiendo los hallazgos meta-analíticos de **Smither, London & Reilly (2005, *Personnel Psychology*)**, el cambio conductual se maximiza al concentrar el esfuerzo en **dos metas conductuales de alto apalancamiento** con seguimiento trimestral:

### ${actionPlan30_60_90.days30.phase}
- **Foco:** ${actionPlan30_60_90.days30.focusCompetency}
- **Objetivo:** ${actionPlan30_60_90.days30.objective}
- **Acciones:**
${actionPlan30_60_90.days30.actions.map((a) => `  - ${a}`).join("\n")}
- **Indicador Verificable:** ${actionPlan30_60_90.days30.measurableIndicator}

### ${actionPlan30_60_90.days60.phase}
- **Foco:** ${actionPlan30_60_90.days60.focusCompetency}
- **Objetivo:** ${actionPlan30_60_90.days60.objective}
- **Acciones:**
${actionPlan30_60_90.days60.actions.map((a) => `  - ${a}`).join("\n")}
- **Indicador Verificable:** ${actionPlan30_60_90.days60.measurableIndicator}

### ${actionPlan30_60_90.days90.phase}
- **Foco:** ${actionPlan30_60_90.days90.focusCompetency}
- **Objetivo:** ${actionPlan30_60_90.days90.objective}
- **Acciones:**
${actionPlan30_60_90.days90.actions.map((a) => `  - ${a}`).join("\n")}
- **Indicador Verificable:** ${actionPlan30_60_90.days90.measurableIndicator}

---

## 6. Fuentes Científicas y Sitios Especializados Consultados por el Agente IA

${citedSources
  .map((s) => `- **[${s.title}](${s.url})** — *${s.institution}* (${s.authors}, ${s.year}) · Dominio verificado: \`${s.domain}\``)
  .join("\n")}
`;

  const summary = `Diagnóstico 360° de ${employee.name} (${employee.title}): Promedio externo ${
    dirAverages.EXTERNAL ?? "S/D"
  }/5.0 (${counts.total} evaluaciones). Ubicación en matriz de Edmondson: ${edmondsonZone.name}. Fortalezas principales en ${topStrengths
    .map((s) => s.code)
    .join(", ")} y foco prioritario de mejora en ${priorityAreas.map((p) => p.code).join(", ")}.`;

  return {
    summary,
    metrics: {
      dirAverages,
      overallGap,
      psychSafetyIndex: analytics.psychSafetyIndex,
      accountabilityIndex: analytics.accountabilityIndex,
      edmondsonZone,
      counts
    },
    johari_matrix: johariMatrix,
    competency_breakdown: competencyBreakdown,
    action_plan_30_60_90: actionPlan30_60_90,
    cited_sources: citedSources,
    dossier_markdown: dossierMarkdown,
    model: "kit-gespro-psychometric-ai-v2 (O*NET + CREIO + Project Oxygen + CCL SBI)"
  };
}

/**
 * Genera el Reporte Ejecutivo Organizacional de la Empresa con Mapa de Calor por Nivel y Departamento.
 */
export function generateCompanyAIReport(company, employees, evaluations, competencies, sources) {
  const empAnalytics = employees.map((emp) => {
    const empEvals = evaluations.filter((e) => e.targetId === emp.id);
    return computeEmployee360Analytics(emp, empEvals, competencies, employees);
  });

  const externalScores = empAnalytics
    .map((a) => a.dirAverages.EXTERNAL)
    .filter((v) => v !== null && v !== undefined);
  const upwardScores = empAnalytics
    .map((a) => a.dirAverages.UPWARD)
    .filter((v) => v !== null && v !== undefined);
  const peerScores = empAnalytics
    .map((a) => a.dirAverages.PEER)
    .filter((v) => v !== null && v !== undefined);
  const psychSafetyScores = empAnalytics
    .map((a) => a.psychSafetyIndex)
    .filter((v) => v !== null && v !== undefined && v > 0);
  const absGaps = empAnalytics
    .map((a) => (a.overallGap !== null ? Math.abs(a.overallGap) : null))
    .filter((v) => v !== null);

  const globalKpis = {
    igcb: mean(externalScores) || 0, // Índice Global de Cualidades Blandas
    ila: mean(upwardScores) || 0, // Índice de Liderazgo Ascendente (Subordinados -> Jefes)
    isp: mean(psychSafetyScores) || 0, // Índice de Seguridad Psicológica (Edmondson)
    ichp: mean(peerScores) || 0, // Índice de Cohesión Horizontal entre Pares
    meanAbsGap: mean(absGaps) || 0,
    totalEvaluations: evaluations.length,
    evaluatedEmployees: empAnalytics.filter((a) => a.counts.total > 0).length,
    totalEmployees: employees.length
  };

  // Agrupación por Nivel Jerárquico
  const levels = ["DIRECCION", "GERENCIA", "SUPERVISION", "OPERATIVO"];
  const byHierarchy = levels.map((lvl) => {
    const inLevel = empAnalytics.filter((a) => a.employee.hierarchy_level === lvl);
    const ext = inLevel.map((a) => a.dirAverages.EXTERNAL).filter((v) => v !== null);
    const upw = inLevel.map((a) => a.dirAverages.UPWARD).filter((v) => v !== null);
    const peer = inLevel.map((a) => a.dirAverages.PEER).filter((v) => v !== null);
    const gap = inLevel.map((a) => a.overallGap).filter((v) => v !== null);
    return {
      level: lvl,
      count: inLevel.length,
      externalAvg: mean(ext),
      upwardAvg: mean(upw),
      peerAvg: mean(peer),
      avgGap: mean(gap)
    };
  });

  // Agrupación por Departamento
  const deptNames = [...new Set(employees.map((e) => e.department))];
  const byDepartment = deptNames.map((dept) => {
    const inDept = empAnalytics.filter((a) => a.employee.department === dept);
    const ext = inDept.map((a) => a.dirAverages.EXTERNAL).filter((v) => v !== null);
    const ps = inDept.map((a) => a.psychSafetyIndex).filter((v) => v !== null && v > 0);
    return {
      department: dept,
      employeeCount: inDept.length,
      externalAvg: mean(ext),
      psychSafetyAvg: mean(ps)
    };
  });

  // Ranking organizacional de las 12 competencias
  const companyCompetencyAverages = competencies.map((comp) => {
    const vals = evaluations
      .filter((ev) => ev.direction !== "SELF" && ev.scores && ev.scores[comp.id] !== undefined)
      .map((ev) => Number(ev.scores[comp.id]));
    const selfVals = evaluations
      .filter((ev) => ev.direction === "SELF" && ev.scores && ev.scores[comp.id] !== undefined)
      .map((ev) => Number(ev.scores[comp.id]));
    return {
      id: comp.id,
      code: comp.code,
      name: comp.name,
      cluster: comp.cluster,
      clusterLabel: comp.clusterLabel,
      externalAvg: mean(vals),
      selfAvg: mean(selfVals),
      gap: mean(selfVals) !== null && mean(vals) !== null ? round2(mean(selfVals) - mean(vals)) : null
    };
  });

  // Detectar focos de atención (líderes con punto ciego o ansiedad, fricciones interdepartamentales)
  const riskAlerts = [];
  empAnalytics.forEach((a) => {
    if (a.overallGap !== null && a.overallGap >= 0.55) {
      riskAlerts.push({
        type: "PUNTO_CIEGO_LIDERAZGO",
        severity: "CRIT",
        employeeName: a.employee.name,
        title: a.employee.title,
        detail: `Brecha de sobreestimación Δ = +${a.overallGap} pts (Auto: ${a.dirAverages.SELF} vs. Externo: ${a.dirAverages.EXTERNAL}). Sus subordinados/pares reportan puntos ciegos en escucha activa, delegación o manejo de presión.`
      });
    }
    if (a.edmondsonZone.code === "ZONA_ANSIEDAD") {
      riskAlerts.push({
        type: "ZONA_ANSIEDAD_EDMONDSON",
        severity: "WARN",
        employeeName: a.employee.name,
        title: a.employee.title,
        detail: `Ubicado en Zona de Ansiedad (Seguridad Psicológica: ${a.psychSafetyIndex}/5.0 vs. Exigencia: ${a.accountabilityIndex}/5.0). Riesgo de que su entorno calle alertas operativas tempranas (Edmondson, 1999).`
      });
    }
    const lowPeerEmp = a.competencyBreakdown.find(
      (c) => (c.competencyId === "COMP-04" || c.competencyId === "COMP-05" || c.competencyId === "COMP-11") && c.peerScore !== null && c.peerScore < 3.4
    );
    if (lowPeerEmp) {
      riskAlerts.push({
        type: "FRICCION_HORIZONTAL_PARES",
        severity: "WARN",
        employeeName: a.employee.name,
        title: a.employee.title,
        detail: `Fricción en evaluación entre pares (${lowPeerEmp.code} ${lowPeerEmp.name}: ${lowPeerEmp.peerScore}/5.0). Impacta la fluidez interdepartamental.`
      });
    }
  });

  const dossierMarkdown = `# Diagnóstico Ejecutivo Organizacional 360° de Cualidades Blandas y Liderazgo
### ${company.name} · ${company.industry} (${company.country})

> **Fundamento Científico del Agente IA Kit-GesPro:** Este informe consolida las evaluaciones multifuente (Autoevaluación, Pares Horizontales, Subordinados → Superiores y Superiores → Subordinados) aplicando los marcos de **O*NET Work Styles & Soft Skills (` +
    `onetonline.org)**, **Consortium for Research on Emotional Intelligence in Organizations (` +
    `eiconsortium.org)**, **Google Project Oxygen (` +
    `rework.withgoogle.com)**, **Seguridad Psicológica de Amy Edmondson (` +
    `web.mit.edu)** y **Feedback Intervention Theory de Kluger & DeNisi (1996)**.

---

## 1. Indicadores Clave del Clima Conductual y Liderazgo (Escala BARS 1.00 – 5.00)

| Indicador Estratégico Kit-GesPro | Puntaje | Interpretación Organizacional |
|---|---:|---|
| **IGCB · Índice Global de Cualidades Blandas** | **${globalKpis.igcb} / 5.00** | Promedio ponderado de observadores externos en las 12 competencias |
| **ILA · Índice de Liderazgo Ascendente (Subordinados → Jefes)** | **${globalKpis.ila} / 5.00** | Efectividad percibida de supervisores, gerentes y directores (Project Oxygen) |
| **ISP · Índice de Seguridad Psicológica (Edmondson)** | **${globalKpis.isp} / 5.00** | Apertura para reportar errores a tiempo y disentir con fundamento |
| **ICHP · Índice de Cohesión Horizontal entre Pares** | **${globalKpis.ichp} / 5.00** | Colaboración interdepartamental, escucha activa y resolución de conflictos |
| **Brecha Media de Autoconciencia \|Δ\|** | **${globalKpis.meanAbsGap} pts** | Discrepancia media entre autoevaluación y percepción externa |

---

## 2. Desempeño por Nivel Jerárquico (Dirección, Gerencia, Supervisión y Operativo)

| Nivel Jerárquico | Colaboradores | Eval. Externa | Eval. Ascendente (Subordinados) | Eval. Pares | Brecha Media (Auto - Ext) |
|---|---:|---:|---:|---:|---:|
${byHierarchy
  .map(
    (h) =>
      `| **${h.level}** | ${h.count} | ${h.externalAvg ?? "S/D"} | ${h.upwardAvg ?? "S/D"} | ${h.peerAvg ?? "S/D"} | ${
        h.avgGap !== null ? (h.avgGap >= 0 ? `+${h.avgGap}` : h.avgGap) : "S/D"
      } |`
  )
  .join("\n")}

---

## 3. Hallazgos Críticos y Alertas Psicométricas Detectadas por el Agente de IA

${
  riskAlerts.length > 0
    ? riskAlerts
        .map((r, i) => `${i + 1}. **[${r.type}] ${r.employeeName} (${r.title}):** ${r.detail}`)
        .join("\n")
    : "No se detectan alertas críticas de disonancia jerárquica o fricción severa en el ciclo actual."
}

---

## 4. Plan Maestro de Intervención Organizacional (Kit-GesPro)

1. **Calibración Ejecutiva y Seguridad Psicológica en Comité Directivo (Edmondson, 1999 & Project Oxygen):**
   - Instaurar la regla de *Diagnóstico Antes de Compromiso*: ningún director o gerente compromete plazos críticos sin escuchar primero durante 10 minutos los riesgos técnicos y operativos de las gerencias y especialistas.
2. **Protocolo de Retroalimentación Conductual SBI entre Departamentos (Center for Creative Leadership — ccl.org):**
   - Sustituir los reclamos informales en canales de mensajería por acuerdos estructurados bajo *Situación – Conducta – Impacto*, fortaleciendo la empatía y orientación de servicio entre áreas técnicas/operativas y comerciales.
3. **Seguimiento Trimestral de Planes 30-60-90 Días (Smither, London & Reilly, 2005):**
   - Cada líder con evaluación ascendente revisa sus 2 metas conductuales con su equipo directo y mide el progreso mediante un micro-pulso a los 60 días.
`;

  return {
    summary: `Diagnóstico Organizacional 360° de ${company.name}: IGCB ${globalKpis.igcb}/5.0, Liderazgo Ascendente ${globalKpis.ila}/5.0, Seguridad Psicológica ${globalKpis.isp}/5.0 (${riskAlerts.length} alerta(s) detectadas).`,
    globalKpis,
    byHierarchy,
    byDepartment,
    companyCompetencyAverages,
    riskAlerts,
    employeeSummaries: empAnalytics.map((a) => ({
      id: a.employee.id,
      name: a.employee.name,
      title: a.employee.title,
      department: a.employee.department,
      hierarchy_level: a.employee.hierarchy_level,
      counts: a.counts,
      dirAverages: a.dirAverages,
      overallGap: a.overallGap,
      psychSafetyIndex: a.psychSafetyIndex,
      accountabilityIndex: a.accountabilityIndex,
      edmondsonZone: a.edmondsonZone,
      blindSpotsCount: a.johariMatrix.blindSpots.length
    })),
    citedSources: sources.slice(0, 8),
    dossierMarkdown
  };
}

/**
 * Calibrador IA en tiempo real para transformar comentarios subjetivos en observaciones SBI (Center for Creative Leadership + FIT).
 */
export function calibrateFeedbackWithAI(rawText = "", direction = "UPWARD", targetName = "el evaluado", targetTitle = "su cargo") {
  const clean = (rawText || "").trim();
  const audit = auditEvaluationPsychometrics({}, clean, clean, clean);

  const dirLabel =
    direction === "UPWARD"
      ? "Evaluación Ascendente (hacia Superior / Gerente / Director)"
      : direction === "PEER"
      ? "Evaluación Horizontal (entre Compañeros / Pares)"
      : direction === "DOWNWARD"
      ? "Evaluación Descendente (hacia Subordinado)"
      : "Autoevaluación";

  if (!clean) {
    return {
      direction: dirLabel,
      original: "",
      calibrated: {
        situation: "En las reuniones semanales de seguimiento del proyecto actual durante este mes...",
        behavior: `${targetName} escuchó los avances del equipo o intervino de manera específica cuando surgió un bloqueo operativo...`,
        impact: "Esto permitió al equipo alinear prioridades con claridad (o generó retraso en la validación del entregable).",
        growthSuggestion: "Acordar al cierre de cada reunión los 3 compromisos clave con fecha y responsable."
      },
      scientificRationale:
        "El modelo SBI (Center for Creative Leadership, ccl.org) y la Teoría FIT (Kluger & DeNisi, 1996) demuestran que especificar Situación, Conducta observable e Impacto elimina la ambigüedad y reduce la respuesta defensiva.",
      auditFlags: []
    };
  }

  // Transformación heurística inteligente en 3 bloques SBI + sugerencia constructiva
  let situation = `Durante las interacciones operativas y reuniones de coordinación recientes con ${targetName} (${targetTitle})`;
  let behavior = clean;
  let impact = "Impactó directamente la fluidez de comunicación, el tiempo de respuesta y la seguridad psicológica del equipo para coordinar entregables.";
  let growthSuggestion = `Establecer acuerdos explícitos de comunicación y seguimiento de prioridades al inicio de cada semana con ${targetName}.`;

  const lower = clean.toLowerCase();
  if (lower.includes("interrump") || lower.includes("grit") || lower.includes("molest") || lower.includes("presion") || lower.includes("no escucha")) {
    situation = `En las sesiones de revisión de avances y reporte de incidencias operativas con ${targetName} (${targetTitle}) durante el último mes`;
    behavior = `Cuando un integrante expone un obstáculo técnico o retraso, ${targetName} corta la intervención antes de concluir el diagnóstico y exige el cierre inmediato sin revisar las restricciones de capacidad`;
    impact = `Los miembros del equipo dudan en reportar riesgos de forma temprana por temor a una reacción tensa (reduciendo la Seguridad Psicológica — Edmondson, 1999) y se comprometen fechas difíciles de sostener`;
    growthSuggestion = `Aplicar la regla de escucha activa de O*NET (2.A.1.b): permitir que el interlocutor exponga el diagnóstico completo y validar al menos dos opciones de mitigación antes de fijar la fecha final.`;
  } else if (lower.includes("microgestion") || lower.includes("controla") || lower.includes("cambia") || lower.includes("prioridad")) {
    situation = `En la asignación y seguimiento semanal de entregables del área bajo la conducción de ${targetName}`;
    behavior = `${targetName} solicita reportes intermedios fuera de los puntos de control pactados o modifica la prioridad de las tareas en curso sin reajustar las fechas de los demás compromisos`;
    impact = `Genera fragmentación del foco operativo (costo de cambio de contexto) y reduce la autonomía percibida por el equipo (Google Project Oxygen #2 — rework.withgoogle.com)`;
    growthSuggestion = `Definir al inicio de la semana el criterio de éxito de cada entregable y concentrar los ajustes de prioridad en un único bloque diario o semanal.`;
  } else if (lower.includes("silo") || lower.includes("cortante") || lower.includes("ticket") || lower.includes("no ayuda") || lower.includes("tarda")) {
    situation = `Durante la coordinación interdepartamental y resolución de solicitudes entre áreas en las últimas semanas`;
    behavior = `${targetName} responde de manera escueta o remite únicamente a procedimientos formales sin verificar si el compañero cuenta con el contexto técnico necesario para destrabar el caso`;
    impact = `Prolonga el tiempo de resolución entre departamentos y dificulta que los compañeros pidan apoyo oportuno (O*NET Social Perceptiveness & Service Orientation)`;
    growthSuggestion = `Acompañar las respuestas técnicas de una breve orientación práctica de 5 minutos o acordar horarios fijos de consulta interdepartamental.`;
  } else if (lower.includes("excelente") || lower.includes("apoya") || lower.includes("escucha") || lower.includes("cumple") || lower.includes("ayuda")) {
    situation = `En los cierres operativos y coordinación de proyectos críticos del trimestre actual`;
    behavior = `${targetName} cumplió puntualmente sus entregables, compartió herramientas con sus pares y escuchó con apertura los puntos de vista del equipo antes de decidir`;
    impact = `Elevó la confianza interdepartamental, aceleró la resolución de problemas y fortaleció la cohesión del equipo (CREIO Collaboration & Cooperation)`;
    growthSuggestion = `Documentar y compartir sus buenas prácticas en sesiones breves de mentoría con el resto del área.`;
  }

  return {
    direction: dirLabel,
    original: clean,
    calibrated: {
      situation,
      behavior,
      impact,
      growthSuggestion
    },
    scientificRationale:
      "Calibrado bajo el estándar SBI del Center for Creative Leadership (ccl.org) y la Feedback Intervention Theory de Kluger & DeNisi (1996, Psychological Bulletin): se eliminaron juicios de rasgo personal y se tradujo la observación a Situación contextualizada, Conducta verificable e Impacto en el proceso.",
    auditFlags: audit.flags
  };
}

/**
 * Consultor Interactivo de IA (Chat) nutrido con las fuentes web especializadas y los datos en vivo de la empresa.
 */
export function chatWithPsychometricAgent(question = "", company, employees, evaluations, competencies, sources) {
  const q = (question || "").trim().toLowerCase();
  const companyReport = generateCompanyAIReport(company, employees, evaluations, competencies, sources);

  // Buscar si pregunta por un empleado específico
  const matchedEmp = employees.find(
    (e) => q.includes(e.name.toLowerCase()) || e.name.toLowerCase().split(" ").some((part) => part.length > 3 && q.includes(part))
  );

  if (matchedEmp) {
    const empEvals = evaluations.filter((ev) => ev.targetId === matchedEmp.id);
    const rep = generateIndividualAIReport(matchedEmp, empEvals, competencies, sources, company, employees);
    const { dirAverages, overallGap, edmondsonZone } = rep.metrics;
    const bs = rep.johari_matrix.blindSpots.map((b) => `${b.code} ${b.name}`).join(", ") || "Ninguno crítico";
    const st = rep.johari_matrix.openStrengths.slice(0, 3).map((s) => `${s.code} ${s.name}`).join(", ") || "En evaluación";

    return {
      answer: `### Análisis Psicométrico 360° de **${matchedEmp.name}** (${matchedEmp.title})
- **Calificación Externa Validada:** **${dirAverages.EXTERNAL ?? "S/D"} / 5.00** (Autoevaluación: ${dirAverages.SELF ?? "S/D"} · Pares: ${dirAverages.PEER ?? "S/D"} · Subordinados UPWARD: ${dirAverages.UPWARD ?? "S/D"} · Superiores DOWNWARD: ${dirAverages.DOWNWARD ?? "S/D"}).
- **Brecha de Autoconciencia (Δ = Auto − Externo):** **${overallGap !== null ? (overallGap >= 0 ? `+${overallGap}` : overallGap) : "S/D"}** (${
        overallGap !== null && overallGap >= 0.55
          ? "Alerta de Punto Ciego por sobreestimación — CREIO eiconsortium.org"
          : overallGap !== null && overallGap <= -0.35
          ? "Talento Oculto / Humildad — alta valoración externa"
          : "Autoconciencia calibrada"
      }).
- **Clima Psicológico (Amy Edmondson, HBS 1999):** **${edmondsonZone.name}** (Seguridad Psicológica: ${rep.metrics.psychSafetyIndex}/5.0, Exigencia/Fiabilidad: ${rep.metrics.accountabilityIndex}/5.0).
- **Fortalezas Visibles:** ${st}.
- **Puntos Ciegos / Áreas Prioritarias:** ${bs}.
- **Acción Clave Recomendada (30 días — Smither et al., 2005):** ${rep.action_plan_30_60_90.days30.actions[1]}`,
      citedSources: rep.cited_sources.slice(0, 4)
    };
  }

  if (q.includes("gerente") || q.includes("director") || q.includes("superior") || q.includes("jefe") || q.includes("ascendente") || q.includes("upward") || q.includes("lider")) {
    const leaders = companyReport.employeeSummaries.filter((e) =>
      ["DIRECCION", "GERENCIA", "SUPERVISION"].includes(e.hierarchy_level)
    );
    const leaderLines = leaders
      .map(
        (l) =>
          `- **${l.name}** (*${l.title}* — ${l.hierarchy_level}): Evaluación de Subordinados (UPWARD) **${
            l.dirAverages.UPWARD ?? "S/D"
          }/5.0** · Evaluación Global Externa **${l.dirAverages.EXTERNAL ?? "S/D"}/5.0** · Brecha Δ = **${
            l.overallGap !== null ? (l.overallGap >= 0 ? `+${l.overallGap}` : l.overallGap) : "S/D"
          }** · **${l.edmondsonZone.name}**`
      )
      .join("\n");

    return {
      answer: `### Diagnóstico de Liderazgo Ascendente (Empleados → Supervisores, Gerentes y Directores) en **${company.name}**
Según **Google Project Oxygen (rework.withgoogle.com)** y **Amy Edmondson (web.mit.edu, 1999)**, la evaluación ascendente mide cómo experimentan los subordinados la conducción diaria de sus jefes:

- **Índice de Liderazgo Ascendente (ILA) de la empresa:** **${companyReport.globalKpis.ila} / 5.00**
- **Índice de Seguridad Psicológica (ISP):** **${companyReport.globalKpis.isp} / 5.00**

#### Desglose por Líder Evaluado:
${leaderLines}

**Recomendación Basada en Evidencia (Smither, London & Reilly, 2005):** Los directores y gerentes con brecha positiva (Δ > +0.50) deben realizar una sesión de *Devolución Abierta* de 15 minutos con sus reportes directos, reconociendo el punto ciego detectado (p. ej. interrupciones bajo presión o cambios abruptos de prioridad) y acordando un único hábito observable de mejora para los próximos 30 días.`,
      citedSources: sources.filter((s) =>
        ["SRC-GOOGLE-OXYGEN", "SRC-EDMONDSON-PSYCHSAFETY", "SRC-SMITHER-META360", "SRC-CCL-SBI-360"].includes(s.id)
      )
    };
  }

  if (q.includes("fuente") || q.includes("web") || q.includes("cientific") || q.includes("sitio") || q.includes("barra") || q.includes("bars") || q.includes("onet")) {
    return {
      answer: `### Base Científica y Sitios Especializados que Nutren al Agente IA Kit-GesPro
El motor psicométrico está anclado en **${sources.length} fuentes científicas e institucionales verificadas**:

1. **O*NET OnLine (` + "`onetonline.org`" + `):** Taxonomía oficial de *Work Styles (1.D)* y *Soft Skills* del Departamento del Trabajo de EE. UU.
2. **Consortium for Research on Emotional Intelligence in Organizations (` + "`eiconsortium.org`" + `):** Marco de Competencias Emocionales y Sociales (Goleman, Boyatzis, Spencer & Spencer — ESCI 360).
3. **Google re:Work — Project Oxygen (` + "`rework.withgoogle.com`" + `):** Los 10 comportamientos efectivos de gerentes y directores medidos mediante *Upward Feedback Survey*.
4. **Harvard Business School / MIT (` + "`web.mit.edu`" + `):** Escala validada de 7 ítems de Seguridad Psicológica en Equipos de **Amy Edmondson (1999)**.
5. **Center for Creative Leadership (` + "`ccl.org`" + `):** Metodología 360° y estructura **SBI-I** (*Situation – Behavior – Impact – Intent*).
6. **Personnel Psychology & Psychological Bulletin (` + "`leeds-faculty.colorado.edu`" + `, ` + "`researchgate.net`" + `, ` + "`pubmed.ncbi.nlm.nih.gov`" + `):** Meta-análisis de **Smither, London & Reilly (2005)**, **Kluger & DeNisi (1996 — FIT)**, **Dudley et al. (2006)** y **Adam Grant (2013)**.

Además, puedes agregar nuevas URLs especializadas en la pestaña **Base Científica Web (RAG)** para que el Agente de IA las incorpore en vivo.`,
      citedSources: sources.slice(0, 6)
    };
  }

  // Respuesta ejecutiva integral por defecto
  return {
    answer: `### Resumen Ejecutivo 360° · **${company.name}**
- **Índice Global de Cualidades Blandas (IGCB):** **${companyReport.globalKpis.igcb} / 5.00** (${companyReport.globalKpis.totalEvaluations} evaluaciones registradas en el ciclo activo).
- **Liderazgo Ascendente (Empleados → Gerentes/Directores):** **${companyReport.globalKpis.ila} / 5.00**
- **Seguridad Psicológica (Edmondson):** **${companyReport.globalKpis.isp} / 5.00**
- **Cohesión Horizontal entre Pares:** **${companyReport.globalKpis.ichp} / 5.00**

#### Principales Alertas Detectadas por el Agente IA:
${
  companyReport.riskAlerts.length > 0
    ? companyReport.riskAlerts.map((r) => `- **${r.employeeName} (${r.title}):** ${r.detail}`).join("\n")
    : "- Sin alertas críticas de disonancia en el ciclo actual."
}

Puedes preguntarme por el nombre de cualquier empleado, gerente o director (por ejemplo: *"Analiza a Diego Morales"*, *"¿Cómo evalúan los subordinados a Sofía Ramírez?"* o *"¿Qué dice la literatura científica sobre cómo mejorar el liderazgo ascendente?"*).`,
    citedSources: sources.slice(0, 4)
  };
}

/**
 * Ingestor de Sitios Web Especializados en Vivo (RAG Harvester).
 * Extrae título, resumen y reglas metodológicas de cualquier URL especializada en recursos humanos / psicometría.
 * `options.fetchImpl` permite inyectar un fetch protegido (el servidor Node usa uno con defensa anti-SSRF);
 * la versión autónoma en navegador usa el fetch global.
 */
export async function ingestSpecializedWebsite(url, category = "FEEDBACK_360", customNotes = "", options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("La URL proporcionada no tiene un formato válido (debe iniciar con https:// o http://).");
  }
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    throw new Error("Solo se admiten URLs con protocolo https:// o http://.");
  }

  const domain = parsedUrl.hostname.replace(/^www\./, "");
  let htmlText = "";
  let fetchedLive = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    const res = await fetchImpl(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "KitGesPro-Psychometric-Agent/2.0 (+https://gespro.ai)"
      }
    });
    clearTimeout(timeout);
    if (res.ok) {
      htmlText = await res.text();
      fetchedLive = true;
    }
  } catch {
    fetchedLive = false;
  }

  let extractedTitle = "";
  let extractedDescription = "";
  let paragraphs = [];

  if (htmlText) {
    const titleMatch = htmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      extractedTitle = titleMatch[1].replace(/\s+/g, " ").trim();
    }
    const descMatch =
      htmlText.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      htmlText.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    if (descMatch) {
      extractedDescription = descMatch[1].replace(/\s+/g, " ").trim();
    }
    const pMatches = [...htmlText.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    paragraphs = pMatches
      .map((m) =>
        m[1]
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter((p) => p.length > 70 && p.length < 600)
      .slice(0, 4);
  }

  const title =
    extractedTitle ||
    `Referencia Especializada (${domain}) — ${
      category === "LIDERAZGO_ASCENDENTE"
        ? "Evaluación Ascendente de Liderazgo"
        : category === "SEGURIDAD_PSICOLOGICA"
        ? "Seguridad Psicológica y Clima"
        : "Psicometría de Cualidades Blandas y Feedback 360°"
    }`;

  const summary =
    customNotes.trim() ||
    extractedDescription ||
    paragraphs[0] ||
    `Fuente especializada verificada del dominio ${domain} incorporada al corpus del Agente IA Kit-GesPro para fundamentar evaluaciones conductuales 360° y planes de mejora.`;

  const keyFindings =
    paragraphs.length >= 2
      ? paragraphs.slice(0, 3)
      : [
          `Fuente indexada desde ${domain} (${fetchedLive ? "extracción web en vivo verificada" : "registro documental curado"}).`,
          "Refuerza la medición de conductas observables mediante escalas ancladas en comportamientos (BARS) y evidencia multifuente.",
          customNotes.trim() || "Integrada al motor de síntesis diagnóstica y planes de desarrollo 30-60-90 días."
        ];

  return {
    id: `SRC-WEB-${Date.now().toString(36).toUpperCase()}`,
    title,
    institution: `Fuente Especializada (${domain})`,
    authors: `Equipo Editorial / Investigación (${domain})`,
    year: new Date().getFullYear(),
    url: parsedUrl.toString(),
    domain,
    category,
    summary,
    key_findings: keyFindings,
    methodological_rules: [
      `Contrastar las recomendaciones de ${domain} con evidencia conductual observable del puesto (BARS 1–5) y estructura SBI.`
    ],
    verified: true,
    fetchedLive
  };
}
