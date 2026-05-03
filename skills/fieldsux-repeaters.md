---
name: fieldsux-repeaters
description: FieldsUX repeater field types — repeater_single, repeater_multiple, repeater_table, repeater_array. Use when building any list of items in a template. Compares the four variants (single vs. table vs. multiple vs. array) including critical limitations like repeater_table not supporting select/checkbox/textarea. Read fieldsux-core.md first.
---

# FieldsUX — Repeaters

> Prerequisite: read `fieldsux-core.md`.

All repeaters expose drag-and-drop reorder (SortableJS), per-row delete, duplicate, copy/paste-as-JSON. Variants differ in row creation and what each row may contain.

## When to pick which

| Need | Use |
|---|---|
| List of identical items, rich field controls per row | `repeater_single` |
| List of identical items, compact one-liner table | `repeater_table` (but read its limitations first) |
| List with multiple row shapes (heterogeneous) | `repeater_multiple` |
| List of plain strings | `repeater_array` |

⚠ `repeater_table` looks the most appealing for most "list of records" use cases — but it does **not** use FieldsUX Custom Elements. Read its section before assuming `select` / `checkbox` / `textarea` will work.

---

## Shared repeater attributes

| Attribute | Type | Description |
|---|---|---|
| `fu_name` ✱ | String | Data key (the array) |
| `fu_colspan` | String &#124; Null | |
| `fu_repeater__labels` | Array&lt;{ `fu_label`: String, `width`: Number &#124; Null }&gt; | Header columns. Optional — when omitted, a single empty header is used. `width` is a flex-grow integer. **Ignored by `repeater_table`** (rebuilds headers from column fields) and by `repeater_array` (uses `heading` instead) |
| `templates` ✱ | Array | Row templates (see specific variant). **Not used by `repeater_array`** — its row template is hard-coded |

Each row's collapsed-state label list is defined per template:

| In `templates[N]` | Type | Description |
|---|---|---|
| `fu_row__labels` | Array&lt;{ `fu_label`: String, `width`: Number &#124; Null }&gt; | Labels shown when row is collapsed. `fu_label` can include `[other_field_name]` — replaced live from that field's `repeater_label` (live update **only here** — see `fieldsux-core.md` for the placeholder mechanism) |

---

## repeater_single

Single template, unlimited rows.

| Attribute | Type | Description |
|---|---|---|
| `templates` ✱ | Array (only `[0]` used) of `{ fu_row__labels?, fields }` | Single row template |

Value: `Array<Object | Null>` — one entry per row; each row's value is whatever the inner `fu-children` produces (`Object` for non-empty rows, `Null` if every field in the row is empty).

```json
{
	"fu_type": "repeater_single",
	"fu_name": "items",
	"fu_repeater__labels": [{ "fu_label": "Title" }],
	"templates": [{
		"fu_row__labels": [{ "fu_label": "[title]" }],
		"fields": [
			{ "fu_type": "text", "fu_name": "title", "fu_label": "Title" },
			{ "fu_type": "number", "fu_name": "price", "fu_label": "Price" }
		]
	}]
}
```

---

## repeater_multiple

Multiple row templates. The user picks the row type from a searchable picker. The picker stores the chosen template's `fu_type` only if the row template explicitly contains a `fu_type` field — see warning below.

| Attribute | Type | Description |
|---|---|---|
| `templates` ✱ | Array&lt;{ `fu_type`: String, `fu_label`: String, `fu_row__labels?`, `fields` }&gt; | One entry per available row type. The picker selects a template by matching the row value's `fu_type` against the template's `fu_type`. `fu_label` may use `>>>` to split into picker section / item (e.g. `"Headers >>> H1"`) |

> **Discriminator persistence.** A row's value is whatever its `fields[]` produce — *not* automatically `{ fu_type: "...", ... }`. To preserve the discriminator across save/load, every template's `fields[]` must include a field with `fu_name: "fu_type"` (typically a `text` field, often hidden). The editor's own `quine.json` follows this convention.
>
> **Override quirk.** If any template in `templates[]` has `fu_type: "type"` literally, the renderer overrides every successful row match to use *that* template instead. This is an edge-case escape hatch — avoid the literal name `"type"` for a row's `fu_type` unless you intend this behaviour.

Value: `Array<Object | Null>` — one entry per row; shape comes from each row's matched template `fields[]`. A row with all fields empty produces `Null`.

```json
{
	"fu_type": "repeater_multiple",
	"fu_name": "sections",
	"fu_repeater__labels": [{ "fu_label": "Type" }, { "fu_label": "Label" }],
	"templates": [
		{
			"fu_type": "hero",
			"fu_label": "Sections >>> Hero",
			"fu_row__labels": [{ "fu_label": "[fu_type]" }, { "fu_label": "[title]" }],
			"fields": [ { "fu_type": "text", "fu_name": "title", "fu_label": "Title" } ]
		},
		{
			"fu_type": "cta",
			"fu_label": "Sections >>> CTA",
			"fu_row__labels": [{ "fu_label": "[fu_type]" }, { "fu_label": "[label]" }],
			"fields": [ { "fu_type": "text", "fu_name": "label", "fu_label": "Button label" } ]
		}
	]
}
```

---

## repeater_table

Compact table layout — every row stays collapsed to one line. Column headers come from `fields[].fu_label` (any `fu_repeater__labels` you pass is ignored — `repeater_table` rebuilds it from the column fields).

> **CRITICAL — limited field types.** Unlike `repeater_single` / `repeater_multiple`, `repeater_table` does **not** use FieldsUX Custom Elements for its row cells. Each cell is a raw `<input type="${fu_type}">`, so `fu_type` here is a **native HTML `<input>` type** (e.g. `text`, `number`, `email`, `url`, `tel`, `date`, `time`, `password`, `color`). The following are **not supported** in `repeater_table`: `select`, `checkbox`, `checkboxes`, `radios`, `textarea`, `group`, `tabs`, nested repeaters, `from_definition`, or any other FieldsUX field. Validation attributes (`fu_required`, `fu_pattern`, `fu_minlength`, `fu_min`, `values`, …) are also **not** rendered on these cell inputs. If you need richer fields per row, use `repeater_single`.

| Attribute | Type | Description |
|---|---|---|
| `templates` ✱ | Array (only `[0]` used) of `{ fields }` | The single row template; `fields` define the table columns |
| `templates[0].fields[]` | Array&lt;{ `fu_type`, `fu_label`, `fu_name`, `width` }&gt; | One entry per column. `fu_type` = native HTML input type. `fu_label` = column header. `fu_name` = data key for that column. `width` is written as `flex-grow: ${width}` on the column header (number or numeric string) |

Per-row value: `Object` keyed by each column's `fu_name`. Empty-string cell values are dropped from the object; rows with no non-empty cells become `Null`.

Repeater value: `Array<Object | Null>`.

```json
{
	"fu_type": "repeater_table",
	"fu_name": "rows",
	"templates": [{
		"fields": [
			{ "fu_type": "text",   "fu_name": "key",   "fu_label": "Key",   "width": "1" },
			{ "fu_type": "number", "fu_name": "value", "fu_label": "Value", "width": "3" }
		]
	}]
}
```

---

## repeater_array

Single-column table for primitive string arrays. The internal field key is forced to `fu_row_array_field` — your output is a flat `Array<String>`.

| Attribute | Type | Description |
|---|---|---|
| `fu_name` ✱ | String | Data key |
| `heading` | String &#124; Null | Single column header |
| `fu_colspan` | String &#124; Null | |

No `templates` — the row template is hard-coded.

Value: `Array<String>`.

```json
{ "fu_type": "repeater_array", "fu_name": "keywords", "heading": "Keyword" }
```

---

## Quick comparison

| Variant | Row UI | Heterogeneous rows | Rich field types | Output |
|---|---|---|---|---|
| `repeater_single` | Expandable, full FieldsUX | No (one template) | Yes (any `fu_type`) | `Array<Object \| Null>` |
| `repeater_multiple` | Expandable, full FieldsUX | Yes (template per type) | Yes (any `fu_type`) | `Array<Object \| Null>` |
| `repeater_table` | Always collapsed (table row) | No | **No** — only native `<input>` types, no validation | `Array<Object \| Null>` |
| `repeater_array` | Single-column table | n/a | n/a — hard-coded text input | `Array<String>` |
