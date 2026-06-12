declare var app: any;

import { loadCssFile, cleanupTempImages } from './utils';
import { targetTextArea, isPanelVisible, isEditMode, isSampleLocked, sampleItem } from './stores/ui';
import { fetchTags } from './stores/tags';
import PromptSelector from './lib/PromptSelector.svelte';
import ShowButton from './lib/ShowButton.svelte';

const D2_PS_CSS_FILEPATH = '/D2_prompt-selector/assets/style.css';
loadCssFile(D2_PS_CSS_FILEPATH);

// 最後にフォーカスされた textarea を追跡
document.addEventListener(
  'focus',
  (e) => {
    if (e.target instanceof HTMLTextAreaElement) {
      targetTextArea.set(e.target);
    }
  },
  true
);

// パネル開閉時は常に通常モードに戻す（× 閉じる、ShowButton トグルなど全経路をカバー）
// サンプルビューの固定・表示内容もリセットする
// パネルを開いたタイミングで不要なテンポラリ画像を掃除する
isPanelVisible.subscribe((visible) => {
  isEditMode.set(false);
  isSampleLocked.set(false);
  sampleItem.set(null);
  if (visible) void cleanupTempImages();
});

// PromptSelector をマウント
const selectorContainer = document.createElement('div');
document.body.appendChild(selectorContainer);
new PromptSelector({ target: selectorContainer });

// ShowButton をマウント
const showButtonContainer = document.createElement('div');
document.body.appendChild(showButtonContainer);
const showButtonInstance = new ShowButton({
  target: showButtonContainer,
  props: {
    app,
    onToggle: () => {
      isPanelVisible.update((v) => !v);
      fetchTags();
    },
  },
});

// ComfyUI Settings 登録
(showButtonInstance as any).setup?.();
