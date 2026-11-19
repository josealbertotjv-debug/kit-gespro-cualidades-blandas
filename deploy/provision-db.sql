-- Kit-GesPro (GP-13) · Rol de privilegios mínimos + esquema kit (idempotente)
-- Uso: psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -v pw=CLAVE -v dbname=BD -f deploy/provision-db.sql
SELECT 'conectado como ' || current_user || ' a ' || current_database() AS info;
SELECT NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kit_gp13') AS crear_rol \gset
\if :crear_rol
  CREATE ROLE kit_gp13 LOGIN;
\endif
ALTER ROLE kit_gp13 WITH LOGIN PASSWORD :'pw';
GRANT CONNECT ON DATABASE :"dbname" TO kit_gp13;
\c :"dbname"
CREATE SCHEMA IF NOT EXISTS kit;
GRANT USAGE, CREATE ON SCHEMA kit TO kit_gp13;
SELECT 'rol kit_gp13 listo en ' || current_database() AS info;
