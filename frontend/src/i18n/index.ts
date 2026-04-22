import { writable, derived, type Readable } from 'svelte/store';

export type Locale = string;

const FALLBACK_LOCALE: Locale = 'en';
const BASE_URL = '/D2_prompt-selector/assets/locales';

type Dict = Record<string, string>;
type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

// 読み込んだ辞書は module-scoped のマップに保持する。
// locale が切り替わっても以前読んだ辞書は残す（主に en フォールバック用）。
const dicts: Record<string, Dict> = {};

// 初期値は空文字とし、initLocale() が必ずストア更新を発火させる。
// 初期値を FALLBACK_LOCALE('en') にすると、Comfy.Locale が英語だった場合に
// locale.set('en') が同値となりストア通知されず、辞書読み込み前にマウントされた
// コンポーネントがキー文字列のままになる。
export const locale = writable<Locale>('');

/** $t(key, vars?) の形で使うリアクティブな翻訳関数 */
export const t: Readable<TranslateFn> = derived(locale, ($locale) => {
    return (key: string, vars?: Record<string, string | number>) => {
        const primary = dicts[$locale];
        const fallback = dicts[FALLBACK_LOCALE];
        let s = primary?.[key] ?? fallback?.[key] ?? key;
        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                s = s.replaceAll(`{${k}}`, String(v));
            }
        }
        return s;
    };
});

/**
 * ComfyUI のロケール表記をプロジェクト内で扱うコードに正規化する。
 * - `zh-TW` / `zh-HK` → `zh-TW`（繁体）
 * - `zh-CN` / その他 `zh-*` → `zh`（簡体）
 * - `ja-JP` / `en-US` など地域サブタグ付き → 先頭のみ（`ja` / `en`）
 */
function normalizeLocale(raw: string): Locale {
    if (!raw) return FALLBACK_LOCALE;
    const lower = raw.toLowerCase();
    if (lower === 'zh-tw' || lower === 'zh-hk') return 'zh-TW';
    if (lower.startsWith('zh')) return 'zh';
    const primary = lower.split('-')[0];
    return primary || FALLBACK_LOCALE;
}

/** 指定コードの辞書を fetch。失敗したら null */
async function loadDict(lang: Locale): Promise<Dict | null> {
    try {
        const res = await fetch(`${BASE_URL}/${lang}.json`);
        if (!res.ok) return null;
        return (await res.json()) as Dict;
    } catch {
        return null;
    }
}

/**
 * ComfyUI の設定から言語を解決し、対応する辞書を読み込む。
 * ShowButton.setup() から起動時に一度だけ呼ぶ想定。
 *
 * 解決順：
 *   1. app.extensionManager.setting.get('Comfy.Locale')
 *   2. navigator.language
 *   3. `en`
 *
 * フォールバック：
 *   - 解決したコードの JSON が無ければ `en.json` を使う
 *   - 辞書にキーが無ければ英語辞書のキーを、それも無ければキー自体を返す
 */
export async function initLocale(app: unknown): Promise<void> {
    const comfyLocale = (() => {
        try {
            const v = (app as any)?.extensionManager?.setting?.get?.('Comfy.Locale');
            return typeof v === 'string' ? v : '';
        } catch {
            return '';
        }
    })();
    const raw = comfyLocale || navigator.language || '';
    const resolved = normalizeLocale(raw);

    let dict = await loadDict(resolved);
    let active: Locale = resolved;

    if (!dict && resolved !== FALLBACK_LOCALE) {
        dict = await loadDict(FALLBACK_LOCALE);
        active = FALLBACK_LOCALE;
    }

    if (dict) dicts[active] = dict;

    // 現在ロケールが英語以外のときは、キー単位のフォールバック用に英語辞書も確保しておく
    if (active !== FALLBACK_LOCALE && !dicts[FALLBACK_LOCALE]) {
        const fb = await loadDict(FALLBACK_LOCALE);
        if (fb) dicts[FALLBACK_LOCALE] = fb;
    }

    locale.set(active);
}
