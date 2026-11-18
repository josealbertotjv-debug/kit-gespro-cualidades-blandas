// =============================================================================
// KIT-GESPRO · BASE DE CONOCIMIENTO CIENTÍFICO Y TAXONOMÍA 360° (BARS)
// Fuentes web especializadas verificadas para alimentar al Agente de IA
// =============================================================================

export const SPECIALIZED_WEB_SOURCES = [
  {
    id: "SRC-ONET-WORKSTYLES",
    title: "O*NET OnLine — Browse by Work Styles (1.D) & Soft Skills Custom List",
    institution: "U.S. Department of Labor / Employment and Training Administration",
    authors: "National Center for O*NET Development",
    year: 2026,
    url: "https://www.onetonline.org/find/descriptor/browse/1.D",
    domain: "onetonline.org",
    category: "TAXONOMIA",
    summary:
      "Taxonomía ocupacional oficial de EE. UU. que estructura los estilos de trabajo (Work Styles) en cuatro macro-dominios: Conscientious and Rule Oriented (Atención al detalle, Prudencia, Fiabilidad, Integridad), Emotionally Resilient (Autocontrol, Tolerancia al estrés), Interpersonally Oriented (Cooperación, Empatía, Humildad, Optimismo, Sinceridad, Orientación social) y Proactive and Growth Oriented (Orientación al logro, Adaptabilidad, Iniciativa, Innovación, Curiosidad intelectual, Orientación al liderazgo, Perseverancia, Autoconfianza, Tolerancia a la ambigüedad).",
    key_findings: [
      "Las cualidades blandas se operacionalizan como tendencias conductuales observables en el puesto, no como rasgos clínicos abstractos.",
      "Distingue entre Social Skills (Coordinación, Instrucción, Negociación, Persuasión, Orientación de servicio, Perceptividad social) y Thinking Skills (Escucha activa, Pensamiento crítico, Resolución de problemas complejos, Juicio y toma de decisiones).",
      "Permite ponderar qué cualidades son críticas según el nivel de responsabilidad y el rol dentro de la organización."
    ],
    methodological_rules: [
      "Anclar toda evaluación en conductas observables del puesto (Work Context & Work Activities).",
      "Evitar evaluar rasgos genéricos desconectados de las demandas reales de la ocupación."
    ],
    verified: true
  },
  {
    id: "SRC-ONET-SOFTSKILLS",
    title: "O*NET OnLine — Soft Skills Custom List (Interpersonal & Thinking Skills)",
    institution: "U.S. Department of Labor / O*NET Resource Center",
    authors: "National Center for O*NET Development",
    year: 2026,
    url: "https://www.onetonline.org/skills/soft/",
    domain: "onetonline.org",
    category: "TAXONOMIA",
    summary:
      "Catálogo estandarizado de habilidades interpersonales y de pensamiento requeridas para interactuar con eficacia con pares, clientes y superiores: Escucha Activa, Perceptividad Social, Coordinación, Negociación, Persuasión, Aprendizaje Activo, Pensamiento Crítico y Monitoreo del desempeño propio y ajeno.",
    key_findings: [
      "La Escucha Activa exige prestar atención plena, comprender los puntos antes de responder, formular preguntas pertinentes y no interrumpir.",
      "La Perceptividad Social mide la conciencia de las reacciones de los demás y la comprensión de por qué reaccionan de esa manera.",
      "La Coordinación mide la capacidad de ajustar las acciones propias en relación con las acciones de los compañeros."
    ],
    methodological_rules: [
      "En evaluaciones entre pares (Peer-to-Peer), priorizar Coordinación, Escucha Activa, Negociación y Orientación de Servicio."
    ],
    verified: true
  },
  {
    id: "SRC-CREIO-GOLEMAN",
    title: "Emotional Competence Framework & ESCI-360 (Emotional and Social Competence Inventory)",
    institution: "Consortium for Research on Emotional Intelligence in Organizations (CREIO — Rutgers University)",
    authors: "Daniel Goleman, Richard Boyatzis, Cary Cherniss & Spencer & Spencer (OPM MOSAIC)",
    year: 2025,
    url: "https://www.eiconsortium.org/reports/emotional_competence_framework.html",
    domain: "eiconsortium.org",
    category: "INTELIGENCIA_EMOCIONAL",
    summary:
      "Marco científico de competencias emocionales y sociales destilado de estudios en más de 200 organizaciones (OPM MOSAIC, Spencer & Spencer). Divide las cualidades blandas en Competencia Personal (Autoconciencia: conciencia emocional, autoevaluación precisa, autoconfianza; Autorregulación: autocontrol, confiabilidad, responsabilidad, adaptabilidad, innovación; Motivación: orientación al logro, compromiso, iniciativa, optimismo) y Competencia Social (Empatía, Desarrollo de otros, Aprovechamiento de la diversidad, Conciencia política, Influencia, Comunicación, Liderazgo, Manejo de conflictos, Colaboración y Sinergia de equipo).",
    key_findings: [
      "La Autoevaluación Precisa (Accurate Self-Assessment) se refleja en una baja discrepancia entre la autoevaluación y la evaluación de pares/subordinados, así como apertura al feedback honesto.",
      "En cargos directivos y gerenciales, entre el 80% y el 90% de las competencias que diferencian a los líderes sobresalientes de los promedio pertenecen al dominio socioemocional.",
      "El Desarrollo de Otros (Developing Others) y el Manejo de Conflictos son predictores directos de retención de talento en equipos subordinados."
    ],
    methodological_rules: [
      "Utilizar la brecha entre Autoevaluación y Observadores (ESCI-360) como indicador directo de Autoconciencia Emocional.",
      "No confundir Empatía con complacencia o falta de firmeza: el líder empático comprende la perspectiva del otro y sostiene estándares claros."
    ],
    verified: true
  },
  {
    id: "SRC-GOOGLE-OXYGEN",
    title: "Project Oxygen: The 10 Behaviors of Great Managers & Upward Feedback Survey (UFS)",
    institution: "Google re:Work — People Innovation Lab (PiLab) & Harvard Business School",
    authors: "David A. Garvin, Alison Berkley Wagonfeld, Liz Kind & Google PiLab",
    year: 2024,
    url: "https://rework.withgoogle.com/intl/en/guides/following-the-data-the-research-behind-great-managers",
    domain: "rework.withgoogle.com",
    category: "LIDERAZGO_ASCENDENTE",
    summary:
      "Investigación longitudinal basada en miles de evaluaciones ascendentes (Upward Feedback Survey — donde los subordinados evalúan a sus jefes, gerentes y directores). Identificó los 10 comportamientos observables de los líderes efectivos: (1) Es un buen coach; (2) Empodera al equipo y no microgestiona; (3) Crea un entorno inclusivo y seguro mostrando interés por el bienestar; (4) Es productivo y orientado a resultados; (5) Es un buen comunicador — escucha y comparte información; (6) Apoya el desarrollo de carrera y conversa sobre desempeño; (7) Tiene visión y estrategia claras; (8) Posee criterio técnico para asesorar; (9) Colabora transversalmente en la empresa; (10) Toma decisiones claras y firmes.",
    key_findings: [
      "Los equipos cuyos gerentes puntúan en el cuartil superior de los 10 comportamientos de Project Oxygen presentan menor rotación, mayor satisfacción y mayor desempeño operativo.",
      "La evaluación ascendente (subordinados → gerentes/directores) debe realizarse de forma confidencial y agregada (mínimo 2–3 subordinados) con escala conductual.",
      "La microgestión y la falta de comunicación transparente son los dos deterioradores más rápidos de la moral del equipo."
    ],
    methodological_rules: [
      "Aplicar los 10 comportamientos de Project Oxygen específicamente en el vector UPWARD (evaluación de empleados hacia supervisores, gerentes y directores).",
      "Separar la evaluación de desarrollo del gerente de decisiones punitivas inmediatas para preservar la honestidad de las respuestas."
    ],
    verified: true
  },
  {
    id: "SRC-EDMONDSON-PSYCHSAFETY",
    title: "Psychological Safety and Learning Behavior in Work Teams (Escala Validada de 7 Ítems)",
    institution: "Harvard Business School / MIT Sloan / Administrative Science Quarterly",
    authors: "Amy C. Edmondson",
    year: 1999,
    url: "https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf",
    domain: "web.mit.edu",
    category: "SEGURIDAD_PSICOLOGICA",
    summary:
      "Estudio fundacional que define la Seguridad Psicológica como la creencia compartida de que el equipo es un espacio seguro para asumir riesgos interpersonales, admitir errores honestos, pedir ayuda y cuestionar decisiones sin temor a represalias o humillación. Incluye la escala validada de 7 ítems para evaluar el clima generado por líderes y compañeros.",
    key_findings: [
      "La seguridad psicológica NO equivale a bajar los estándares ni a evitar el desacuerdo; por el contrario, permite el desacuerdo franco y el reporte temprano de errores antes de que se conviertan en fallas graves.",
      "Los equipos con alta seguridad psicológica reportan más errores a tiempo porque no temen ser castigados por decir la verdad a sus gerentes o directores.",
      "Cuando la seguridad psicológica es baja pero la presión por metas es alta, los empleados entran en la 'Zona de Ansiedad', ocultando problemas operativos."
    ],
    methodological_rules: [
      "Cruzar siempre Seguridad Psicológica con Exigencia de Estándares/Responsabilidad para ubicar al equipo en las 4 zonas de Edmondson: Zona de Apatía, Zona de Confort, Zona de Ansiedad o Zona de Aprendizaje y Alto Desempeño."
    ],
    verified: true
  },
  {
    id: "SRC-CCL-SBI-360",
    title: "360-Degree Assessments & The SBI-I Feedback Model (Situation – Behavior – Impact – Intent)",
    institution: "Center for Creative Leadership (CCL)",
    authors: "Center for Creative Leadership Research Faculty & Sloan Weitzel",
    year: 2025,
    url: "https://www.ccl.org/articles/leading-effectively-articles/sbi-feedback-model-a-quick-win-to-improve-talent-conversations-development/",
    domain: "ccl.org",
    category: "FEEDBACK_360",
    summary:
      "Metodología estándar global para evaluaciones de 360 grados y retroalimentación ejecutiva desarrollada por el Center for Creative Leadership. Estructura cada observación cualitativa en tres componentes verificables: Situación (cuándo y dónde ocurrió), Conducta (qué hizo o dijo la persona de forma observable, sin adjetivos ni suposiciones de intención) e Impacto (qué efecto concreto produjo en la tarea, el equipo o el resultado).",
    key_findings: [
      "Los comentarios vagos o centrados en rasgos ('es arrogante', 'no tiene actitud', 'es mal jefe') disparan respuestas defensivas y bloquean el aprendizaje.",
      "El modelo SBI obliga al evaluador (par, subordinado o superior) a anclar su calificación numérica en un episodio real de trabajo.",
      "Más del 85% de las empresas Fortune 500 utilizan evaluaciones 360° estructuradas bajo principios del CCL para identificar puntos ciegos de liderazgo."
    ],
    methodological_rules: [
      "Exigir estructura SBI (Situación, Conducta, Impacto) en todas las evaluaciones cualitativas entre pares y hacia superiores.",
      "Calibrar automáticamente con IA cualquier comentario subjetivo para reformularlo en términos conductuales observables."
    ],
    verified: true
  },
  {
    id: "SRC-SMITHER-META360",
    title: "Does Performance Improve Following Multisource Feedback? A Theoretical Model, Meta-Analysis, and Review",
    institution: "Personnel Psychology (Vol. 58, pp. 33–66) / Rutgers & Stevens Institute of Technology",
    authors: "James W. Smither, Manuel London & Richard R. Reilly",
    year: 2005,
    url: "https://leeds-faculty.colorado.edu/dahe7472/smither%20performance.pdf",
    domain: "leeds-faculty.colorado.edu",
    category: "FEEDBACK_360",
    summary:
      "Meta-análisis de 24 estudios longitudinales sobre el impacto real del feedback multifuente (360°: autoevaluación, pares, subordinados y superiores). Demuestra que entregar un reporte 360° de forma aislada produce tamaños de efecto pequeños, pero el impacto se multiplica cuando el evaluado traduce el diagnóstico en 2 o 3 metas conductuales específicas, comparte su plan con su equipo y realiza seguimiento estructurado a 30, 60 y 90 días.",
    key_findings: [
      "Los gerentes que discuten abiertamente los resultados de su evaluación ascendente con sus subordinados y piden seguimiento logran mejoras estadísticamente significativas un año después.",
      "El exceso de metas diluye el cambio: el Plan de Desarrollo Individual (PDI) debe concentrarse en máximo 2–3 conductas clave de alto apalancamiento."
    ],
    methodological_rules: [
      "Todo reporte de IA debe culminar en un Plan de Desarrollo Individual (PDI) accionable a 30-60-90 días con indicadores observables de progreso."
    ],
    verified: true
  },
  {
    id: "SRC-KLUGER-DENISI-FIT",
    title: "The Effects of Feedback Interventions on Performance: Feedback Intervention Theory (FIT)",
    institution: "Psychological Bulletin (American Psychological Association, Vol. 119, No. 2, 254–284)",
    authors: "Avraham N. Kluger & Angelo DeNisi",
    year: 1996,
    url: "https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory",
    domain: "researchgate.net",
    category: "FEEDBACK_360",
    summary:
      "Meta-análisis monumental de 607 tamaños de efecto y 23,663 observaciones. Demostró que, aunque el feedback mejora el desempeño en promedio (d = 0.41), en más de un tercio de los casos deterioró el rendimiento. La Teoría de Intervención del Feedback (FIT) explica por qué: cuando la retroalimentación dirige la atención hacia el 'yo' (amenaza a la autoestima, comparaciones personales o etiquetas de personalidad), agota los recursos cognitivos; cuando dirige la atención hacia la tarea y los procesos conductuales concretos, maximiza el aprendizaje.",
    key_findings: [
      "Las intervenciones de feedback que atacan o juzgan la identidad personal reducen el rendimiento incluso cuando son bienintencionadas.",
      "Las intervenciones que especifican qué conducta modificar y cómo hacerlo con respecto a la tarea producen los mayores incrementos de eficacia."
    ],
    methodological_rules: [
      "El Agente de IA nunca debe emitir juicios sobre la personalidad intrínseca o valía del empleado; debe dirigir el 100% de las recomendaciones al nivel de proceso y conducta de tarea (Task-Motivation & Task-Learning Processes)."
    ],
    verified: true
  },
  {
    id: "SRC-DUDLEY-CONSCIENTIOUSNESS",
    title: "A Meta-Analytic Investigation of Conscientiousness in the Prediction of Job Performance",
    institution: "Journal of Applied Psychology / PubMed (NIH NLM)",
    authors: "NM Dudley, KA Orvis, JE Lebiecki & JM Cortina",
    year: 2006,
    url: "https://pubmed.ncbi.nlm.nih.gov/16435937/",
    domain: "pubmed.ncbi.nlm.nih.gov",
    category: "PSICOMETRIA_BARS",
    summary:
      "Evidencia meta-analítica publicada en el Journal of Applied Psychology sobre la validez predictiva de la Responsabilidad (Conscientiousness) y el valor incremental de sus facetas específicas (Orientación al logro, Fiabilidad/Dependability, Orden y Prudencia) sobre el desempeño global, conductas de ciudadanía organizacional y reducción de conductas contraproducentes.",
    key_findings: [
      "Las facetas estrechas de Fiabilidad (cumplimiento puntual de compromisos) y Orientación al Logro aportan validez incremental significativa más allá del rasgo global.",
      "Es el predictor conductual más consistente en todos los niveles jerárquicos."
    ],
    methodological_rules: [
      "Evaluar la responsabilidad desglosando fiabilidad documental, cumplimiento de plazos con pares y seguimiento de acuerdos."
    ],
    verified: true
  },
  {
    id: "SRC-GRANT-AMBIVERT",
    title: "Rethinking the Extraverted Leadership & Sales Ideal: The Ambivert Advantage",
    institution: "Psychological Science / Wharton School (University of Pennsylvania) / PubMed",
    authors: "Adam M. Grant",
    year: 2013,
    url: "https://pubmed.ncbi.nlm.nih.gov/23567176/",
    domain: "pubmed.ncbi.nlm.nih.gov",
    category: "LIDERAZGO_ASCENDENTE",
    summary:
      "Investigación empírica que demuestra una relación curvilínea (U invertida) entre extraversión/dominancia verbal y efectividad: las personas y líderes que combinan asertividad para expresar dirección con escucha receptiva (perfil ambivertido) superan significativamente tanto a los perfiles pasivos como a los excesivamente dominantes que acaparan la palabra.",
    key_findings: [
      "El exceso de dominancia verbal en gerentes y directores inhibe la participación de equipos proactivos.",
      "El equilibrio entre hablar con claridad y escuchar con atención maximiza la persuasión y la cohesión del equipo."
    ],
    methodological_rules: [
      "No premiar la locuacidad o dominancia como sinónimo de liderazgo; valorar la reciprocidad comunicativa (asertividad + escucha activa)."
    ],
    verified: true
  },
  {
    id: "SRC-SIOP-BARS",
    title: "SIOP Principles for Competency Modeling & Behaviorally Anchored Rating Scales (BARS)",
    institution: "Society for Industrial and Organizational Psychology (SIOP — Division 14 APA)",
    authors: "SIOP Task Force on Competency Modeling & Smith and Kendall (1963)",
    year: 2024,
    url: "https://www.siop.org/",
    domain: "siop.org",
    category: "PSICOMETRIA_BARS",
    summary:
      "Estándares psicométricos para el diseño de Escalas de Calificación Ancladas en Conductas (BARS) y prevención de sesgos de evaluación en sistemas multifuente: Efecto Halo (asignar la misma nota en todas las dimensiones por impresión general), Sesgo de Lenidad/Complacencia (inflar notas para evitar incomodidad), Sesgo de Severidad y Tendencia Central.",
    key_findings: [
      "Las escalas BARS reducen la varianza de error inter-evaluador al describir ejemplos conductuales explícitos para cada punto de la escala (1 a 5).",
      "El análisis psicométrico automatizado debe auditar la varianza intra-evaluación para detectar respuestas mecánicas o sesgo de halo."
    ],
    methodological_rules: [
      "Auditar estadísticamente cada evaluación recibida: marcar alerta psicométrica cuando la desviación estándar entre ítems sea casi nula (Efecto Halo) o cuando haya contradicción entre puntaje numérico y evidencia escrita."
    ],
    verified: true
  },
  {
    id: "SRC-ESCO-TRANSVERSAL",
    title: "ESCO Transversal Skills and Competences Taxonomy (European Commission)",
    institution: "European Commission — Employment, Social Affairs and Inclusion (ESCO)",
    authors: "ESCO Maintenance Committee & Expert Working Group on Transversal Skills",
    year: 2025,
    url: "https://esco.ec.europa.eu/",
    domain: "esco.ec.europa.eu",
    category: "TAXONOMIA",
    summary:
      "Clasificación multilingüe europea de capacidades transversales estructurada en Pensamiento (procesamiento de información, resolución de problemas, pensamiento crítico), Autogestión (actitud eficiente, gestión de la incertidumbre), Interacción Social (comunicación, apoyo a otros, trabajo en equipo, negociación) y Valores Ciudadanos y Ética Organizacional.",
    key_findings: [
      "Permite homologar competencias blandas entre áreas operativas, administrativas, comerciales y directivas bajo un lenguaje común auditable."
    ],
    methodological_rules: [
      "Cruzar la taxonomía O*NET con ESCO para cubrir tanto roles técnicos/operativos como roles ejecutivos en Iberoamérica."
    ],
    verified: true
  }
];

