-- ============================================================================
-- saved_shades: add UNIQUE NULLS NOT DISTINCT (user_id, name, hex)
-- to match saved_products' dedup shape and enable safe upsert in
-- migrateAnonymousData. Existing rows deduped first (multiple migration
-- calls during Phase 2 Step 6 testing left duplicate rows in staging).
--
-- name + hex are NOT NULL today, so NULLS NOT DISTINCT is a no-op for
-- current data — included for symmetry with saved_products and to
-- future-proof against any later nullable migration.
-- ============================================================================

-- Dedupe existing rows: keep oldest (MIN id) per (user_id, name, hex) group,
-- drop the rest. ROW_NUMBER over the partition is the standard pattern.
with duplicates as (
  select id,
         row_number() over (
           partition by user_id, name, hex
           order by id
         ) as rn
  from public.saved_shades
)
delete from public.saved_shades
where id in (select id from duplicates where rn > 1);

-- Add the unique constraint.
alter table public.saved_shades
  add constraint saved_shades_user_name_hex_key
  unique nulls not distinct (user_id, name, hex);
