# CLAUDE.md

## Git workflow
After every change is finished and tested, do the git steps yourself without asking:
1. git add ONLY the files you changed or created for this task (never use "git add ." or "git add -A").
2. Never add: .env.local, sp-photos/, Claude outputs/, demo/, _to_delete/, tsconfig.tsbuildinfo.
3. git commit with a short clear message.
4. git push origin main.
5. Tell me in one line that it was pushed.

If git shows a lock error (index.lock), wait a few seconds and retry once; if it still fails, tell me.

## AI team (subagents in .claude/agents/)
For ANY request about the web app (البرنامج) or the mobile app (برنامج الموبيل / HSE-Reporting, `app/m/`):
1. First run the **project-manager** agent to split the request into tasks and assign owners.
2. Run each task with its owner agent, in the order the plan gives: **backend-dev** (Supabase, auth, APIs) → **frontend-dev** (web app UI) / **mobile-dev** (mobile app).
3. Always finish with **qa-tester** (typecheck, build, diff review). Only commit/push after QA says PASS and the project-manager says READY TO COMMIT.
4. Every agent updates the office board when it starts and finishes a task:
   `node office/set-status.js <agent> <working|meeting|idle|testing> "<task>"`
   Watch the team live by double-clicking `office/start-office.bat` (opens http://localhost:4321).
5. Never commit `office/status.json` (it is in .gitignore).
