import { writable } from 'svelte/store';

// パネルの表示・非表示
export const isPanelVisible = writable<boolean>(false);

// 選択中のタブ（fileId）
export const activeTabId = writable<string>('');

// 編集モードかどうか
export const isEditMode = writable<boolean>(false);

// 最後にフォーカスされた textarea
export const targetTextArea = writable<HTMLTextAreaElement | null>(null);

// サンプルビューに表示する項目（ホバー or 固定で更新）
export type SampleItem = {
  fileId: string;
  categoryId: string;
  name: string;
  prompt: string;
  image?: string;
};
export const sampleItem = writable<SampleItem | null>(null);

// サンプルビューを固定中か（固定中はホバーで更新しない）
export const isSampleLocked = writable<boolean>(false);

// サンプルビューを表示するか（コントローラーの Sample ボタンでトグル）
export const isSampleVisible = writable<boolean>(true);
