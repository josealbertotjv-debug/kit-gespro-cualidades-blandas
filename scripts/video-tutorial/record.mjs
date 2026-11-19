// Graba el tutorial de Kit-GesPro GP-13 con CDP screencast (frames JPEG con
// marca de tiempo) y sincroniza cada "beat" con la duración de su narración.
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.env.APP_URL || "http://127.0.0.1:4600/";
const OUT = "/tmp/vid/frames";
const beats = JSON.parse(fs.readFileSync("/tmp/vid/narration.json", "utf8"));
const durs = JSON.parse(fs.readFileSync("/tmp/vid/audio/durations.json", "utf8"));
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null; // depuración

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- overlay JS
const OVERLAY = `
(() => { const __init = () => {
  if (window.__v) return;
  const css = \`
  #__cur{position:fixed;left:-60px;top:-60px;width:26px;height:26px;z-index:2147483647;pointer-events:none;
    transition:left .75s cubic-bezier(.4,.1,.2,1),top .75s cubic-bezier(.4,.1,.2,1);filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
  .__rip{position:fixed;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:3px solid #E08A00;z-index:2147483646;
    pointer-events:none;animation:__rip .6s ease-out forwards}
  @keyframes __rip{from{transform:scale(.4);opacity:1}to{transform:scale(3.4);opacity:0}}
  .__hl{position:fixed;z-index:2147483645;pointer-events:none;border:3px solid #E08A00;border-radius:12px;
    box-shadow:0 0 0 6px rgba(224,138,0,.22),0 0 0 4000px rgba(10,12,16,.30);opacity:0;transition:opacity .35s}
  .__hl.on{opacity:1}
  .__hl span{position:absolute;left:-3px;top:-34px;background:#E08A00;color:#fff;font:600 15px/1 'IBM Plex Sans',system-ui,sans-serif;
    padding:8px 12px;border-radius:8px 8px 8px 0;white-space:nowrap}
  #__card{position:fixed;inset:0;z-index:2147483640;display:flex;align-items:center;justify-content:center;opacity:0;
    transition:opacity .6s;background:radial-gradient(1200px 600px at 20% 10%,#2a1a05 0%,#121418 55%,#0b0c0f 100%);color:#fff;
    font-family:'IBM Plex Sans',system-ui,sans-serif}
  #__card.on{opacity:1}
  #__card .wrap{max-width:980px;padding:40px}
  #__card .eyebrow{font:600 14px/1.4 'IBM Plex Mono',monospace;letter-spacing:.18em;color:#E8A94B;text-transform:uppercase}
  #__card h1{font:700 54px/1.1 'Archivo',system-ui,sans-serif;margin:16px 0 18px;letter-spacing:-.01em}
  #__card p{font-size:22px;line-height:1.5;color:#cfd4da;margin:0}
  #__card .dot{display:inline-block;width:14px;height:14px;border-radius:4px;background:#C9790A;margin-right:10px;vertical-align:middle}
  #__card .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:34px}
  #__card .step{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:18px}
  #__card .step b{display:block;font:600 13px 'IBM Plex Mono',monospace;color:#E8A94B;margin-bottom:8px}
  #__card .step div{font-size:18px;line-height:1.35}
  #__card .url{display:inline-block;margin-top:26px;padding:14px 20px;border-radius:12px;background:rgba(255,255,255,.08);
    border:1px solid rgba(255,255,255,.18);font:500 22px 'IBM Plex Mono',monospace;color:#fff}
  #__card .login{display:flex;gap:16px;margin-top:18px}
  #__card .login div{flex:1;padding:14px 18px;border-radius:12px;background:#fff;color:#13171C;font-size:18px}
  #__card .login small{display:block;font:600 12px 'IBM Plex Mono',monospace;color:#9A5600;margin-bottom:4px;letter-spacing:.08em}
  #__chap{position:fixed;right:22px;top:172px;z-index:2147483641;background:rgba(19,23,28,.88);color:#fff;border-radius:999px;
    padding:9px 16px 9px 12px;font:600 15px 'IBM Plex Sans',system-ui,sans-serif;opacity:0;transform:translateY(-8px);transition:all .4s;box-shadow:0 6px 18px rgba(0,0,0,.18)}
  #__chap.on{opacity:1;transform:none}
  #__chap i{font-style:normal;background:#C9790A;border-radius:999px;padding:3px 9px;margin-right:9px;font:600 13px 'IBM Plex Mono',monospace}
  \`;
  const st = document.createElement('style'); st.textContent = css; document.documentElement.appendChild(st);
  const cur = document.createElement('div'); cur.id='__cur';
  cur.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 11.5-6.6.9 3.9 7.4-2.9 1.5-3.9-7.5L4 20z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const chap = document.createElement('div'); chap.id='__chap';
  const mount = () => { document.body.appendChild(cur); document.body.appendChild(chap); };
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  window.__v = {
    move(x,y,instant){ if(instant){cur.style.transition='none'; requestAnimationFrame(()=>cur.style.transition='');} cur.style.left=(x-4)+'px'; cur.style.top=(y-2)+'px'; },
    ripple(x,y){ const r=document.createElement('div'); r.className='__rip'; r.style.left=x+'px'; r.style.top=y+'px'; document.body.appendChild(r); setTimeout(()=>r.remove(),700); },
    hl(sel,label,pad=8){ const el=document.querySelector(sel); if(!el) return; const b=el.getBoundingClientRect();
      const h=document.createElement('div'); h.className='__hl';
      h.style.left=(b.left-pad)+'px'; h.style.top=(b.top-pad)+'px'; h.style.width=(b.width+pad*2)+'px'; h.style.height=(b.height+pad*2)+'px';
      if(label){ const s=document.createElement('span'); s.textContent=label; h.appendChild(s);} document.body.appendChild(h);
      requestAnimationFrame(()=>h.classList.add('on')); },
    unhl(){ document.querySelectorAll('.__hl').forEach(h=>{h.classList.remove('on'); setTimeout(()=>h.remove(),400);}); },
    card(html){ let c=document.getElementById('__card'); if(!c){c=document.createElement('div'); c.id='__card'; document.body.appendChild(c);}
      c.innerHTML='<div class="wrap">'+html+'</div>'; requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.add('on'))); },
    uncard(){ const c=document.getElementById('__card'); if(c){ c.classList.remove('on'); setTimeout(()=>c.remove(),700);} },
    chap(n,t){ chap.innerHTML='<i>'+n+'</i>'+t; chap.classList.add('on'); },
    unchap(){ chap.classList.remove('on'); },
  };
}; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', __init); else __init(); })();`;

