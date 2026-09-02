import { build } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "..");
const buildDirectory = resolve(projectDirectory, "dist-income-standalone");
const outputDirectory = resolve(projectDirectory, "canvas-package");
const outputFile = resolve(outputDirectory, "income-statement-exercise.html");

await build({ configFile: resolve(projectDirectory, "vite.income.config.js") });

const entryFile = resolve(buildDirectory, "income-standalone-entry.html");
let html = await readFile(entryFile, "utf8");

const stylesheetMatch = html.match(/<link rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/);
const scriptMatch = html.match(/<script type="module"[^>]+src="([^"]+)"[^>]*><\/script>/);

if (!stylesheetMatch || !scriptMatch) {
  throw new Error("Could not locate the generated CSS or JavaScript bundle.");
}

const resolveAsset = (assetPath) =>
  resolve(buildDirectory, assetPath.replace(/^\.\//, ""));
const css = await readFile(resolveAsset(stylesheetMatch[1]), "utf8");
const javascript = await readFile(resolveAsset(scriptMatch[1]), "utf8");
const safeJavascript = javascript.replace(/<\/script/gi, String.raw`<\/script`);
if (safeJavascript.toLowerCase().includes("</script")) {
  throw new Error("The JavaScript bundle still contains an unsafe closing-script sequence.");
}
new Script(safeJavascript);

html = html
  .replace(stylesheetMatch[0], () => `<style>${css}</style>`)
  .replace(scriptMatch[0], "")
  .replace("</body>", () => `<script>${safeJavascript}</script></body>`)
  .replace(/<link rel="modulepreload"[^>]*>/g, "");

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFile, html, "utf8");

console.log(`Created ${outputFile}`);
