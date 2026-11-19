// =============================================================================
// KIT-GESPRO (GP-13) · DEFENSA ANTI-SSRF PARA EL INGESTOR WEB EN VIVO
// Impide que /api/sources/ingest se use para alcanzar servicios internos
// (localhost, redes privadas, metadatos de la nube 169.254.169.254, etc.).
// Solo para el servidor Node (no se incluye en la versión autónoma del navegador).
// =============================================================================

import dns from "node:dns/promises";
import net from "node:net";

const MAX_REDIRECTS = 4;

const blockList = new net.BlockList();
// IPv4 reservados / privados / loopback / link-local / CGNAT / multicast
for (const [addr, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4]
]) {
  blockList.addSubnet(addr, prefix, "ipv4");
}
// IPv6 loopback / no especificada / ULA / link-local / multicast
// (las IPv4-mapped ::ffff:a.b.c.d se desenvuelven en isPrivateAddress: una regla ::ffff:0:0/96
//  en BlockList también coincidiría con todas las IPv4 normales)
for (const [addr, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8]
]) {
  blockList.addSubnet(addr, prefix, "ipv6");
}

export function isPrivateAddress(ip) {
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped) return isPrivateAddress(mapped[1]);
  if (/^::ffff:/i.test(ip)) return true; // forma hexadecimal de IPv4-mapped: bloquear por prudencia
  const family = net.isIP(ip);
  if (family === 4) return blockList.check(ip, "ipv4");
  if (family === 6) return blockList.check(ip, "ipv6");
  return true;
}

/** Lanza un error si la URL no es http(s) o si su host resuelve a una dirección no pública. */
export async function assertPublicUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Solo se admiten URLs con protocolo https:// o http://.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error(`El host "${url.hostname}" no es una dirección pública permitida para el ingestor.`);
  }
  return url;
}

/**
 * fetch con validación anti-SSRF en cada salto de redirección.
 * @param {{ allowPrivateHosts?: boolean }} opts
 */
export function createGuardedFetch({ allowPrivateHosts = false } = {}) {
  if (allowPrivateHosts) return fetch;
  return async function guardedFetch(input, init = {}) {
    let current = String(input);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublicUrl(current);
      const res = await fetch(current, { ...init, redirect: "manual" });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        current = new URL(res.headers.get("location"), current).toString();
        continue;
      }
      return res;
    }
    throw new Error("Demasiadas redirecciones al descargar la fuente.");
  };
}
