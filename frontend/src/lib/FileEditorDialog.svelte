<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { get } from 'svelte/store';
    import { Constants } from '../Constants';
    import { apiPostWithBackup } from '../utils';
    import { sortedTagFiles, fetchTags } from '../stores/tags';
    import { t } from '../i18n';

    // 保存完了時、旧 fileId と新 fileId を親に通知
    // （親はアクティブタブがリネームされたかチェックして activeTabId を更新する）
    const dispatch = createEventDispatcher<{ done: { oldId: string; newId: string } }>();

    let dialog: HTMLDialogElement;

    // ---- フォーム状態 ----
    let fileName = '';
    let origFileName = '';

    let errorMsg = '';
    let saving = false;

    // 他のファイルと重複しているか（自分自身は除外）
    $: isDuplicate = (() => {
        const trimmed = fileName.trim();
        if (!trimmed || trimmed === origFileName) return false;
        return $sortedTagFiles.some((f) => f.fileId === trimmed);
    })();

    // 不正な文字 or 予約名か
    $: isInvalid = (() => {
        const trimmed = fileName.trim();
        if (!trimmed) return true;
        if (trimmed === '__config__') return true;
        return /[\/\\:*?"<>|]/.test(trimmed);
    })();

    $: canSave = !isInvalid && !isDuplicate && !saving;

    // ---- 公開メソッド ----
    export function openEdit(fileId: string) {
        fileName = fileId;
        origFileName = fileId;
        errorMsg = '';
        saving = false;
        dialog.showModal();
    }

    async function handleSave() {
        if (!canSave) return;
        const newId = fileName.trim();
        if (newId === origFileName) {
            // 変更なし：閉じるだけ
            dialog.close();
            return;
        }
        saving = true;
        errorMsg = '';
        try {
            const res = await apiPostWithBackup<{ success?: boolean; error?: string }>(
                '/edit_file',
                {
                    file: origFileName,
                    new_file_name: newId,
                },
            );
            const translate = get(t);
            if (res.error === 'duplicate') {
                errorMsg = translate('file.error.duplicate');
                return;
            }
            if (res.error === 'not_found') {
                errorMsg = translate('file.error.notFound');
                return;
            }
            if (res.error === 'invalid_file_name') {
                errorMsg = translate('file.error.invalidName');
                return;
            }
            if (!res.success) {
                errorMsg = translate('common.error.generic');
                return;
            }
            await fetchTags();
            dialog.close();
            dispatch('done', { oldId: origFileName, newId });
        } catch (e) {
            errorMsg = get(t)('common.error.generic');
        } finally {
            saving = false;
        }
    }

    function handleCancel() {
        dialog.close();
    }
</script>

<dialog class="d2ps-dialog-root" bind:this={dialog}>
    <div class="d2ps-dialog">
        <h3 class="d2ps-dialog__title">{$t('file.rename.title')}</h3>

        <!-- ファイル名 -->
        <label class="d2ps-dialog__label">
            <span>{$t('file.field.name')}</span>
            <input class="d2ps-dialog__input" type="text" bind:value={fileName} />
        </label>

        <!-- エラー・重複 -->
        {#if isDuplicate}
            <p class="d2ps-dialog__error">{$t('file.error.duplicate')}</p>
        {:else if isInvalid && fileName.trim() !== ''}
            <p class="d2ps-dialog__error">{$t('file.error.invalidChar')}</p>
        {/if}
        {#if errorMsg}
            <p class="d2ps-dialog__error">{errorMsg}</p>
        {/if}

        <!-- ボタン -->
        <div class="d2ps-dialog__buttons">
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY}"
                on:click={handleSave}
                disabled={!canSave}
            >
                {saving ? $t('common.saving') : $t('common.save')}
            </button>
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY}"
                on:click={handleCancel}>{$t('common.cancel')}</button
            >
        </div>
    </div>
</dialog>
