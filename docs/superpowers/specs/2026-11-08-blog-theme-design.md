# blog-theme 设计文档

日期:2026-11-08
状态:已批准

## 目标

参考 [AIHOT](https://github.com/KKKKhazix/AIHOT) 的页面主题风格,产出一个**通用博客页面框架**,以独立 Hugo 主题的形式交付到
[cx0110/blog-theme](https://github.com/cx0110/blog-theme)。

AIHOT 是一个 AI 热点聚合站(React 19 + React Router 8 + Tailwind 4),本项目不复刻它的业务逻辑与信息架构,只提取它的
**视觉语言**:暖白纸底 + 墨色四级层次 + 单一强调色 + 发丝描边 + 无渐变 + 克制的动效,并把这些视觉规则重新组织成一个
面向静态博客的、可配置的 Hugo 主题。

## 交付形态

独立 Hugo 主题。两种使用方式:

1. 作为 Hugo Module:`hugo mod get github.com/cx0110/blog-theme`
2. 作为 `themes/` 目录直接拷贝

不是 Hugo Blox 的覆盖层,也不只是 CSS 片段。主题自带完整模板与双语界面文案。

## 技术选型

Hugo 原生模板 + 纯 CSS 自定义属性设计系统。**不引入 Tailwind、Sass 或任何 Node 构建步骤**——`hugo server` 即可运行,
任何 Hugo 用户 clone 下来就能用。

运行时切换外观与配色方案的能力,要求语义色必须存在于运行时 CSS 变量中(而非编译期生成的样式),这是选择纯 CSS 方案
的直接原因。

Hugo 版本要求:`min_version = "0.146.0"`(开发验证于 0.157.0 extended)。

## 色彩模型

三层叠加,自下而上:

### 第 1 层:基础色板

主题自带默认值,站点配置可逐项覆盖。令牌沿用 AIHOT 的语义命名:

```
--color-bg / bg-sunk / bg-muted / well / surface / surface-2 / raised / sidebar
--color-ink / ink-2 / ink-3 / ink-4
--color-line / line-strong / line-soft
--color-accent / accent-ink / accent-soft / accent-softer / accent-contrast
--color-note / hot / hot-soft / amber / amber-ink / amber-soft
--color-ok / ok-soft / ok-ink
--color-up / up-soft / down / down-soft     ← 语义色,由第 2 层决定指向
```

覆盖方式:

```toml
[params.theme.colors]
  accent = "#176b75"      # 强调色(浅色外观)
  accentDark = "#12ccd8"  # 强调色(深色外观);省略时由 accent 自动提亮
```

`accentDark` 省略时用 `color-mix(in oklab, accent 78%, white)` 推导。除 `accent` / `accentDark` 外,站点还可通过
`assets/css/custom.css` 覆盖任意令牌(主题在 `custom.css` 存在时才引入它)。

### 第 2 层:配色方案(scheme)

决定"涨"与"跌"分别指向哪个颜色。内置四个:

| scheme | up(涨) | down(跌) | 说明 |
|---|---|---|---|
| `aihot` | 暖红 `#b3402a` / `#d86a52` | 暖绿 `#2f7d5c` / `#5fc79a` | AIHOT 原味,**默认** |
| `ashare` | 红 | 绿 | A 股:红涨绿跌 |
| `western` | 绿 | 红 | 欧美:绿涨红跌 |
| `neutral` | 中性灰 | 中性灰 | 不强调涨跌 |

每组数值是"浅色 / 深色"两个值。

站点可新增自定义方案,切换器只列出配置中实际存在的方案:

```toml
[params.theme.schemes.myco]
  label = "MyCo 行情"
  up = ["#c0392b", "#e06a5c"]
  down = ["#2f7d5c", "#5fc79a"]
```

`up` / `down` 的第二个值(深色)可省略,省略时由第一个值自动提亮。`label` 缺省时用方案名。

### 第 3 层:深浅外观(appearance)

`light` / `dark` / `system`。解析后的值写到 `<html data-theme="light|dark">`。

配色方案写到 `<html data-scheme="aihot">`。两个属性独立共存,任意组合都有定义。

## 运行时切换

页面内提供一个下拉控件,分两组:**外观**(浅色 / 深色 / 跟随系统)与**配色方案**(第 2 层的方案列表)。

- 状态存 `localStorage`,键 `blog-theme:appearance` 与 `blog-theme:scheme`
- 首次访问用站点配置的默认值;`appearance` 默认 `system`
- 切换时调用 `document.startViewTransition` 做交叉淡入(200ms),与 AIHOT 一致;不支持时直接切换
- `prefers-reduced-motion: reduce` 时不做过渡
- 首屏前在 `<head>` 内联一段 boot 脚本读取 localStorage 并写好 `data-theme` / `data-scheme`,避免闪白

## 置顶:可配置且默认关闭

AIHOT 的侧栏、顶栏、文章目录全部是写死的 `sticky`。本主题把这些落到配置,**默认全部关闭**:

```toml
[params.theme.sticky]
  sidebar = false      # 侧栏固定
  header = false       # 顶栏固定
  toc = false          # 文章目录固定
  backToTop = true     # 回到顶部悬浮按钮(浮层,非置顶)
```

模板按配置决定是否输出固定定位的样式类。

## 布局

沿用 AIHOT 的形状与断点:

| 断点 | 宽度 | 形态 |
|---|---|---|
| `< lg` | < 700px | 单栏 + 底部标签栏(可配 `bottom-bar` / `header` / `none`) |
| `lg` ~ `wide` | 700–941px | 64px 图标导轨 + 主区 |
| `≥ wide` | ≥ 941px | 180px 完整侧栏 + 主区 |

主区宽度:列表页 `max(1200px, calc(270dvh - 236px))`,阅读页 `max(1100px, calc(200dvh - 236px))`——沿用 AIHOT 的
"填充 16:9 屏、超出居中"策略。

文章正文栏固定 760px(17px 字号下约 42 字/行,与 AIHOT 的中文排版基准一致)。

断点标度:`sm 641 / lg 700 / md 768 / wide 941 / side 1176 / xl 1280 / 2xl 1536`
圆角标度:`mark 5 / control 8 / tile 10 / card 12 / panel 14 / sheet 16`(px)

## 长文排版

移植 AIHOT 的 `.prose` 规则:

- 正文 17px / 行高 1.8 / 字距 0.012em;≥ 80rem 时 18px
- 段落间距 1.2em;标题 h2 1.26em / h3 1.1em / h4-h5 1em
- 链接:accent 色 + 35% 混色下划线,hover 加深
- 代码块:带语言头与复制按钮;行内代码带边框
- 表格:横向滚动,不挤压单元格
- 锚点 `scroll-margin-top: 88px`
- 另附 `.prose-compact`(15px,政策类页面用)

## 双语 i18n

`i18n/en.toml` 与 `i18n/zh.toml`。覆盖:导航项、按钮、"阅读全文"、日期与字数标签、目录标题、配色方案名、空状态、
分页、页脚。站点语言由 Hugo 的 `defaultContentLanguage` 决定。

## 页面清单

- 首页(文章列表)
- 列表页(section / taxonomy)
- 词条页(tag / category 单页)
- 文章详情页(正文 + 元信息 + 可选目录 + 上下篇)
- 404
- RSS(复用 Hugo 内置)

## 仓库结构

```
blog-theme/
├── .github/workflows/hugo.yml
├── .gitignore
├── LICENSE
├── README.md
├── exampleSite.toml
├── go.mod
├── hugo.toml
├── assets/
│   ├── css/theme.css
│   ├── css/custom.css
│   └── js/appearance.js
├── docs/superpowers/specs/
├── exampleSite/
│   ├── config/_default/hugo.toml
│   └── content/
├── i18n/en.toml, zh.toml
├── layouts/
│   ├── 404.html
│   ├── index.html
│   ├── _default/{baseof,single,list,terms}.html
│   ├── partials/
│   └── shortcodes/
└── static/favicon.svg
```

## 验证

1. `hugo --minify --destination public` 构建 exampleSite 零错误
2. GitHub Actions 在每次 push / PR 上跑同一构建
3. 推送前本地起服务,核对浅色/深色、四个 scheme、置顶开关的实际渲染

## 明确不做(YAGNI)

- 不做 Hugo Blox 兼容层
- 不做多作者、评论系统、搜索、订阅表单
- 不做站内图片处理管线
- 不做除 `en` / `zh` 外的第三种语言
- 不做 i18n 运行时切换(仅随 Hugo 语言配置)
