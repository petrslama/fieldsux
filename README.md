# FieldsUX

A web components library for building dynamic, composable form field systems from JSON templates.

Version: 0.0.1

## Overview

FieldsUX renders form UIs from JSON template definitions and JSON data. Each field type is a custom HTML element extending `HTMLElement`, registered under the `fu-` prefix (e.g. `<fu-text>`, `<fu-group>`, `<fu-repeater_single>`).

## Initialization

FieldsUX expects a container with class `.fieldsux` containing:

- `.fu_template` -- a `<textarea>` with the JSON template (field schema)
- `.fu_data` -- a `<textarea>` with the JSON data (field values)
- `.fu_opened` (optional) -- an `<input>` to persist open/closed state of tabs and rows
- `.fu_scroll` (optional) -- an `<input>` to restore scroll position

```html
<div class="fieldsux">
  <textarea class="fu_template">{ ... }</textarea>
  <textarea class="fu_data">{ ... }</textarea>
  <input class="fu_opened" value="">
  <input class="fu_scroll" value="0">
</div>
```

Calling `fu.init()` scans for `.fieldsux` containers, parses the JSON, and creates a `<fu-main>` element that renders the full field tree.

## Field types

### Inputs

| Type | Element | Description |
|------|---------|-------------|
| text | `<fu-text>` | Text input. Supports placeholder, pattern, minlength, maxlength, autocomplete, validation. |
| number | `<fu-number>` | Numeric input with min, max, step. |
| textarea | `<fu-textarea>` | Multi-line text input. |
| checkbox | `<fu-checkbox>` | Single boolean toggle. |
| checkboxes | `<fu-checkboxes>` | Multiple-choice checkboxes (value is an array). |
| radios | `<fu-radios>` | Radio button group (single selection). |
| select | `<fu-select>` | Dropdown select. |
| color | `<fu-color>` | Color picker with synced hex text input. |
| hidden | `<fu-hidden>` | Hidden field (label shown with strikethrough). |

All inputs support `fu_before` / `fu_after` HTML wrappers and responsive width via template properties.

### Groups

| Type | Element | Description |
|------|---------|-------------|
| main | `<fu-main>` | Root container. Manages actions (debug, JSON edit, copy, paste), dialogs, definitions, and datalists. |
| group | `<fu-group>` | Basic field container with optional label and grid layout. |
| tabs | `<fu-tabs>` | Tab navigation with panel switching. Includes an "Everything" debug tab. |
| radiotabs | `<fu-radiotabs>` | Radio-button-style tabs where selection is stored as a value. |

### Repeaters

| Type | Element | Description |
|------|---------|-------------|
| repeater_single | `<fu-repeater_single>` | Repeater with a single row template. |
| repeater_multiple | `<fu-repeater_multiple>` | Repeater with multiple row type templates and a type picker. |
| repeater_table | `<fu-repeater_table>` | Table-style repeater with inline row editing. |
| repeater_array | `<fu-repeater_array>` | Simplified repeater for arrays of single text values. |

Repeater features:
- Add, delete, duplicate, reorder rows
- Drag-and-drop reordering (SortableJS)
- Checkbox selection with bulk actions (delete, copy selected)
- Collapsible rows with dynamic header labels
- Copy/paste rows as JSON

### HTML / Display

| Type | Element | Description |
|------|---------|-------------|
| h1, h2, h3 | `<fu-h1>` etc. | Headings (content from `fu_label`). |
| p | `<fu-p>` | Paragraph. |
| img | `<fu-img>` | Image with `src` attribute. |
| a | `<fu-a>` | Link with `href` and `target`. |
| br | `<fu-br>` | Line break. |
| hr | `<fu-hr>` | Horizontal rule. |

### Dialogs

| Type | Element | Description |
|------|---------|-------------|
| dialog_json | `<fu-dialog_json>` | Edit a field's value as JSON. Compress/beautify buttons. |
| dialog_copy | `<fu-dialog_copy>` | Displays JSON for manual copy (clipboard fallback). |
| dialog_diff | `<fu-dialog_diff>` | Visual diff comparing original vs modified JSON. |

## Template format

A template is a JSON object describing the field tree:

```json
{
  "fu_name": "main",
  "fu_type": "main",
  "definitions": [],
  "datalists": [],
  "fields": [
    {
      "fu_name": "title",
      "fu_type": "text",
      "fu_label": "Title",
      "placeholder": "Enter title"
    },
    {
      "fu_name": "settings",
      "fu_type": "group",
      "fu_label": "Settings",
      "fields": [
        {
          "fu_name": "enabled",
          "fu_type": "checkbox",
          "fu_label": "Enabled"
        }
      ]
    },
    {
      "fu_name": "items",
      "fu_type": "repeater_single",
      "fu_label": "Items",
      "fields": [
        {
          "fu_name": "name",
          "fu_type": "text",
          "fu_label": "Name"
        }
      ]
    }
  ]
}
```

### Common template properties

- `fu_name` -- field name (maps to the data key)
- `fu_type` -- field type (determines which custom element is created)
- `fu_label` -- display label
- `fu_description` -- description text below the field
- `width` -- set to `"fullwidth"` for full-width fields
- `size_0` .. `size_6` -- responsive column sizes per breakpoint

## Utilities

### `fu.DOM`
Element creation and attribute management. `fu.DOM.create(attrs)` builds elements from object notation. `fu.DOM.attrs(element, attrs)` applies attributes, events, styles, and children.

### `fu.JSON`
JSON parsing with auto-repair, stable hashing, and formatted stringification. `fu.JSON.repair(text)` fixes common JSON errors (missing commas, trailing commas, whitespace issues).

### `fu.Templates`
Template registry for repeater row templates. Deduplicates templates by hash.

### `fu.Opened`
Persists open/closed state of tabs and rows across page loads.

## Build

The `dist/` directory contains the bundled output:

- `fieldsux.js` -- concatenated JavaScript (IIFE, strict mode)
- `fieldsux.css` -- minified CSS

The PHP files `dist/fieldsux.js.php` and `dist/fieldsux.css.php` serve as both the build scripts and HTTP endpoints. They read source files from `src/`, concatenate them in dependency order, write the result to `dist/`, and output to the browser.

## File structure

```
src/
  fu.js                    Entry point, global fu object
  fu.css                   CSS variables, base styles
  utils/
    DOM.js                 Element creation
    JSON.js                JSON utilities + repair
    Templates.js           Template registry
    Opened.js              Open state persistence
  fields/
    abstract.js            Base class for all fields
    undefined.js           Error display for missing types
    inputs/                Input field types + inputs.css
    groups/                Group/container types + groups.css
    repeaters/             Repeater types + row variants + CSS
    dialogs/               Dialog types + individual CSS
    html/                  HTML display fields + html.css
  misc/
    debug.css              Debug mode styles
    icon.css               Icon definitions
    wp.css                 WordPress integration
dist/
  fieldsux.js              Generated JS bundle
  fieldsux.js.php          JS bundler
  fieldsux.css             Generated CSS bundle
  fieldsux.css.php         CSS bundler + minifier
```