// ------------------------------------------------------------------- browser
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--hide-scrollbars"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5, locale: "es-VE" });
await ctx.addInitScript(OVERLAY);
await ctx.addInitScript(() => { try { localStorage.setItem("kit-gespro-theme", "light"); } catch {} });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERR", e.message));
await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForSelector("#employeeRosterBody tr");
await page.evaluate(() => window.__v.card(""));
await sleep(900);

// ------------------------------------------------------------------ helpers
let cx = 640, cy = 400;
const v = (fn, ...a) => page.evaluate(([fn, a]) => window.__v[fn](...a), [fn, a]);
async function box(sel) {
  const el = await page.waitForSelector(sel, { state: "visible", timeout: 8000 });
  return el.boundingBox();
}
async function moveTo(sel, { dx = 0.5, dy = 0.5, wait = 800 } = {}) {
  const b = await box(sel);
  cx = b.x + b.width * dx; cy = b.y + b.height * dy;
  await v("move", cx, cy);
  await page.mouse.move(cx, cy, { steps: 8 });
  await sleep(wait);
}
async function click(sel, opts = {}) {
  await moveTo(sel, opts);
  await v("ripple", cx, cy);
  await page.click(sel, { position: undefined, timeout: 8000 });
  await sleep(opts.after ?? 450);
}
async function scrollTo(sel, block = "center", wait = 1100) {
  await v("unhl");
  await page.$eval(sel, (el, block) => el.scrollIntoView({ behavior: "smooth", block }), block);
  await sleep(wait);
}
async function scrollY(y, wait = 1100) {
  await v("unhl");
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), y);
  await sleep(wait);
}
const hl = (sel, label, pad) => v("hl", sel, label || "", pad ?? 8);
const unhl = () => v("unhl");
async function type(sel, text, delay = 32) {
  await click(sel, { after: 150 });
  await page.keyboard.type(text, { delay });
}
async function selectByText(sel, text) {
  await click(sel, { after: 200 });
  await page.$eval(sel, (s, text) => {
    const o = [...s.options].find((o) => o.textContent.includes(text));
    if (!o) throw new Error("opción no encontrada: " + text);
    s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true }));
  }, text);
  await sleep(500);
}
async function tab(name) { await click(`[data-tab=${name}]`, { after: 700 }); await page.evaluate(() => window.scrollTo(0, 0)); }

