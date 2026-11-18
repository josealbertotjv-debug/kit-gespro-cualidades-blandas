# Kit-GesPro (Módulo GP-13) · Evaluación 360° de Cualidades Blandas y Liderazgo con Agente de IA

Aplicación del ecosistema **GesPro (`Kit-GesPro`)** para la evaluación multifuente 360° de cualidades blandas, cohesión entre compañeros y efectividad de liderazgo ascendente (empleados que evalúan a sus supervisores, gerentes y directores), impulsada por un **Agente de IA Psicométrica** nutrido por sitios web científicos e institucionales verificados.

## 1. Vectores de Evaluación 360°

1. **`PEER` (Horizontal · Entre Pares / Compañeros):** Evalúa colaboración transversal, comunicación asertiva, escucha activa, orientación de servicio y resolución constructiva de conflictos entre empleados del mismo nivel o de distintos departamentos.
2. **`UPWARD` (Ascendente · Empleados → Supervisores, Gerentes y Directores):** Evalúa liderazgo psicológico seguro (Escala de 7 ítems de Amy Edmondson, HBS 1999), coaching sin microgestión, claridad estratégica y justicia organizacional (los 10 comportamientos de *Google Project Oxygen*).
3. **`DOWNWARD` (Descendente · Superiores → Subordinados):** Evalúa fiabilidad y responsabilidad (*Conscientiousness* — Dudley et al., 2006 / O*NET), pensamiento crítico, adaptabilidad y cumplimiento de compromisos.
4. **`SELF` (Autoevaluación 180°/360°):** Contrasta la autopercepción con la evaluación de observadores externos ($\Delta = \text{Auto} - \text{Externo}$) para construir la **Ventana de Johari 360°** (*Fortalezas Visibles*, *Puntos Ciegos*, *Talentos Ocultos* y *Zonas Críticas*).

## 2. Sitios Web Especializados y Marcos Científicos Integrados (RAG Corpus)

El Agente de IA está alimentado con 12+ fuentes institucionales y meta-analíticas verificadas (y cuenta con un **Ingestor Web en Vivo** en `/api/sources/ingest` para agregar nuevas URLs):

- **O*NET OnLine (`onetonline.org`):** [Work Styles (1.D)](https://www.onetonline.org/find/descriptor/browse/1.D) y [Soft Skills Custom List](https://www.onetonline.org/skills/soft/) del Departamento del Trabajo de EE. UU.
- **Consortium for Research on Emotional Intelligence in Organizations (`eiconsortium.org`):** [Emotional Competence Framework (ESCI 360)](https://www.eiconsortium.org/reports/emotional_competence_framework.html) (Goleman, Boyatzis, Spencer & Spencer, OPM MOSAIC).
- **Google re:Work — Project Oxygen (`rework.withgoogle.com`):** [The 10 Behaviors of Great Managers & Upward Feedback Survey](https://rework.withgoogle.com/intl/en/guides/following-the-data-the-research-behind-great-managers).
- **Harvard Business School / MIT (`web.mit.edu`):** [Psychological Safety and Learning Behavior in Work Teams](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf) (Amy C. Edmondson, 1999).
- **Center for Creative Leadership (`ccl.org`):** [Evaluaciones 360° y Modelo SBI (Situation – Behavior – Impact)](https://www.ccl.org/articles/leading-effectively-articles/sbi-feedback-model-a-quick-win-to-improve-talent-conversations-development/).
- **Personnel Psychology (`leeds-faculty.colorado.edu`):** [Smither, London & Reilly (2005) — Meta-análisis de 24 estudios longitudinales sobre Feedback Multifuente 360°](https://leeds-faculty.colorado.edu/dahe7472/smither%20performance.pdf).
- **Psychological Bulletin (`researchgate.net`):** [Kluger & DeNisi (1996) — Feedback Intervention Theory (FIT)](https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory).
- **PubMed / NIH (`pubmed.ncbi.nlm.nih.gov`):** [Dudley et al. (2006) — Facetas de Responsabilidad](https://pubmed.ncbi.nlm.nih.gov/16435937/) y [Grant (2013) — Ventaja Ambivertida en Liderazgo](https://pubmed.ncbi.nlm.nih.gov/23567176/).
- **SIOP (`siop.org`) & ESCO (`esco.ec.europa.eu`):** Escalas de Calificación Ancladas en Conductas (*BARS*) y Competencias Transversales Europeas.

## 3. Ejecución y Pruebas

```bash
# Iniciar servidor en puerto 4500
cd /home/antigravity/kit-gespro-cualidades-blandas && npm start

# Ejecutar suite de pruebas psicométricas y de API
cd /home/antigravity/kit-gespro-cualidades-blandas && npm test
```

### Versión autónoma (un solo archivo, sin servidor)

```bash
npm run build:standalone   # genera dist/kit-gespro-cualidades-blandas.html
```

El HTML generado incluye la base de conocimiento, el agente IA y un backend local que emula todas las rutas `/api/*`.
Los datos se guardan en el `localStorage` del navegador (clave `kit-gespro-gp13-v1`). Se abre con doble clic en Safari,
Chrome o Edge, y trae un botón **"Restablecer datos demo"**.


## 4. Integración con PostgreSQL (`esquema kit` de `gespro-costos`)

El archivo [`sql/kit_soft_skills_360_migration.sql`](sql/kit_soft_skills_360_migration.sql) contiene la migración SQL completa bajo el esquema `kit` (`kit.soft_skill_sources`, `kit.soft_skill_competencies`, `kit.soft_skill_employees`, `kit.soft_skill_cycles`, `kit.soft_skill_evaluations`, `kit.soft_skill_ai_reports`) vinculada por `"gesproCompanyId"` con las empresas de `auditoria-estrategica` y `gespro-costos`.
