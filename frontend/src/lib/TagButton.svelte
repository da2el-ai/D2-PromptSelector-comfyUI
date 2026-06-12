<script lang="ts">
    import { Constants } from '../Constants';
    import { isEditMode, isSampleVisible } from '../stores/ui';
    import { t } from '../i18n';

    export let name: string;
    export let prompt: string;
    export let onClickTag: (prompt: string, closePanel: boolean) => void;
    export let onDeleteItem: ((name: string) => void) | undefined = undefined;
    // ホバー時にサンプルビューを更新するコールバック（ロック中は親側で無視）
    export let onHover: (() => void) | undefined = undefined;
    // ピン押下でサンプルビューを固定するコールバック
    export let onPin: (() => void) | undefined = undefined;
    // 画像ファイル名（あればボタンに目印を出す）
    export let image: string | undefined = undefined;

    function handleClick(e: MouseEvent) {
        onClickTag(prompt, e.ctrlKey);
    }

    function handleRightClick(e: MouseEvent) {
        e.preventDefault();
        onClickTag(prompt, true);
    }

    function handlePin(e: MouseEvent) {
        // 本体ボタンとは別要素なので挿入はそもそも発火しないが、念のため伝播を止める
        e.stopPropagation();
        onPin?.();
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span class="d2ps-btn-wrapper">
    {#if $isEditMode}
        <button class="d2ps-btn d2ps-btn--delete" on:click={() => onDeleteItem?.(name)} title={$t('common.delete')}
            >x</button
        >
    {/if}
    <button
        class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-btn d2ps-btn--tag"
        data-has-image={image ? 'true' : 'false'}
        on:click={handleClick}
        on:contextmenu={handleRightClick}
        on:mouseenter={() => onHover?.()}
    >
        {name}
    </button>
    {#if !$isEditMode && $isSampleVisible && onPin}
        <!-- ピン（固定専用）：本体ボタンの兄弟要素として内側に重ねる。ホバー時のみ表示。
             サンプルビュー非表示時は意味がないので隠す -->
        <button class="d2ps-btn--pin" on:click={handlePin} title={$t('sample.pin')}>📌</button>
    {/if}
</span>
