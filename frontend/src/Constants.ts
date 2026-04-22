export class Constants {
  static API_GET_TAGS = '/D2_prompt-selector/get_tags';
  // ComfyUI 標準ボタンクラス
  static CSS_CLASS_BUTTON_BASE =
    'inline-flex items-center justify-center cursor-pointer touch-manipulation appearance-none border-none text-sm font-inter transition-colors h-8 rounded-lg px-4 font-light';
  static CSS_CLSSS_BUTTON_PRIMARY = 'text-base-foreground bg-primary-background hover:bg-primary-background-hover';
  static CSS_CLSSS_BUTTON_SECONDARY = 'text-secondary-foreground bg-secondary-background hover:bg-secondary-background-hover';
  static CSS_CLSSS_BUTTON_DESTRUCTIVE = 'text-secondary-foreground bg-destructive-background hover:bg-destructive-background-hover';
    // アイコン
  static ICON_SEARCH = '🔍';
  // Settings
  static D2_PS_SETTING_LOCATION_ID = 'D2.PromptSelector.ShowButtonLocation';
  static D2_PS_SETTING_LOCATION_DEFAULT = 'left-bottom';
  static D2_PS_SETTING_X_MARGIN_ID = 'D2.PromptSelector.ShowButtonHorizontalMargin';
  static D2_PS_SETTING_X_MARGIN_DEFAULT = 50;
  static D2_PS_SETTING_Y_MARGIN_ID = 'D2.PromptSelector.ShowButtonVerticalMargin';
  static D2_PS_SETTING_Y_MARGIN_DEFAULT = 10;
  static D2_PS_SETTING_BACKUP_COUNT_ID = 'D2.PromptSelector.BackupCount';
  static D2_PS_SETTING_BACKUP_COUNT_DEFAULT = 10;
}
