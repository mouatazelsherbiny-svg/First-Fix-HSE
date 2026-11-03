# CLAUDE.md

## Git workflow
After every change is finished and tested, do the git steps yourself without asking:
1. git add ONLY the files you changed or created for this task (never use "git add ." or "git add -A").
2. Never add: .env.local, sp-photos/, Claude outputs/, demo/, _to_delete/, tsconfig.tsbuildinfo.
3. git commit with a short clear message.
4. git push origin main.
5. Tell me in one line that it was pushed.

If git shows a lock error (index.lock), wait a few seconds and retry once; if it still fails, tell me.
