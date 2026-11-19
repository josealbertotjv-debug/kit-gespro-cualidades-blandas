# Despliegue a producción · Kit-GesPro GP-13 en Vultr

Runbook para poner en producción el módulo **GP-13 · Evaluación 360° de Cualidades Blandas** dentro del ecosistema GesPro, usando el **PostgreSQL compartido de `gespro-costos` (esquema `kit`)** en un servidor **Vultr**.

```mermaid
flowchart LR
  U["Usuarios GesPro"] -->|HTTPS| N["Nginx + Certbot (Vultr)"]
  N -->|127.0.0.1:4500| A["Contenedor kit-gespro-gp13"]
  A -->|DATABASE_URL| P[("PostgreSQL gespro-costos · esquema kit")]
  G["GitHub Actions"] -->|imagen| R["GHCR"]
  G -->|SSH: compose pull + up| A
  R --> A
```

## 1. Requisitos en el servidor Vultr

- Ubuntu 22.04/24.04 con **Docker Engine + plugin Compose** (`docker compose version`).
- **Nginx** y **Certbot** (probablemente ya los usan las demás apps GesPro).
- Un subdominio apuntando (registro A/AAAA) a la IP del servidor, p. ej. `cualidades.gespro.<dominio>`.
- Acceso de red del contenedor al PostgreSQL de `gespro-costos`.

## 2. Base de datos (una sola vez)

Crear un rol con privilegios mínimos sobre el esquema `kit` (ejecutar como superusuario o dueño de la BD):

```sql
CREATE ROLE kit_gp13 LOGIN PASSWORD 'CAMBIAR_PASSWORD_LARGA';
GRANT CONNECT ON DATABASE gespro_costos TO kit_gp13;
CREATE SCHEMA IF NOT EXISTS kit;
GRANT USAGE, CREATE ON SCHEMA kit TO kit_gp13;
```

La app aplica [`sql/kit_soft_skills_360_migration.sql`](sql/kit_soft_skills_360_migration.sql) al arrancar (`DB_AUTO_MIGRATE=true`). La migración es idempotente (`CREATE ... IF NOT EXISTS`) y solo crea tablas `kit.soft_skill_*`; **no toca ninguna tabla existente de gespro-costos**.

> Si prefieren que el DBA controle las migraciones: pongan `DB_AUTO_MIGRATE=false`, ejecuten `docker compose run --rm kit-cualidades-blandas node scripts/migrate.mjs` con un rol dueño del esquema y concedan a `kit_gp13` solo `SELECT, INSERT, UPDATE` sobre `kit.soft_skill_*`.

**Cadena de conexión según dónde corra PostgreSQL:**

| PostgreSQL de gespro-costos | `DATABASE_URL` |
|---|---|
| En el mismo Vultr, instalado en el host | `postgresql://kit_gp13:...@host.docker.internal:5432/gespro_costos` (y en `postgresql.conf`/`pg_hba.conf` permitir la red `172.16.0.0/12` de Docker) |
| En el mismo Vultr, en un contenedor Docker | `postgresql://kit_gp13:...@<nombre-servicio-postgres>:5432/gespro_costos` y descomentar `networks` en `docker-compose.yml` |
| Vultr Managed Database | URL que entrega Vultr + `DATABASE_SSL=true` |

## 3. Primer despliegue en el servidor

```bash
sudo mkdir -p /opt/gespro/kit-cualidades-blandas && sudo chown $USER /opt/gespro/kit-cualidades-blandas
cd /opt/gespro/kit-cualidades-blandas

# Descargar solo los archivos de despliegue
BASE=https://raw.githubusercontent.com/josealbertotjv-debug/kit-gespro-cualidades-blandas/main
curl -fsSLO $BASE/docker-compose.yml
curl -fsSL  $BASE/.env.example -o .env
chmod 600 .env
nano .env        # DATABASE_URL, BASIC_AUTH_*, CORS_ORIGIN, SEED_DEMO_DATA=false ...

# Si el paquete de GHCR es privado:
# echo <PAT con read:packages> | docker login ghcr.io -u josealbertotjv-debug --password-stdin

docker compose pull
docker compose up -d
curl -fsS http://127.0.0.1:4500/healthz    # → {"ok":true,...,"database":"postgres"}
```

### Nginx + HTTPS

```bash
sudo cp deploy/nginx/kit-cualidades-blandas.conf /etc/nginx/sites-available/   # (o descargarlo con curl desde $BASE)
sudo nano /etc/nginx/sites-available/kit-cualidades-blandas.conf                # ajustar server_name
sudo ln -s /etc/nginx/sites-available/kit-cualidades-blandas.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d cualidades.gespro.<dominio>
```

## 4. Despliegue continuo (GitHub Actions)

El workflow [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml):

1. Ejecuta las pruebas sobre **SQLite** y sobre **PostgreSQL 16** real (incluye re-ejecución para validar idempotencia).
2. En cada push a `main`, publica `ghcr.io/josealbertotjv-debug/kit-gespro-cualidades-blandas:{latest,<sha>}` y hace un smoke test del contenedor.
3. **Despliega por SSH en Vultr** cuando se configura lo siguiente en *Settings → Secrets and variables → Actions*:

| Tipo | Nombre | Valor |
|---|---|---|
| Variable | `DEPLOY_ENABLED` | `true` |
| Variable | `DEPLOY_PATH` | `/opt/gespro/kit-cualidades-blandas` (opcional) |
| Secret | `VULTR_HOST` | IP o hostname del servidor |
| Secret | `VULTR_USER` | usuario SSH con permiso para `docker` |
| Secret | `VULTR_SSH_KEY` | llave privada SSH (ed25519) dedicada al despliegue |
| Secret | `VULTR_SSH_PORT` | opcional, por defecto 22 |

Se recomienda crear el *environment* `production` en GitHub con aprobación manual requerida.

## 5. Operación

| Tarea | Comando (en `/opt/gespro/kit-cualidades-blandas`) |
|---|---|
| Logs | `docker compose logs -f --tail 200` |
| Estado / salud | `docker compose ps` · `curl -fsS 127.0.0.1:4500/healthz` |
| Reiniciar | `docker compose restart` |
| **Rollback** | en `.env` fijar `IMAGE=ghcr.io/josealbertotjv-debug/kit-gespro-cualidades-blandas:<sha-anterior>` y `docker compose up -d` |
| Respaldo del módulo | `pg_dump "$DATABASE_URL" -n kit -t 'kit.soft_skill_*' -Fc > gp13_$(date +%F).dump` |

## 6. Seguridad incluida

- Contenedor sin root, sistema de archivos de solo lectura, `no-new-privileges`, publicado solo en `127.0.0.1`.
- Cabeceras CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`; HSTS desde Nginx; rate limiting de `/api/` en Nginx.
- Autenticación HTTP Basic opcional (`BASIC_AUTH_USER`/`BASIC_AUTH_PASSWORD`) — **actívenla** hasta integrar el SSO de GesPro; `/healthz` queda libre para monitoreo.
- Ingestor web con defensa **anti-SSRF** (bloquea `localhost`, redes privadas y el endpoint de metadatos `169.254.169.254` de Vultr, revalidando cada redirección).
- Errores 500 sin detalles internos cuando `NODE_ENV=production`.

> [!IMPORTANT]
> Las evaluaciones 360° son datos sensibles de RR. HH. No expongan la app sin autenticación (Basic Auth, auth de Nginx o SSO GesPro).
