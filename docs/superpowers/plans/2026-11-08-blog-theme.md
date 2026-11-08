# blog-theme 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付一个独立 Hugo 主题 `cx0110/blog-theme`,视觉语言取自 AIHOT,支持运行时切换深浅外观与涨跌配色方案,置顶行为全部可配置且默认关闭。

**Architecture:** Hugo 原生模板 + 纯 CSS 自定义属性。三层色彩模型:基础色板(第 1 层,配置可覆盖)→ 配色方案(第 2 层,决定涨跌语义色指向)→ 深浅外观(第 3 层)。运行时通过 `<html data-theme data-scheme>` 切换,状态存 localStorage,首屏前内联 boot 脚本避免闪白。

**Tech Stack:** Hugo v0.146+ (extended),HTML5,CSS 自定义属性,原生 JS(零依赖),Node 20+ 仅用于构建校验脚本。

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `hugo.toml` | 主题元数据、`min_version`、默认参数(默认配色方案/外观、置顶开关、布局) |
| `go.mod` | 让主题可被 `hugo mod get github.com/cx0110/blog-theme` 引入 |
| `exampleSite.toml` | 示例站配置,照抄即可跑起来 |
| `assets/css/theme.css` | 三层色彩模型 + 基础层 + 组件层 + `.prose` 长文排版 + 断点/圆角标度 |
| `assets/css/custom.css` | 用户覆盖入口(存在才被引入) |
| `assets/js/appearance.js` | 运行时外观与配色方案切换(localStorage + View Transition) |
| `layouts/partials/head.html` | `<head>`、内联 boot 脚本、`data-theme`/`data-scheme` 初始值、CSS/JS 引入 |
| `layouts/partials/appearance-vars.html` | 由站点配置注入 `<style>`,输出第 1 层与第 2 层的自定义变量 |
| `layouts/partials/header.html` | 顶栏(可固定) |
| `layouts/partials/sidebar.html` | 桌面侧栏 + 窄屏导轨(可固定) |
| `layouts/partials/phone-nav.html` | 手机底部标签栏 |
| `layouts/partials/footer.html` | 页脚 |
| `layouts/partials/scheme-switcher.html` | 外观 + 配色方案下拉 |
| `layouts/partials/post-card.html` | 列表页文章卡片 |
| `layouts/partials/pagination.html` | 分页 |
| `layouts/partials/toc.html` | 文章目录(可固定) |
| `layouts/partials/icons.html` | 内联 SVG 图标集 |
| `layouts/_default/baseof.html` | 页面骨架 |
| `layouts/_default/single.html` | 文章详情 |
| `layouts/_default/list.html` | 列表页 |
| `layouts/_default/terms.html` | 分类/标签总览 |
| `layouts/index.html` | 首页 |
| `layouts/404.html` | 404 |
| `layouts/shortcodes/notice.html` | 提示块 |
| `i18n/en.toml` / `i18n/zh.toml` | 双语界面文案 |
| `exampleSite/` | 示例站(config + content) |
| `tests/check.mjs` | 构建校验脚本(Node,零依赖):构建 + 断言产物含预期标记 |
| `.github/workflows/hugo.yml` | CI:每次 push/PR 跑 `tests/check.mjs` |

---

### Task 1: 主题骨架与元数据

**Files:**
- Create: `hugo.toml`
- Create: `go.mod`
- Create: `exampleSite.toml`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `static/favicon.svg`

- [ ] **Step 1: 写 `hugo.toml`**