export const SOFT_SKILL_COMPETENCIES = [
  {
    id: "COMP-01",
    code: "CB-01",
    name: "Responsabilidad, Fiabilidad y Cumplimiento de Compromisos",
    cluster: "INTRAPERSONAL",
    clusterLabel: "1 · Autogestión, Fiabilidad y Resiliencia",
    framework: "O*NET Work Styles (1.D Conscientiousness & Dependability) · Dudley et al. (2006)",
    onet_code: "1.D.1.c / 1.D.1.d",
    description:
      "Grado en que la persona planifica su trabajo con rigor, cumple en fecha y calidad los acuerdos asumidos con compañeros, subordinados y superiores, y responde por sus resultados sin necesidad de recordatorios constantes.",
    why_relevant:
      "Predictor conductual más robusto del desempeño laboral en todas las ocupaciones (Dudley et al., 2006). En equipos interdependientes, la falta de fiabilidad de un eslabón bloquea el flujo de los demás.",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Incumple plazos comprometidos sin aviso previo; requiere seguimiento reiterado de pares o supervisores para cerrar entregables.",
      "2": "Cumple sus tareas principales pero olvida detalles acordados o avisa de los retrasos sobre la hora de vencimiento.",
      "3": "Cumple de forma consistente sus acuerdos en tiempo y forma; cuando surge un imprevisto, alerta con antelación y propone alternativa.",
      "4": "Anticipa cuellos de botella, lleva control sistemático de sus compromisos y entrega con cero defectos antes o dentro del plazo.",
      "5": "Referente de fiabilidad en toda la empresa: diseña mecanismos de seguimiento que elevan la puntualidad y el rigor de todo su entorno."
    },
    observable_indicators: [
      "Entrega lo acordado en la fecha pactada sin que deban recordárselo.",
      "Avisa con anticipación cuando un obstáculo compromete una entrega y presenta un plan de contingencia.",
      "Mantiene trazabilidad documental y orden en los asuntos bajo su responsabilidad."
    ],
    source_ids: ["SRC-ONET-WORKSTYLES", "SRC-DUDLEY-CONSCIENTIOUSNESS", "SRC-CREIO-GOLEMAN"],
    sortIndex: 1
  },
  {
    id: "COMP-02",
    code: "CB-02",
    name: "Autocontrol Emocional y Tolerancia a la Presión",
    cluster: "INTRAPERSONAL",
    clusterLabel: "1 · Autogestión, Fiabilidad y Resiliencia",
    framework: "O*NET Work Styles (1.D Emotionally Resilient) · CREIO Goleman (Self-Control)",
    onet_code: "1.D.2.a / 1.D.2.b",
    description:
      "Capacidad de mantener la serenidad, la claridad de juicio y el trato respetuoso frente a picos de trabajo, errores operativos, críticas, clientes difíciles o cambios bruscos de prioridad.",
    why_relevant:
      "El desborde emocional (gritos, sarcasmo, parálisis o pánico) deteriora de inmediato la seguridad psicológica del equipo y contamina la toma de decisiones (Goleman, 1998; Edmondson, 1999).",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Pierde la calma bajo presión; reacciona de forma impulsiva, defensiva o áspera ante errores o cuestionamientos.",
      "2": "Mantiene la compostura en situaciones rutinarias, pero muestra irritabilidad o desorganización visible en cierres críticos.",
      "3": "Conserva el trato respetuoso y se enfoca en resolver el problema durante contingencias o desacuerdos intensos.",
      "4": "Actúa como ancla de serenidad en momentos de crisis: separa el problema de las personas y ayuda a que el equipo recupere el foco.",
      "5": "Transforma situaciones de alta tensión en oportunidades de aprendizaje colectivo con ecuanimidad ejemplar."
    },
    observable_indicators: [
      "Responde a las críticas o malas noticias indagando los hechos en lugar de buscar culpables o alzar la voz.",
      "Prioriza con cabeza fría cuando coinciden múltiples urgencias.",
      "Mantiene el mismo respeto hacia subordinados, pares y superiores en momentos de estrés."
    ],
    source_ids: ["SRC-ONET-WORKSTYLES", "SRC-CREIO-GOLEMAN", "SRC-KLUGER-DENISI-FIT"],
    sortIndex: 2
  },
  {
    id: "COMP-03",
    code: "CB-03",
    name: "Adaptabilidad, Flexibilidad y Aprendizaje Activo",
    cluster: "INTRAPERSONAL",
    clusterLabel: "1 · Autogestión, Fiabilidad y Resiliencia",
    framework: "O*NET Soft Skills (Active Learning & Adaptability) · ESCO Transversal Skills",
    onet_code: "1.D.4.b / 2.A.2.b",
    description:
      "Disposición y agilidad para incorporar nuevos procesos, tecnologías, retroalimentación recibida y cambios de entorno sin aferrarse al 'siempre se ha hecho así'.",
    why_relevant:
      "La orientación al feedback (Feedback Orientation — London & Smither, 2002) determina si una evaluación 360° se traduce en mejora conductual real.",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Se resiste abiertamente a cambios de método o descarta la retroalimentación recibida justificándose sistemáticamente.",
      "2": "Acepta cambios solo tras insistencia reiterada; tarda en ajustar sus hábitos de trabajo.",
      "3": "Adopta nuevos procesos con buena disposición y ajusta su conducta cuando recibe observaciones fundamentadas.",
      "4": "Busca proactivamente retroalimentación, aprende herramientas nuevas con rapidez y propone mejoras al proceso.",
      "5": "Catalizador de cambio: facilita la transición de sus compañeros y convierte las lecciones aprendidas en estándares del área."
    },
    observable_indicators: [
      "Agradece y aplica las observaciones constructivas sin ponerse a la defensiva.",
      "Ajusta sus prioridades con agilidad cuando cambian las condiciones del negocio.",
      "Comparte con el equipo lo que aprende en nuevos proyectos o errores superados."
    ],
    source_ids: ["SRC-ONET-SOFTSKILLS", "SRC-SMITHER-META360", "SRC-ESCO-TRANSVERSAL"],
    sortIndex: 3
  },
  {
    id: "COMP-04",
    code: "CB-04",
    name: "Comunicación Asertiva y Escucha Activa",
    cluster: "HORIZONTAL_PARES",
    clusterLabel: "2 · Interacción Entre Pares y Colaboración",
    framework: "O*NET Soft Skills (Active Listening) · Grant (2013) Ambivert Advantage · CREIO",
    onet_code: "2.A.1.b",
    description:
      "Capacidad de escuchar con atención plena sin interrumpir, verificar la comprensión del mensaje ajeno y expresar ideas, límites o desacuerdos de forma clara, directa y respetuosa.",
    why_relevant:
      "La investigación de Grant (2013) y O*NET demuestra que la comunicación efectiva no es hablar más, sino equilibrar asertividad clara con escucha receptiva genuina.",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Interrumpe con frecuencia, impone su punto de vista sin escuchar o guarda silencio pasivo ocultando información clave.",
      "2": "Comunica datos básicos pero a veces deja ambigüedades o escucha de forma parcial cuando tiene prisa.",
      "3": "Escucha sin interrumpir, confirma haber comprendido y transmite información completa, clara y oportuna.",
      "4": "Adapta su registro comunicativo a distintos interlocutores, sintetiza acuerdos complejos y facilita que todas las voces sean escuchadas.",
      "5": "Domina la comunicación de alto impacto: destraba malentendidos entre áreas y genera claridad inmediata en temas sensibles."
    },
    observable_indicators: [
      "Parafrasea o resume los puntos del interlocutor antes de rebatir.",
      "Comunica malas noticias o riesgos a tiempo, con datos y sin rodeos.",
      "Escribe y habla con precisión, dejando claros los acuerdos, responsables y fechas."
    ],
    source_ids: ["SRC-ONET-SOFTSKILLS", "SRC-GRANT-AMBIVERT", "SRC-CREIO-GOLEMAN"],
    sortIndex: 4
  },
  {
    id: "COMP-05",
    code: "CB-05",
    name: "Colaboración Transversal y Cohesión entre Compañeros",
    cluster: "HORIZONTAL_PARES",
    clusterLabel: "2 · Interacción Entre Pares y Colaboración",
    framework: "O*NET Social Skills (Coordination & Service Orientation) · Google Project Oxygen #9",
    onet_code: "2.B.1.b / 2.B.1.f",
    description:
      "Disposición activa para coordinar acciones con pares de su misma área y de otros departamentos, compartir información sin silos, apoyar en picos de carga y priorizar el resultado colectivo sobre el lucimiento individual.",
    why_relevant:
      "Los silos departamentales son una de las principales causas de retrabajo y pérdida de margen identificadas en auditorías operativas de GesPro.",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Trabaja de forma aislada, retiene información útil o traslada culpas a otros departamentos ('eso no me toca a mí').",
      "2": "Colabora únicamente cuando se lo pide su jefe directo o dentro de su círculo inmediato.",
      "3": "Comparte información a tiempo, coordina entregas con otras áreas y ofrece apoyo práctico a sus compañeros.",
      "4": "Rompe silos entre departamentos: anticipa cómo su trabajo impacta a otras áreas y co-diseña soluciones conjuntas.",
      "5": "Tejedor de cohesión organizacional: reconocido en toda la empresa por compartir el mérito y destrabar proyectos interdepartamentales."
    },
    observable_indicators: [
      "Entrega insumos a otros departamentos pensando en facilitarles el siguiente paso del proceso.",
      "Comparte el reconocimiento cuando un logro fue producto del trabajo en equipo.",
      "Se ofrece a cubrir o apoyar a un par cuando detecta sobrecarga crítica."
    ],
    source_ids: ["SRC-ONET-SOFTSKILLS", "SRC-CREIO-GOLEMAN", "SRC-GOOGLE-OXYGEN"],
    sortIndex: 5
  },
  {
    id: "COMP-06",
    code: "CB-06",
    name: "Negociación y Resolución Constructiva de Conflictos",
    cluster: "HORIZONTAL_PARES",
    clusterLabel: "2 · Interacción Entre Pares y Colaboración",
    framework: "O*NET Social Skills (Negotiation) · CCL SBI Model · CREIO Conflict Management",
    onet_code: "2.B.1.d",
    description:
      "Capacidad de abordar desacuerdos de frente y con tacto, enfocándose en los hechos y los intereses compartidos en lugar de ataques personales, rumores de pasillo o evitación pasiva.",
    why_relevant:
      "El conflicto técnico bien gestionado eleva la calidad de las decisiones; el conflicto interpersonal mal gestionado o llevado a rumores destruye la productividad del equipo.",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Alimenta quejas de pasillo, escala cualquier diferencia como ataque personal o evita hablar con la persona involucrada.",
      "2": "Le cuesta abordar desacuerdos directos; suele ceder con resentimiento o imponer su postura sin buscar puntos medios.",
      "3": "Trata las diferencias directamente con la persona implicada basándose en hechos observables y buscando acuerdos viables.",
      "4": "Desactiva tensiones entre compañeros, identifica la raíz objetiva del desacuerdo y construye acuerdos ganar-ganar.",
      "5": "Mediador de referencia: transforma fricciones históricas entre áreas en protocolos claros de trabajo conjunto."
    },
    observable_indicators: [
      "Habla directamente con la persona con quien tiene una diferencia antes de quejarse con terceros.",
      "Utiliza hechos y datos (Situación-Conducta-Impacto) al plantear un reclamo.",
      "Propone alternativas concretas para destrabar un desacuerdo."
    ],
    source_ids: ["SRC-ONET-SOFTSKILLS", "SRC-CCL-SBI-360", "SRC-CREIO-GOLEMAN"],
    sortIndex: 6
  },
  {
    id: "COMP-07",
    code: "CB-07",
    name: "Seguridad Psicológica y Apertura al Disenso (Liderazgo Ascendente)",
    cluster: "LIDERAZGO_ASCENDENTE",
    clusterLabel: "3 · Liderazgo Ascendente: Supervisores, Gerentes y Directores",
    framework: "Amy Edmondson (HBS, 1999) 7-Item Scale · Google Project Aristotle & Oxygen #3",
    onet_code: "1.D.3 / Leadership",
    description:
      "Evaluada por subordinados y pares hacia líderes: capacidad del supervisor, gerente o director para crear un clima donde el equipo pueda reportar errores a tiempo, plantear problemas difíciles, pedir ayuda y expresar desacuerdos técnicos con respeto sin temor a represalias ni ridiculización.",
    why_relevant:
      "Según Edmondson (1999), cuando los subordinados temen la reacción del gerente o director, ocultan los problemas operativos hasta que es demasiado tarde para corregirlos.",
    applicable_directions: ["SELF", "UPWARD", "PEER", "DOWNWARD"],
    bars_anchors: {
      "1": "Penaliza o ridiculiza en público a quien reporta un problema o piensa distinto; el equipo calla por temor a represalias.",
      "2": "Declara que su puerta está abierta, pero sus gestos de impaciencia o molestia inhiben que los subordinados cuestionen ideas.",
      "3": "Escucha con respeto cuando un subordinado alerta de un error o propone otro enfoque, enfocándose en cómo solucionarlo.",
      "4": "Invita activamente al disenso técnico en las reuniones, agradece a quien detecta un riesgo a tiempo y admite sus propios errores.",
      "5": "Modela la Zona de Aprendizaje y Alto Desempeño (Edmondson): combina máxima apertura y confianza psicológica con altos estándares de excelencia."
    },
    observable_indicators: [
      "Cuando alguien comete un error honesto, pregunta '¿qué falló en el proceso y cómo lo prevenimos?' en vez de humillar.",
      "Pide explícitamente opiniones contrarias antes de cerrar una decisión importante.",
      "Reconoce públicamente cuando un subordinado tenía razón o aportó una mejor idea."
    ],
    source_ids: ["SRC-EDMONDSON-PSYCHSAFETY", "SRC-GOOGLE-OXYGEN", "SRC-KLUGER-DENISI-FIT"],
    sortIndex: 7
  },
  {
    id: "COMP-08",
    code: "CB-08",
    name: "Coaching, Desarrollo de Talento y Delegación sin Microgestión",
    cluster: "LIDERAZGO_ASCENDENTE",
    clusterLabel: "3 · Liderazgo Ascendente: Supervisores, Gerentes y Directores",
    framework: "Google Project Oxygen (Behaviors #1, #2 & #6) · CREIO Developing Others · CCL",
    onet_code: "2.B.1.c / 4.A.4.b.4",
    description:
      "Evaluada principalmente de forma ascendente (empleados → gerentes/directores): capacidad de delegar con objetivos y criterios claros sin asfixiar la autonomía (microgestión), ofreciendo retroalimentación formativa oportuna y apoyando el crecimiento profesional del equipo.",
    why_relevant:
      "Los comportamientos #1 (Buen Coach) y #2 (Empodera sin microgestionar) de Project Oxygen explican la mayor varianza en satisfacción, autonomía y retención de talento bajo un gerente.",
    applicable_directions: ["SELF", "UPWARD", "PEER", "DOWNWARD"],
    bars_anchors: {
      "1": "Microgestiona cada detalle o, en el extremo opuesto, abandona al equipo sin instrucciones y solo aparece para reprochar el resultado.",
      "2": "Delega tareas pero interviene abruptamente reescribiendo el trabajo sin explicar qué criterio debe aprender el subordinado.",
      "3": "Delega definiendo qué resultado se espera, acompaña cuando se le solicita y da retroalimentación útil para mejorar.",
      "4": "Hace preguntas que desarrollan el criterio propio de su gente, asigna retos progresivos y sostiene conversaciones periódicas de desarrollo.",
      "5": "Multiplicador de talento: forma líderes autónomos, impulsa el crecimiento de su equipo y eleva de forma medible la capacidad técnica y humana del área."
    },
    observable_indicators: [
      "Define con claridad el objetivo y el margen de decisión al delegar, sin controlar cada paso intermedio.",
      "Dedica tiempo a explicar el 'porqué' detrás de las correcciones para que el empleado aprenda.",
      "Reconoce los avances individuales y apoya el desarrollo profesional de sus reportes directos."
    ],
    source_ids: ["SRC-GOOGLE-OXYGEN", "SRC-CREIO-GOLEMAN", "SRC-CCL-SBI-360"],
    sortIndex: 8
  },
  {
    id: "COMP-09",
    code: "CB-09",
    name: "Claridad Estratégica, Justicia Organizacional y Toma de Decisiones",
    cluster: "LIDERAZGO_ASCENDENTE",
    clusterLabel: "3 · Liderazgo Ascendente: Supervisores, Gerentes y Directores",
    framework: "Google Project Oxygen (Behaviors #7 & #10) · O*NET Judgment & Decision Making",
    onet_code: "2.A.2.d / 1.D.4.f",
    description:
      "Capacidad de dirección y gerencia para traducir los objetivos de la empresa en prioridades claras para el equipo, tomar decisiones a tiempo sin parálisis por análisis y aplicar criterios equitativos y transparentes sin favoritismos.",
    why_relevant:
      "La ambigüedad de rol y la percepción de injusticia o favoritismo en gerentes y directores erosionan el compromiso organizacional más rápido que la carga de trabajo.",
    applicable_directions: ["SELF", "UPWARD", "PEER", "DOWNWARD"],
    bars_anchors: {
      "1": "Cambia las prioridades a diario sin explicación, posterga decisiones críticas o muestra favoritismos evidentes en el trato y distribución de carga.",
      "2": "Comunica metas generales pero deja dudas sobre qué es prioritario; a veces tarda en decidir ante dilemas operativos.",
      "3": "Establece prioridades claras, decide oportunamente con base en datos y aplica las mismas reglas para todos los miembros del equipo.",
      "4": "Conecta el trabajo diario del área con la estrategia de la empresa, explica la lógica de sus decisiones y distribuye cargas con equidad.",
      "5": "Brújula estratégica: en escenarios complejos o inciertos, alinea a toda la organización con decisiones justas, transparentes y fundamentadas."
    },
    observable_indicators: [
      "El equipo sabe con exactitud cuáles son las 3 prioridades de la semana y qué se espera de cada rol.",
      "Toma decisiones difíciles a tiempo y asume la responsabilidad de sus consecuencias ante la dirección.",
      "Evalúa y distribuye oportunidades y cargas de trabajo por mérito y evidencia, sin favoritismos."
    ],
    source_ids: ["SRC-GOOGLE-OXYGEN", "SRC-ONET-SOFTSKILLS", "SRC-SIOP-BARS"],
    sortIndex: 9
  },
  {
    id: "COMP-10",
    code: "CB-10",
    name: "Pensamiento Crítico y Resolución Estructurada de Problemas",
    cluster: "TRANSVERSAL_DIRECTIVO",
    clusterLabel: "4 · Pensamiento Crítico, Empatía e Integridad Organizacional",
    framework: "O*NET Thinking Skills (Critical Thinking & Complex Problem Solving) · WEF Core Skills",
    onet_code: "2.A.2.a / 2.B.2.i",
    description:
      "Uso de la lógica, los datos y el análisis de causa raíz para diagnosticar problemas complejos, evaluar costos y beneficios de distintas opciones e implementar soluciones que ataquen el origen y no solo el síntoma.",
    why_relevant:
      "Competencia transversal #1 en el reporte Future of Jobs del Foro Económico Mundial y en la taxonomía Thinking Skills de O*NET.",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Actúa por impulso o suposición sin verificar datos; aplica parches superficiales que hacen que el mismo problema se repita.",
      "2": "Identifica el problema evidente pero necesita guía constante para analizar sus causas o estructurar alternativas.",
      "3": "Reúne datos relevantes antes de concluir, distingue causas de síntomas y propone soluciones viables y bien pensadas.",
      "4": "Estructura problemas ambiguos en variables claras, evalúa riesgos de segundo orden y presenta opciones respaldadas por evidencia.",
      "5": "Pensador sistémico: detecta fallas estructurales de proceso antes de que ocurran y diseña soluciones que optimizan toda la cadena de valor."
    },
    observable_indicators: [
      "Verifica los datos y pregunta por la causa raíz antes de dar por buena una explicación.",
      "Cuando plantea un problema a su superior o a sus pares, lleva al menos dos opciones de solución analizadas.",
      "Evalúa el impacto de una decisión en las demás áreas de la empresa."
    ],
    source_ids: ["SRC-ONET-SOFTSKILLS", "SRC-ESCO-TRANSVERSAL"],
    sortIndex: 10
  },
  {
    id: "COMP-11",
    code: "CB-11",
    name: "Empatía, Perceptividad Social y Respeto por la Dignidad Humana",
    cluster: "TRANSVERSAL_DIRECTIVO",
    clusterLabel: "4 · Pensamiento Crítico, Empatía e Integridad Organizacional",
    framework: "O*NET Social Perceptiveness (2.B.1.a) & Empathy · CREIO Goleman Empathy",
    onet_code: "2.B.1.a / 1.D.3.b",
    description:
      "Sensibilidad para captar las reacciones, cargas y perspectivas de compañeros, subordinados y superiores, manteniendo un trato humano, considerado y respetuoso sin sacrificar la exigencia profesional.",
    why_relevant:
      "En la taxonomía O*NET (Social Perceptiveness) y CREIO, la empatía permite calibrar el mensaje para lograr cooperación genuina y prevenir el desgaste emocional (burnout).",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Muestra indiferencia ante el impacto de sus palabras o decisiones en las personas; utiliza tono despectivo o ignora señales evidentes de saturación.",
      "2": "Es cortés en lo formal pero le cuesta ponerse en el lugar de otros departamentos o niveles jerárquicos.",
      "3": "Escucha con genuino interés las circunstancias de los demás y mantiene un trato cálido, digno y respetuoso con todos los niveles.",
      "4": "Lee con precisión el clima del equipo, detecta a tiempo señales de sobrecarga o desmotivación y actúa con sensibilidad y firmeza equilibradas.",
      "5": "Referente de calidad humana: logra exigir los más altos estándares haciendo que cada persona se sienta valorada y respetada."
    },
    observable_indicators: [
      "Trata con la misma cortesía y respeto al personal operativo, administrativo, par y directivo.",
      "Corrige en privado y reconoce en público.",
      "Considera las restricciones reales del otro antes de juzgar su desempeño."
    ],
    source_ids: ["SRC-ONET-SOFTSKILLS", "SRC-ONET-WORKSTYLES", "SRC-CREIO-GOLEMAN"],
    sortIndex: 11
  },
  {
    id: "COMP-12",
    code: "CB-12",
    name: "Integridad, Ética Profesional y Coherencia (Predicar con el Ejemplo)",
    cluster: "TRANSVERSAL_DIRECTIVO",
    clusterLabel: "4 · Pensamiento Crítico, Empatía e Integridad Organizacional",
    framework: "O*NET Work Styles (1.D.1.d Integrity) · CREIO Trustworthiness · SIOP",
    onet_code: "1.D.1.d",
    description:
      "Honestidad intelectual y ética en el manejo de información, recursos y relaciones laborales: decir la verdad aunque sea incómoda, no atribuirse el trabajo ajeno, admitir errores propios y sostener coherencia entre lo que se exige y lo que se practica.",
    why_relevant:
      "La confianza organizacional descansa sobre la integridad percibida de pares y líderes; sin ella, cualquier sistema de control o evaluación pierde legitimidad.",
    applicable_directions: ["SELF", "PEER", "UPWARD", "DOWNWARD"],
    bars_anchors: {
      "1": "Oculta errores, distorsiona cifras o promesas para salir del paso, o se atribuye méritos que corresponden a sus compañeros o subordinados.",
      "2": "Cumple las normas cuando hay supervisión directa, pero a veces busca atajos ambiguos bajo presión.",
      "3": "Actúa con rectitud, reporta la realidad de los datos sin maquillarla y respeta el crédito del trabajo de los demás.",
      "4": "Admite sus errores de inmediato, defiende criterios éticos aunque resulten incómodos y genera plena confianza en todas las direcciones.",
      "5": "Estándar ético de la organización: su coherencia entre palabra y acción inspira credibilidad absoluta ante clientes, subordinados, pares y junta directiva."
    },
    observable_indicators: [
      "Reporta las cifras y el estado de los proyectos con total veracidad, sin maquillar indicadores.",
      "Da crédito explícito al autor real de una propuesta o esfuerzo ante la gerencia o dirección.",
      "Practica en sí mismo las normas de puntualidad, rigor y respeto que exige a los demás."
    ],
    source_ids: ["SRC-ONET-WORKSTYLES", "SRC-CREIO-GOLEMAN", "SRC-SIOP-BARS"],
    sortIndex: 12
  }
];

