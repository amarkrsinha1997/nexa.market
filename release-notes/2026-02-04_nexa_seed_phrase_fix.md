# Release Note - 2026-02-04

**Original Prompt:** ⚠️ WARNING: Nexa seed phrases are missing. Blockchain operations will fail.

**Summary:** Resolved the "Nexa seed phrases are missing" warning by updating the Nexa configuration to support and validate both `FUND` and `INTEREST` seed phrases.

**Actions Taken:**
1.  Modified `src/lib/config/nexa.config.ts` to include `interestSeedPhrase` and improved validation logic.
2.  Added `NEXA_INTEREST_SEED_PHRASE` to `.env`.
3.  Updated the warning message to be specific about missing environment variables.

**Files Touched:**
- `src/lib/config/nexa.config.ts`
- `.env`

**Business Logic:** Unchanged.