```toml
name = "blog-theme"
license = "MIT"
licenses = ["MIT"]
description = "A general-purpose Hugo blog theme in the visual language of AIHOT: warm paper ground, ink hierarchy, one accent, hairline borders — with runtime-switchable appearance and up/down colour schemes."
homepage = "https://github.com/cx0110/blog-theme"
demosite = "https://github.com/cx0110/blog-theme"
tags = ["blog", "theme", "hugo", "minimal", "dark mode"]
features = ["blog", "theme", "dark-mode", "i18n", "responsive"]
min_version = "0.146.0"

[author]
  name = "cx0110"
  homepage = "https://github.com/cx0110"

[params]
  description = "A general-purpose Hugo blog theme."

  [params.theme]
    # 第 2 层默认配色方案、第 3 层默认外观
    defaultScheme = "aihot"
    defaultAppearance = "system"
    showAppearanceSwitcher = true
    showSchemeSwitcher = true
    # 手机端导航形态:bottom-bar | header | none
    phoneNav = "bottom-bar"
    # 桌面侧栏形态:full | rail | none
    sidebar = "full"

    # 置顶:默认全部关闭
    [params.theme.sticky]
      sidebar = false
      header = false
      toc = false
      backToTop = true

    # 第 1 层:主题自身颜色
    [params.theme.colors]
      accent = "#176b75"
      accentDark = "#12ccd8"

    # 第 2 层:内置配色方案(决定涨/跌指向)
    [params.theme.schemes.aihot]
      label = "AIHOT"
      up = ["#b3402a", "#d86a52"]
      down = ["#2f7d5c", "#5fc79a"]
    [params.theme.schemes.ashare]
      label = "A 股"
      up = ["#c0392b", "#e06a5c"]
      down = ["#2f7d5c", "#5fc79a"]
    [params.theme.schemes.western]
      label = "欧美"
      up = ["#2f7d5c", "#5fc79a"]
      down = ["#c0392b", "#e06a5c"]
    [params.theme.schemes.neutral]
      label = "中性"
      up = ["#59656b", "#a5b0b3"]
      down = ["#657176", "#89979d"]
```

- [ ] **Step 2: 写 `go.mod`**

```
module github.com/cx0110/blog-theme

go 1.23
```

- [ ] **Step 3: 写 `exampleSite.toml`**

```toml
baseURL = "https://example.com/"
languageCode = "en-us"
defaultContentLanguage = "en"
title = "blog-theme"
theme = "blog-theme"

[params]
  description = "A general-purpose Hugo blog theme in the visual language of AIHOT."

  [params.theme]
    defaultScheme = "aihot"
    defaultAppearance = "system"
```

- [ ] **Step 4: 写 `.gitignore`**

```
/public/
/resources/
/.hugo_build.lock
/exampleSite/public/
/exampleSite/resources/
.DS_Store
```

- [ ] **Step 5: 写 `LICENSE`(MIT,cx0110)**

- [ ] **Step 6: 写 `static/favicon.svg`** —— 一个青色圆环加实心圆点,与 AIHOT 的 `RingMark` 同形。

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="#176b75" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="42 15"><circle cx="12" cy="12" r="9"/></g><circle cx="12" cy="12" r="2.6" fill="#176b75"/></svg>
```

- [ ] **Step 7: 提交**

```bash
git add hugo.toml go.mod exampleSite.toml .gitignore LICENSE static/favicon.svg
git commit -m "feat: 主题骨架、元数据与许可证"
```

---

### Task 2: 设计令牌与三层色彩模型

**Files:**
- Create: `assets/css/theme.css`

- [ ] **Step 1: 写色彩令牌骨架**

`assets/css/theme.css` 顶部。**第 1 层**定义在 `:root`,**第 3 层**(深色)在 `[data-theme="dark"]`,**第 2 层**(配色方案)用 `[data-scheme="..."]` 覆盖 `--color-up` / `--color-down`:

```css
/* 第 1 层:基础色板(浅色) */
:root {
  color-scheme: light;
  --bg: #faf9f6;  --bg-sunk: #f3f3ef;  --bg-muted: #e9ede9;
  --well: var(--bg-sunk);
  --surface: #ffffff;  --surface-2: #fdfdfb;  --raised: #ffffff;  --sidebar: #fdfdfb;
  --ink: #202a30;  --ink-2: #303c42;  --ink-3: #59656b;  --ink-4: #657176;
  --line: #dfe4e1;  --line-strong: #d1d9d5;  --line-soft: #e9ede9;
  --accent: #176b75;  --accent-ink: #145f68;
  --accent-soft: rgba(23, 107, 117, 0.08);  --accent-softer: rgba(23, 107, 117, 0.05);
  --accent-contrast: #ffffff;
  --note: #526f72;  --hot: #b3402a;  --hot-soft: rgba(179, 64, 42, 0.08);
  --amber: #b8873a;  --amber-ink: #7c5a24;  --amber-soft: rgba(184, 135, 58, 0.1);
  --ok: #2f7d5c;  --ok-soft: rgba(47, 125, 92, 0.1);  --ok-ink: #2a6e51;
  --shadow-card: 0 1px 2px rgba(32, 42, 48, 0.025);
  --shadow-card-hover: 0 3px 12px rgba(32, 42, 48, 0.055);
  --shadow-soft: 0 4px 12px rgba(28, 39, 51, 0.06);
  --shadow-pop: 0 12px 32px rgba(28, 39, 51, 0.12);
  --prose-ink: #26323a;
  --code-bg: #f6f7f4;
  --selection: rgba(23, 107, 117, 0.16);
}

