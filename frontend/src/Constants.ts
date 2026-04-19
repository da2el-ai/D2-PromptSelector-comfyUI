export class Constants {
  static API_GET_TAGS = '/D2_prompt-selector/get_tags';
  // ComfyUI 標準ボタンクラス
  static CSS_CLASS_BUTTON =
    'inline-flex items-center justify-center cursor-pointer touch-manipulation appearance-none border-none text-sm font-inter transition-colors bg-primary-background text-base-foreground hover:bg-primary-background-hover h-8 rounded-lg px-4 font-light';
  // PromptSelector 表示ボタン
  static CSS_CLASS_SHOW_BUTTON = 'd2ps-show-button';
  // パネル全体
  static CSS_CLASS_TOP_CONTAINER = 'd2ps';
  // コントローラー
  static CSS_CLASS_CONTROL_CONTAINER = 'd2ps__controller';
  static CSS_CLASS_BUTTON_OPEN = 'd2ps-button--open';
  // タグラッパー
  static CSS_CLASS_TAG_WRAPPER = 'd2ps__tag-wrapper';
  static CSS_CLASS_TAG_CONTAINER = 'd2ps__tag-container';
  // タグフィールド
  static CSS_CLASS_TAG_FIELD = 'd2ps-tag-field';
  static CSS_CLASS_TAG_FIELD_TOP = 'd2ps-tag-field--top';
  static CSS_CLASS_TAG_FIELD_RANDOM = 'd2ps-tag-field--with-random';
  // タグボタン
  static CSS_CLASS_TAG_BUTTON = 'd2ps-button--tag';
  static CSS_CLASS_RANDOM_BUTTON = 'd2ps-button--random';
  // タブ（p-button が基底クラス）
  static CSS_CLASS_TAB = 'd2ps-tab';
  static CSS_CLASS_TAB_BUTTON = 'd2ps-tab__button';
  // 検索
  static CSS_CLASS_SEARCH = 'd2ps-search';
  static CSS_CLASS_SEARCH_INPUT = 'd2ps-search__input';
  // ツールチップ
  static CSS_CLASS_TOOLTIP_CONTAINER = 'd2ps-tooltip-container';
  // アイコン
  static ICON_SEARCH = '🔍';
  // Settings
  static D2_PS_SETTING_LOCATION_ID = 'D2.PromptSelector.ShowButtonLocation';
  static D2_PS_SETTING_LOCATION_DEFAULT = 'left-bottom';
  static D2_PS_SETTING_X_MARGIN_ID = 'D2.PromptSelector.ShowButtonHorizontalMargin';
  static D2_PS_SETTING_X_MARGIN_DEFAULT = 50;
  static D2_PS_SETTING_Y_MARGIN_ID = 'D2.PromptSelector.ShowButtonVerticalMargin';
  static D2_PS_SETTING_Y_MARGIN_DEFAULT = 10;
}
