---
name: fieldsux-static
description: FieldsUX decorative HTML field types — h1, h2, h3, p, a, img, hr, br. These render fixed HTML inside the form (no value, no `fu_name`) for headings, paragraphs, links, images, dividers, and vertical spacers. Simple and infrequent — only load when the task uses decorative elements. For from_definition / function (expansion-time fields), see fieldsux-structure.md. Read fieldsux-core.md first.
---

# FieldsUX — Static HTML decorations

> Prerequisite: read `fieldsux-core.md`.

These types render fixed HTML inside the form. They have no value and no `fu_name` — purely decorative.

For `from_definition` and `function` (which expand into other field templates at runtime, not real DOM elements), see `fieldsux-structure.md` — they live there because they shape the field tree, just like `group` / `tabs` / `radiotabs` do.

---

## STATIC HTML — decorative (no value, no `fu_name`)

These render plain HTML inside the form. They appear in the editor's picker as "Headers >>> …" / "HTML >>> …". The renderer enforces nothing — every attribute below has a fallback (mostly `''`), so a missing value produces an empty/broken element rather than a runtime error. Provide all listed attributes for a useful render.

For headings (`h1`/`h2`/`h3`) and `p`, the rendered DOM is a styled `<div>` with class `fu_h1`/`fu_h2`/`fu_h3`/(or a real `<p>` for `p`) — *not* a real `<h1>` element. Inside an admin form that's fine.

The visible `<div class="fu_h1">` (or `<div class="fu_h2">`, etc.) sits **inside** the custom-element wrapper, which itself carries `class="fu_html"`. So the full chain for headings is `<fu-h1 class="fu_html"><div class="fu_h1">…</div></fu-h1>`. **`p` is the exception**: its inner element is a real `<p>` (no `fu_p` class), so the chain is `<fu-p class="fu_html"><p>…</p></fu-p>` — target it as `.fu_html > p` if needed. If you target headings with CSS, scope to `.fu_h1`/`.fu_h2`/`.fu_h3` (the inner div), not to `.fu_html` (which is shared by every static-HTML field type — `a`, `img`, `hr`, `br` included).

### h1, h2, h3

| Attribute | Type | Description |
|---|---|---|
| `fu_label` | String &#124; Null | Heading text/HTML. Default `""` (empty heading) |
| `fu_colspan` | String &#124; Null | |

```json
{ "fu_type": "h2", "fu_label": "Section heading", "fu_colspan": "full" }
```

### p

| Attribute | Type | Description |
|---|---|---|
| `fu_label` | String &#124; Null | Paragraph text/HTML. Default `""` |
| `fu_colspan` | String &#124; Null | |

### a (link)

| Attribute | Type | Description |
|---|---|---|
| `fu_label` | String &#124; Null | Link text/HTML. Default `""` (link with no visible text) |
| `href` | String &#124; Null | URL. Default `"#"` |
| `target` | String &#124; Null | Default `"_blank"` |
| `fu_colspan` | String &#124; Null | |

```json
{ "fu_type": "a", "fu_label": "Docs", "href": "https://example.com/docs" }
```

### img

| Attribute | Type | Description |
|---|---|---|
| `src` | String (URL) &#124; Null | Image source. Default `""` (broken-image icon). The renderer does not set `alt` |
| `fu_colspan` | String &#124; Null | |

### hr

Renders an `<hr>` inside the wrapper.

| Attribute | Type | Description |
|---|---|---|
| `fu_colspan` | String &#124; Null | |

### br

Vertical spacer; the wrapper gets `style="height: <height>"`.

| Attribute | Type | Description |
|---|---|---|
| `height` | String with unit &#124; Null | e.g. `"32px"`, `"1rem"`. Default `"32px"` when omitted/falsy |
| `fu_colspan` | String &#124; Null | |
