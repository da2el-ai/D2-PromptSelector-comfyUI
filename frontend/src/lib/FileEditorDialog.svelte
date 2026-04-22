<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Constants } from '../Constants';
    import { apiPostWithBackup } from '../utils';
    import { sortedTagFiles, fetchTags } from '../stores/tags';

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
            if (res.error === 'duplicate') {
                errorMsg = '同じ名前のファイルが存在します';
                return;
            }
            if (res.error === 'not_found') {
                errorMsg = '元のファイルが見つかりません';
                return;
            }
            if (res.error === 'invalid_file_name') {
                errorMsg = 'ファイル名が不正です';
                return;
            }
            if (!res.success) {
                errorMsg = '保存中にエラーが発生しました';
                return;
            }
            await fetchTags();
            dialog.close();
            dispatch('done', { oldId: origFileName, newId });
        } catch (e) {
            errorMsg = '保存中にエラーが発生しました';
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
        <h3 class="d2ps-dialog__title">ファイル名を変更</h3>

        <!-- ファイル名 -->
        <label class="d2ps-dialog__label">
            <span>ファイル名</span>
            <input class="d2ps-dialog__input" type="text" bind:value={fileName} />
        </label>

        <!-- エラー・重複 -->
        {#if isDuplicate}
            <p class="d2ps-dialog__error">同じ名前のファイルが存在します</p>
        {:else if isInvalid && fileName.trim() !== ''}
            <p class="d2ps-dialog__error">ファイル名に使えない文字が含まれています</p>
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
                {saving ? '保存中...' : '保存'}
            </button>
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY}"
                on:click={handleCancel}>キャンセル</button
            >
        </div>
    </div>
</dialog>
