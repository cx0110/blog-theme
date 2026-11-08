# blog-theme

> A general-purpose Hugo blog theme in the visual language of [AIHOT](https://github.com/KKKKhazix/AIHOT).
>
> 暖纸底色、清晰的墨色层级、一个克制的强调色、发丝级描边 —— 外观与涨跌配色都能在运行时切换。
> 零构建步骤:没有 Sass、没有 Tailwind、没有 Node,`hugo server` 就是最终效果。

一个独立的 Hugo 主题,把 AIHOT 的视觉语言抽出来做成通用的博客框架。

- **三层颜色模型** —— 主题自身颜色 / 涨跌配色方案 / 浅深外观,互不干扰
- **运行时切换** —— 访客可以自己切浅色深色、切绿涨红跌还是 A 股红涨绿跌,选择记在 `localStorage`
- **默认什么都不置顶** —— 侧栏、顶栏、目录的吸顶全部默认关闭,由站长自己开
- **双语界面** —— 中英文文案随 Hugo 的语言配置走
- **零依赖** —— 纯 Hugo 模板 + 纯 CSS 自定义属性

## 安装

### 方式一:Hugo Module(推荐)

```bash
hugo mod init github.com/you/your-blog
hugo mod get github.com/cx0110/blog-theme
```

然后在 `hugo.toml` 里加上:

```toml
[module]
  [[module.imports]]
    path = "github.com/cx0110/blog-theme"
```

### 方式二:放进 `themes/`

```bash
git clone https://github.com/cx0110/blog-theme.git themes/blog-theme
```

```toml
theme = "blog-theme"
```

## 快速开始

最小配置:

```toml
baseURL = "https://example.com/"
languageCode = "en-us"
defaultContentLanguage = "en"
title = "My Blog"
theme = "blog-theme"

[menus]
  [[menus.main]]
    name = "Posts"
    url = "/posts/"
    weight = 10
```

跑示例站看效果:

```bash
git clone https://github.com/cx0110/blog-theme.git
cd blog-theme
hugo server --source exampleSite
```

仓库里的 `exampleSite/themes/blog-theme` 是一个指向仓库根的符号链接,所以示例站不需要任何额外参数。
克隆时如果符号链接没被带过来(Windows 默认不检出符号链接),用临时目录顶替:

```bash
mkdir -p /tmp/themes && ln -sfn "$PWD" /tmp/themes/blog-theme
hugo server --source exampleSite --themesDir /tmp/themes
```

## 配置参考

所有配置都在 `params.theme` 下。站点配置会与主题默认值**深度合并** —— 只写要改的那一项就行。

| 键 | 默认值 | 说明 |
| --- | --- | --- |
| `defaultScheme` | `"aihot"` | 默认配色方案(第 2 层),必须是 `schemes` 里的名字 |
| `defaultAppearance` | `"system"` | 默认外观(第 3 层):`light` / `dark` / `system` |
| `showAppearanceSwitcher` | `true` | 是否显示浅色 / 深色 / 跟随系统切换器 |
| `showSchemeSwitcher` | `true` | 是否显示配色方案切换器 |
| `phoneNav` | `"bottom-bar"` | 手机端导航:`bottom-bar` / `header` / `none` |
| `sidebar` | `"full"` | 桌面侧栏:`full` / `rail` / `none`。`rail` 是图标导轨,宽屏也保持窄栏 |
| `colors.accent` | `"#176b75"` | 强调色(第 1 层) |
| `colors.accentDark` | `"#12ccd8"` | 深色外观下的强调色;不写就由 `accent` 自动推导 |

### 置顶

**默认全部关闭。** 想开哪一项就开哪一项,不用改模板。

| 键 | 默认值 | 说明 |
| --- | --- | --- |
| `sticky.sidebar` | `false` | 桌面侧栏吸顶 |
| `sticky.header` | `false` | 手机顶栏吸顶 |
| `sticky.toc` | `false` | 文章目录吸顶 |
| `sticky.backToTop` | `true` | 右下角「回到顶部」悬浮按钮 |

```toml
[params.theme.sticky]
  sidebar = true
  header = false
  toc = true
```

### 配色方案(第 2 层)

每个方案声明「涨」和「跌」各是什么颜色,浅色 / 深色各一套取值:

```toml
[params.theme.schemes.aihot]
  label = "AIHOT"
  up = ["#b3402a", "#d86a52"]     # 浅色,深色
  down = ["#2f7d5c", "#5fc79a"]
```

`up` / `down` 也可以只写一个颜色,那样浅深两套用同一个值。

内置方案:

| 方案 | 涨 | 跌 | 说明 |
| --- | --- | --- | --- |
| `aihot` | 暖红 | 松绿 | 默认。取自 AIHOT |
| `ashare` | 正红 | 松绿 | A 股:红涨绿跌 |
| `western` | 松绿 | 暖红 | 欧美:绿涨红跌 |
| `neutral` | 灰 | 灰 | 不表达方向 |

新增自己的方案,照抄上面的结构即可,名字随便取:

```toml
[params.theme.schemes.ocean]
  label = "Ocean"
  up = ["#0f7b8a", "#3fb6c9"]
  down = ["#a4512c", "#d99060"]
```

方案会自动出现在配色方案切换器里。

用涨跌颜色的小徽标:

```markdown
{{< badge type="up" text="+2.31%" >}}
{{< badge type="down" text="−1.08%" >}}
```

`type` 可选 `neutral`(默认)/ `accent` / `hot` / `amber` / `ok` / `up` / `down`。

### 提示块

```markdown
{{< notice type="warn" title="注意" >}}
这里是内容。
{{< /notice >}}
```

`type` 可选 `info`(默认)/ `warn` / `danger` / `success`。

## 三层颜色模型

| 层 | 管什么 | 配在哪 |
| --- | --- | --- |
| 第 1 层 | 主题自身颜色:纸面底色、墨色层级、强调色 | `params.theme.colors` |
| 第 2 层 | 涨跌语义:涨是什么颜色、跌是什么颜色 | `params.theme.schemes.<name>` |
| 第 3 层 | 浅色 / 深色 / 跟随系统 | `params.theme.defaultAppearance` + 访客的选择 |

三层在 CSS 里这样接合 —— 第 2 层声明两套取值,第 3 层决定取哪一套:

```css
:root                { --up: var(--up-light, var(--ink-3)); }
[data-theme="dark"]  { --up: var(--up-dark,  var(--ink-3)); }
```

所以加一个配色方案只要写四行,不用碰 CSS。

## 自定义 CSS

站点放一个 `assets/css/custom.css`,主题会自动在样式表之后加载它,优先级更高:

```css
:root {
  --accent: #3b5bdb;
  --radius-card: 16px;
}
```

常用变量:

| 变量 | 含义 |
| --- | --- |
| `--accent` / `--accent-ink` | 强调色及其文字色 |
| `--bg` / `--surface` / `--sidebar` | 底色、卡片面、侧栏底色 |
| `--ink` … `--ink-4` | 四级墨色 |
| `--line` / `--line-strong` / `--line-soft` | 发丝描边 |
| `--radius-mark` … `--radius-sheet` | 圆角刻度(5 / 8 / 10 / 12 / 14 / 16 px) |
| `--page-max-wide` / `--page-max-reading` | 列表页与文章页的最大宽度 |
| `--content-w` | 正文栏宽(默认 760px) |

## 双语

主题自带 `i18n/en.toml` 和 `i18n/zh.toml`,随 Hugo 的语言配置走:

```toml
defaultContentLanguage = "zh"
```

想加自己的语言,复制一份 `i18n/` 下的文件改名为 `fr.toml` 之类,并在站点配置里声明:

```toml
[languages.zh]
  languageName = "中文"
  weight = 1
  [languages.zh.params]
    theme = { defaultScheme = "ashare" }
```

> 翻译文件里有一条约定:一个表要么只放 `other`,要么只放子表,不能混用;
> 带点的平铺键必须写在第一个表头之前。`i18n/en.toml` 里有注释说明。

## 目录结构

```
blog-theme/
├── assets/
│   ├── css/theme.css        # 全部样式:设计令牌 + 组件 + 排版
│   └── js/appearance.js     # 外观与配色方案切换(localStorage + View Transition)
├── layouts/
│   ├── _default/            # baseof / list / single / terms
│   ├── partials/            # 侧栏、顶栏、切换器、文章卡片、目录、分页……
│   └── shortcodes/          # notice / badge
├── i18n/                    # en.toml / zh.toml
├── exampleSite/             # 示例站
├── static/
└── tests/check.mjs          # 构建校验脚本
```

## 开发

```bash
node tests/check.mjs          # 构建示例站并对产物断言
```

CI 会在每次 push 和 PR 时跑这个脚本。

## 与 AIHOT 的关系

视觉语言(设计令牌、圆角刻度、栅格、正文排版、浅深两套配色)取自
[KKKKhazix/AIHOT](https://github.com/KKKKhazix/AIHOT)(MIT)。
本仓库只保留主题层,并把它重写成 Hugo 模板 + 纯 CSS 自定义属性,
去掉了 React、数据库和所有业务逻辑。

配色方案 `aihot` 直接沿用 AIHOT 的涨跌取色。致谢原作者。

## 许可

MIT
