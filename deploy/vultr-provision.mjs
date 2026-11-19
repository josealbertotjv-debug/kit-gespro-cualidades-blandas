#!/usr/bin/env node
// =============================================================================
// Kit-GesPro (GP-13) · Aprovisionamiento por API de Vultr (lo ejecuta GitHub Actions)
//   1. Valida la API key
//   2. Localiza la Managed Database PostgreSQL de GesPro (y la BD lógica de gespro-costos)
//   3. Registra la llave SSH de despliegue
//   4. Crea (o reutiliza) un servidor Ubuntu dedicado "kit-gespro-gp13"
//   5. Autoriza la IP del servidor en "Trusted Sources" de la base de datos
//   6. Escribe las salidas para el paso SSH (host, dominio sslip.io, URL admin de BD)
// Idempotente: si el servidor ya existe, se reutiliza.
//
// Entorno: VULTR_API_KEY, SSH_PUBLIC_KEY, [DB_LABEL], [DB_NAME], [VULTR_REGION], [VULTR_PLAN]
// =============================================================================

import fs from "node:fs";

const API = process.env.VULTR_API_BASE || "https://api.vultr.com/v2";
const KEY = process.env.VULTR_API_KEY;
const LABEL = "kit-gespro-gp13";
const PLAN_PREFERENCE = (process.env.VULTR_PLAN || "vc2-1c-1gb,vc2-1c-2gb,vhf-1c-1gb,vhp-1c-1gb-amd,vhp-1c-1gb-intel").split(",");

const out = (k, v) => fs.appendFileSync(process.env.GITHUB_OUTPUT || "/dev/stdout", `${k}=${v}\n`);
const mask = (v) => v && console.log(`::add-mask::${v}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (msg) => {
  console.log(`::error::${msg}`);
  process.exit(1);
};

async function api(method, path, body) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 429 && attempt < 6) {
      await sleep(1500 * attempt);
      continue;
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const err = new Error(`${method} ${path} → HTTP ${res.status}: ${data.error || text}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }
}

if (!KEY) fail("Falta el secreto VULTR_API_KEY.");
if (!process.env.SSH_PUBLIC_KEY) fail("Falta la llave pública SSH de despliegue.");

// 1. API key
let account;
try {
  account = (await api("GET", "/account")).account;
} catch (err) {
  if (err.status === 401 || err.status === 403) {
    fail(
      "Vultr rechazó la API key. Verifique que esté copiada completa y que en Account → API → Access Control esté habilitado 'Allow All IPv4'."
    );
  }
  throw err;
}
console.log(`✔ Cuenta Vultr: ${account.name || account.email} · saldo pendiente: ${account.pending_charges}`);

// 2. Managed Database PostgreSQL
let db = null;
let dbName = process.env.DB_NAME || "";
try {
  const { databases = [] } = await api("GET", "/databases?per_page=100");
  const pgs = databases.filter((d) => d.database_engine === "pg");
  console.log(`Bases de datos PostgreSQL administradas: ${pgs.map((d) => `${d.label} (${d.region})`).join(", ") || "ninguna"}`);
  if (process.env.DB_LABEL) db = pgs.find((d) => d.label === process.env.DB_LABEL);
  db ||= pgs.find((d) => /gespro|costo/i.test(d.label)) || (pgs.length === 1 ? pgs[0] : null) || pgs[0] || null;
} catch (err) {
  console.log(`::warning::No se pudieron listar las Managed Databases (${err.message}).`);
}

if (db) {
  db = (await api("GET", `/databases/${db.id}`)).database;
  mask(db.password);
  if (!dbName) {
    try {
      const { dbs = [] } = await api("GET", `/databases/${db.id}/dbs`);
      const names = dbs.map((d) => d.name);
      console.log(`BD lógicas en ${db.label}: ${names.join(", ")}`);
      dbName =
        names.find((n) => /gespro.*costo|costo/i.test(n)) ||
        names.find((n) => /gespro/i.test(n)) ||
        names.find((n) => !["defaultdb", "postgres", "_dodb"].includes(n)) ||
        db.dbname ||
        "defaultdb";
    } catch {
      dbName = db.dbname || "defaultdb";
    }
  }
  console.log(`✔ Base de datos destino: ${db.label} · ${db.host}:${db.port}/${dbName} (región ${db.region})`);
} else {
  console.log("::warning::No se encontró una Managed Database PostgreSQL. La app usará SQLite persistente en el servidor.");
}