/* 第 3 层:深色外观 */
[data-theme="dark"] {
  color-scheme: dark;
  --bg: #13191c;  --bg-sunk: #182024;  --bg-muted: #202a2f;
  --well: color-mix(in oklab, var(--bg-muted) 60%, transparent);
  --surface: #1a2226;  --surface-2: #1d272b;  --raised: #202a2f;
  --sidebar: #161e21;
  --ink: #e7eceb;  --ink-2: #d2dada;  --ink-3: #a5b0b3;  --ink-4: #89979d;
  --line: rgba(255, 255, 255, 0.08);  --line-strong: rgba(255, 255, 255, 0.12);  --line-soft: rgba(255, 255, 255, 0.06);
  --accent: #12ccd8;  --accent-ink: #2ce2e8;
  --accent-soft: rgba(18, 204, 216, 0.12);  --accent-softer: rgba(18, 204, 216, 0.06);
  --accent-contrast: #000000;
  --note: #8fb8a8;  --hot: #d86a52;  --hot-soft: rgba(216, 106, 82, 0.12);
  --amber: #d3b26a;  --amber-ink: #d3b26a;  --amber-soft: rgba(211, 178, 106, 0.12);
  --ok: #5fc79a;  --ok-soft: rgba(95, 199, 154, 0.12);  --ok-ink: #7fd1ad;
  --shadow-card: none;  --shadow-card-hover: none;
  --shadow-soft: 0 6px 18px rgba(0, 0, 0, 0.35);  --shadow-pop: 0 16px 40px rgba(0, 0, 0, 0.45);
  --prose-ink: #d7dfdf;
  --code-bg: #10151c;
  --selection: rgba(18, 204, 216, 0.22);
}

