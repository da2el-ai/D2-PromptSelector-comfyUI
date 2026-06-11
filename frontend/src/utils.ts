import { get } from 'svelte/store';
import type { AllTags, RawTagsResponse, RawTagValue, TagFile, TagCategory, TagItem } from './types';
import { backupCount } from './stores/settings';
import { Constants } from './Constants';

const BASE = '/D2_prompt-selector';

/** 画像ファイル名から配信 URL を組み立てる */
export function imageUrl(name: string): string {
  return Constants.IMAGE_BASE_URL + encodeURIComponent(name);
}

export type ImageUploadResult = { success?: boolean; image?: string; url?: string; error?: string };

/**
 * 画像アップロード（通常モード：既存項目へ即時登録）。
 * multipart のため backup_count はフォームフィールドとして手動付与する（JSON 専用の apiPostWithBackup は使えない）。
 */
export async function uploadImage(
  file: string,
  category: string,
  name: string,
  blob: Blob,
  filename: string,
): Promise<ImageUploadResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  form.append('name', name);
  form.append('backup_count', String(get(backupCount)));
  form.append('image', blob, filename);
  const res = await fetch(BASE + '/upload_image', { method: 'POST', body: form });
  return res.json() as Promise<ImageUploadResult>;
}

/** 画像アップロード（temp モード：新規追加用の一時保存）。YAML は触らずファイル名のみ返る */
export async function uploadImageTemp(blob: Blob, filename: string): Promise<ImageUploadResult> {
  const form = new FormData();
  form.append('temp', 'true');
  form.append('image', blob, filename);
  const res = await fetch(BASE + '/upload_image', { method: 'POST', body: form });
  return res.json() as Promise<ImageUploadResult>;
}

/** 画像削除（書き込み系。YAML をプレーン文字列に戻す） */
export async function deleteImage(file: string, category: string, name: string): Promise<{ success?: boolean; error?: string }> {
  return apiPostWithBackup('/delete_image', { file, category, name });
}

/** 不要なテンポラリ画像を削除（パネル起動時・編集完了時に呼ぶ） */
export async function cleanupTempImages(): Promise<void> {
  await apiPost('/cleanup_temp_images', {});
}

/**
 * ネスト値からワイルドカードプロンプトを生成（オリジナル $_getWildCardPrompt 相当）
 * - 配列: `{ item1, | item2, | ... }`
 * - 文字列値のみのオブジェクト: `{ v1, | v2, | ... }`
 * - ネストオブジェクトを含む場合: '' (ランダム不可)
 */
function getWildCardPrompt(value: string[] | Record<string, RawTagValue>): string {
  if (Array.isArray(value)) {
    const strs = value.filter((v): v is string => typeof v === 'string');
    return strs.length > 0 ? `{ ${strs.map((v) => `${v},`).join(' | ')} }` : '';
  }
  const vals = Object.values(value);
  if (vals.some((v) => typeof v === 'object' && v !== null)) return '';
  const strs = vals.filter((v): v is string => typeof v === 'string');
  return strs.length > 0 ? `{ ${strs.map((v) => `${v},`).join(' | ')} }` : '';
}

/** 再帰的に TagItem を生成（オリジナル $_createButtons 相当） */
function parseTagNode(name: string, value: RawTagValue): TagItem {
  if (value === null || value === undefined) {
    return { name, prompt: name };
  }
  if (typeof value === 'string') {
    return { name, prompt: value };
  }
  if (Array.isArray(value)) {
    const children: TagItem[] = value
      .filter((v): v is string => typeof v === 'string')
      .map((v) => ({ name: v, prompt: v }));
    return { name, prompt: getWildCardPrompt(value), children };
  }
  // leaf-meta：文字列の prompt キーを持つ dict はリーフ＋メタ情報（画像つき項目）
  // それ以外の dict は従来どおりグループノード（ワイルドカード）
  const obj = value as Record<string, RawTagValue>;
  if (typeof obj.prompt === 'string') {
    const image = typeof obj.image === 'string' ? obj.image : undefined;
    return { name, prompt: obj.prompt, image };
  }
  // ネストオブジェクト
  const children: TagItem[] = Object.entries(value).map(([k, v]) => parseTagNode(k, v));
  return { name, prompt: getWildCardPrompt(value as Record<string, RawTagValue>), children };
}

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
        for (const [name, value] of Object.entries(items)) {
          tagItems.push(parseTagNode(name, value));
        }
      }

      const category: TagCategory = { categoryId, items: tagItems };
      tagFile.categories.push(category);
    }

    result.push(tagFile);
  }

  return result;
}

/** TagItem のリーフノードのみを再帰的に収集（検索用） */
export function flattenLeaves(items: TagItem[]): TagItem[] {
  const result: TagItem[] = [];
  for (const item of items) {
    if (item.children) {
      result.push(...flattenLeaves(item.children));
    } else {
      result.push(item);
    }
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

/**
 * fetch ラッパー（POST JSON + backup_count 自動付与）
 * 書き込み系 API（add_item / edit_item / edit_category / delete_item）で使う。
 * ボディに settings.backupCount ストアの値を `backup_count` フィールドとして付与する。
 * reorder_* や migrate などバックアップ不要な API には使わない。
 */
export async function apiPostWithBackup<T = unknown>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  return apiPost<T>(endpoint, { ...body, backup_count: get(backupCount) });
}

/** fetch ラッパー（GET） */
export async function apiGet<T = unknown>(endpoint: string): Promise<T> {
  const res = await fetch(BASE + endpoint);
  return res.json() as Promise<T>;
}