// 3. Región / plan / sistema operativo
const region = process.env.VULTR_REGION || db?.region || "ewr";
const { available_plans: available = [] } = await api("GET", `/regions/${region}/availability`);
const plan = PLAN_PREFERENCE.find((p) => available.includes(p));
if (!plan) fail(`No hay planes pequeños disponibles en la región ${region}. Disponibles: ${available.slice(0, 15).join(", ")}`);
const { os: osList = [] } = await api("GET", "/os?per_page=500");
const os =
  osList.find((o) => o.name === "Ubuntu 24.04 LTS x64") ||
  osList.find((o) => /^Ubuntu 24\.04.*x64/.test(o.name)) ||
  osList.find((o) => /^Ubuntu 22\.04.*x64/.test(o.name));
if (!os) fail("No se encontró una imagen Ubuntu 24.04/22.04 x64.");

// 4. Llave SSH
const pub = process.env.SSH_PUBLIC_KEY.trim();
const { ssh_keys: keys = [] } = await api("GET", "/ssh-keys?per_page=100");
let sshKey = keys.find((k) => k.ssh_key.trim().split(" ").slice(0, 2).join(" ") === pub.split(" ").slice(0, 2).join(" "));
if (!sshKey) sshKey = (await api("POST", "/ssh-keys", { name: "gp13-deploy-github-actions", ssh_key: pub })).ssh_key;
console.log(`✔ Llave SSH registrada: ${sshKey.name}`);

// 5. Servidor
const { instances: existing = [] } = await api("GET", `/instances?label=${LABEL}&per_page=100`);
let instance = existing.find((i) => i.label === LABEL);
if (instance) {
  console.log(`↺ Reutilizando servidor existente ${LABEL} (${instance.main_ip}, ${instance.region}, ${instance.plan})`);
} else {
  instance = (
    await api("POST", "/instances", {
      region,
      plan,
      os_id: os.id,
      label: LABEL,
      hostname: LABEL,
      sshkey_id: [sshKey.id],
      enable_ipv6: true,
      backups: "disabled",
      tags: ["gespro", "gp13", "kit-cualidades-blandas"]
    })
  ).instance;
  console.log(`✔ Servidor creado: ${LABEL} · ${plan} · ${os.name} · región ${region}`);
}

for (let i = 0; i < 90; i++) {
  instance = (await api("GET", `/instances/${instance.id}`)).instance;
  if (instance.status === "active" && instance.power_status === "running" && instance.main_ip && instance.main_ip !== "0.0.0.0") break;
  if (i % 6 === 0) console.log(`  esperando servidor… status=${instance.status} power=${instance.power_status} ip=${instance.main_ip}`);
  await sleep(Number(process.env.POLL_MS || 10_000));
}
if (instance.status !== "active") fail(`El servidor no quedó activo a tiempo (status=${instance.status}).`);
const ip = instance.main_ip;
console.log(`✔ Servidor activo en ${ip}`);

// 6. Trusted Sources de la base de datos
if (db) {
  const trusted = db.trusted_ips || [];
  if (trusted.length === 0) {
    console.log("✔ La base de datos acepta conexiones desde cualquier IP (sin lista de Trusted Sources).");
  } else if (trusted.some((t) => t === ip || t === `${ip}/32`)) {
    console.log("✔ La IP del servidor ya está en Trusted Sources.");
  } else {
    await api("PUT", `/databases/${db.id}`, { trusted_ips: [...trusted, `${ip}/32`] });
    console.log(`✔ IP ${ip} agregada a Trusted Sources de ${db.label}.`);
  }
}

// 7. Salidas
const domain = `${ip.replace(/\./g, "-")}.sslip.io`;
out("host", ip);
out("domain", domain);
out("instance_id", instance.id);
out("email", account.email || "");
if (db) {
  const adminUrl = `postgresql://${encodeURIComponent(db.user)}:${encodeURIComponent(db.password)}@${db.host}:${db.port}/${encodeURIComponent(db.dbname || "defaultdb")}?sslmode=require`;
  mask(adminUrl);
  out("db_mode", "managed");
  out("db_admin_url", adminUrl);
  out("db_host", db.host);
  out("db_port", db.port);
  out("db_name", dbName);
} else {
  out("db_mode", "sqlite");
}
console.log(`\nRESUMEN: servidor ${ip} · URL https://${domain} · BD ${db ? `${db.host}/${dbName}` : "SQLite local"}`);
