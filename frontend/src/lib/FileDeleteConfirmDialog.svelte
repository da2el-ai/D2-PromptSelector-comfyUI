<script lang="ts">
    import { Constants } from '../Constants';
    import { t } from '../i18n';

    let dialog: HTMLDialogElement;

    let fileId = '';
    let categoryCount = 0;
    let itemCount = 0;
    let typedName = '';
    let resolver: ((ok: boolean) => void) | null = null;

    type OpenOptions = {
        fileId: string;
        categoryCount: number;
        itemCount: number;
    };

    /**
     * ファイル削除の強確認ダイアログを開く。
     * 入力欄に fileId と完全一致するファイル名を入力した場合のみ「削除」ボタンが有効になる。
     */
    export function open(opts: OpenOptions): Promise<boolean> {
        fileId = opts.fileId;
        categoryCount = opts.categoryCount;
        itemCount = opts.itemCount;
        typedName = '';
        return new Promise<boolean>((resolve) => {
            resolver = resolve;
            dialog.showModal();
        });
    }

    function handleConfirm() {
        if (typedName !== fileId) return;
        dialog.close();
        resolver?.(true);
        resolver = null;
    }

    function handleCancel() {
        dialog.close();
        resolver?.(false);
        resolver = null;
    }

    $: canDelete = typedName === fileId;
</script>

<dialog class="d2ps-dialog-root" bind:this={dialog}>
    <div class="d2ps-dialog d2ps-dialog--file-delete">
        <h3 class="d2ps-dialog__title">{$t('file.delete.confirm.title')}</h3>
        <p class="d2ps-dialog__message">
            {@html $t('file.delete.confirm.message', { fileId, categoryCount, itemCount })}
        </p>
        <p class="d2ps-dialog__message">
            {@html $t('file.delete.confirm.typePrompt', { fileId })}
        </p>
        <input
            class="d2ps-dialog__input d2ps-dialog__input--confirm"
            type="text"
            bind:value={typedName}
            placeholder={fileId}
            autocomplete="off"
        />
        <div class="d2ps-dialog__buttons">
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_DESTRUCTIVE}"
                disabled={!canDelete}
                on:click={handleConfirm}>{$t('common.delete')}</button
            >
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY}"
                on:click={handleCancel}>{$t('common.cancel')}</button
            >
        </div>
    </div>
</dialog>