/* 第 2 层:配色方案 —— 决定涨/跌指向 */
[data-scheme="aihot"]   { --up: #b3402a; --down: #2f7d5c; }
[data-scheme="ashare"]  { --up: #c0392b; --down: #2f7d5c; }
[data-scheme="western"] { --up: #2f7d5c; --down: #c0392b; }
[data-scheme="neutral"] { --up: #59656b; --down: #657176; }

[data-theme="dark"] {
  --up: var(--up-dark, var(--up));  --down: var(--down-dark, var(--down));
}

/* 语义别名 + 软色(由 color-mix 派生,软色不必逐方案手写) */
:root {
  --color-up: var(--up);  --color-down: var(--down);
  --color-up-soft: color-mix(in srgb, var(--up) 12%, transparent);
  --color-down-soft: color-mix(in srgb, var(--down) 12%, transparent);
}
```

**注意**:深浅下的 up/down 差异由 `appearance-vars.html` 注入的 `--up-dark` / `--down-dark` 承担,深浅模式优先读它们,
没有则回落到浅色值。

- [ ] **Step 2: 写标度与断点**

```css
:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", monospace;

  --radius-mark: 5px; --radius-control: 8px; --radius-tile: 10px;
  --radius-card: 12px; --radius-panel: 14px; --radius-sheet: 16px;

  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);

  --page-max-wide: max(1200px, calc(270dvh - 236px));
  --page-max-reading: max(1100px, calc(200dvh - 236px));
  --bar-h: 48px;
  --gutter-l: max(16px, env(safe-area-inset-left));
  --gutter-r: max(16px, env(safe-area-inset-right));
  --sidebar-w: 180px;
  --rail-w: 64px;
}
```

断点用媒体查询实现(`--bp-*` 变量只用于文档,实际用 `@media`):

```css
/* sm 641 / lg 700 / md 768 / wide 941 / side 1176 / xl 1280 / 2xl 1536 */
```

- [ ] **Step 3: 写基础层**

`body` 背景 `--bg`、文字 `--ink`、`font-size: 14px; line-height: 1.5`;`::selection` 用 `--selection`;
`:focus-visible` 用 2px `--accent` 描边 + 2px offset;`a` 去下划线继承颜色;`img` max-width 100%。
`@media (prefers-reduced-motion: reduce)` 全局把动画与过渡压到 0.01ms。

- [ ] **Step 4: 写组件层**

AIHOT 的 `.card` / `.well` / `.chip` / `.badge` / `.num` / `.mono` / `.skeleton` / `.scrollbar-none` / `.scrollbar-thin` /
`.disclosure` 等价类,以及 `.site-shell` / `.site-sidebar` / `.site-main` / `.site-header` / `.phone-nav` 布局类。

固定定位类统一由配置驱动(见 Task 5),CSS 里提供 `.is-sticky` 修饰:

```css
.is-sticky { position: sticky; }
```

- [ ] **Step 5: 写 `.prose`**

移植 AIHOT:17px/1.8、`> * + * { margin-top: 1.2em }`、h2 1.26em / h3 1.1em / h4-h5 1em、链接 accent + 35% 混色下划线、
blockquote 3px `--line-strong` 左边线、代码块边框 + 圆角 tile、表格 `display:block; overflow-x:auto`、
`scroll-margin-top: 88px`、`.prose-compact` 变体。

- [ ] **Step 6: 提交**

```bash
git add assets/css/theme.css
git commit -m "feat: 设计令牌、三层色彩模型与长文排版"
```

---

### Task 3: 运行时外观与配色方案切换

**Files:**
- Create: `assets/js/appearance.js`
- Create: `layouts/partials/appearance-vars.html`

- [ ] **Step 1: 写 `assets/js/appearance.js`**

```js
// 外观与配色方案的运行时切换。状态存 localStorage,写在 <html data-theme data-scheme> 上。
(function () {
  var KEY_APPEARANCE = "blog-theme:appearance";
  var KEY_SCHEME = "blog-theme:scheme";
  var root = document.documentElement;

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch (e) {}
  }

  function systemTheme() {
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
    catch (e) { return "light"; }
  }

  function resolve(pref) {
    return pref === "light" || pref === "dark" ? pref : systemTheme();
  }

  function apply(appearance, scheme, animate) {
    var doc = document;
    var commit = function () {
      root.setAttribute("data-theme", resolve(appearance));
      root.setAttribute("data-scheme", scheme);
      document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
        m.content = resolve(appearance) === "dark" ? "#13191c" : "#faf9f6";
      });
    };
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate && !reduced && doc.startViewTransition) {
      try { doc.startViewTransition(commit); return; } catch (e) {}
    }
    commit();
  }

  // scheme 合法性由服务端渲染的 <select> 保证;这里只做兜底。
  window.BlogThemeAppearance = {
    get: function () { return read(KEY_APPEARANCE); },
    set: function (appearance) {
      write(KEY_APPEARANCE, appearance);
      apply(appearance, root.getAttribute("data-scheme") || "aihot", true);
    },
    setScheme: function (scheme) {
      write(KEY_SCHEME, scheme);
      apply(read(KEY_APPEARANCE), scheme, true);
    },
    apply: apply,
    resolve: resolve,
  };

  // 跟随系统时,系统切换深浅也要跟着变。
  try {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      if (!read(KEY_APPEARANCE)) apply(null, root.getAttribute("data-scheme"), false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
  } catch (e) {}

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-appearance-set]");
    if (trigger) {
      event.preventDefault();
      window.BlogThemeAppearance.set(trigger.getAttribute("data-appearance-set"));
      return;
    }
    var schemeTrigger = event.target.closest("[data-scheme-set]");
    if (schemeTrigger) {
      event.preventDefault();
      window.BlogThemeAppearance.setScheme(schemeTrigger.getAttribute("data-scheme-set"));
    }
  });
})();
```

- [ ] **Step 2: 写 `layouts/partials/appearance-vars.html`**

把站点配置注入成 CSS 变量。第 1 层:强调色;第 2 层:每个方案的 up/down 与其深色变体。

```go-html
{{- $t := .Site.Params.theme | default dict -}}
{{- $colors := $t.colors | default dict -}}
{{- $schemes := $t.schemes | default dict -}}
{{- $default := $t.defaultScheme | default "aihot" -}}
<style>
:root {
  {{- with $colors.accent }}
  --accent: {{ . }};
  --accent-ink: color-mix(in oklab, {{ . }} 88%, black);
  --accent-soft: color-mix(in srgb, {{ . }} 8%, transparent);
  --accent-softer: color-mix(in srgb, {{ . }} 5%, transparent);
  {{- end }}
  {{- with $colors.accentDark }}
  --accent-dark: {{ . }};
  {{- end }}
}
[data-theme="dark"] {
  {{- with $colors.accentDark }}
  --accent: {{ . }};
  --accent-ink: color-mix(in oklab, {{ . }} 88%, white);
  --accent-soft: color-mix(in srgb, {{ . }} 12%, transparent);
  --accent-softer: color-mix(in srgb, {{ . }} 6%, transparent);
  {{- else }}
  {{- with $colors.accent }}
  --accent: color-mix(in oklab, {{ . }} 78%, white);
  --accent-ink: color-mix(in oklab, {{ . }} 78%, white);
  {{- end }}
  {{- end }}
}
{{- range $name, $s := $schemes }}
[data-scheme="{{ $name }}"] {
  {{- with $s.up }}{{ if reflect.IsSlice . }}{{ index . 0 }}  --up-dark: {{ index . 1 | default (index . 0) }};{{ else }}{{ . }};--up-dark: color-mix(in oklab, {{ . }} 82%, white);{{ end }}{{ end }}
  {{- with $s.down }}{{ if reflect.IsSlice . }}{{ index . 0 }}  --down-dark: {{ index . 1 | default (index . 0) }};{{ else }}{{ . }};--down-dark: color-mix(in oklab, {{ . }} 82%, white);{{ end }}{{ end }}
}
{{- end }}
</style>
```

`--up` / `--up-dark` 的浅深切换由 `theme.css` 中 `[data-theme="dark"] { --up: var(--up-dark, var(--up)); }` 承担。

- [ ] **Step 3: 提交**

```bash
git add assets/js/appearance.js layouts/partials/appearance-vars.html
git commit -m "feat: 运行时外观与配色方案切换"
```

---

### Task 4: 模板骨架

**Files:**
- Create: `layouts/_default/baseof.html`
- Create: `layouts/partials/head.html`
- Create: `layouts/partials/header.html`
- Create: `layouts/partials/sidebar.html`
- Create: `layouts/partials/phone-nav.html`
- Create: `layouts/partials/footer.html`
- Create: `layouts/partials/icons.html`
- Create: `layouts/partials/scheme-switcher.html`

- [ ] **Step 1: 写 `baseof.html`**

```go-html
<!DOCTYPE html>
<html lang="{{ .Site.Language.Lang }}" data-theme="{{ .Site.Params.theme.defaultAppearance | default "system" }}" data-scheme="{{ .Site.Params.theme.defaultScheme | default "aihot" }}">
<head>{{ partial "head.html" . }}</head>
<body>
  {{ partial "appearance-vars.html" . }}
  <div class="site-shell">
    {{ partial "sidebar.html" . }}
    <div class="site-body">
      {{ partial "header.html" . }}
      <main id="main" class="site-main">{{ block "main" . }}{{ end }}</main>
      {{ partial "footer.html" . }}
    </div>
    {{ partial "phone-nav.html" . }}
  </div>
  {{ partial "scripts.html" . }}
