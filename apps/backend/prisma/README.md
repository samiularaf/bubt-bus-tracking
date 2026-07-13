# Prisma Notes

`schema.prisma` mirrors `../../../schema.sql` (Phase 3) as closely as Prisma's schema language allows. Two things Prisma cannot express natively and must be added as raw SQL in the first migration:

1. **Role-based `CHECK` constraint** on `users` (see `schema.sql` §"chk_role_required_fields") — enforces that `driver` rows have all required driver fields, `admin` rows have `admin_id`, etc., at the database level.
2. **`schedules_one_active` partial unique index** — ensures only one schedule can have `is_active = true` at a time.

When running the first `prisma migrate dev`, add these via a `migration.sql` edit (Prisma supports appending raw SQL to a generated migration) rather than trying to force them into the schema DSL. `schema.sql` remains the authoritative reference for these constraints until they're folded into a migration.
