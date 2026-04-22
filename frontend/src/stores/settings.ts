import { writable } from 'svelte/store';
import { Constants } from '../Constants';

// ComfyUI 設定「Backup Count」と同期するストア。
// ShowButton.svelte の setup() 内で onChange ハンドラから更新する。
// 書き込み系 API 呼び出し時に backup_count としてボディに含める。
export const backupCount = writable<number>(Constants.D2_PS_SETTING_BACKUP_COUNT_DEFAULT);
