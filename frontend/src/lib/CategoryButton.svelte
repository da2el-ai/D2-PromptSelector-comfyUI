<script lang="ts">
    import { isEditMode } from '../stores/ui';
    import { Constants } from '../Constants';

    /** ボタンに表示するラベル */
    export let label: string;
    /** クリック時に送出するプロンプト（空文字の場合はボタン無効状態） */
    export let prompt: string;
    export let onClickTag: (prompt: string, closePanel: boolean) => void;
    /** 削除コールバック（省略時は削除ボタンを表示しない） */
    export let onDelete: (() => void) | undefined = undefined;
</script>

<span class="d2ps-btn-wrapper" style="width:100%">
    {#if $isEditMode && onDelete}
        <button class="d2ps-btn d2ps-btn--delete" on:click={onDelete} title="削除">x</button>
    {/if}
    <button
        class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY} d2ps-btn d2ps-btn--random{prompt
            ? ''
            : ' d2ps-btn--none'} d2ps-btn"
        on:click={(e) => prompt && !$isEditMode && onClickTag(prompt, e.ctrlKey || e.metaKey)}
        on:contextmenu|preventDefault={(e) => prompt && !$isEditMode && onClickTag(prompt, true)}>{label}</button
    >
</span>
