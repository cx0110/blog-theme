#!/usr/bin/env node
/**
 * 构建校验:用示例站构建一次主题,然后对产物做断言。
 *
 * 零依赖:只用 Node 内置模块 + 系统里的 hugo。
 *   node tests/check.mjs
 */

import { execFileSync } from "node:child_process";
import {
  readFileSync,
  readdirSync,
  statSync,
  lstatSync,
  mkdirSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, "exampleSite");
const out = join(root, ".check-build");
const tmpThemes = join(root, ".check-themes");

// 示例站需要指向仓库根这个主题。优先用仓库里提交的符号链接
// (exampleSite/themes/blog-theme -> ../..);符号链接丢失时(比如 Windows
// 默认不检出符号链接)退回到临时 themes 目录。
const committedLink = join(site, "themes", "blog-theme");
let useCommittedLink = false;
try {
  useCommittedLink = lstatSync(committedLink).isSymbolicLink();
} catch {
  useCommittedLink = false;
}

// 不开 --minify:压缩会去掉属性值和 CSS 选择器上的引号,断言就没法按字面量写了。
const args = ["--source", site, "--destination", out];
if (!useCommittedLink) {
  rmSync(tmpThemes, { recursive: true, force: true });
  mkdirSync(tmpThemes, { recursive: true });
  symlinkSync(root, join(tmpThemes, "blog-theme"), "dir");
  args.push("--themesDir", tmpThemes);
}

rmSync(out, { recursive: true, force: true });
try {
  execFileSync("hugo", args, { stdio: "inherit" });
} finally {
  rmSync(tmpThemes, { recursive: true, force: true });
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(out);
const read = (ext) =>
  files
    .filter((f) => f.endsWith(ext))
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");

const html = read(".html");
const css = read(".css");

const checks = [
  // HTML:外观 / 配色方案的挂载点与防闪烁脚本
  ["html", /data-theme="/],
  ["html", /data-scheme="/],
  ["html", /blog-theme:appearance/],
  ["html", /blog-theme:scheme/],
  ["html", /id="main"/],
  ["html", /prefers-color-scheme/],
  // HTML:内容模板确实渲染了
  ["html", /Hello, world/],
  ["html", /On colour and typography/],
  ["html", /article-layout/],
  ["html", /scheme-switcher/],
  // HTML:第 2 层配色方案是内联注入的(站点可覆盖主题默认值)
  ["html", /\[data-scheme="aihot"\]/],
  ["html", /\[data-scheme="ashare"\]/],
  ["html", /\[data-scheme="western"\]/],
  ["html", /\[data-scheme="ocean"\]/],
  ["html", /--up-light/],
  ["html", /--down-dark/],
  // CSS:第 1 层与第 3 层。样式表经过压缩,选择器上的引号会被去掉。
  ["css", /\[data-theme=["']?dark["']?\]/],
  ["css", /--color-up/],
  ["css", /--color-down/],
  ["css", /--radius-card/],
  ["css", /--accent/],
  // CSS:正文排版
  ["css", /\.prose/],
];

let failed = 0;
for (const [where, needle] of checks) {
  const haystack = where === "html" ? html : css;
  const ok = needle.test(haystack);
  console.log(`${ok ? "PASS" : "FAIL"}  ${where}: ${needle}`);
  if (!ok) failed++;
}

rmSync(out, { recursive: true, force: true });

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