</body>
</html>
```

- [ ] **Step 2: 写 `head.html`**

包含 charset、viewport(带 `viewport-fit=cover`)、两个 `theme-color` meta、标题与描述、favicon、CSS(`theme.css` +
存在时的 `custom.css`)、以及**首屏前的内联 boot 脚本**:

```go-html
<script>
(function(){var a=null,s=null;try{a=localStorage.getItem("blog-theme:appearance");s=localStorage.getItem("blog-theme:scheme")}catch(e){}
var t=(a==="light"||a==="dark")?a:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
var r=document.documentElement;r.setAttribute("data-theme",t);if(s)r.setAttribute("data-scheme",s);})();
</script>
```

- [ ] **Step 3: 写 `sidebar.html` / `header.html` / `phone-nav.html` / `footer.html`**

- 侧栏:站点名 + 主导航(来自 `.Site.Menus.main`)+ 配色切换器 + 页脚信息。
  置顶由 `sticky.sidebar` 决定:

```go-html
<aside class="site-sidebar{{ if site.Params.theme.sticky.sidebar }} is-sticky{{ end }}">
```

- 顶栏:移动端显示站点名与配色切换器;`sticky.header` 决定是否 `is-sticky`。
- 手机底部标签栏:`phoneNav` 为 `bottom-bar` 时渲染,`header` 时不渲染(顶栏承担),`none` 时不渲染。
- 页脚:版权、`poweredBy`、备案信息占位。

- [ ] **Step 4: 写 `icons.html`**

内联 SVG 图标集,用 `{{ partial "icon.html" (dict "name" "sun" "size" 16) }}` 形式调用。至少需要:
`sun`、`moon`、`monitor`、`palette`、`chevron-down`、`chevron-right`、`arrow-up`、`menu`、`rss`、`github`、`tag`、`clock`。
每支图标是 `<svg viewBox="0 0 24 24" width="{{size}}" height="{{size}}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">…</svg>`。

- [ ] **Step 5: 写 `scheme-switcher.html`**

一个 `<details>` 下拉,两组 radio:`data-appearance-set` 与 `data-scheme-set`。方案列表由
`.Site.Params.theme.schemes` 遍历生成,默认项来自 `defaultScheme`。

```go-html
<details class="scheme-switcher">
  <summary class="scheme-switcher-summary" aria-label="{{ i18n "appearance" | default "Appearance" }}">
    {{ partial "icon.html" (dict "name" "palette" "size" 15) }}
  </summary>
  <div class="scheme-switcher-panel">
    {{- if site.Params.theme.showAppearanceSwitcher }}
    <div class="scheme-switcher-group" role="radiogroup" aria-label="{{ i18n "appearance" | default "Appearance" }}">
      {{- range $k, $v := dict "light" "light" "dark" "dark" "system" "system" }}
      <button type="button" role="radio" data-appearance-set="{{ $v }}" class="scheme-switcher-option">{{ i18n (printf "appearance.%s" $k) | default $k }}</button>
      {{- end }}
    </div>
    {{- end }}
    {{- if site.Params.theme.showSchemeSwitcher }}
    <div class="scheme-switcher-group" role="radiogroup" aria-label="{{ i18n "colourScheme" | default "Colour scheme" }}">
      {{- range $name, $s := site.Params.theme.schemes }}
      <button type="button" role="radio" data-scheme-set="{{ $name }}" class="scheme-switcher-option">{{ $s.label | default $name }}</button>
      {{- end }}
    </div>
    {{- end }}
  </div>
