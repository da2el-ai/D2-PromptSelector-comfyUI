# D2-PromptSelector-comfyUI

[English](i18n_en.md) | [日本語](i18n.md) | [繁體中文](i18n_zh.md)

Specification for the multilingual support files.

## Supported languages

D2 Prompt Selector supports the following languages out of the box.

| Language             | Code    |
| -------------------- | ------- |
| Japanese             | `ja`    |
| English              | `en`    |
| Simplified Chinese   | `zh`    |
| Traditional Chinese  | `zh-TW` |

The language selected in ComfyUI's Settings > Comfy > Locale is applied.

## Adding a language yourself

You can add a language by placing a JSON file with any language code in the `D2-PromptSelector-comfyUI/web/locales/` folder.

Example: Korean → `ko.json`

Copy an existing JSON file and translate it.

Any text that is not translated will be shown in English.

## Structure of a language file

A language file is a flat JSON of "key: translated text" pairs.

```json
{
    "common.save": "Save",
    "button.edit": "Edit",
    "search.placeholder": "Search...",
    "tag.delete.confirm.message": "Delete \"{name}\"?"
}
```

| Part                        | Description                                                  |
| --------------------------- | ----------------------------------------------------------- |
| Key (left, `"..."`)         | An identifier used internally by the app. **Do not change or translate it.** |
| Translated text (right)     | The text shown on screen. **Translate only this part.**     |

### Editing rules

- **Do not change the key (left side).** Edit only the translated text on the right.
- Save the file as **UTF-8**, and do not break the JSON syntax (commas `,`, quotes `"`, braces `{}`).
- Watch the commas at the end of lines (the last item must not have a trailing comma).
- You do not need to translate every key. Missing keys fall back to English, and then to the key string itself.

### Placeholders

Variables enclosed in braces `{ }` are replaced with actual values at display time. **Keep them as-is in the translated text** (you may move their position to fit the sentence).

| Variable          | Replaced with                       |
| ----------------- | ----------------------------------- |
| `{name}`          | The display name of the target      |
| `{fileId}`        | The file name                       |
| `{categoryCount}` | The number of categories in a file  |
| `{itemCount}`     | The number of prompts in a file     |

Example: `"Delete \"{name}\"?"` → at display time, `{name}` is replaced with the prompt name.

### HTML tags and line breaks

- Some values (`migration.message` / `file.delete.confirm.message` / `file.delete.confirm.typePrompt`) contain HTML tags such as `<br />` (line break), `<strong>` (emphasis), and `<code>` (monospace). **Keep the tags as-is** and translate only the text between them.
- `\n` represents a line break (e.g. `category.delete.confirm.message`). Keep it as-is.

### How changes take effect

After saving the file, **reload the browser** to apply the translation (no build required). The displayed language follows ComfyUI's Settings > Comfy > Locale.

---
