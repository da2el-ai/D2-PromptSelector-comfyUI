import { writable } from 'svelte/store';

// パネルの表示・非表示
export const isPanelVisible = writable<boolean>(false);

// 選択中のタブ（fileId）
export const activeTabId = writable<string>('');

// 編集モードかどうか
export const isEditMode = writable<boolean>(false);

// 最後にフォーカスされた textarea
export const targetTextArea = writable<HTMLTextAreaElement | null>(null);

// ツールチップに表示するプロンプト文字列
export const tooltip = writable<string>('');
