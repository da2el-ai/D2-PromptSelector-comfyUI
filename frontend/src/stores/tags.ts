import { writable, derived } from 'svelte/store';
import type { AllTags, TagFile } from '../types';
import { apiGet, parseTagsResponse } from '../utils';
import type { RawTagsResponse } from '../types';

// 全タグデータ
export const allTags = writable<AllTags>([]);

// タブの表示順（__config__.yml の sort に従う）
export const tabOrder = writable<string[]>([]);

// 表示用：tabOrder に従いソートされた TagFile[]
export const sortedTagFiles = derived([allTags, tabOrder], ([$allTags, $tabOrder]) => {
  if ($tabOrder.length === 0) return $allTags;
  return [...$allTags].sort((a, b) => {
    const ia = $tabOrder.indexOf(a.fileId);
    const ib = $tabOrder.indexOf(b.fileId);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
});

/** バックエンドからタグを取得してストアを更新する */
export async function fetchTags(): Promise<void> {
  const raw = await apiGet<RawTagsResponse>('/get_tags');

  // __config__ から sort を取得
  const config = raw['__config__'] as { sort?: string[] } | undefined;
  if (config?.sort) {
    tabOrder.set(config.sort);
  }

  allTags.set(parseTagsResponse(raw));
}
