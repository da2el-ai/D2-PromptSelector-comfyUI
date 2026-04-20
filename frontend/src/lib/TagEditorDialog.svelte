<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Constants } from '../Constants';
    import { apiPost } from '../utils';
    import { sortedTagFiles, fetchTags } from '../stores/tags';

    const dispatch = createEventDispatcher<{ done: void }>();

    // ---- モード ----
    type Mode = 'add' | 'edit';
    let mode: Mode = 'add';

    // ---- ダイアログ参照 ----
    let dialog: HTMLDialogElement;

    // ---- フォーム状態 ----
    let fileId = '';
    let categoryId = '';
    let name = '';
    let prompt = '';

    // 編集時の元の値
    let origFileId = '';
    let origCategoryId = '';
    let origName = '';

    // カテゴリの新規入力切替
    let isNewCategory = false;
    let newCategoryName = '';

    // エラーメッセージ
    let errorMsg = '';
    let saving = false;

    // ---- ファイル・カテゴリ選択肢 ----
    $: files = $sortedTagFiles;
    $: selectedFile = files.find((f) => f.fileId === fileId);
    $: categories = selectedFile ? selectedFile.categories.map((c) => c.categoryId) : [];

    // ---- 重複チェック ----
    $: isDuplicate = (() => {
        if (!name.trim()) return false;
        const targetCategory = isNewCategory ? newCategoryName : categoryId;
        const targetFile = files.find((f) => f.fileId === fileId);
        const cat = targetFile?.categories.find((c) => c.categoryId === targetCategory);
        if (!cat) return false;
        return cat.items.some((item) => {
            // 編集時は自分自身を除外
            if (
                mode === 'edit' &&
                fileId === origFileId &&
                targetCategory === origCategoryId &&
                item.name === origName
            ) {
                return false;
            }
            return item.name === name.trim();
        });
    })();

    $: effectiveCategoryId = isNewCategory ? newCategoryName.trim() : categoryId;
    $: canSave =
        name.trim() !== '' &&
        prompt.trim() !== '' &&
        fileId !== '' &&
        effectiveCategoryId !== '' &&
        !isDuplicate &&
        !saving;

    // ---- 公開メソッド ----
    export function openAdd() {
        mode = 'add';
        const first = files[0];
        fileId = first ? first.fileId : '';
        categoryId = first && first.categories[0] ? first.categories[0].categoryId : '';
        name = '';
        prompt = '';
        origFileId = '';
        origCategoryId = '';
        origName = '';
        isNewCategory = false;
        newCategoryName = '';
        errorMsg = '';
        saving = false;
        dialog.showModal();
    }

    export function openEdit(fId: string, catId: string, itemName: string, itemPrompt: string) {
        mode = 'edit';
        fileId = fId;
        categoryId = catId;
        name = itemName;
        prompt = itemPrompt;
        origFileId = fId;
        origCategoryId = catId;
        origName = itemName;
        isNewCategory = false;
        newCategoryName = '';
        errorMsg = '';
        saving = false;
        dialog.showModal();
    }

    // ---- カテゴリ選択クリア（ファイル変更時） ----
    function handleFileChange() {
        isNewCategory = false;
        newCategoryName = '';
        const f = files.find((f) => f.fileId === fileId);
        categoryId = f && f.categories[0] ? f.categories[0].categoryId : '';
    }

    // ---- 保存 ----
    async function handleSave() {
        if (!canSave) return;
        saving = true;
        errorMsg = '';
        try {
            if (mode === 'add') {
                await apiPost('/add_item', {
                    file: fileId,
                    category: isNewCategory ? '__new__' : categoryId,
                    new_category: isNewCategory ? newCategoryName.trim() : null,
                    name: name.trim(),
                    prompt: prompt.trim(),
                });
            } else {
                await apiPost('/edit_item', {
                    file: origFileId,
                    category: origCategoryId,
                    name: origName,
                    new_name: name.trim(),
                    new_prompt: prompt.trim(),
                    new_file: fileId,
                    new_category: isNewCategory ? '__new__' : effectiveCategoryId,
                    new_category_name: isNewCategory ? newCategoryName.trim() : null,
                });
            }
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
    <div class="d2ps-dialog d2ps-dialog--editor">
        <h3 class="d2ps-dialog__title">{mode === 'add' ? 'タグを追加' : 'タグを編集'}</h3>

        <!-- ファイル（タブ） -->
        <label class="d2ps-dialog__label">
            <span>タブ（ファイル）</span>
            <select class="d2ps-dialog__select" bind:value={fileId} on:change={handleFileChange}>
                {#each files as f (f.fileId)}
                    <option value={f.fileId}>{f.fileId}</option>
                {/each}
            </select>
        </label>

        <!-- カテゴリ -->
        <label class="d2ps-dialog__label">
            <span>カテゴリ</span>
            <div class="d2ps-dialog__row">
                {#if !isNewCategory}
                    <select class="d2ps-dialog__select" bind:value={categoryId}>
                        {#each categories as cat (cat)}
                            <option value={cat}>{cat}</option>
                        {/each}
                    </select>
                    <button
                        class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-dialog__new-btn"
                        on:click={() => {
                            isNewCategory = true;
                            newCategoryName = '';
                        }}>+ 新規</button
                    >
                {:else}
                    <input
                        class="d2ps-dialog__input"
                        type="text"
                        placeholder="新しいカテゴリ名"
                        bind:value={newCategoryName}
                    />
                    <button
                        class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-dialog__new-btn"
                        on:click={() => {
                            isNewCategory = false;
                        }}>既存</button
                    >
                {/if}
            </div>
        </label>

        <!-- 名前 -->
        <label class="d2ps-dialog__label">
            <span>名前（表示名）</span>
            <input class="d2ps-dialog__input" type="text" bind:value={name} />
        </label>

        <!-- プロンプト -->
        <label class="d2ps-dialog__label">
            <span>プロンプト</span>
            <textarea class="d2ps-dialog__input" bind:value={prompt}></textarea>
        </label>

        <!-- エラー・重複 -->
        {#if isDuplicate}
            <p class="d2ps-dialog__error">同じアイテムが存在します</p>
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