export const GESPRO_COMPANIES = [
  {
    id: "cmqh9nb290000mrjuaolf17a2",
    name: "Nexus Digital Hub",
    industry: "Software de gestión empresarial (SaaS B2B)",
    country: "México · Colombia · Perú",
    description: "Plataforma SaaS de gestión empresarial para PyMEs en Latinoamérica con más de 240 clientes activos."
  },
  {
    id: "cmqra3no20000pubxhfsllnqd",
    name: "Medical Shields",
    industry: "Salud · Dispositivos médicos y farmacéutica",
    country: "Venezuela",
    description: "Representación de casas médicas, importación y distribución de productos farmacéuticos y cuidado avanzado de heridas."
  },
  {
    id: "cmu6d5wib0000xzddjlektvus",
    name: "\"SAPPCORP MÉXICO\", S.A. DE C.V.",
    industry: "Petróleo y Servicios Industriales",
    country: "México (Tampico, Tamaulipas)",
    description: "Servicios especializados a refinerías, ductos, ensayos no destructivos, tratamiento de agua e ingeniería EPC."
  },
  {
    id: "cmq9jrguh0000hcs3rxixsazc",
    name: "INVERSIONES ARAGUA 2003, C.A.",
    industry: "Automotriz · Lubricantes y Filtros",
    country: "Venezuela",
    description: "Comercialización y distribución mayorista de lubricantes, filtros y suministros automotrices."
  }
];

