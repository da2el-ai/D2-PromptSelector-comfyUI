<script lang="ts">
    import { Constants } from '../Constants';

    let dialog: HTMLDialogElement;

    let title = '';
    let message = '';
    let confirmLabel = 'OK';
    let cancelLabel = 'キャンセル';
    let resolver: ((ok: boolean) => void) | null = null;

    type OpenOptions = {
        title?: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
    };

    /** ダイアログを開いて、確認/キャンセルの結果を Promise<boolean> で返す */
    export function open(opts: OpenOptions): Promise<boolean> {
        title = opts.title ?? '';
        message = opts.message;
        confirmLabel = opts.confirmLabel ?? 'OK';
        cancelLabel = opts.cancelLabel ?? 'キャンセル';
        return new Promise<boolean>((resolve) => {
            resolver = resolve;
            dialog.showModal();
        });
    }

    function handleConfirm() {
        dialog.close();
        resolver?.(true);
        resolver = null;
    }

    function handleCancel() {
        dialog.close();
        resolver?.(false);
        resolver = null;
    }
</script>

<dialog class="d2ps-dialog-root" bind:this={dialog}>
    <div class="d2ps-dialog">
        {#if title}
            <h3 class="d2ps-dialog__title">{title}</h3>
        {/if}
        <p class="d2ps-dialog__message">{message}</p>
        <div class="d2ps-dialog__buttons">
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY}"
                on:click={handleConfirm}>{confirmLabel}</button
            >
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY}"
                on:click={handleCancel}>{cancelLabel}</button
            >
        </div>
    </div>
</dialog>
