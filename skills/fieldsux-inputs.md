---
name: fieldsux-inputs
description: FieldsUX input field types — text, number, textarea, checkbox, checkboxes, radios, select, color, hidden. Use when a template needs user-editable values, or when choosing between similar input types (e.g. select vs. radios vs. checkboxes — these should be consulted together, not in isolation). Read fieldsux-core.md first for common attributes.
---

# FieldsUX — Input fields

> Prerequisite: read `fieldsux-core.md` for common attributes (`fu_type`, `fu_name`, `fu_label`, `fu_description`, `fu_colspan`) and the `[name]` placeholder rules.

`hidden` is the only input type that does not dispatch `fu_field_input` on user edits via DOM tools — live `[name]` labels won't update from it in practice. All other input types update `[name]` placeholders live in `fu_row__labels`.

---

## text

Renders `<input type="text">` (or `email`/`url`/`tel` per `fu_validate_as`).

| Attribute | Type | Description |
|---|---|---|
| `fu_label` | String &#124; Null | Label |
| `fu_name` | String | Data key |
| `fu_before` | String &#124; Null | Text/HTML before input |
| `fu_after` | String &#124; Null | Text/HTML after input |
| `fu_placeholder` | String &#124; Null | Placeholder |
| `fu_description` | String &#124; Null | Helper text |
| `fu_validate_as` | `"text"` &#124; `"email"` &#124; `"url"` &#124; `"tel"` | Native HTML input type. Default `"text"` |
| `fu_minlength` | Number &#124; Null | Min characters |
| `fu_maxlength` | Number &#124; Null | Max characters |
| `fu_pattern` | String &#124; Null | Regex pattern (HTML `pattern` attribute) |
| `fu_required` | `"1"` &#124; Null | Required field |
| `fu_readonly` | `"1"` &#124; Null | Read-only field |
| `fu_autocomplete` | String &#124; Null | HTML `autocomplete` token (e.g. `"name"`, `"email"`) |
| `fu_list` | String &#124; Null | `<datalist>` id (datalist must be declared at root, without leading `#`) |
| `fu_colspan` | String &#124; Null | Column span |

Value: `String | Null` (the underlying `<input>.value`; `null` only if the input is missing for some reason — in practice always a String, possibly `""`)

```json
{ "fu_type": "text", "fu_name": "title", "fu_label": "Title", "fu_placeholder": "Enter title…" }
```

---

## number

Renders `<input type="number">`.

| Attribute | Type | Description |
|---|---|---|
| `fu_label`, `fu_name`, `fu_description`, `fu_colspan` | — | Common |
| `fu_before` | String &#124; Null | Text before input |
| `fu_after` | String &#124; Null | Text after input |
| `fu_placeholder` | String &#124; Null | Placeholder |
| `fu_min` | Number &#124; Null | Minimum value |
| `fu_max` | Number &#124; Null | Maximum value |
| `fu_step` | Number &#124; Null | Step |
| `fu_pattern` | String &#124; Null | Regex pattern |
| `fu_required` | `"1"` &#124; Null | Required |
| `fu_readonly` | `"1"` &#124; Null | Read-only |
| `fu_list` | String &#124; Null | `<datalist>` id |

Value: `String | Null` (numeric string from `<input type="number">.value`; `""` when empty)

```json
{ "fu_type": "number", "fu_name": "price", "fu_label": "Price", "fu_min": 0, "fu_step": 1, "fu_after": "EUR" }
```

---

## textarea

Renders `<textarea>`.

| Attribute | Type | Description |
|---|---|---|
| `fu_label`, `fu_name`, `fu_description`, `fu_colspan` | — | Common |
| `fu_placeholder` | String &#124; Null | |
| `fu_minlength` | Number &#124; Null | |
| `fu_maxlength` | Number &#124; Null | |
| `fu_required` | `"1"` &#124; Null | |
| `fu_readonly` | `"1"` &#124; Null | |

No `fu_before`, `fu_after`, `fu_pattern`, `fu_list`, `fu_autocomplete`.

Value: `String | Null`

```json
{ "fu_type": "textarea", "fu_name": "body", "fu_label": "Content", "fu_maxlength": 2000 }
```

---

## checkbox

Single checkbox. The `<label>` wraps the box; `fu_after` is rendered next to the box (typical "Yes" inline label).

| Attribute | Type | Description |
|---|---|---|
| `fu_label`, `fu_name`, `fu_description`, `fu_colspan` | — | Common |
| `fu_value` | String | Value emitted when checked. Default `"1"` |
| `fu_before` | String &#124; Null | Text/HTML before checkbox |
| `fu_after` | String &#124; Null | Text/HTML after checkbox (inline label) |
| `fu_required` | `"1"` &#124; Null | |
| `fu_readonly` | `"1"` &#124; Null | |

