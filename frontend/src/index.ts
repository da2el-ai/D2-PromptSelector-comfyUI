declare var app: any;

import { loadCssFile } from './utils';
import { targetTextArea } from './stores/ui';

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

// TODO: Phase4 で PromptSelector コンポーネントのマウント処理を実装
console.log('[D2 PromptSelector] loaded (Svelte build)');
