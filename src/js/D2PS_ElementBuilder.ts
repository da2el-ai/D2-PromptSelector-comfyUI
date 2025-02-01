// onClick: (elm: HTMLButtonElement, ev: MouseEvent) => void;

import { TElementParams } from "./types";
import { Constants } from "./Constants";

/*********************************************************
 * UI作成クラス
 */
class D2PS_ElementBuilder {

    /**
     * ボタン作成
     * @param {*} text ボタンに表示するテキスト
     * @param {*} param1 サイズ、色の指定
     */
    static baseButton(text: string, { size = '', color = '' }: TElementParams): HTMLButtonElement {
        const button = document.createElement('button');
        button.classList.add("p-button");
        if (size) button.classList.add(size);
        if (color) button.classList.add(color);

        button.textContent = text;
        return button;
    }

    /**
     * シンプルボタン
     */
    static simpleButton(text: string, { onClick = () => {} }: TElementParams): HTMLButtonElement {
        const button = D2PS_ElementBuilder.baseButton(text, {
            size: '',
            color: '',
        });
        button.classList.add(Constants.CSS_CLASS_BUTTON_BASE, 'd2ps-button--open');
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * 全体を覆うコンテナ
     */
    static psContainer(id: string = ''): HTMLElement {
        const container = document.createElement('div');
        container.id = id;
        container.classList.add(Constants.CSS_CLASS_TAG_CONTAINER);
        return container;
    }

    /**
     * ネガティブ送信チェックボックス
     */
    static negativeCheckbox(text: string, { onChange }: TElementParams): HTMLElement {
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.classList.add('d2ps-checkbox');
        checkbox.addEventListener('change', () => {
            onChange!(checkbox.checked);
        });

        const labelText = document.createElement('span');
        labelText.classList.add('d2ps-label__text');
        labelText.textContent = text;

        const label = document.createElement('label');
        label.classList.add('d2ps-label');
        label.appendChild(checkbox);
        label.appendChild(labelText);
        return label;
    }

    /**
     * タブコンテナ
     */
    static tabContainer(): HTMLElement {
        const container = document.createElement('div');
        container.classList.add(Constants.CSS_CLASS_TAB);
        return container;
    }

    /**
     * タブボタン
     */
    static tabButton(text: string, { onClick = () => {} }: TElementParams): HTMLButtonElement {
        const button = D2PS_ElementBuilder.baseButton(text, {});
        button.addEventListener('click', onClick);
        button.classList.add(Constants.CSS_CLASS_TAB_BUTTON);
        return button;
    }

    // /**
    //  * タグのカテゴリ（ファイル単位）を覆うコンテナ
    //  */
    // static categoryContainer(id: string = ''): HTMLElement {
    //     const container = document.createElement('div');
    //     container.id = id;
    //     container.classList.add('d2ps-category-container', 'tabitem', 'gradio-tabitem');
    //     return container;
    // }

    // /**
    //  * グループボタン（ランダムボタン）とタグフィールドを格納する枠
    //  */
    // static groupContainer(): HTMLElement {
    //     const container = document.createElement('div');
    //     container.classList.add('d2ps-group-container');
    //     return container;
    // }

    /**
     * タグボタン、グループを格納する枠
     */
    static tagField(): HTMLElement {
        const field = document.createElement('div');
        field.classList.add(Constants.CSS_CLASS_TAG_FIELD);
        return field;
    }

    /**
     * タグボタン
     */
    static tagButton(
        title: string,
        {
            onClick = () => {},
            onRightClick = () => {},
            onMouseEnter = () => {},
            onMouseLeave = () => {},
            color = '',
        }: TElementParams,
    ): HTMLButtonElement {
        const button = D2PS_ElementBuilder.baseButton(title, { color });
        button.classList.add(Constants.CSS_CLASS_BUTTON_BASE, Constants.CSS_CLASS_TAG_BUTTON);
        button.addEventListener('click', onClick);
        button.addEventListener('contextmenu', onRightClick);
        button.addEventListener('mouseenter', onMouseEnter);
        button.addEventListener('mouseleave', onMouseLeave);
        return button;
    }

    /**
     * ランダムボタン
     */
    static randomButton(
        title: string,
        { 
            onClick = () => {}, 
            onRightClick = () => {}, 
            onMouseEnter = () => {},
            onMouseLeave = () => {},
            color = 'primary'
        }: TElementParams,
    ): HTMLButtonElement {
        const button = D2PS_ElementBuilder.baseButton(title, { color });
        button.classList.add(Constants.CSS_CLASS_BUTTON_BASE, Constants.CSS_CLASS_RANDOM_BUTTON);
        button.addEventListener('click', onClick);
        button.addEventListener('contextmenu', onRightClick);
        button.addEventListener('mouseenter', onMouseEnter);
        button.addEventListener('mouseleave', onMouseLeave);
        return button;
    }

    /**
     * ツールチップ
     */
    static toolTipContainer() {
        const container = document.createElement('div');
        container.classList.add(Constants.CSS_CLASS_TOOLTIP_CONTAINER);
        return container;
    }

    /**
     * 検索入力エリア
     */
    // static searchContainer(input: HTMLInputElement, { onClick = () => {} }: TElementParams) {
    static searchContainer(input: HTMLInputElement) {
        const container = document.createElement('div');
        container.classList.add(Constants.CSS_CLASS_SEARCH);
        container.appendChild(input);

        // const button = D2PS_ElementBuilder.baseButton(`${Constants.ICON_SEARCH}検索`, {
        //     size: '',
        //     color: '',
        // });
        // button.classList.add(Constants.CSS_CLASS_BUTTON_BASE);
        // button.addEventListener('click', onClick);
        // container.appendChild(button);

        return container;
    }

    static searchInput(): HTMLInputElement {
        const input = document.createElement('input');
        input.classList.add(Constants.CSS_CLASS_SEARCH_INPUT);
        return input;
    }
}

export { D2PS_ElementBuilder };
