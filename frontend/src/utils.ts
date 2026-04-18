import type { AllTags, RawTagsResponse, TagFile, TagCategory, TagItem } from './types';

const BASE = '/D2_prompt-selector';

/** バックエンドの生レスポンスを AllTags 形式に変換する */
export function parseTagsResponse(raw: RawTagsResponse): AllTags {
  const configKey = '__config__';
  const result: AllTags = [];

  for (const [fileId, categories] of Object.entries(raw)) {
    if (fileId === configKey) continue;

    const tagFile: TagFile = { fileId, categories: [] };

    for (const [categoryId, items] of Object.entries(categories)) {
      if (categoryId === configKey || items == null) continue;

      const tagItems: TagItem[] = [];

      if (Array.isArray(items)) {
        for (const item of items) {
          if (typeof item === 'string') {
            tagItems.push({ name: item, prompt: item });
          }
        }
      } else {
        for (const [name, prompt] of Object.entries(items)) {
          tagItems.push({ name, prompt: String(prompt) });
        }
      }

      const category: TagCategory = { categoryId, items: tagItems };
      tagFile.categories.push(category);
    }

    result.push(tagFile);
  }

  return result;
}

/** カーソル位置にテキストを挿入する（ComfyUI Vue 対応） */
export function insertTextToTarget(textarea: HTMLTextAreaElement, text: string): void {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set;

  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  const newValue = before + text + after;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(textarea, newValue);
  } else {
    textarea.value = newValue;
  }

  textarea.dispatchEvent(new Event('input', { bubbles: true }));

  const newCursor = start + text.length;
  textarea.setSelectionRange(newCursor, newCursor);
  textarea.focus();
}

/** CSS ファイルを動的にロードする */
export function loadCssFile(href: string): void {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = href;
  document.head.appendChild(link);
}

/** fetch ラッパー（POST JSON） */
export async function apiPost<T = unknown>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

/** fetch ラッパー（GET） */
export async function apiGet<T = unknown>(endpoint: string): Promise<T> {
  const res = await fetch(BASE + endpoint);
  return res.json() as Promise<T>;
}
