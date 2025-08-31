# Generate Supabase Types

Instead of using the hardcoded `Database` interface in `client.ts`, you should generate types from your actual database schema.

## Steps:

1. **Login to Supabase CLI:**

   ```bash
   npx supabase login
   ```

2. **Generate types from your project:**

   ```bash
   npx supabase gen types typescript --project-id pvfimysvoikizuemevez --schema public > src/lib/supabase/database.types.ts
   ```

3. **Update client.ts to import generated types:**

   ```typescript
   import { Database } from "./database.types";
   ```

4. **Remove the hardcoded Database interface**

## Benefits:

- ✅ Always in sync with your actual database
- ✅ Automatic updates when schema changes
- ✅ No manual maintenance
- ✅ Type safety guaranteed

## Current Status:

🚨 Using hardcoded types - should be replaced with generated ones
