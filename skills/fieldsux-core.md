---
name: fieldsux-core
description: Read first when working with any FieldsUX template (`fu_type` JSON). Defines common attributes, the `[name]` placeholder mechanism, the root template structure (`fields` / `definitions` / `datalists`), and a "need → field type" cheat sheet. Routes to fieldsux-inputs / fieldsux-structure / fieldsux-repeaters / fieldsux-static for type-specific details.
---

# FieldsUX — Core Reference (router)

This is the entry point for everything FieldsUX. Read it first, then load the type-specific skill based on what you're building.

## Sources of truth

- `wp-content/plugins/fieldsux/fieldsux/src/fields/**/*.js` (renderer)
- `wp-content/plugins/fieldsux_editor/quine.json` (the editor that edits itself — the canonical attribute names and UI labels)

## Notation used in all skill files

- `String` / `Number` / `Object` / `Array<T>` — JSON types
- `Null` — attribute may be omitted
- `"1"` — string literal (FieldsUX checkboxes serialize to the string `"1"`, not boolean `true`)
- ✱ — required attribute

---

## Loading the right skill

| If the task involves… | Read |
|---|---|
| `text`, `number`, `textarea`, `checkbox`, `checkboxes`, `radios`, `select`, `color`, `hidden` | `fieldsux-inputs.md` |
| `group`, `tabs`, `radiotabs`, `from_definition`, `function` (layout / nesting / expansion) | `fieldsux-structure.md` |
| `repeater_single`, `repeater_multiple`, `repeater_table`, `repeater_array` | `fieldsux-repeaters.md` |
| `h1`–`h3`, `p`, `a`, `img`, `hr`, `br` (decorative HTML only) | `fieldsux-static.md` |

**Load all relevant skill files for the task before writing any template** — don't start with one and fetch others later. Most real templates touch multiple domains (e.g. an input nested inside a `repeater_single` inside a `tabs` panel), and you can't make sound choices about one part without knowing the constraints of the others.

When choosing between similar input types (e.g. `select` vs. `radios` vs. `checkboxes`), load `fieldsux-inputs.md` once — they belong together. When the design uses repeaters, load `fieldsux-repeaters.md` because the variants (`single` vs. `table` vs. `multiple`) have non-trivial trade-offs and shared limitations worth comparing side by side.

---

## Common attributes

These appear repeatedly across field types, but **not every type accepts every one**. Each type's section in the per-skill files lists the attributes it actually consumes — when in doubt, treat the per-type table as the source of truth.

| Attribute | Type | Description |
|---|---|---|
| `fu_type` ✱ | String | Field type id. Unknown types render as `fu-undefined` (visible error stub) |
| `fu_name` | String | Data key under which the field's value is stored. The editor enforces `^[a-z0-9_]*$`; the runtime renderer accepts any string |
| `fu_label` | String &#124; Null | Renders differently per field family — see per-type sections. Accepts HTML. Empty string is treated as omitted |
| `fu_description` | String &#124; Null | Helper text under the field. Accepts HTML. **Only** on input-style fields: `text`, `number`, `textarea`, `checkbox`, `checkboxes`, `radios`, `select`, `color`. `hidden`, `group`, `tabs`, `radiotabs`, repeaters, and static HTML elements ignore it |
| `fu_colspan` | `"1"`…`"8"` &#124; `"full"` &#124; Null | Grid column span. The renderer copies the value verbatim onto a `fu_colspan` HTML attribute; only `"1"`…`"8"` and `"full"` are styled by the bundled CSS. **Not read by `hidden`** — its rendered wrapper has no `fu_colspan` attribute. All other field types accept it |

---

## The `[other_field_name]` placeholder mechanism

The `[name]` placeholder syntax has two distinct stages — be careful not to conflate them:

