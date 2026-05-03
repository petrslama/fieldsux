---
name: fieldsux-structure
description: FieldsUX structural field types — group, tabs, radiotabs (layout containers) and from_definition / function (expansion-time fields that inline reusable root definitions or the result of a global JS function). Use when organizing fields into sub-objects, side-by-side panels, variant choosers, or for reusable / dynamic field-tree expansion. Read fieldsux-core.md first.
---

# FieldsUX — Structural / grouping fields

> Prerequisite: read `fieldsux-core.md`.

These three types are layout containers — they don't store values themselves; they shape how child values aggregate into the parent object.

| Type | Has `fu_name` | Children's value relationship |
|---|---|---|
| `group` | optional | If set: nested under `fu_name`. If omitted: merged into parent |
| `tabs` | none | Always merged into parent (across all tab panels) |
| `radiotabs` | required | Selected `fu_value` stored under `fu_name`; selected panel's fields merged into parent |

None of these accept `fu_description`. All three accept `fu_colspan`.

---

## group

Container that aggregates child fields into a sub-object under `fu_name`. If `fu_name` is omitted, children's keys merge into the parent.

| Attribute | Type | Description |
|---|---|---|
| `fu_name` | String &#124; Null | If set, children nest under this key |
| `fu_label` | String &#124; Null | |
| `fu_colspan` | String &#124; Null | |
| `fields` ✱ | Array&lt;field templates&gt; | Child fields |

Value: `Object` keyed by child `fu_name`, or `Null` when empty.

```json
{
	"fu_type": "group",
	"fu_name": "address",
	"fu_label": "Address",
	"fields": [
		{ "fu_type": "text", "fu_name": "street", "fu_label": "Street" },
		{ "fu_type": "text", "fu_name": "city", "fu_label": "City" }
	]
}
```

---

## tabs

Tabbed layout. Each tab holds independent fields. Tab values **merge** into the parent (no key wrapping).

| Attribute | Type | Description |
|---|---|---|
| `fu_colspan` | String &#124; Null | |
| `tabs` ✱ | Array&lt;{ `fu_label`: String, `fields`: Array }&gt; | Tab definitions |

No `fu_name` — `tabs` is structural only. The container has CSS class `fu_field`, so its value is spread into the parent object by the surrounding `fu-children`.

Value: `Object | Null` (merged from every tab panel; `Null` if every panel is empty).

```json
{
	"fu_type": "tabs",
	"tabs": [
		{ "fu_label": "Content", "fields": [ { "fu_type": "text", "fu_name": "title", "fu_label": "Title" } ] },
		{ "fu_label": "SEO",     "fields": [ { "fu_type": "text", "fu_name": "meta_description", "fu_label": "Meta Description" } ] }
	]
}
```

---

## radiotabs

Tabs driven by a radio group. The radio's value is stored under `fu_name`; the panel's fields merge into the same parent object.

| Attribute | Type | Description |
|---|---|---|
| `fu_name` ✱ | String | Key for the selected radio's `fu_value` |
| `fu_colspan` | String &#124; Null | |
| `tabs` ✱ | Array&lt;{ `fu_value`: String, `fu_label`: String, `fields`: Array }&gt; | Each tab is one radio choice |

Only the **currently selected** panel contributes its fields to the value (the other panels' values are ignored).

Value:
- `{ [fu_name]: <selected fu_value>, ...<selected panel value> }` when a radio is checked and both `fu_name` and `fu_value` are non-empty
- `<selected panel value>` (an Object, `Null`, or `undefined`) otherwise

```json
{
	"fu_type": "radiotabs",
	"fu_name": "layout",
	"tabs": [
		{ "fu_value": "grid", "fu_label": "Grid", "fields": [ { "fu_type": "number", "fu_name": "columns", "fu_label": "Columns" } ] },
		{ "fu_value": "list", "fu_label": "List", "fields": [ { "fu_type": "checkbox", "fu_name": "compact", "fu_after": "Compact" } ] }
	]
}
```

---

## Choosing between group / tabs / radiotabs

- **Sub-object in JSON output** → `group` with `fu_name`
- **Visually separate panels, same flat output** → `tabs` (no `fu_name`)
- **User picks one mode and fills mode-specific fields** → `radiotabs` (the radio's value tells consumers which panel was active)
- **Just want flat fields under a heading** → `group` without `fu_name` (merges children into parent)

---

## SPECIAL — resolved at expansion time, not real elements

`from_definition` and `function` are intercepted by `fu-children` **before** any custom element is created. They produce no DOM of their own — they expand into other field templates that are then appended in their place. They live in this skill because they shape the field tree (just like `group` / `tabs` / `radiotabs` do), even though they don't render anything themselves.

### from_definition

Inlines a definition registered at the root (see "TOP-LEVEL TEMPLATE" in `fieldsux-core.md`). Expanded recursively, so a definition can itself contain `from_definition` references.

| Attribute | Type | Description |
|---|---|---|
| `definition` ✱ | String | Name of a definition declared in `definitions[]` |

```json
{ "fu_type": "from_definition", "definition": "address_block" }
```

### function

Calls a global JS function and inlines its return value as if it were written into the template literally.

| Attribute | Type | Description |
|---|---|---|
| `fu_name` ✱ | String | Global function name — looked up as `window[fu_name]` |

Calls `window[fu_name]()`. The return value must be `Array<field templates>` and is inlined exactly where the `function` template stood. If `window[fu_name]` is missing or not a function, the template is skipped (the renderer logs a `console.error`).

```json
{ "fu_type": "function", "fu_name": "build_dynamic_options" }
```
