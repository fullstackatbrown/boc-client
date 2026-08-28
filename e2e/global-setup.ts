import { execFileSync } from "child_process";
import path from "path";

const SERVER_DIR = path.resolve(__dirname, "../../boc-server");

/**
 * Resets the database to the known seed before the suite runs.
 *
 * This is destructive: default_insts.mjs calls sequelize.sync({ force: true }),
 * which drops every table. It runs against whatever MARIADB_DATABASE points at
 * (default "boc"), so local development data is replaced.
 */
export default function globalSetup() {
  execFileSync("node", ["default_insts.mjs"], {
    cwd: SERVER_DIR,
    stdio: "inherit",
  });
  console.log("[e2e] database reseeded from default_insts.mjs");
}
