---
title: "Tags and categories"
date: 2026-04-20T08:05:00+08:00
description: "分类页、标签页,以及它们在导航里的位置。"
tags: ["hugo", "design"]
categories: ["meta"]
---

标签页走的是 Hugo 的 taxonomy 模板。`/tags/` 列出所有标签并按文章数排序,`/tags/<name>/` 列出该标签下的文章。

{{< notice type="info" title="提示" >}}
分类页和标签页用的是同一套模板,由 Hugo 的 `kind` 决定走哪一份。
{{< /notice >}}

## 排序

列表页默认按权重排序,文章按日期倒序。可以在 front matter 里覆盖:

```yaml
---
title: "置顶的文章"
date: 2026-04-20T08:05:00+08:00
weight: 1
---
```

{{< notice type="warn" title="注意" >}}
`weight` 越小越靠前,但它不会影响首页的取页顺序 —— 首页走的是分页器。
{{< /notice >}}

## 一个空状态

分类页没有内容时会显示一句提示,而不是留下一个空白页:

{{< notice type="success" title="空状态" >}}
Nothing here yet.
{{< /notice >}}
