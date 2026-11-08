---
title: "Hello, world"
date: 2026-02-01T10:12:00+08:00
description: "主题的第一篇文章,顺便把排版能力都过一遍。"
tags: ["hugo", "theme"]
categories: ["meta"]
---

这是一篇用来验收排版能力的示例文章:标题层级、段落、列表、引用、代码块、表格、链接,全都走一遍。

## 二级标题

正文用 17px / 1.8 的行高,单行大约 42 个字符,长时间阅读不累。

### 三级标题

三级标题更紧凑,颜色退到第二层墨色,不需要额外强调。

## 列表

- 无序列表的第一项
- 第二项,中间可以夹一段解释文字
- 第三项

有序列表:

1. 打开 `hugo.toml`
2. 找到 `[params.theme.sticky]`
3. 把 `sidebar` 改成 `true`

## 引用

> 好的默认是"什么都不发生"。
> 置顶、吸底、动画,都应该是访客和站长主动打开的开关。

## 代码块

```toml
[params.theme]
  defaultScheme = "aihot"
  defaultAppearance = "system"

  [params.theme.sticky]
    sidebar = false
    header = false
    toc = false
```

行内代码写作 `params.theme.colors.accent`。

## 表格

| 配色方案 | 涨 | 跌 |
| --- | --- | --- |
| AIHOT | 暖红 | 松绿 |
| A 股 | 正红 | 松绿 |
| 欧美 | 松绿 | 暖红 |
| 中性 | 灰 | 灰 |

## 涨跌徽标

配色方案决定下面这两个徽标指向哪个颜色 —— 切到「A 股」和「欧美」看它们的红绿互换:

{{< badge type="up" text="+2.31%" >}}
{{< badge type="down" text="−1.08%" >}}

## 链接

主题的[源码](https://github.com/cx0110/blog-theme)在 GitHub 上,MIT 许可。
