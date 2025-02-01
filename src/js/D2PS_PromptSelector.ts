/* global gradioApp */

import { Constants } from "./Constants";
import { D2PS_PromptSelectorUnit } from "./D2PS_PromptSelectorUnit";
import { D2PS_Search } from './D2PS_Search';
import { TConfig, TTags } from './types';

class D2PS_PromptSelector {
    tags: TTags;
    config: TConfig | undefined;
    psUnit: D2PS_PromptSelectorUnit;
    targetTextArea: HTMLTextAreaElement | undefined;

    /**
     * コンストラクタ
     */
    constructor() {
        this.psUnit = new D2PS_PromptSelectorUnit(this.onTagClick.bind(this));
        this.tags = {};
        this.targetTextArea = undefined;

        // documentにイベントリスナーを設定し、textareaへのフォーカスを監視
        document.addEventListener('focus', (e:any) => {
            // フォーカスされた要素がtextareaの場合
            if (e.target.tagName.toLowerCase() === 'textarea') {
                this.targetTextArea = e.target as HTMLTextAreaElement;
            }
        }, true); // キャプチャリングフェーズで実行
    }

    /**
     * 表示切り替えボタンなどを作成
     * 再読み込みボタンの動作も指定
     */
    createControl() {
        this.psUnit.createControl(() => {
            this.init();
        });
    }

    /**
     * 初期化
     */
    async init() {
        await this.getTags();
        this.psUnit.init(this.tags, this.config as TConfig);
    }

    /**
     * 表示状態切り替え
     */
    changeVisible() {
        this.psUnit.changeVisible();
    }

    /**
     * タグファイルをjsonで取得
     * @returns object タグリスト
     */
    async getTags() {
        const response = await fetch(`${Constants.API_GET_TAGS}?${new Date().getTime()}`);
        const tags = await response.json();

        // 設定を取り出す
        this.config = tags.__config__;
        delete tags['__config__'];
        this.tags = tags;

        // 検索用に設定
        D2PS_Search.setTags(tags);
    }

    /**
     * タグボタンクリック
     * @param tag 
     * @param toNegative 
     */
    // onTagClick(tag: string, toNegative: boolean = false) {
    onTagClick(tag: string) {
        if(!this.targetTextArea) return;

        const tag2 = `${tag} `;

        // カーソル位置を取得
        const startPos = this.targetTextArea.selectionStart;
        const endPos = this.targetTextArea.selectionEnd;
        
        // テキストを追加
        const currentValue = this.targetTextArea.value;
        const beforeText = currentValue.substring(0, startPos);
        const afterText = currentValue.substring(endPos);
        
        // テキストを結合
        this.targetTextArea.value = beforeText + tag2 + afterText;
        
        // カーソル位置を追加したテキストの後ろに移動
        const newPosition = startPos + tag2.length;
        this.targetTextArea.setSelectionRange(newPosition, newPosition);
        
        // フォーカスを維持
        this.targetTextArea.focus();

    }
    // onTagRightClick(tag: string, toNegative: boolean = false) {
    //     // this.$_addTag(tag, toNegative);
    //     // console.log("aaa right click", tag, toNegative);
    // }


}

export { D2PS_PromptSelector };