export const SEED_EMPLOYEES = [
  // ── NEXUS DIGITAL HUB ──────────────────────────────────────────────────────
  {
    id: "EMP-NX-01",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    name: "Diego Morales",
    email: "diego.morales@nexus.mx",
    title: "Director Comercial y de Crecimiento",
    department: "Dirección Comercial",
    hierarchy_level: "DIRECCION",
    managerId: null,
    avatar_initials: "DM",
    tenure_months: 48,
    mission: "Dirigir la estrategia de ingresos, expansión regional en México, Colombia y Perú y alinear los frentes de ventas, producto y éxito del cliente."
  },
  {
    id: "EMP-NX-02",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    name: "Sofía Ramírez",
    email: "sofia.ramirez@nexus.mx",
    title: "Gerente de Ingeniería y Arquitectura (Tech Lead)",
    department: "Tecnología y Producto",
    hierarchy_level: "GERENCIA",
    managerId: "EMP-NX-01",
    avatar_initials: "SR",
    tenure_months: 36,
    mission: "Asegurar la estabilidad de la plataforma SaaS, liderar el equipo de ingeniería y coordinar entregas técnicas con Producto e Implantación."
  },
  {
    id: "EMP-NX-03",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    name: "María Fernández",
    email: "maria.fernandez@nexus.mx",
    title: "Gerente de Operaciones e Implantación",
    department: "Operaciones y Servicios Profesionales",
    hierarchy_level: "GERENCIA",
    managerId: "EMP-NX-01",
    avatar_initials: "MF",
    tenure_months: 42,
    mission: "Garantizar que las implantaciones en clientes corporativos se entreguen en alcance, plazo y rentabilidad."
  },
  {
    id: "EMP-NX-04",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    name: "Laura Castillo",
    email: "laura.castillo@nexus.mx",
    title: "Coordinadora de Producto (Product Manager)",
    department: "Tecnología y Producto",
    hierarchy_level: "SUPERVISION",
    managerId: "EMP-NX-02",
    avatar_initials: "LC",
    tenure_months: 28,
    mission: "Priorizar el roadmap funcional escuchando a clientes, ventas e ingeniería, asegurando especificaciones claras."
  },
  {
    id: "EMP-NX-05",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    name: "Pablo Jiménez",
    email: "pablo.jimenez@nexus.mx",
    title: "Coordinador de Éxito del Cliente (Customer Success)",
    department: "Operaciones y Servicios Profesionales",
    hierarchy_level: "SUPERVISION",
    managerId: "EMP-NX-03",
    avatar_initials: "PJ",
    tenure_months: 24,
    mission: "Sostener la retención neta de ingresos (NRR), acompañar la adopción posventa y prevenir la cancelación de cuentas."
  },
  {
    id: "EMP-NX-06",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    name: "Andrés Vega",
    email: "andres.vega@nexus.mx",
    title: "Desarrollador Senior Full-Stack",
    department: "Tecnología y Producto",
    hierarchy_level: "OPERATIVO",
    managerId: "EMP-NX-02",
    avatar_initials: "AV",
    tenure_months: 20,
    mission: "Desarrollar módulos críticos del ERP en la nube, revisar código de pares y resolver incidencias de nivel 3."
  },
  {
    id: "EMP-NX-07",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    name: "Valeria Mendoza",
    email: "valeria.mendoza@nexus.mx",
    title: "Consultora de Implantación Senior",
    department: "Operaciones y Servicios Profesionales",
    hierarchy_level: "OPERATIVO",
    managerId: "EMP-NX-03",
    avatar_initials: "VM",
    tenure_months: 16,
    mission: "Levantar procesos en el cliente, parametrizar módulos, migrar datos históricos y capacitar a usuarios clave."
  },

  // ── MEDICAL SHIELDS ────────────────────────────────────────────────────────
  {
    id: "EMP-MS-01",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    name: "Rosse",
    email: "admin@medical-shields.com",
    title: "Directora General",
    department: "Dirección Ejecutiva",
    hierarchy_level: "DIRECCION",
    managerId: null,
    avatar_initials: "RO",
    tenure_months: 60,
    mission: "Dirigir la estrategia institucional, las alianzas con casas médicas internacionales y la solvencia integral de Medical Shields."
  },
  {
    id: "EMP-MS-02",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    name: "Daniel López",
    email: "daniel.lopez.ve@gmail.com",
    title: "Gerente Nacional Comercial y de Visita Médica",
    department: "Dirección Comercial / Ventas",
    hierarchy_level: "GERENCIA",
    managerId: "EMP-MS-01",
    avatar_initials: "DL",
    tenure_months: 30,
    mission: "Conducir la fuerza de visita médica, captación de clínicas de alto interés y cobranza efectiva en farmacias y distribuidores."
  },
  {
    id: "EMP-MS-03",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    name: "Gersom Ortiz",
    email: "gersom.ortiz.ve@gmail.com",
    title: "Gerente de Desarrollo Organizacional y Operaciones",
    department: "Operaciones y Talento",
    hierarchy_level: "GERENCIA",
    managerId: "EMP-MS-01",
    avatar_initials: "GO",
    tenure_months: 26,
    mission: "Alinear los procesos logísticos, el cumplimiento regulatorio sanitario y el desarrollo del talento comercial y técnico."
  },
  {
    id: "EMP-MS-04",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    name: "Carolina Herrera",
    email: "carolina.herrera@medical-shields.com",
    title: "Visitadora Médica Comercial (Zona Capital)",
    department: "Dirección Comercial / Ventas",
    hierarchy_level: "OPERATIVO",
    managerId: "EMP-MS-02",
    avatar_initials: "CH",
    tenure_months: 18,
    mission: "Generar prescripción con especialistas, negociar inclusión en clínicas y gestionar venta y cobranza en cadenas de farmacias."
  },
  {
    id: "EMP-MS-05",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    name: "Miguel Ángel Rivas",
    email: "miguel.rivas@medical-shields.com",
    title: "Visitador Médico Comercial (Zona Centro-Occidente)",
    department: "Dirección Comercial / Ventas",
    hierarchy_level: "OPERATIVO",
    managerId: "EMP-MS-02",
    avatar_initials: "MR",
    tenure_months: 14,
    mission: "Expandir el portafolio de cuidado avanzado de heridas y bioseguridad en hospitales, clínicas y distribuidores regionales."
  },

  // ── SAPPCORP MÉXICO, S.A. DE C.V. ──────────────────────────────────────────
  {
    id: "EMP-SP-01",
    gesproCompanyId: "cmu6d5wib0000xzddjlektvus",
    name: "Víctor Manuel de la Rosa Peña",
    email: "vdelarosa@sappcorp.mx",
    title: "Administrador Único / Director General",
    department: "Dirección y Gobierno Societario",
    hierarchy_level: "DIRECCION",
    managerId: null,
    avatar_initials: "VR",
    tenure_months: 72,
    mission: "Dirigir y representar legal y estratégicamente a la sociedad ante clientes del sector energético e industrial."
  },
  {
    id: "EMP-SP-02",
    gesproCompanyId: "cmu6d5wib0000xzddjlektvus",
    name: "Ing. Héctor Cantú",
    email: "hcantu@sappcorp.mx",
    title: "Gerente de Operaciones y Servicios de Campo",
    department: "Operaciones y Mantenimiento Industrial",
    hierarchy_level: "GERENCIA",
    managerId: "EMP-SP-01",
    avatar_initials: "HC",
    tenure_months: 38,
    mission: "Garantizar que cada servicio en refinerías y ductos se ejecute en alcance, plazo, seguridad y margen comprometidos."
  },
  {
    id: "EMP-SP-03",
    gesproCompanyId: "cmu6d5wib0000xzddjlektvus",
    name: "Ing. Mariana Treviño",
    email: "mtrevino@sappcorp.mx",
    title: "Gerente de SSPA (Seguridad, Salud y Protección Ambiental)",
    department: "Seguridad, Salud y Protección Ambiental (SSPA)",
    hierarchy_level: "GERENCIA",
    managerId: "EMP-SP-01",
    avatar_initials: "MT",
    tenure_months: 34,
    mission: "Prevenir incidentes en campo y sostener la elegibilidad normativa de la empresa ante clientes petroleros y reguladores."
  },
  {
    id: "EMP-SP-04",
    gesproCompanyId: "cmu6d5wib0000xzddjlektvus",
    name: "Téc. Roberto Garza",
    email: "rgarza@sappcorp.mx",
    title: "Supervisor de Campo (Limpieza Química y Nitrógeno)",
    department: "Operaciones y Mantenimiento Industrial",
    hierarchy_level: "SUPERVISION",
    managerId: "EMP-SP-02",
    avatar_initials: "RG",
    tenure_months: 25,
    mission: "Dirigir en sitio la cuadrilla asignada y responder por la ejecución segura y conforme de paros de planta."
  },

  // ── INVERSIONES ARAGUA 2003, C.A. ──────────────────────────────────────────
  {
    id: "EMP-IA-01",
    gesproCompanyId: "cmq9jrguh0000hcs3rxixsazc",
    name: "Alberto Mendoza",
    email: "amendoza@inversionesaragua.com",
    title: "Director General",
    department: "Dirección Ejecutiva",
    hierarchy_level: "DIRECCION",
    managerId: null,
    avatar_initials: "AM",
    tenure_months: 84,
    mission: "Dirigir la operación comercial y financiera de distribución mayorista de lubricantes y filtros a nivel nacional."
  },
  {
    id: "EMP-IA-02",
    gesproCompanyId: "cmq9jrguh0000hcs3rxixsazc",
    name: "Elena Bolívar",
    email: "ebolivar@inversionesaragua.com",
    title: "Gerente de Ventas y Cobranzas",
    department: "Mercadeo y Ventas",
    hierarchy_level: "GERENCIA",
    managerId: "EMP-IA-01",
    avatar_initials: "EB",
    tenure_months: 40,
    mission: "Coordinar la fuerza de ventas, control de cartera vencida y rotación de líneas de lubricantes y filtros."
  },
  {
    id: "EMP-IA-03",
    gesproCompanyId: "cmq9jrguh0000hcs3rxixsazc",
    name: "Carlos Zambrano",
    email: "czambrano@inversionesaragua.com",
    title: "Jefe de Almacén y Despacho",
    department: "Logística y Almacén",
    hierarchy_level: "SUPERVISION",
    managerId: "EMP-IA-01",
    avatar_initials: "CZ",
    tenure_months: 32,
    mission: "Custodiar el inventario físico, conteos cíclicos y despacho puntual a rutas comerciales."
  }
];

