#!/bin/bash

# We need this file to be a Bash script instead of regular .sql file in order to be able to inject env vars into SQL statements

echo "Initializing database "$POSTGRES_DATABASE" for user "$POSTGRES_USER": creating tables, views and seeding the database"

# 1. Create and seed tables with the most basic data
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f "/sql/schema/tables.sql" \
  -f "/sql/schema/views.sql" \
  -f "/sql/seeds/role-superadmin.sql"

# 2. Seed db with default data required for the proper functioning of the app (roles, users, permissions, settings, etc.)
psql \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DATABASE" \
  -c "
WITH ro_id AS (SELECT role_id FROM role WHERE name = 'superadmin')
INSERT INTO appuser (
  role_id, 
  username, 
  password_hash, 
  email, 
  is_email_confirmed, 
  is_deleted
)
VALUES (
  (SELECT role_id FROM ro_id), 
  '$POSTGRES_USER', 
  '$POSTGRES_PASSWORD', 
  '$ADMIN_EMAIL', 
  true, 
  false
);"
