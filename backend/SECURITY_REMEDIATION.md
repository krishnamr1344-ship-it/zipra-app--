# Security Remediation — Credentials in Git History

The following credentials were previously committed to this repository's git history:

- **Supabase database password**: `Ffiey6iZc78$GVS` (was in `backend/app/config.py` as a default fallback for `DATABASE_URL`)
- **Supabase project ref**: `gnoypcoithdbbishbyby`
- **Razorpay live keys**: `rzp_live_T3c7FZwhvj3xjs` / `rQNATvwGmdiw7KFb1XPrdCEO`
- **Firebase project ID**: `zipra-app` (was in `config.py`)
- **Render API key**: `rnd_ova4o8a9XlKpG82gJACyUPu7yBI9`

## Required Actions

1. **Rotate all exposed credentials**:
   - Supabase: Regenerate database password in Supabase dashboard → Project Settings → Database → Reset password
   - Razorpay: Regenerate key_secret in Razorpay dashboard
   - Firebase: The service account JSON in `FIREBASE_CREDENTIALS` env var should be checked. If it was ever in git, generate a new key in GCP Console → IAM → Service Accounts
   - Render: Regenerate the API key

2. **Scrub git history** (manual):
   ```bash
   # Using BFG Repo-Cleaner (recommended):
   # 1. Clone a fresh copy: git clone --mirror <repo-url>
   # 2. bfg --replace-text passwords.txt repo.git
   # 3. cd repo.git && git reflog expire --expire=now --all && git gc --prune=now --aggressive
   # 4. git push --force
   ```

3. **After scrubbing**:
   - Force-push the cleaned history
   - All collaborators must re-clone (existing clones still have the old history)
   - Update any services that reference the rotated credentials
   - Delete old service account keys from GCP

4. **Prevent recurrence**:
   - Add `backend/app/config.py` to `.gitignore` and use `config.py.example` instead
   - Set up a pre-commit hook to scan for secrets (e.g., `detect-secrets` or `talisman`)
   - Review CI/CD logs for any secret exposure
