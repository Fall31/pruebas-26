import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

const databasePath = resolve("..", "app", "db.e2e.json");
const python = process.env.PYTHON ?? "python";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
  },
  webServer: [
    {
      command: `${python} -m uvicorn app.main:app --app-dir .. --host 127.0.0.1 --port 8000`,
      url: "http://127.0.0.1:8000/docs",
      env: { DB_FILE: databasePath },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
