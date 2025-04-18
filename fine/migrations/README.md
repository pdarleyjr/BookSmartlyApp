# BookSmartly Migrations

## Appointments Table Consolidation (2025-05-02)

All previous migrations that created, dropped, or altered the `appointments` table have been consolidated into a single migration:  
**20250502000000_consolidated_appointments_table.sql**

- This ensures a clean, conflict-free schema setup for Fine.dev and all environments.
- Do NOT add new migrations that drop or recreate the `appointments` table.  
  Instead, use `ALTER TABLE` statements in new migrations to evolve the schema.
- If you need to change the appointments table in the future, create a new migration that only alters the table as needed.

**If you encounter migration errors, reset your database and apply migrations from scratch using the consolidated file.**

For questions, contact the BookSmartly maintainers.