export const SEED_CYCLES = [
  {
    id: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    name: "Ciclo 360° Cualidades Blandas y Liderazgo · 4T 2026",
    period: "2026-Q4",
    status: "OPEN",
    purpose: "DEVELOPMENTAL",
    anonymity_threshold: 2,
    description:
      "Evaluación multifuente integral (Autoevaluación, Entre Pares, Subordinados → Gerentes/Directores y Superiores → Equipo) anclada en O*NET, Project Oxygen, Seguridad Psicológica de Edmondson y método SBI."
  },
  {
    id: "CYC-MS-2026Q4",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    name: "Ciclo 360° Fuerza Comercial, Operaciones y Dirección · 4T 2026",
    period: "2026-Q4",
    status: "OPEN",
    purpose: "DEVELOPMENTAL",
    anonymity_threshold: 2,
    description:
      "Evaluación de competencias interpersonales, adaptabilidad comunicativa ('camaleón verbal'), cohesión entre visita médica y operaciones, y liderazgo ascendente."
  },
  {
    id: "CYC-SP-2026Q4",
    gesproCompanyId: "cmu6d5wib0000xzddjlektvus",
    name: "Diagnóstico 360° Seguridad Psicológica en Campo y Liderazgo · 4T 2026",
    period: "2026-Q4",
    status: "OPEN",
    purpose: "DEVELOPMENTAL",
    anonymity_threshold: 2,
    description:
      "Evaluación de liderazgo en paros de planta, coordinación Operaciones-SSPA y apertura para reportar riesgos en sitio sin temor a represalias."
  }
];

