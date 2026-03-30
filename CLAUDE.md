# Project Instructions

## "Push These Changes" Workflow

Whenever the user says **"push these changes"**, follow these steps exactly:

1. **Create a feature branch** named `feature/{epochtime}` where `{epochtime}` is the current Unix epoch timestamp (e.g., `feature/1743200000`). Note: `~` is not a valid git branch name character, so it is omitted.
   ```
   git checkout -b feature/$(date +%s)
   ```

2. **Security scan before committing** — inspect `git diff` (staged and unstaged changes) for:
   - Passwords, secrets, API keys, tokens, credentials
   - Personal data (email addresses, phone numbers, SSNs, private keys)
   - Hardcoded usernames or passphrases
   - `.env` files or any file containing sensitive config values

   If any are found, **stop and alert the user** before proceeding. Do not commit until the user confirms the concern is resolved.

3. **Stage and commit** all current changes with a descriptive commit message summarizing what changed.

4. **Push the branch** to remote:
   ```
   git push -u origin feature/~{epochtime}
   ```

Report the branch name and commit hash to the user when done.