</details>
```

- [ ] **Step 6: 写 `layouts/partials/scripts.html`**

```go-html
{{ with resources.Get "js/appearance.js" }}
<script src="{{ .RelPermalink }}" defer></script>
{{ end }}
```

- [ ] **Step 7: 提交**

```bash
git add layouts
git commit -m "feat: 页面骨架、导航与配色切换器"
```

---

### Task 5: 内容页面模板

**Files:**
- Create: `layouts/index.html`
- Create: `layouts/_default/single.html`
- Create: `layouts/_default/list.html`
- Create: `layouts/_default/terms.html`
- Create: `layouts/404.html`
- Create: `layouts/partials/post-card.html`
- Create: `layouts/partials/pagination.html`
- Create: `layouts/partials/toc.html`
- Create: `layouts/shortcodes/notice.html`

- [ ] **Step 1: 写 `post-card.html`**

列表项:标题(链接)、日期、摘要、标签。日期用 `.Date` 与 `time.Format` 或 `partials/date.html`。

- [ ] **Step 2: 写 `index.html` 与 `list.html`**

`index.html` 取 `.Site.RegularPages`;`list.html` 取 `.Pages`。两者共用 `post-card` 渲染,并带 `pagination.html`。

- [ ] **Step 3: 写 `single.html`**

文章页:标题、日期/字数/标签元信息、正文(`.prose`)、可选目录(`.toc`)、上一篇/下一篇。

目录由 `.TableOfContents` 提供;`sticky.toc` 决定目录容器是否 `is-sticky`。

- [ ] **Step 4: 写 `toc.html`**

```go-html
{{- if and .TableOfContents (not .TableOfContents | plainify | chomp | eq "") -}}
{{- else if .TableOfContents }}
<nav class="toc{{ if site.Params.theme.sticky.toc }} is-sticky{{ end }}" aria-label="{{ i18n "toc" | default "Table of contents" }}">
  <div class="toc-inner">{{ .TableOfContents }}</div>
