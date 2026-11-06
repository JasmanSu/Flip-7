// Generates config.js (gitignored) from .env and/or process.env.
// Local:  node build-config.mjs     Vercel: set as the Build Command (see vercel.json).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(dir, ".env");

const fileEnv = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#")) fileEnv[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}
const env = { ...fileEnv, ...process.env }; // real environment variables win

const MAP = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  databaseURL: "FIREBASE_DATABASE_URL",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
  appId: "FIREBASE_APP_ID",
};
const REQUIRED = ["FIREBASE_API_KEY", "FIREBASE_DATABASE_URL"];

const missing = REQUIRED.filter(k => !env[k] || /YOUR_/.test(env[k]));
if (missing.length) {
  console.error(`Missing or placeholder values: ${missing.join(", ")}. Create .env from .env_example (or set them as environment variables).`);
  process.exit(1);
}

const cfg = {};
for (const [prop, key] of Object.entries(MAP)) if (env[key]) cfg[prop] = env[key];
writeFileSync(join(dir, "config.js"), `window.FIREBASE_CFG = ${JSON.stringify(cfg, null, 2)};\n`);
console.log("config.js written.");