1. **DOM transformation (happens everywhere).** Every `[name]` token in any `'html'` value is rewritten into `<span data-from="name">[name]</span>`. This applies to **all** rendered HTML — `fu_label`, `fu_description`, `fu_row__labels`, headings, paragraphs, anywhere `'html'` is set.
2. **Live update (happens only in `fu_row__labels[].fu_label`).** Only repeater rows walk those `[data-from]` spans, find the sibling field by `fu_name`, listen for value-change events, and rewrite the span with the field's `repeater_label`. Nowhere else is this listener attached.

**Practical effect:** if you put `[title]` in a regular `fu_label` or `fu_description`, the user sees the literal text `[title]` (wrapped in a static `<span data-from="title">`) — it does **not** update as the `title` field is typed. Live binding only works for the per-row collapsed labels in repeaters.

For a `[name]` placeholder to update live (i.e. inside `fu_row__labels`), the referenced sibling field must (a) expose a `repeater_label` getter and (b) dispatch the `fu_field_input` custom event when its value changes. Both conditions are met by the eight input-style types: `text`, `number`, `textarea`, `checkbox`, `checkboxes`, `radios`, `select`, `color`. `hidden` inherits the getter but its rendered input has no change listener, so the label stays stale; `group`, `tabs`, `radiotabs`, repeaters, and static HTML elements have no `repeater_label` at all and produce an empty label.

---

## TOP-LEVEL TEMPLATE (the root object passed to `<fu-main>`)

The outermost object is **not** a `fu_type` field — it's a container with three optional sections.

| Attribute | Type | Description |
|---|---|---|
| `fu_name` | String &#124; Null | Optional name for the root |
| `fields` ✱ | Array&lt;field templates&gt; | The form contents |
| `definitions` | Array&lt;{ `fu_name`: String, `fields`: Array }&gt; | Reusable field groups, referenced via `from_definition` |
| `datalists` | Array&lt;{ `id`: String, `values`: Array&lt;{ `fu_value`, `fu_label` }&gt; }&gt; | `<datalist>` elements for `fu_list` references |

```json
{
	"fields": [
		{ "fu_type": "text", "fu_name": "title", "fu_label": "Title" },
		{ "fu_type": "from_definition", "definition": "address_block" }
	],
	"definitions": [
		{ "fu_name": "address_block", "fields": [
			{ "fu_type": "text", "fu_name": "street", "fu_label": "Street" },
			{ "fu_type": "text", "fu_name": "city", "fu_label": "City" }
		] }
	],
	"datalists": [
		{ "id": "country_codes", "values": [
			{ "fu_value": "CZ", "fu_label": "Czechia" },
			{ "fu_value": "SK", "fu_label": "Slovakia" }
		] }
	]
}
```

---

## Cheat sheet — picking the right field

| Need | Use | Skill file |
|---|---|---|
| One-line text | `text` | `fieldsux-inputs.md` |
| Long text | `textarea` | `fieldsux-inputs.md` |
| Numeric | `number` | `fieldsux-inputs.md` |
| One choice from a list | `select` (dropdown) or `radios` (visible) | `fieldsux-inputs.md` |
| Multiple choices | `checkboxes` | `fieldsux-inputs.md` |
| Yes/no | `checkbox` | `fieldsux-inputs.md` |
| Color picker | `color` | `fieldsux-inputs.md` |
| Internal value not shown | `hidden` | `fieldsux-inputs.md` |
| Sub-object | `group` | `fieldsux-structure.md` |
| Side-by-side panels | `tabs` | `fieldsux-structure.md` |
| Variant chooser with different fields per variant | `radiotabs` | `fieldsux-structure.md` |
| List of identical items | `repeater_single` or `repeater_table` | `fieldsux-repeaters.md` |
| List of mixed types | `repeater_multiple` | `fieldsux-repeaters.md` |
| List of plain strings | `repeater_array` | `fieldsux-repeaters.md` |
| Reusable field block | `from_definition` + root `definitions` | `fieldsux-structure.md` |
| Dynamic field list at runtime | `function` | `fieldsux-structure.md` |
| Static heading / paragraph / image / link / hr / spacer | `h1`–`h3`, `p`, `img`, `a`, `hr`, `br` | `fieldsux-static.md` |
