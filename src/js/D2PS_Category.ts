import { D2PS_ElementBuilder } from './D2PS_ElementBuilder';
import { D2PS_ToolTip } from './D2PS_ToolTip';
import { D2PS_Search } from './D2PS_Search';
import { TTags, TTagButtonClick, TElementParams } from "./types";
import { Constants } from './Constants';

///////////////////
class D2PS_Category {
    onClick: TTagButtonClick;
    // onRightClick: TTagButtonClick;
    categoryId: string = '';
    container: HTMLElement;

    // constructor(categoryId: string, onClick: TTagButtonClick, onRightClick: TTagButtonClick) {
    constructor(categoryId: string, onClick: TTagButtonClick) {
        this.categoryId = categoryId;
        this.onClick = onClick;
        // this.onRightClick = onRightClick;
        this.container = D2PS_ElementBuilder.tagField();
        this.container.classList.add(Constants.CSS_CLASS_TAG_FIELD_TOP);
        this.container.style.display = 'none';
    }

    /**
     * 検索を作る
     */
    createSearch(): HTMLElement {
        this.container.classList.add(Constants.CSS_CLASS_TAG_FIELD_RANDOM);

        // 検索入力
        const search = new D2PS_Search();
        const searchContainer = search.createSearchContainer((filtered: TTags) => {
            // 過去の検索結果を削除
            const children = this.container.children;
            if (children.length >= 2) {
                children[1].remove();
            }
            const buttonField = D2PS_ElementBuilder.tagField();
            this.container.appendChild(buttonField);

            // 検索結果のボタンを作る
            this.$_createButtons(filtered, '').forEach((button) => {
                buttonField.appendChild(button);
            });
        });
        this.container.appendChild(searchContainer);

        return this.container;
    }

    /**
     * カテゴリーを作る
     */
    createCategory(tags: TTags): HTMLElement {
        this.$_createButtons(tags, this.categoryId).forEach((button) => {
            this.container.appendChild(button);
        });
        return this.container;
    }

    /**
     * ボタンかフィールドを配列で受け取る
     * @param tags
     * @param prefix 階層テキスト
     * @returns
     */
    private $_createButtons(tags: TTags, prefix = ''): HTMLElement[] {
        // 配列ならボタンテキスト無しのタグが並んでいるだけ
        if (Array.isArray(tags)) {
            return tags.map((tag) => {
                return this.$_createTagButton('tag', tag, `${tag},`, 'secondary');
            });
        }

        // 以下は連想配列の処理
        return Object.keys(tags).map((key) => {
            const values = tags[key];
            const randomKey = `${prefix}:${key}`;

            // 内容が文字列ならタグ
            if (typeof values === 'string') {
                return this.$_createTagButton('tag', key, `${values},`, '');
            }

            // 以下は内容が配列 or 連想配列だった時
            // ランダムボタンを作成してフィールドに格納
            const field = D2PS_ElementBuilder.tagField();
            field.classList.add(Constants.CSS_CLASS_TAG_FIELD_RANDOM);

            const randomPrompt = this.$_getWildCardPrompt(values);
            if(randomPrompt){
                field.appendChild(this.$_createTagButton('random', key, randomPrompt, ''));
            }else{
                field.appendChild(this.$_createTagButton('random', key, randomPrompt, 'd2ps-button--none'));
            }

            // ボタンだけのフィールドを作成
            const buttonField = D2PS_ElementBuilder.tagField();
            field.appendChild(buttonField);

            // 下層またはボタンを作成
            this.$_createButtons(values, randomKey).forEach((button: HTMLElement) => {
                buttonField.appendChild(button);
            });

            return field;
        });
    }

    /**
     * 配列、連想配列から文字列を連結してワイルドカードプロンプトを生成
     */
    private $_getWildCardPrompt (value: string[] | Record<string, unknown>): string {
        // 配列の場合
        if (Array.isArray(value)) {
            return `{ ${value.map((str)=>`${str},`).join(' | ')} }`;
        }

        // 連想配列の場合
        const values = Object.values(value);
        
        // 下層にオブジェクトが含まれている場合は何も返さない
        if (values.some(v => typeof v === 'object' && v !== null)) {
            return '';
        }

        // 文字列のみを抽出
        const validValues = values
            .filter(v => typeof v === 'string')
            .map(v => `${v},` as string);

        return validValues.length > 0 ? `{ ${validValues.join(' | ')} }` : '';
    }

    /**
     * タグボタンを作成
     * @param title ボタンに表示するテキスト
     * @param value プロンプトタグ
     * @param color ボタン色
     * @returns ボタン
     */
    private $_createTagButton(
        type: 'tag' | 'random',
        title: string,
        value: string,
        color = 'primary',
        tooltip?: string,
    ): HTMLButtonElement {
        const param: TElementParams = {
            onClick: (e: MouseEvent) => {
                e.preventDefault();
                this.onClick(value, e.metaKey || e.ctrlKey);
            },
            // onRightClick: (e: MouseEvent) => {
            //     e.preventDefault();
            //     this.onRightClick(value, e.metaKey || e.ctrlKey);
            // },
            onMouseEnter: () => {
                D2PS_ToolTip.showTip(tooltip || value);
            },
            onMouseLeave: () => {
                D2PS_ToolTip.hideTip();
            },
            color,
        };

        if (type === 'random') {
            return D2PS_ElementBuilder.randomButton(title, param);
        } else {
            return D2PS_ElementBuilder.tagButton(title, param);
        }
    }
}

export { D2PS_Category };
