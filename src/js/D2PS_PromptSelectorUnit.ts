/* global gradioApp */

import { D2PS_ElementBuilder } from './D2PS_ElementBuilder';
import { D2PS_TabNavi } from './D2PS_TabNavi';
import { D2PS_Category } from './D2PS_Category';
import { D2PS_ToolTip } from './D2PS_ToolTip';
import { TConfig, TTags, TTagsDict, TTagButtonClick } from './types';
import { Constants } from './Constants';

declare var gradioApp: any;
declare var updateInput: any;

/*********************************************************
 * プロンプトセレクター本体
 * txt2img / img2img それぞれで作成する
 */
class D2PS_PromptSelectorUnit {

    // type: string;
    container: HTMLElement;
    tagWrapper: HTMLElement;
    visible: boolean;
    toNegative: boolean;
    tags: TTags;
    config: TConfig | undefined;
    categories: D2PS_Category[];
    tabNavi: D2PS_TabNavi | undefined;
    onClick: TTagButtonClick;
    onRightClick: TTagButtonClick;

    /**
     * コンストラクタ
     */
    constructor(onClick: TTagButtonClick, onRightClick: TTagButtonClick) {
    // constructor(onClick: TTagButtonClick) {
        // ここで初期化しないとエラーになるのでとりあえず作っておく
        this.container = document.createElement("div");
        this.tagWrapper = document.createElement("div");
        this.visible = false;
        this.toNegative = false;
        this.tags = {};
        this.categories = [];
        this.onClick = onClick;
        this.onRightClick = onRightClick;
    }

    /**
     * 閉じるボタンなど基本コントローラー作成
     */
    createControl(reloadClick: () => void) {
        // 全体
        this.container = document.createElement("div");
        this.container.classList.add(Constants.CSS_CLASS_TOP_CONTAINER);
        document.body.appendChild(this.container);

        // コントローラー枠
        const controllerArea = document.createElement('div');
        controllerArea.classList.add(Constants.CSS_CLASS_CONTROL_CONTAINER);
        this.container.appendChild(controllerArea);


        // タグ再読み込みボタン
        const reloadButton = D2PS_ElementBuilder.simpleButton("🔄", {
            onClick: async ()=> {
                await reloadClick();
            }
        });
        controllerArea.appendChild(reloadButton);

        // 閉じるボタン
        const closeButton = D2PS_ElementBuilder.simpleButton("✖", {
            onClick: () => {
                this.changeVisible();
            },
        });
        controllerArea.appendChild(closeButton);

        // タグコンテンツの入れ物
        this.tagWrapper = document.createElement("div");
        this.tagWrapper.classList.add(Constants.CSS_CLASS_TAG_WRAPPER);
        this.container.appendChild(this.tagWrapper);

        // プレビュー表示
        this.container.appendChild(D2PS_ToolTip.init());

        this.changeVisible(false);
    }

    /**
     * 初期化
     */
    init(tags: TTags, config: TConfig) {
        this.tags = tags;
        this.config = config;

        let tagContainer = document.querySelector(`.${Constants.CSS_CLASS_TAG_CONTAINER}`);

        // タグボタンを消して作り直す
        if (tagContainer) {
            tagContainer.remove();
            this.categories = [];
        }
        tagContainer = this.$_render();
        this.tagWrapper.appendChild(tagContainer);
    }

    /**
     * 表示状態切り替え
     */
    changeVisible(bool:boolean|undefined = undefined) {
        this.visible = bool !== undefined ? bool : !this.visible;
        this.container.style.display = this.visible ? 'grid' : 'none';
    }

    


    /**
     * タグエリア全体を作る
     */
    private $_render(): HTMLElement {
        // 全体を覆うコンテナ
        const tagContainer = D2PS_ElementBuilder.psContainer("");
        // タグカテゴリ作成
        this.$_renderCategory(tagContainer);
        // タブ切り替えボタン
        tagContainer.appendChild(this.$_renderTabNavi());

        this.$_changeCategory();

        return tagContainer;
    }

    /**
     * タブ切り替えを作る
     */
    private $_renderTabNavi(): HTMLElement {
        this.tabNavi = new D2PS_TabNavi(() => {
            this.$_changeCategory();
        });
        return this.tabNavi.createTabNavi(this.config as TConfig, this.tags);
    }

    /**
     * アクティブカテゴリーを切り替える
     */
    private $_changeCategory() {
        this.categories.forEach((category: D2PS_Category) => {
            if (this.tabNavi!.activeCategory === category.categoryId) {
                category.container.style.display = 'flex';
            } else {
                category.container.style.display = 'none';
            }
        });
    }

    /**
     * タグカテゴリを作る
     */
    private $_renderCategory(parentContainer: HTMLElement) {
        Object.keys(this.tags).forEach((categoryId: string) => {
            const category = new D2PS_Category(
                categoryId, this.onClick, this.onRightClick
            );
            const categoryContainer = category.createCategory((this.tags as TTagsDict)[categoryId]);
            parentContainer.appendChild(categoryContainer);
            this.categories.push(category);
        });

        // 検索を作る
        const searchCategory = new D2PS_Category(
            '🔍', this.onClick, this.onRightClick
        );
        const categoryContainer = searchCategory.createSearch();
        parentContainer.appendChild(categoryContainer);
        this.categories.push(searchCategory);
    }

}

export { D2PS_PromptSelectorUnit };
