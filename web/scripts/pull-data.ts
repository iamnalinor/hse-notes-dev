/**
Downloads the `site-data` (and PDFs) of the latest successful "Build notes" run on main into
`public/`, so `bun dev` has real lectures. Needs the GitHub CLI (`gh auth login`).
Pass a run id to pin a run: `bun data:pull 38691623019`.
*/
import { rm } from "node:fs/promises";

const REPO = "iamnalinor/hse-notes-dev";
const publicDir = new URL("../public/", import.meta.url).pathname;

const gh = async (...args: string[]): Promise<string> => {
  const run = Bun.spawn(["gh", ...args], { stderr: "inherit", stdout: "pipe" });
  const output = await new Response(run.stdout).text();
  if ((await run.exited) !== 0) {
    throw new Error(`gh ${args.join(" ")} failed`);
  }
  return output.trim();
};

const runId =
  Bun.argv[2] ??
  (await gh(
    "run",
    "list",
    "--repo",
    REPO,
    "--workflow",
    "Build notes",
    "--branch",
    "main",
    "--status",
    "success",
    "--limit",
    "1",
    "--json",
    "databaseId",
    "--jq",
    ".[0].databaseId",
  ));

console.log(`run ${runId}`);
await rm(`${publicDir}data`, { force: true, recursive: true });
await rm(`${publicDir}pdf`, { force: true, recursive: true });
await gh(
  "run",
  "download",
  runId,
  "--repo",
  REPO,
  "--name",
  "site-data",
  "--dir",
  `${publicDir}data`,
);
await gh("run", "download", runId, "--repo", REPO, "--name", "pdf", "--dir", `${publicDir}pdf`);
// The per-lecture preview pages of the build are not part of the site.
await Bun.$`find ${publicDir}data -name index.html -delete`;
console.log("public/data and public/pdf are ready");
