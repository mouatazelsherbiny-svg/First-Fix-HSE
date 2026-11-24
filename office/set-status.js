#!/usr/bin/env node
// Update the AI office board.
// Usage: node office/set-status.js <agent> <working|meeting|idle|testing> "<task>"
// status.json keeps the latest entry per agent plus a rolling log; every entry is
// { "agent", "state", "task", "time" } with an ISO time.
const fs = require("fs");
const path = require("path");

const AGENTS = ["project-manager", "frontend-dev", "backend-dev", "mobile-dev", "qa-tester"];
const STATES = ["working", "meeting", "idle", "testing"];
const [agent, state, ...rest] = process.argv.slice(2);
const task = rest.join(" ").trim();

if (!AGENTS.includes(agent) || !STATES.includes(state)) {
  console.error(`Usage: node office/set-status.js <${AGENTS.join("|")}> <${STATES.join("|")}> "<task>"`);
  process.exit(1);
}

const file = path.join(__dirname, "status.json");
let data = { agents: {}, log: [] };
try {
  const old = JSON.parse(fs.readFileSync(file, "utf8"));
  if (old && typeof old === "object") data = { agents: old.agents || {}, log: Array.isArray(old.log) ? old.log : [] };
} catch {}

const entry = { agent, state, task: task || (state === "idle" ? "Idle" : ""), time: new Date().toISOString() };
data.agents[agent] = entry;
data.log.push(entry);
data.log = data.log.slice(-200);

// Write to a temp file then rename, so the page never reads half a file.
const tmp = file + ".tmp";
fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
fs.renameSync(tmp, file);
console.log(`office: ${agent} → ${state}${entry.task ? ` (${entry.task})` : ""}`);
