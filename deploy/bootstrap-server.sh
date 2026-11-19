#!/usr/bin/env bash
# =============================================================================
# Kit-GesPro (GP-13) · Aprovisionamiento idempotente del servidor Vultr
# Lo ejecuta .github/workflows/bootstrap-vultr.yml (como root, vía SSH).
# Se puede re-ejecutar sin riesgo: cada paso verifica el estado antes de actuar.
#
# Variables requeridas (las inyecta el workflow):
#   APP_DOMAIN, LETSENCRYPT_EMAIL, IMAGE, GHCR_USER, GHCR_TOKEN,
#   DB_ADMIN_URL, DB_HOST, DB_PORT, DB_NAME, KIT_DB_PASSWORD,
#   BASIC_AUTH_PASSWORD, BUNDLE_DIR
# Opcionales: APP_DIR, HOST_PORT, DB_SSL, BASIC_AUTH_USER
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/gespro/kit-cualidades-blandas}"
HOST_PORT="${HOST_PORT:-4500}"
DB_SSL="${DB_SSL:-true}"
BASIC_AUTH_USER="${BASIC_AUTH_USER:-gespro}"
CONTAINER=kit-gespro-gp13

log()  { echo -e "\n==> $*"; }
warn() { echo "::warning::$*"; }
fail() { echo "::error::$*"; exit 1; }

for v in APP_DOMAIN LETSENCRYPT_EMAIL IMAGE GHCR_USER GHCR_TOKEN DB_ADMIN_URL DB_HOST DB_PORT DB_NAME KIT_DB_PASSWORD BASIC_AUTH_PASSWORD BUNDLE_DIR; do
  [ -n "${!v:-}" ] || fail "Falta la variable $v"
done
[ "$(id -u)" -eq 0 ] || fail "Este script debe ejecutarse como root (o con sudo)."
[ -f /etc/os-release ] && . /etc/os-release
command -v apt-get >/dev/null || fail "Se requiere una distribución basada en Debian/Ubuntu (apt). Detectado: ${PRETTY_NAME:-desconocido}"
export DEBIAN_FRONTEND=noninteractive

# ── 1. Docker ────────────────────────────────────────────────────────────────
log "1/6 Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker >/dev/null 2>&1 || true
docker compose version >/dev/null || fail "Docker Compose v2 no está disponible."
docker --version

# ── 2. Puerto de la app ──────────────────────────────────────────────────────
log "2/6 Puerto local ${HOST_PORT}"
if ss -ltnH "sport = :${HOST_PORT}" | grep -q . && ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  ss -ltnp "sport = :${HOST_PORT}" || true
  fail "El puerto ${HOST_PORT} ya está en uso por otro proceso. Defina la variable HOST_PORT con otro puerto."
fi

# ── 3. Rol PostgreSQL (Managed Database) ─────────────────────────────────────
log "3/6 PostgreSQL · rol kit_gp13 y esquema kit en ${DB_HOST}:${DB_PORT}/${DB_NAME}"
docker run --rm -i \
  -e PGCONNECT_TIMEOUT=15 \
  postgres:16-alpine \
  psql "$DB_ADMIN_URL" -v ON_ERROR_STOP=1 -q \
       -v pw="$KIT_DB_PASSWORD" -v dbname="$DB_NAME" -f - < "$BUNDLE_DIR/provision-db.sql" \
  || fail "No se pudo configurar PostgreSQL. Verifique DB_ADMIN_URL y que la IP de este servidor esté en 'Trusted Sources' de la Managed Database."

