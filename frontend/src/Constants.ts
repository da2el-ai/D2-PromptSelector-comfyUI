export class Constants {
  static API_GET_TAGS = '/D2_prompt-selector/get_tags';
  // ComfyUI 標準ボタンクラス
  static CSS_CLASS_BUTTON_BASE =
    'inline-flex items-center justify-center cursor-pointer touch-manipulation appearance-none border-none text-sm font-inter transition-colors h-8 rounded-lg px-4 font-light';
  static CSS_CLSSS_BUTTON_PRIMARY = 'text-base-foreground bg-primary-background hover:bg-primary-background-hover';
  static CSS_CLSSS_BUTTON_SECONDARY = 'text-secondary-foreground bg-secondary-background hover:bg-secondary-background-hover';
// inline-flex items-center justify-center gap-2 cursor-pointer touch-manipulation whitespace-nowrap appearance-none border-none font-medium font-inter transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([width]):not([height])]:size-4 [&_svg]:shrink-0  h-8 rounded-lg p-2 text-xs relative px-3
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