</nav>
{{- end }}
```

- [ ] **Step 5: 写 `pagination.html`**

用 Hugo 内置 `.Paginator`,输出上一页/下一页与页码。

- [ ] **Step 6: 写 `terms.html` / `404.html` / `notice.html`**

`terms.html` 列出所有 term 及其文章数;`404.html` 用 AIHOT 的错误页造型(状态码 + 标题 + 说明 + 按钮);
`notice.html` 短代码支持 `type` 参数(`info` / `warn` / `danger` / `success`)。

- [ ] **Step 7: 提交**

```bash
git add layouts
git commit -m "feat: 首页、列表、文章、归档与 404 模板"
```

---

### Task 6: 双语 i18n

**Files:**
- Create: `i18n/en.toml`
- Create: `i18n/zh.toml`

- [ ] **Step 1: 写 `i18n/en.toml`**

```toml
[appearance]
other = "Appearance"

[appearance.light]
other = "Light"

[appearance.dark]
other = "Dark"

[appearance.system]
other = "System"

[colourScheme]
other = "Colour scheme"

[toc]
other = "Table of contents"

[readMore]
other = "Read more"

[postedOn]
other = "Posted on"

[words]
other = "{{ .Count }} words"

[readingTime]
other = "{{ .Count }} min read"

[tags]
other = "Tags"

[untagged]
other = "Untagged"

[noPosts]
other = "Nothing here yet."

[newer]
other = "Newer"

[older]
other = "Older"

[page]
other = "Page {{ .Current }} of {{ .Total }}"

[backHome]
other = "Back to home"

[notFoundTitle]
other = "This page does not exist"

[notFoundBody]
other = "The link may be wrong, or the page has been taken down."

[skipToContent]
other = "Skip to content"

[toggleNav]
other = "Toggle navigation"

[home]
other = "Home"

[archive]
other = "Archive"

[poweredBy]
other = "Powered by {name}"
```

- [ ] **Step 2: 写 `i18n/zh.toml`** —— 同结构,值译为中文。

- [ ] **Step 3: 提交**

```bash
git add i18n
git commit -m "feat: 中英文界面文案"
```

---

### Task 7: 示例站与构建校验

**Files:**
- Create: `exampleSite/config/_default/hugo.toml`
- Create: `exampleSite/content/_index.md`
- Create: `exampleSite/content/posts/hello-world.md`
- Create: `exampleSite/content/posts/on-colour-and-typography.md`
- Create: `exampleSite/content/posts/tags-and-categories.md`
- Create: `exampleSite/content/about.md`
- Create: `tests/check.mjs`
- Create: `.github/workflows/hugo.yml`

- [ ] **Step 1: 写示例站配置**

```toml
baseURL = "https://example.com/"
languageCode = "en-us"
defaultContentLanguage = "en"
title = "blog-theme"
theme = "blog-theme"

[params]
  description = "A general-purpose Hugo blog theme in the visual language of AIHOT."

  [params.theme]
    defaultScheme = "aihot"
    defaultAppearance = "system"

  [[params.theme.schemes.demo]]