// ------------------------------------------------------------------ escenas
const CARD_INTRO = `<div class="eyebrow"><span class="dot"></span>Ecosistema GesPro · Guía para usuarios</div>
<h1>Kit-GesPro GP-13<br>Evaluación 360° de Cualidades Blandas</h1>
<p>Cómo usar el sistema paso a paso: tablero, evaluaciones, expedientes con IA y consultor inteligente.</p>
<div class="steps"><div class="step"><b>PASO 1</b><div>Revisar el tablero de la empresa</div></div>
<div class="step"><b>PASO 2</b><div>Registrar evaluaciones 360°</div></div>
<div class="step"><b>PASO 3</b><div>Consultar el expediente y plan 30-60-90</div></div>
<div class="step"><b>PASO 4</b><div>Preguntar al Agente de IA</div></div></div>`;
const CARD_LOGIN = `<div class="eyebrow"><span class="dot"></span>Antes de empezar · Acceso</div>
<h1>Entre desde su navegador</h1>
<p>Use la dirección, el usuario y la contraseña que le entregó el administrador de GesPro.</p>
<div class="url">🔒 https://su-direccion-gespro…</div>
<div class="login"><div><small>USUARIO</small>••••••</div><div><small>CONTRASEÑA</small>••••••••••••</div></div>
<p style="margin-top:22px;font-size:18px">💻 Computadora · 📱 Teléfono · Tableta</p>`;
const CARD_OUTRO = `<div class="eyebrow"><span class="dot"></span>Resumen</div>
<h1>Así se usa Kit-GesPro GP-13</h1>
<div class="steps"><div class="step"><b>1 · ELEGIR</b><div>La empresa en «Empresa Auditada»</div></div>
<div class="step"><b>2 · EVALUAR</b><div>Calificar 1 a 5 y dejar un ejemplo real</div></div>
<div class="step"><b>3 · REVISAR</b><div>Expediente IA y plan 30-60-90</div></div>
<div class="step"><b>4 · CONSULTAR</b><div>Preguntar al Agente de IA</div></div></div>
<p style="margin-top:34px">Kit-GesPro · Ecosistema GesPro · J@RTechnologies</p>`;