# ── 4. App (Docker Compose) ──────────────────────────────────────────────────
log "4/6 App en ${APP_DIR}"
mkdir -p "$APP_DIR"
install -m 644 "$BUNDLE_DIR/docker-compose.yml" "$APP_DIR/docker-compose.yml"
[ -f "$APP_DIR/.env" ] && cp -p "$APP_DIR/.env" "$APP_DIR/.env.bak.$(date +%Y%m%d%H%M%S)"
umask 077
cat > "$APP_DIR/.env" <<EOF
# Generado por deploy/bootstrap-server.sh · $(date -u +%FT%TZ)
NODE_ENV=production
HOST=0.0.0.0
PORT=4500
DATABASE_URL=postgresql://kit_gp13:${KIT_DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
DATABASE_SSL=${DB_SSL}
# Vultr Managed Database usa una CA propia; el canal va cifrado (TLS) igualmente.
DATABASE_SSL_REJECT_UNAUTHORIZED=false
DATABASE_POOL_MAX=10
DB_AUTO_MIGRATE=true
SEED_DEMO_DATA=false
CORS_ORIGIN=https://${APP_DOMAIN}
FRAME_ANCESTORS=self
BASIC_AUTH_USER=${BASIC_AUTH_USER}
BASIC_AUTH_PASSWORD=${BASIC_AUTH_PASSWORD}
INGEST_ALLOW_PRIVATE_HOSTS=false
IMAGE=${IMAGE}
HOST_PORT=${HOST_PORT}
EOF
umask 022
chmod 600 "$APP_DIR/.env"

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null
cd "$APP_DIR"
docker compose pull
docker compose up -d --remove-orphans
ok=""
for i in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${HOST_PORT}/healthz"; then ok=1; echo; break; fi
  sleep 2
done
[ -n "$ok" ] || { docker compose logs --tail 120; fail "La app no respondió en /healthz."; }

# ── 5. Nginx + HTTPS ─────────────────────────────────────────────────────────
log "5/6 Nginx + Let's Encrypt para ${APP_DOMAIN}"
if ! command -v nginx >/dev/null; then
  if ss -ltnH "sport = :80" | grep -q .; then
    ss -ltnp "sport = :80" || true
    fail "El puerto 80 lo usa otro servidor web (no Nginx). Configure el proxy hacia 127.0.0.1:${HOST_PORT} manualmente."
  fi
  apt-get update -qq
  apt-get install -y -qq nginx
fi
command -v certbot >/dev/null || { apt-get update -qq; apt-get install -y -qq certbot python3-certbot-nginx; }
dpkg -s python3-certbot-nginx >/dev/null 2>&1 || apt-get install -y -qq python3-certbot-nginx

SITE=/etc/nginx/sites-available/kit-cualidades-blandas.conf
sed -e "s/cualidades\.gespro\.ejemplo\.com/${APP_DOMAIN}/g" \
    -e "s/127\.0\.0\.1:4500/127.0.0.1:${HOST_PORT}/g" \
    -e "s/# ← CAMBIAR//" \
    "$BUNDLE_DIR/kit-cualidades-blandas.conf" > "$SITE"
ln -sf "$SITE" /etc/nginx/sites-enabled/kit-cualidades-blandas.conf
nginx -t
systemctl enable --now nginx >/dev/null 2>&1 || true
systemctl reload nginx

if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 'Nginx Full' >/dev/null || true
fi

SERVER_IPS="$(hostname -I) $(curl -fsS4 --max-time 5 https://api.ipify.org || true)"
DOMAIN_IPS="$(getent ahostsv4 "$APP_DOMAIN" | awk '{print $1}' | sort -u | tr '\n' ' ')"
HTTPS_OK=""
if [ -z "$DOMAIN_IPS" ]; then
  warn "El dominio ${APP_DOMAIN} aún no resuelve en DNS. Se omite HTTPS; vuelva a ejecutar el workflow cuando el registro A apunte a este servidor."
elif ! grep -qwF -f <(echo "$DOMAIN_IPS" | tr ' ' '\n' | sed '/^$/d') <(echo "$SERVER_IPS" | tr ' ' '\n'); then
  warn "${APP_DOMAIN} resuelve a [${DOMAIN_IPS}] pero este servidor es [${SERVER_IPS}]. Se omite HTTPS hasta corregir el DNS."
else
  if certbot --nginx -d "$APP_DOMAIN" -m "$LETSENCRYPT_EMAIL" --agree-tos -n --redirect --keep-until-expiring; then
    HTTPS_OK=1
  else
    warn "Certbot no pudo emitir el certificado; la app queda disponible por HTTP."
  fi
fi

# ── 6. Verificación final ────────────────────────────────────────────────────
log "6/6 Verificación"
docker compose ps
if [ -n "$HTTPS_OK" ]; then
  curl -fsS "https://${APP_DOMAIN}/healthz" && echo
  echo "RESULTADO: https://${APP_DOMAIN} (usuario: ${BASIC_AUTH_USER})"
else
  curl -fsS -H "Host: ${APP_DOMAIN}" "http://127.0.0.1/healthz" && echo
  echo "RESULTADO: http://${APP_DOMAIN} (sin HTTPS todavía) (usuario: ${BASIC_AUTH_USER})"
fi