export const SEED_EVALUATIONS = [
  // ── Evaluaciones hacia Diego Morales (Director Comercial - Nexus) ──────────
  // 1. Autoevaluación de Diego Morales (muestra sobreestimación en escucha y delegación: Punto Ciego)
  {
    id: "EV-NX-001",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-01",
    targetId: "EMP-NX-01",
    direction: "SELF",
    is_anonymous: false,
    scores: {
      "COMP-01": 4.8,
      "COMP-02": 4.5,
      "COMP-03": 4.4,
      "COMP-04": 4.6,
      "COMP-05": 4.5,
      "COMP-06": 4.4,
      "COMP-07": 4.6,
      "COMP-08": 4.5,
      "COMP-09": 4.8,
      "COMP-10": 4.7,
      "COMP-11": 4.4,
      "COMP-12": 4.9
    },
    sbi_situation: "Durante el cierre trimestral de cuentas corporativas en México y Colombia del último mes.",
    sbi_behavior: "Me involucré personalmente en las negociaciones clave, fijé metas semanales exigentes para las gerencias y tomé decisiones rápidas sobre precios y alcances.",
    sbi_impact: "Logramos sostener el ritmo de crecimiento del 42% YoY, aunque reconozco que a veces entro directamente en los detalles operativos por la urgencia comercial.",
    growth_suggestion: "Sistematizar reuniones de delegación estratégica para no absorber tareas operativas de las gerencias."
  },
  // 2. Evaluación Ascendente (UPWARD) de Sofía Ramírez (Gerente de Ingeniería) hacia su Director Diego Morales
  {
    id: "EV-NX-002",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-02",
    targetId: "EMP-NX-01",
    direction: "UPWARD",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.5,
      "COMP-02": 3.1,
      "COMP-03": 3.4,
      "COMP-04": 2.9,
      "COMP-05": 3.3,
      "COMP-06": 3.2,
      "COMP-07": 2.8,
      "COMP-08": 2.7,
      "COMP-09": 3.6,
      "COMP-10": 4.4,
      "COMP-11": 3.0,
      "COMP-12": 4.6
    },
    sbi_situation: "En las reuniones de comité de los lunes cuando Ingeniería u Operaciones reportan que un requerimiento comercial requiere más tiempo de desarrollo.",
    sbi_behavior: "Diego interrumpe la explicación técnica a los pocos minutos, eleva el tono diciendo que 'el cliente no puede esperar' y compromete fechas de entrega con el cliente sin consultar antes la capacidad real del equipo.",
    sbi_impact: "El equipo técnico siente temor de reportar riesgos a tiempo (baja seguridad psicológica) y terminamos haciendo horas extra de emergencia o reescribiendo alcance a mitad de implantación.",
    growth_suggestion: "Escuchar el diagnóstico técnico completo antes de comprometer fechas comerciales y acordar un protocolo de viabilidad previo a la firma."
  },
  // 3. Evaluación Ascendente (UPWARD) de María Fernández (Gerente de Operaciones) hacia su Director Diego Morales
  {
    id: "EV-NX-003",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-03",
    targetId: "EMP-NX-01",
    direction: "UPWARD",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.4,
      "COMP-02": 3.2,
      "COMP-03": 3.5,
      "COMP-04": 3.0,
      "COMP-05": 3.4,
      "COMP-06": 3.3,
      "COMP-07": 3.0,
      "COMP-08": 2.9,
      "COMP-09": 3.5,
      "COMP-10": 4.5,
      "COMP-11": 3.2,
      "COMP-12": 4.7
    },
    sbi_situation: "Durante el arranque de los tres clientes corporativos de Perú en las últimas cuatro semanas.",
    sbi_behavior: "Diego solicitó reportes diarios por mensajería a los consultores saltándose la coordinación de Operaciones y cambió dos veces la prioridad de implantación en la misma semana.",
    sbi_impact: "Generó confusión en los consultores sobre qué proyecto priorizar y sensación de microgestión, aunque su visión comercial e integridad con el negocio son admirables.",
    growth_suggestion: "Canalizar los cambios de prioridad a través de la gerencia de área y mantener estables los acuerdos semanales."
  },
  // 4. Evaluación Ascendente Skip-Level (UPWARD) de Laura Castillo hacia el Director Diego Morales
  {
    id: "EV-NX-004",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-04",
    targetId: "EMP-NX-01",
    direction: "UPWARD",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.6,
      "COMP-02": 3.3,
      "COMP-03": 3.6,
      "COMP-04": 3.1,
      "COMP-05": 3.5,
      "COMP-06": 3.4,
      "COMP-07": 3.1,
      "COMP-08": 3.0,
      "COMP-09": 3.8,
      "COMP-10": 4.6,
      "COMP-11": 3.3,
      "COMP-12": 4.8
    },
    sbi_situation: "En la revisión mensual del roadmap de producto del trimestre.",
    sbi_behavior: "Aportó datos muy valiosos del mercado latinoamericano, pero descartó sin debate dos iniciativas de deuda técnica propuestas por el equipo.",
    sbi_impact: "Aporta gran claridad comercial, pero los especialistas sentimos que cuesta plantear objeciones cuando ya tomó una postura inicial.",
    growth_suggestion: "Abrir un bloque de 10 minutos de preguntas y objeciones antes de cerrar decisiones de roadmap."
  },

  // ── Evaluaciones hacia Sofía Ramírez (Gerente de Ingeniería - Nexus) ───────
  // 5. Autoevaluación de Sofía Ramírez (muestra humildad / ligera subestimación: Talento Oculto)
  {
    id: "EV-NX-005",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-02",
    targetId: "EMP-NX-02",
    direction: "SELF",
    is_anonymous: false,
    scores: {
      "COMP-01": 4.2,
      "COMP-02": 3.9,
      "COMP-03": 4.1,
      "COMP-04": 3.8,
      "COMP-05": 4.0,
      "COMP-06": 3.7,
      "COMP-07": 4.1,
      "COMP-08": 3.9,
      "COMP-09": 3.8,
      "COMP-10": 4.4,
      "COMP-11": 4.1,
      "COMP-12": 4.5
    },
    sbi_situation: "Coordinación de lanzamientos técnicos y soporte a implantaciones durante el trimestre.",
    sbi_behavior: "He procurado proteger al equipo de cambios bruscos y documentar las causas raíz de cada incidente antes de desplegar parches.",
    sbi_impact: "Reducimos los incidentes en producción en un 35%, aunque siento que debo ser más firme negociando plazos con Dirección Comercial.",
    growth_suggestion: "Fortalecer mis habilidades de negociación ejecutiva con datos de capacidad para defender mejor los tiempos de ingeniería."
  },
  // 6. Evaluación Entre Pares (PEER) de María Fernández (Gerente Operaciones) hacia Sofía Ramírez (Gerente Ingeniería)
  {
    id: "EV-NX-006",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-03",
    targetId: "EMP-NX-02",
    direction: "PEER",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.8,
      "COMP-02": 4.6,
      "COMP-03": 4.5,
      "COMP-04": 4.5,
      "COMP-05": 4.7,
      "COMP-06": 4.4,
      "COMP-07": 4.7,
      "COMP-08": 4.6,
      "COMP-09": 4.5,
      "COMP-10": 4.9,
      "COMP-11": 4.7,
      "COMP-12": 4.9
    },
    sbi_situation: "Durante la migración crítica de datos del cliente industrial de Monterrey el mes pasado.",
    sbi_behavior: "Sofía no dijo 'eso es problema de implantación'; se sentó con mi equipo de consultores, analizó los logs de migración y diseñó un validador automático en 24 horas.",
    sbi_impact: "Salvó la fecha de salida en vivo del cliente y fortaleció la confianza entre Operaciones e Ingeniería sin buscar protagonismo.",
    growth_suggestion: "Visibilizar más ante Dirección el trabajo preventivo que su equipo hace para evitar caídas."
  },
  // 7. Evaluación Ascendente (UPWARD) de Andrés Vega (Dev Senior) hacia su Gerente Sofía Ramírez
  {
    id: "EV-NX-007",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-06",
    targetId: "EMP-NX-02",
    direction: "UPWARD",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.9,
      "COMP-02": 4.7,
      "COMP-03": 4.6,
      "COMP-04": 4.6,
      "COMP-05": 4.8,
      "COMP-06": 4.5,
      "COMP-07": 4.9,
      "COMP-08": 4.8,
      "COMP-09": 4.5,
      "COMP-10": 4.9,
      "COMP-11": 4.8,
      "COMP-12": 5.0
    },
    sbi_situation: "En el post-mortem del incidente de facturación electrónica hace tres semanas.",
    sbi_behavior: "Cuando admití que mi cambio en el índice causó la lentitud, Sofía agradeció la transparencia inmediata, detuvo cualquier búsqueda de culpables y guio al equipo para crear el test automatizado de regresión.",
    sbi_impact: "Genera una seguridad psicológica total en ingeniería: cualquiera reporta un bug en el minuto uno porque sabemos que se analiza con rigor técnico y respeto.",
    growth_suggestion: "Seguir delegando presentaciones ante dirección para que el equipo senior gane exposición ejecutiva."
  },
  // 8. Evaluación Ascendente (UPWARD) de Laura Castillo (PM) hacia su Gerente Sofía Ramírez
  {
    id: "EV-NX-008",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-04",
    targetId: "EMP-NX-02",
    direction: "UPWARD",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.7,
      "COMP-02": 4.6,
      "COMP-03": 4.5,
      "COMP-04": 4.4,
      "COMP-05": 4.7,
      "COMP-06": 4.3,
      "COMP-07": 4.8,
      "COMP-08": 4.7,
      "COMP-09": 4.4,
      "COMP-10": 4.8,
      "COMP-11": 4.7,
      "COMP-12": 4.9
    },
    sbi_situation: "En las sesiones quincenales 1-a-1 de seguimiento de producto.",
    sbi_behavior: "Dedica tiempo a revisar mis especificaciones con preguntas socráticas sin imponerme la solución y me respalda cuando hay presión comercial desmedida.",
    sbi_impact: "He mejorado notablemente la calidad de mis criterios de aceptación y me siento empoderada en mi rol.",
    growth_suggestion: "Ser aún más asertiva frente a Dirección cuando nos piden meter cambios fuera de sprint."
  },
  // 9. Evaluación Descendente (DOWNWARD) de Diego Morales (Director) hacia Sofía Ramírez
  {
    id: "EV-NX-009",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-01",
    targetId: "EMP-NX-02",
    direction: "DOWNWARD",
    is_anonymous: false,
    scores: {
      "COMP-01": 4.8,
      "COMP-02": 4.7,
      "COMP-03": 4.3,
      "COMP-04": 4.2,
      "COMP-05": 4.6,
      "COMP-06": 4.2,
      "COMP-07": 4.7,
      "COMP-08": 4.7,
      "COMP-09": 4.4,
      "COMP-10": 4.9,
      "COMP-11": 4.6,
      "COMP-12": 5.0
    },
    sbi_situation: "Cumplimiento del plan anual de arquitectura e integración con Operaciones.",
    sbi_behavior: "Mantiene indicadores de estabilidad impecables y un equipo altamente cohesionado; cuando dice que algo estará listo el viernes, está listo el viernes.",
    sbi_impact: "Da solidez técnica a todo Nexus Digital Hub.",
    growth_suggestion: "Presentar propuestas de recorte de alcance más rápidas cuando comercial necesita salir al mercado con un MVP."
  },

  // ── Evaluaciones entre Pares y Superiores para Andrés Vega y Valeria Mendoza (Operativo - Nexus) ──
  // 10. Autoevaluación de Andrés Vega
  {
    id: "EV-NX-010",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-06",
    targetId: "EMP-NX-06",
    direction: "SELF",
    is_anonymous: false,
    scores: {
      "COMP-01": 4.5,
      "COMP-02": 4.2,
      "COMP-03": 4.4,
      "COMP-04": 3.9,
      "COMP-05": 4.0,
      "COMP-06": 3.8,
      "COMP-07": 4.1,
      "COMP-08": 4.0,
      "COMP-09": 4.1,
      "COMP-10": 4.7,
      "COMP-11": 3.8,
      "COMP-12": 4.7
    },
    sbi_situation: "Desarrollo del motor de conciliación bancaria y soporte a consultoría.",
    sbi_behavior: "Entregué todos los módulos antes de cierre de sprint, aunque cuando me interrumpen con dudas de soporte sin ticket completo suelo responder de forma muy escueta.",
    sbi_impact: "Alta productividad en código, pero puedo mejorar mi paciencia y pedagogía con los compañeros de implantación.",
    growth_suggestion: "Dedicar sesiones breves de explicación a consultoría en lugar de responder solo con enlaces técnicos."
  },
  // 11. Evaluación Entre Pares (PEER) de Valeria Mendoza (Consultora Implantación) hacia Andrés Vega (Dev Senior)
  {
    id: "EV-NX-011",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-07",
    targetId: "EMP-NX-06",
    direction: "PEER",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.6,
      "COMP-02": 3.5,
      "COMP-03": 4.2,
      "COMP-04": 3.1,
      "COMP-05": 3.3,
      "COMP-06": 3.4,
      "COMP-07": 3.4,
      "COMP-08": 3.5,
      "COMP-09": 4.0,
      "COMP-10": 4.8,
      "COMP-11": 3.1,
      "COMP-12": 4.7
    },
    sbi_situation: "Durante la semana de arranque en vivo con el cliente de Bogotá cuando escalamos dos dudas sobre el importador contable.",
    sbi_behavior: "Andrés resolvió el ajuste técnico en menos de dos horas (es brillantísimo), pero en el canal de soporte respondió 'lean la documentación antes de abrir tickets' frente a todo el grupo.",
    sbi_impact: "El problema técnico quedó resuelto, pero varios consultores nuevos ahora dudan en preguntarle por temor a recibir una respuesta cortante.",
    growth_suggestion: "Mantener un tono empático en los canales compartidos y explicar qué dato faltó en el ticket sin descalificar."
  },
  // 12. Evaluación Descendente (DOWNWARD) de Sofía Ramírez hacia Andrés Vega
  {
    id: "EV-NX-012",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmqh9nb290000mrjuaolf17a2",
    evaluatorId: "EMP-NX-02",
    targetId: "EMP-NX-06",
    direction: "DOWNWARD",
    is_anonymous: false,
    scores: {
      "COMP-01": 4.7,
      "COMP-02": 3.8,
      "COMP-03": 4.4,
      "COMP-04": 3.4,
      "COMP-05": 3.6,
      "COMP-06": 3.6,
      "COMP-07": 3.8,
      "COMP-08": 3.8,
      "COMP-09": 4.2,
      "COMP-10": 4.9,
      "COMP-11": 3.4,
      "COMP-12": 4.8
    },
    sbi_situation: "Revisiones de código y colaboración con el equipo de Implantación y Producto en el 4T.",
    sbi_behavior: "Su capacidad analítica y cumplimiento técnico son sobresalientes, pero cuando está concentrado y recibe consultas de otras áreas responde de manera seca.",
    sbi_impact: "Es nuestro referente técnico más sólido, pero para dar el salto a Arquitecto Principal necesita desarrollar mayor empatía y orientación de servicio interdepartamental.",
    growth_suggestion: "Liderar un taller quincenal de 30 minutos con Implantación para transferir conocimiento de forma estructurada."
  },

  // ── Evaluaciones en MEDICAL SHIELDS (Daniel López - Gerente Comercial y Carolina Herrera - Visitadora) ──
  // 13. Autoevaluación de Daniel López (Gerente Comercial - Medical Shields)
  {
    id: "EV-MS-001",
    cycleId: "CYC-MS-2026Q4",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    evaluatorId: "EMP-MS-02",
    targetId: "EMP-MS-02",
    direction: "SELF",
    is_anonymous: false,
    scores: {
      "COMP-01": 4.5,
      "COMP-02": 4.3,
      "COMP-03": 4.4,
      "COMP-04": 4.4,
      "COMP-05": 4.1,
      "COMP-06": 4.2,
      "COMP-07": 4.3,
      "COMP-08": 4.4,
      "COMP-09": 4.5,
      "COMP-10": 4.3,
      "COMP-11": 4.2,
      "COMP-12": 4.7
    },
    sbi_situation: "Despliegue de la estrategia triple (visita médica, farmacias independientes y cadenas) en el trimestre.",
    sbi_behavior: "Acompañé en ruta a los visitadores médicos y revisé semanalmente la conversión de facturación a cobranza efectiva.",
    sbi_impact: "Incrementamos la cobranza efectiva en un 19% y codificamos el portafolio en 8 clínicas nuevas.",
    growth_suggestion: "Mejorar la sincronización anticipada de pronósticos de demanda con Operaciones y Almacén."
  },
  // 14. Evaluación Ascendente (UPWARD) de Carolina Herrera hacia su Gerente Daniel López
  {
    id: "EV-MS-002",
    cycleId: "CYC-MS-2026Q4",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    evaluatorId: "EMP-MS-04",
    targetId: "EMP-MS-02",
    direction: "UPWARD",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.6,
      "COMP-02": 4.4,
      "COMP-03": 4.5,
      "COMP-04": 4.5,
      "COMP-05": 4.2,
      "COMP-06": 4.4,
      "COMP-07": 4.5,
      "COMP-08": 4.7,
      "COMP-09": 4.4,
      "COMP-10": 4.5,
      "COMP-11": 4.5,
      "COMP-12": 4.8
    },
    sbi_situation: "Durante las visitas conjuntas a jefes de cirugía y comité de compras de clínicas en Caracas.",
    sbi_behavior: "Daniel observó mi presentación sin quitarme autoridad frente al médico y al salir me dio feedback específico sobre cómo enlazar la evidencia clínica con la condición comercial.",
    sbi_impact: "Aumentó mi seguridad frente a líderes de opinión (KOL) y cerré dos protocolos hospitalarios a la semana siguiente.",
    growth_suggestion: "Ayudarnos a destrabar con Operaciones los tiempos de despacho hacia el interior del país."
  },
  // 15. Evaluación Entre Pares (PEER) de Gersom Ortiz (Gerente Operaciones) hacia Daniel López (Gerente Comercial)
  {
    id: "EV-MS-003",
    cycleId: "CYC-MS-2026Q4",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    evaluatorId: "EMP-MS-03",
    targetId: "EMP-MS-02",
    direction: "PEER",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.1,
      "COMP-02": 4.2,
      "COMP-03": 4.3,
      "COMP-04": 3.7,
      "COMP-05": 3.4,
      "COMP-06": 3.9,
      "COMP-07": 4.2,
      "COMP-08": 4.5,
      "COMP-09": 4.1,
      "COMP-10": 4.2,
      "COMP-11": 4.1,
      "COMP-12": 4.7
    },
    sbi_situation: "En los cierres de mes cuando el equipo comercial cierra pedidos grandes con clínicas sin validar lote y logística.",
    sbi_behavior: "Daniel lidera muy bien a sus visitadores, pero en dos ocasiones notificó promociones especiales a cadenas de farmacias el mismo día en que debían despacharse.",
    sbi_impact: "Generó cuellos de botella en almacén y presión innecesaria sobre logística, aunque siempre mantiene buen trato y disposición a resolver.",
    growth_suggestion: "Establecer una reunión semanal de 20 minutos Comercial-Operaciones (S&OP) para alinear inventario antes de lanzar compromisos de entrega."
  },
  // 16. Evaluación Entre Pares (PEER) de Miguel Ángel Rivas hacia Carolina Herrera (Visitadores Médicos)
  {
    id: "EV-MS-004",
    cycleId: "CYC-MS-2026Q4",
    gesproCompanyId: "cmqra3no20000pubxhfsllnqd",
    evaluatorId: "EMP-MS-05",
    targetId: "EMP-MS-04",
    direction: "PEER",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.7,
      "COMP-02": 4.6,
      "COMP-03": 4.8,
      "COMP-04": 4.8,
      "COMP-05": 4.7,
      "COMP-06": 4.6,
      "COMP-07": 4.6,
      "COMP-08": 4.5,
      "COMP-09": 4.4,
      "COMP-10": 4.5,
      "COMP-11": 4.8,
      "COMP-12": 4.9
    },
    sbi_situation: "Durante la jornada nacional de actualización en cuidado avanzado de heridas y apoyo entre zonas.",
    sbi_behavior: "Carolina compartió desinteresadamente sus plantillas de manejo de objeciones con traumatólogos y sus guiones de cobranza respetuosa para farmacias independientes.",
    sbi_impact: "Me permitió acortar mi curva de aprendizaje en mi zona y demostró qué significa ser un verdadero 'camaleón verbal' con ética y compañerismo.",
    growth_suggestion: "Liderar el programa de mentoría interna para los nuevos visitadores médicos que ingresen."
  },
  // 17. Evaluaciones en SAPPCORP MÉXICO (Supervisor de Campo -> Gerente de Operaciones y Par SSPA)
  {
    id: "EV-SP-001",
    cycleId: "CYC-SP-2026Q4",
    gesproCompanyId: "cmu6d5wib0000xzddjlektvus",
    evaluatorId: "EMP-SP-04",
    targetId: "EMP-SP-02",
    direction: "UPWARD",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.6,
      "COMP-02": 4.1,
      "COMP-03": 4.2,
      "COMP-04": 4.3,
      "COMP-05": 4.4,
      "COMP-06": 4.2,
      "COMP-07": 4.5,
      "COMP-08": 4.4,
      "COMP-09": 4.5,
      "COMP-10": 4.6,
      "COMP-11": 4.3,
      "COMP-12": 4.8
    },
    sbi_situation: "Durante el paro de planta en la refinería de Madero al detectar una lectura inusual de presión en la línea de nitrógeno.",
    sbi_behavior: "El Ing. Héctor respaldó de inmediato mi decisión de detener la maniobra para verificar válvulas sin cuestionar el tiempo consumido.",
    sbi_impact: "Fortaleció la seguridad psicológica de toda la cuadrilla para reportar condiciones inseguras en sitio.",
    growth_suggestion: "Involucrar a los supervisores desde la fase de estimación de tiempos de maniobra."
  },
  {
    id: "EV-SP-002",
    cycleId: "CYC-SP-2026Q4",
    gesproCompanyId: "cmu6d5wib0000xzddjlektvus",
    evaluatorId: "EMP-SP-03",
    targetId: "EMP-SP-02",
    direction: "PEER",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.5,
      "COMP-02": 4.2,
      "COMP-03": 4.3,
      "COMP-04": 4.1,
      "COMP-05": 4.4,
      "COMP-06": 4.3,
      "COMP-07": 4.6,
      "COMP-08": 4.3,
      "COMP-09": 4.4,
      "COMP-10": 4.5,
      "COMP-11": 4.2,
      "COMP-12": 4.9
    },
    sbi_situation: "Coordinación pre-arranque de permisos de trabajo peligroso entre Operaciones y SSPA.",
    sbi_behavior: "Exigió a todos los jefes de cuadrilla cerrar la lista de verificación ambiental antes de movilizar equipos.",
    sbi_impact: "Cero incidentes registrables y auditoría del cliente aprobada al 100%.",
    growth_suggestion: "Anticipar 48 horas la entrega de dossieres de calibración al área de SSPA."
  },
  // 18. Evaluaciones en INVERSIONES ARAGUA 2003, C.A.
  {
    id: "EV-IA-001",
    cycleId: "CYC-NX-2026Q4",
    gesproCompanyId: "cmq9jrguh0000hcs3rxixsazc",
    evaluatorId: "EMP-IA-03",
    targetId: "EMP-IA-02",
    direction: "PEER",
    is_anonymous: true,
    scores: {
      "COMP-01": 4.3,
      "COMP-02": 4.0,
      "COMP-03": 4.2,
      "COMP-04": 3.8,
      "COMP-05": 3.7,
      "COMP-06": 4.0,
      "COMP-07": 4.2,
      "COMP-08": 4.3,
      "COMP-09": 4.1,
      "COMP-10": 4.3,
      "COMP-11": 4.1,
      "COMP-12": 4.7
    },
    sbi_situation: "Durante la semana de cierre de facturación y despacho de lubricantes a distribuidores regionales.",
    sbi_behavior: "Elena gestionó con gran efectividad la cobranza vencida, pero pasó tres pedidos urgentes de última hora fuera de la ventana de corte de almacén.",
    sbi_impact: "Logramos despachar a tiempo pero con sobrecarga en el turno de cierre de almacén.",
    growth_suggestion: "Respetar la hora de corte de las 3:00 pm o validar disponibilidad de ruta con Almacén antes de prometer entrega el mismo día."
  }
];