const actions = {
  async intro() { await v("card", CARD_INTRO); },
  async acceso() { await v("card", CARD_LOGIN); },
  async empresa() {
    await v("uncard"); await sleep(700);
    await v("chap", "1", "El tablero");
    await v("move", 640, 420, true);
    await moveTo("#companySelect", { dx: 0.4 });
    await hl("#companySelect", "Empresa Auditada", 6);
  },
  async kpis() {
    await unhl();
    await scrollTo("#globalKpiGrid", "center");
    await hl("#globalKpiGrid", "Indicadores clave (escala 1 a 5)", 10);
    for (let i = 1; i <= 5; i++) await moveTo(`#globalKpiGrid > :nth-child(${i})`, { dy: 0.35, wait: 1900 });
  },
  async niveles() {
    await scrollTo("#hierarchyTable", "center");
    await hl("#hierarchyTable", "Resultados por nivel jerárquico");
    await moveTo("#hierarchyTableBody tr:nth-child(1)", { dx: 0.2, wait: 4500 });
    await unhl();
    await hl("#edmondsonMatrixContainer", "Matriz de seguridad psicológica");
    await moveTo("#edmondsonMatrixContainer", { dx: 0.5, dy: 0.45, wait: 1500 });
  },
  async alertas() {
    await scrollTo("#riskAlertsList", "center");
    await hl("#riskAlertsList", "Alertas del Agente IA");
    await moveTo("#riskAlertsList", { dx: 0.5, dy: 0.25, wait: 4200 });
    await unhl();
    await hl("#companyCompetenciesBars", "Las 12 cualidades blandas");
    await moveTo("#companyCompetenciesBars", { dx: 0.6, dy: 0.3, wait: 1000 });
  },
  async plantilla() {
    await scrollTo("#employeeRosterTable", "start", 1300);
    await page.evaluate(() => window.scrollBy({ top: -90, behavior: "smooth" })); await sleep(500);
    await hl("#filterLevelSelect", "Filtrar por nivel", 6);
    await moveTo("#filterLevelSelect", { wait: 2400 });
    await unhl();
    await hl("#employeeRosterBody tr:first-child [data-open-report]", "", 4);
    await hl("#employeeRosterBody tr:first-child [data-eval-target]", "Expediente o evaluar", 4);
    await moveTo("#employeeRosterBody tr:first-child [data-eval-target]", { wait: 900 });
  },
  async alta1() {
    await v("unchap"); await scrollY(0, 900);
    await v("chap", "2", "Agregar personas");
    await click("#btnNewEmployeeModal", { after: 600 });
  },
  async alta2() {
    await type("#newEmpName", "Carla Rodríguez");
    await type("#newEmpTitle", "Supervisora de Atención al Cliente");
    await type("#newEmpDept", "Éxito del Cliente");
    await selectByText("#newEmpLevel", "Supervisión");
    await selectByText("#newEmpManager", "María Fernández");
    await click('#newEmployeeForm button[type=submit]', { after: 900 });
  },
  async eval1() {
    await v("chap", "3", "Registrar una evaluación");
    await tab("evaluar");
    await selectByText("#evalEvaluatorSelect", "Andrés Vega");
    await selectByText("#evalTargetSelect", "Sofía Ramírez");
  },
  async eval2() {
    await hl("#detectedVectorBadge", "Tipo de relación detectado", 6);
    await moveTo("#detectedVectorBadge", { wait: 2600 });
    await hl("#vectorMethodologicalHint", "", 6);
    await moveTo("#vectorMethodologicalHint", { dx: 0.3, wait: 2600 });
    await unhl();
    await hl("#evalAnonSelect", "Anónima (recomendado)", 6);
    await moveTo("#evalAnonSelect", { wait: 600 });
  },
  async eval3() {
    await scrollTo("#barsCompetenciesContainer .bars-card:nth-child(1)", "start", 1200);
    await page.evaluate(() => window.scrollBy({ top: -60, behavior: "smooth" })); await sleep(400);
    const picks = [[1, 5], [2, 4], [3, 3], [1, 4]];
    for (const [n, lvl] of picks) {
      await click(`#barsCompetenciesContainer .bars-card:nth-child(${n}) .bars-opt[data-level="${lvl}"]`, { after: 900 });
    }
    await hl("#liveAvgScoreReadout", "Promedio automático", 6);
    await moveTo("#liveAvgScoreReadout", { wait: 300 });
  },
  async eval4() {
    await scrollTo("#rawFeedbackDraft", "center");
    await type("#rawFeedbackDraft", "En las reuniones de cierre, Sofía escucha al equipo antes de decidir y siempre cumple lo que promete. Eso nos ayudó a entregar a tiempo.", 22);
    await sleep(300);
    await click("#btnCalibrateSbiAi", { after: 400 });
  },
  async eval5() {
    await page.waitForFunction(() => document.querySelector("#sbiSituationInput").value.length > 0, null, { timeout: 8000 }).catch(() => {});
    await sleep(300);
    await scrollTo("#sbiBehaviorInput", "center", 900);
    await hl("#sbiSituationInput", "Situación", 4);
    await sleep(1500);
    await hl("#sbiBehaviorInput", "Conducta", 4);
    await sleep(1500);
    await hl("#sbiImpactInput", "Impacto", 4);
    await moveTo("#sbiImpactInput", { wait: 500 });
  },
  async eval6() {
    await unhl();
    await scrollTo("#sbiGrowthInput", "center", 700);
    await page.fill("#sbiGrowthInput", "");
    await type("#sbiGrowthInput", "Mantener los 10 minutos de escucha al cierre de cada comité.", 24);
    await click("#btnSubmitEvaluation", { after: 900 });
    await hl("#evalSubmitFeedback", "", 6);
  },
  async exp1() {
    await unhl();
    await v("chap", "4", "Expediente IA");
    await tab("reportes");
    await page.waitForSelector("[data-select-emp]");
    const sel = await page.$$eval("[data-select-emp]", (els) => {
      const e = els.find((x) => x.textContent.includes("Sofía Ramírez")); return e ? `[data-select-emp="${e.getAttribute("data-select-emp")}"]` : "[data-select-emp]";
    });
    await hl("#reportEmployeeList", "Elija una persona", 6);
    await click(sel, { after: 900 });
    await unhl();
  },
  async exp2() {
    const s = "#employeeReportMainArea .grid-2 > .card:nth-child(1)";
    await scrollTo(s, "center", 1200);
    await hl(s, "Radar 360°", 6);
    await moveTo(s, { dx: 0.5, dy: 0.55, wait: 500 });
  },
  async exp3() {
    await unhl();
    const s = "#employeeReportMainArea .grid-2 > .card:nth-child(2)";
    await hl(s, "Ventana de Johari", 6);
    await moveTo(s, { dx: 0.35, dy: 0.45, wait: 500 });
  },
  async exp4() {
    const s = "#employeeReportMainArea > :nth-child(3)";
    await scrollTo(s, "start", 1200);
    await page.evaluate(() => window.scrollBy({ top: -50, behavior: "smooth" })); await sleep(500);
    await hl(s, "Plan 30-60-90 días", 6);
    await moveTo(s, { dx: 0.3, dy: 0.3, wait: 500 });
  },
  async exp5() {
    await scrollY(0, 1000);
    await hl("#btnPrintEmployeeReport", "Exportar a PDF", 6);
    await moveTo("#btnPrintEmployeeReport", { wait: 400 });
  },
  async ia1() {
    await unhl();
    await v("chap", "5", "Consultor Agente IA");
    await tab("copiloto");
    await hl("#quickPromptsList", "Consultas rápidas", 6);
    await sleep(900);
    await unhl();
    await click('#quickPromptsList button[data-prompt*="Sofía"]', { after: 600 });
  },
  async ia2() {
    await type("#aiChatInput", "¿Qué acciones recomiendas para mejorar la colaboración entre áreas?", 26);
    await click('#aiChatForm button[type=submit]', { after: 1200 });
  },
  async fuentes() {
    await v("chap", "6", "Base científica");
    await tab("fuentes");
    await hl("#ingestSourceForm", "Agregar un sitio web confiable", 8);
    await moveTo("#sourceUrlInput", { wait: 2500 });
    await unhl();
    await scrollTo("#sourcesCatalogGrid", "start", 1500);
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" })); await sleep(1500);
  },
  async tema() {
    await scrollY(0, 900);
    await click("#btnThemeToggle", { after: 2000 });
    await click("#btnThemeToggle", { after: 300 });
  },
  async outro() { await v("unchap"); await v("card", CARD_OUTRO); },
};

