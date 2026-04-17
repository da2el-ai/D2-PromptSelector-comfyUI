/**
 * cssのクラス名管理
 */

class Constants{
    static CSS_CLASS_BUTTON = 'inline-flex items-center justify-center cursor-pointer touch-manipulation appearance-none border-none text-sm font-inter transition-colors bg-primary-background text-base-foreground hover:bg-primary-background-hover h-8 rounded-lg px-4 font-light';
    // PromptSelect表示ボタン
    static CSS_CLASS_SHOW_BUTTON = 'd2ps-show-button';
    ///////////////////////////
    // 全体
    static CSS_CLASS_TOP_CONTAINER = "d2ps";
    // コントローラーコンテナ
    static CSS_CLASS_CONTROL_CONTAINER = "d2ps__controller";
    // タグコンテナ
    static CSS_CLASS_TAG_WRAPPER = "d2ps__tag-wrapper";
    static CSS_CLASS_TAG_CONTAINER = "d2ps__tag-container";
    // タグボタンコンテナ
    static CSS_CLASS_TAG_FIELD = 'd2ps-tag-field';
    static CSS_CLASS_TAG_FIELD_TOP = 'd2ps-tag-field--top';
    static CSS_CLASS_TAG_FIELD_RANDOM = 'd2ps-tag-field--with-random';
    ///////////////////////////
    static CSS_CLASS_BUTTON_BASE = Constants.CSS_CLASS_BUTTON;
    static CSS_CLASS_TAG_BUTTON = 'd2ps-button--tag';
    static CSS_CLASS_RANDOM_BUTTON = 'd2ps-button--random';
    ///////////////////////////
    // 検索
    static CSS_CLASS_SEARCH = 'd2ps-search';
    static CSS_CLASS_SEARCH_INPUT = 'd2ps-search__input';
    static ICON_SEARCH = '🔍';
    ///////////////////////////
    // タブ
    static CSS_CLASS_TAB = 'd2ps-tab';
    static CSS_CLASS_TAB_BUTTON = 'd2ps-tab__button';
    ///////////////////////////
    // ツールチップ
    static CSS_CLASS_TOOLTIP_CONTAINER = "d2ps-tooltip-container";


    static API_GET_TAGS = '/D2_prompt-selector/get_tags';
}

export {Constants}