Value: `String` (the `fu_value`) when checked, `Null` when unchecked.

```json
{ "fu_type": "checkbox", "fu_name": "featured", "fu_label": "Featured?", "fu_after": "Yes" }
```

---

## checkboxes

Group of checkboxes. Multi-select.

| Attribute | Type | Description |
|---|---|---|
| `fu_label`, `fu_name`, `fu_description`, `fu_colspan` | — | Common |
| `values` ✱ | Array&lt;{ `fu_value`: String, `fu_label`: String }&gt; | Available choices |

No `fu_before`/`fu_after`/`fu_required`/`fu_readonly` for the group.

Value: `Array<String>` of selected `fu_value`s, `Null` if nothing selected.

```json
{
	"fu_type": "checkboxes",
	"fu_name": "tags",
	"fu_label": "Tags",
	"values": [
		{ "fu_value": "news", "fu_label": "News" },
		{ "fu_value": "blog", "fu_label": "Blog" }
	]
}
```

---

## radios

Group of radio buttons. Single-select.

| Attribute | Type | Description |
|---|---|---|
| `fu_label`, `fu_name`, `fu_description`, `fu_colspan` | — | Common |
| `values` ✱ | Array&lt;{ `fu_value`: String, `fu_label`: String }&gt; | Available choices |

Value: `String` (selected `fu_value`) or `Null`.

```json
{
	"fu_type": "radios",
	"fu_name": "size",
	"fu_label": "Size",
	"values": [
		{ "fu_value": "s", "fu_label": "Small" },
		{ "fu_value": "m", "fu_label": "Medium" },
		{ "fu_value": "l", "fu_label": "Large" }
	]
}
```

---

## select

Native `<select>` dropdown.

| Attribute | Type | Description |
|---|---|---|
| `fu_label`, `fu_name`, `fu_description`, `fu_colspan` | — | Common |
| `values` ✱ | Array&lt;{ `fu_value`: String, `fu_label`: String }&gt; | Options |
| `fu_before` | String &#124; Null | Text before select |
| `fu_after` | String &#124; Null | Text after select |

Value: `String` (selected `fu_value`).

```json
{
	"fu_type": "select",
	"fu_name": "status",
	"fu_label": "Status",
	"values": [
		{ "fu_value": "draft", "fu_label": "Draft" },
		{ "fu_value": "published", "fu_label": "Published" }
	]
}
```

---

## color

Combined `<input type="color">` + `<input type="text">` (hex). Both stay in sync.

| Attribute | Type | Description |
|---|---|---|
| `fu_label`, `fu_name`, `fu_description`, `fu_colspan` | — | Common |
| `fu_before` | String &#124; Null | Text before input |
| `fu_after` | String &#124; Null | Text after input |
| `fu_readonly` | `"1"` &#124; Null | Locks the hex input only (color picker stays interactive) |
| `fu_list` | String &#124; Null | `<datalist>` id (predefined hex palette) |

The hex `<input type="text">` has a hard-coded `pattern="^#[0-9A-Fa-f]{6}$"`; the color picker is updated from the hex only when the hex passes that pattern.

Value: `String | Null` (the hex input's value). Setting the value to `null`/`undefined` writes `"#000000"`. The renderer does not enforce the hex shape on read — invalid hex strings are returned as-is.

```json
{ "fu_type": "color", "fu_name": "primary_color", "fu_label": "Primary" }
```

---

## hidden

Hidden-style input. The wrapper gets the class `fu_field_hidden` and the label is hard-coded to `<s>Hidden</s>`. The bundled CSS controls whether it's visually shown (e.g. only in debug). Underlying input is `<input type="text">`, so the value can still be edited via DOM tools.

| Attribute | Type | Description |
|---|---|---|
| `fu_name` ✱ | String | Data key |

`hidden` reads **only** `fu_name`. Every other attribute on the template is silently ignored — including `fu_label` (overwritten by the hard-coded `<s>Hidden</s>`), `fu_description`, `fu_colspan`, `fu_required`, `fu_readonly`, `fu_placeholder`, etc. Don't bother setting them.

Value: `String | Null`.

```json
{ "fu_type": "hidden", "fu_name": "internal_id" }
```

---

## Choosing between similar input types

| If you need… | Pick |
|---|---|
| One choice, list always visible (≤ ~5 options) | `radios` |
| One choice, dropdown to save space | `select` |
| Many choices simultaneously | `checkboxes` |
| Single yes/no toggle | `checkbox` (singular) |
| Free text with optional autocomplete | `text` + `fu_list` (datalist) |
| Email/URL/phone — want native browser validation | `text` with `fu_validate_as` |
| Multiline text | `textarea` |
| Internal/system value not for user editing | `hidden` |
