<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Constants } from '../Constants';
    import { apiPost } from '../utils';
    import { sortedTagFiles, fetchTags } from '../stores/tags';

    const dispatch = createEventDispatcher<{ done: void }>();

    let dialog: HTMLDialogElement;

    // ---- フォーム状態 ----
    let fileId = '';
    let categoryName = '';

    // 編集前の値
    let origFileId = '';
    let origCategoryName = '';

    let errorMsg = '';
    let saving = false;

    // ---- ファイル選択肢 ----
    $: files = $sortedTagFiles;

    // ---- 重複チェック（移動先 / リネーム先に同名カテゴリが既存か） ----
    $: isDuplicate = (() => {
        const trimmed = categoryName.trim();
        if (!trimmed) return false;
        if (fileId === origFileId && trimmed === origCategoryName) return false;
        const targetFile = files.find((f) => f.fileId === fileId);
        if (!targetFile) return false;
        return targetFile.categories.some((c) => c.categoryId === trimmed);
    })();

    $: canSave =
        categoryName.trim() !== '' &&
        fileId !== '' &&
        !isDuplicate &&
        !saving;

    // ---- 公開メソッド ----
    export function openEdit(fId: string, catId: string) {
        fileId = fId;
        categoryName = catId;
        origFileId = fId;
        origCategoryName = catId;
        errorMsg = '';
        saving = false;
        dialog.showModal();
    }

    // ---- 保存 ----
    async function handleSave() {
        if (!canSave) return;
        saving = true;
        errorMsg = '';
        try {
            await apiPost('/edit_category', {
                file: origFileId,
                category: origCategoryName,
                new_file: fileId,
                new_category: categoryName.trim(),
            });
            await fetchTags();
            dialog.close();
            dispatch('done');
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
        <h3 class="d2ps-dialog__title">カテゴリを編集</h3>

        <!-- ファイル（タブ） -->
        <label class="d2ps-dialog__label">
            <span>タブ（ファイル）</span>
            <select class="d2ps-dialog__select" bind:value={fileId}>
                {#each files as f (f.fileId)}
                    <option value={f.fileId}>{f.fileId}</option>
                {/each}
            </select>
        </label>

        <!-- カテゴリ名 -->
        <label class="d2ps-dialog__label">
            <span>カテゴリ</span>
            <input class="d2ps-dialog__input" type="text" bind:value={categoryName} />
        </label>

        <!-- エラー・重複 -->
        {#if isDuplicate}
            <p class="d2ps-dialog__error">同じカテゴリが存在します</p>
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
