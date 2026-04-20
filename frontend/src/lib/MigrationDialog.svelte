<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Constants } from '../Constants';

    const dispatch = createEventDispatcher<{
        confirm: void;
        cancel: void;
    }>();

    let dialog: HTMLDialogElement;

    export function open() {
        dialog.showModal();
    }

    function handleConfirm() {
        dialog.close();
        dispatch('confirm');
    }

    function handleCancel() {
        dialog.close();
        dispatch('cancel');
    }
</script>

<dialog class="d2ps-dialog-root" bind:this={dialog}>
    <div class="d2ps-dialog">
        <p class="d2ps-dialog__message">
            辞書が旧形式（多階層・配列混在）を含んでいます。<br />
            編集機能を使うには新形式（1階層 dict）への変換が必要です。<br />
            変換前に <strong>tags_bak/</strong> へバックアップを作成します。<br /><br />
            変換しますか？（多階層構造は使えなくなります）
        </p>
        <div class="d2ps-dialog__buttons">
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY}"
                on:click={handleConfirm}>変換する</button
            >
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY}"
                on:click={handleCancel}>キャンセル</button
            >
        </div>
    </div>
</dialog>