// ------------------------------------------------------------ captura CDP
const cdp = await ctx.newCDPSession(page);
const frames = [];
let n = 0;
cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
  const f = `${OUT}/f${String(n++).padStart(6, "0")}.jpg`;
  frames.push({ f, t: metadata.timestamp });
  fs.writeFile(f, Buffer.from(data, "base64"), () => {});
  cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
await sleep(400);
const t0 = Date.now() / 1000;
const timeline = [];

// Pequeña "respiración" visual al inicio para que el primer frame exista.
for (const b of beats) {
  if (ONLY && !ONLY.includes(b.id)) continue;
  const start = Date.now() / 1000 - t0;
  const dur = durs[b.id];
  const act = (async () => { try { await actions[b.id]?.(); } catch (e) { console.log("ACTERR", b.id, e.message); } })();
  await Promise.all([act, sleep(dur * 1000 + 250)]);
  const end = Date.now() / 1000 - t0;
  timeline.push({ id: b.id, start, dur, end });
  console.log(b.id, start.toFixed(2), dur.toFixed(2), (end - start).toFixed(2));
  await sleep(b.id === "acceso" ? 150 : 450);
}
await sleep(1500);
const tEnd = Date.now() / 1000;
await cdp.send("Page.stopScreencast");
await sleep(500);
fs.writeFileSync("/tmp/vid/timeline.json", JSON.stringify({ t0, tEnd, timeline, frames }, null, 0));
console.log("frames", frames.length, "dur", (tEnd - t0).toFixed(1));
await browser.close();