```

示例站用 `themesDir = "../../"` 或直接 `theme = "blog-theme"` 指向仓库根。仓库根即主题,示例站通过 `hugo server --source exampleSite --themesDir ../..` 运行。

- [ ] **Step 2: 写三篇示例文章 + 关于页**

文章要覆盖:代码块、表格、引用、列表、标题层级、标签——用来验证 `.prose` 的所有规则确实生效。

- [ ] **Step 3: 写 `tests/check.mjs`**

Node 零依赖脚本,做三件事:

1. 以 `--source exampleSite --themesDir <repoRoot>` 构建站点到临时目录
2. 断言产物 HTML 里存在关键标记:`data-theme=`、`data-scheme=`、`blog-theme:appearance`、`id="main"`、文章标题
3. 断言产物 CSS 里含三层模型的锚点:`[data-scheme="ashare"]`、`[data-theme="dark"]`、`--color-up`

```js
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, "exampleSite");
const out = join(root, ".check-build");

rmSync(out, { recursive: true, force: true });
execFileSync("hugo", ["--source", site, "--themesDir", root, "--destination", out, "--minify"], { stdio: "inherit" });

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(out);
const html = files.filter((f) => f.endsWith(".html")).map((f) => readFileSync(f, "utf8")).join("\n");
const css = files.filter((f) => f.endsWith(".css")).map((f) => readFileSync(f, "utf8")).join("\n");

const checks = [
  ["html", 'data-theme='],
  ["html", 'data-scheme='],
  ["html", 'blog-theme:appearance'],
  ["html", 'id="main"'],
  ["css", '[data-scheme="ashare"]'],
  ["css", '[data-theme="dark"]'],
  ["css", "--color-up"],
  ["css", "--radius-card"],
];

let failed = 0;
for (const [where, needle] of checks) {
  const haystack = where === "html" ? html : css;
  const ok = haystack.includes(needle);
  console.log(`${ok ? "PASS" : "FAIL"}  ${where}: ${needle}`);
  if (!ok) failed++;
}
rmSync(out, { recursive: true, force: true });
if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log("\nall checks passed");
```

- [ ] **Step 4: 写 CI**

```yaml
name: build
on:
  push:
    branches: [main]
  pull_request:
jobs:
  hugo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - uses: peaceiris/setup-hugo@v3
        with:
          hugo-version: "0.157.0"
          extended: true
      - run: node tests/check.mjs
```

- [ ] **Step 5: 跑校验**

Run: `node tests/check.mjs`
Expected: 全部 `PASS`,末行 `all checks passed`

- [ ] **Step 6: 提交**

```bash
git add exampleSite tests .github
git commit -m "feat: 示例站、构建校验与 CI"
```

---

### Task 8: 文档与推送

**Files:**
- Create: `README.md`

- [ ] **Step 1: 写 `README.md`**

必须包含:

- 一句话定位 + 预览图占位
- **安装**:Hugo Module 方式与 `themes/` 方式各一段
- **快速开始**:最小配置示例 + `hugo server --source exampleSite --themesDir ../..`
- **配置参考**:完整列出 `params.theme` 下的每一项,含默认值与含义
  - `defaultScheme` / `defaultAppearance` / `showAppearanceSwitcher` / `showSchemeSwitcher`
  - `phoneNav` / `sidebar`
  - `sticky.*`(强调默认全关)
  - `colors.accent` / `colors.accentDark`
  - `schemes.<name>` 的 `label` / `up` / `down`,以及如何新增自定义方案
- **配色方案表**:aihot / ashare / western / neutral 的涨跌指向
- **自定义 CSS**:`assets/css/custom.css` 的用法与优先级
- **双语**:如何切换 `defaultContentLanguage`
- **与 AIHOT 的关系**:视觉语言来源与致谢(MIT)

- [ ] **Step 2: 本地最终验证**

Run: `hugo --source exampleSite --themesDir . --destination /tmp/blog-theme-public --minify`
Expected: 构建成功,无 template 警告。

Run: `node tests/check.mjs`
Expected: `all checks passed`

- [ ] **Step 3: 提交并推送**

```bash
git add README.md
git commit -m "docs: 使用说明与配置参考"
git push -u origin main
```
