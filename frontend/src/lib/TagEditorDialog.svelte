<script lang="ts">
    import { createEventDispatcher, } from 'svelte';
    import { get } from 'svelte/store';
    import { Constants } from '../Constants';
    import {
        apiPostWithBackup,
        flattenLeaves,
        imageUrl,
        uploadImage,
        uploadImageTemp,
        deleteImage,
        cleanupTempImages,
    } from '../utils';
    import { sortedTagFiles, fetchTags } from '../stores/tags';
    import { t } from '../i18n';

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

    // ファイルの新規入力切替
    let isNewFile = false;
    let newFileName = '';

    // カテゴリの新規入力切替
    let isNewCategory = false;
    let newCategoryName = '';

    // エラーメッセージ
    let errorMsg = '';
    let saving = false;

    // ---- 画像 ----
    // edit: 既存項目の正式画像ファイル名 / add: temp 画像ファイル名 / 未登録: ''
    let imageFilename = '';
    let imageError = '';
    let imageUploading = false;
    let imageDragOver = false;

    // ---- ファイル・カテゴリ選択肢 ----
    $: files = $sortedTagFiles;
    $: selectedFile = files.find((f) => f.fileId === fileId);
    $: categories = selectedFile ? selectedFile.categories.map((c) => c.categoryId) : [];

    // 新規ファイル時はカテゴリも必ず新規（既存カテゴリが存在しないため）
    $: if (isNewFile && !isNewCategory) {
        isNewCategory = true;
    }

    // ---- 重複チェック（既存ファイル選択時のみ意味がある） ----
    $: isDuplicate = (() => {
        if (isNewFile) return false;
        if (!name.trim()) return false;
        const targetCategory = isNewCategory ? newCategoryName : categoryId;
        const targetFile = files.find((f) => f.fileId === fileId);
        const cat = targetFile?.categories.find((c) => c.categoryId === targetCategory);
        if (!cat) return false;
        return cat.items.some((item) => {
            // 編集時は自分自身を除外
            if (
                mode === 'edit' &&
                !isNewFile &&
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
    $: effectiveFileId = isNewFile ? newFileName.trim() : fileId;
    $: canSave =
        name.trim() !== '' &&
        prompt.trim() !== '' &&
        effectiveFileId !== '' &&
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
        isNewFile = false;
        newFileName = '';
        isNewCategory = false;
        newCategoryName = '';
        errorMsg = '';
        saving = false;
        imageFilename = '';
        imageError = '';
        imageUploading = false;
        imageDragOver = false;
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
        isNewFile = false;
        newFileName = '';
        isNewCategory = false;
        newCategoryName = '';
        errorMsg = '';
        saving = false;
        imageError = '';
        imageUploading = false;
        imageDragOver = false;
        // 既存項目の画像をストアから引く（leaf-meta の image）
        imageFilename = findItemImage(fId, catId, itemName) ?? '';
        dialog.showModal();
    }

    /** ストアから対象リーフ項目の image を取得する */
    function findItemImage(fId: string, catId: string, itemName: string): string | undefined {
        const f = get(sortedTagFiles).find((x) => x.fileId === fId);
        const c = f?.categories.find((x) => x.categoryId === catId);
        if (!c) return undefined;
        const leaf = flattenLeaves(c.items).find((i) => i.name === itemName);
        return leaf?.image;
    }

    // ---- 画像ドロップ／削除 ----
    function handleImageDragOver(e: DragEvent) {
        e.preventDefault();
        imageDragOver = true;
    }
    function handleImageDragLeave() {
        imageDragOver = false;
    }

    async function handleImageDrop(e: DragEvent) {
        imageDragOver = false;
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;
        imageError = '';
        imageUploading = true;
        try {
            if (mode === 'add') {
                // 新規追加：temp 保存（保存時に add_item へ渡してリネーム）
                const res = await uploadImageTemp(file, file.name);
                if (res.error) {
                    imageError = res.error === 'invalid_format' ? get(t)('tag.image.invalidFormat') : get(t)('common.error.generic');
                    return;
                }
                imageFilename = res.image ?? '';
            } else {
                // 編集：元の項目へ即時登録（差し替え）。対象は orig（YAML 上の現在値）
                const res = await uploadImage(origFileId, origCategoryId, origName, file, file.name);
                if (res.error) {
                    imageError = res.error === 'invalid_format' ? get(t)('tag.image.invalidFormat') : get(t)('common.error.generic');
                    return;
                }
                imageFilename = res.image ?? '';
                await fetchTags();
            }
        } catch {
            imageError = get(t)('common.error.generic');
        } finally {
            imageUploading = false;
        }
    }

    async function handleImageDelete() {
        imageError = '';
        if (mode === 'add') {
            // temp はローカル state をクリアするだけ（孤立 temp は後でクリーンアップ）
            imageFilename = '';
            return;
        }
        imageUploading = true;
        try {
            const res = await deleteImage(origFileId, origCategoryId, origName);
            if (res.error) {
                imageError = get(t)('common.error.generic');
                return;
            }
            imageFilename = '';
            await fetchTags();
        } catch {
            imageError = get(t)('common.error.generic');
        } finally {
            imageUploading = false;
        }
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
                await apiPostWithBackup('/add_item', {
                    file: isNewFile ? '__new__' : fileId,
                    new_file: isNewFile ? newFileName.trim() : null,
                    category: isNewCategory ? '__new__' : categoryId,
                    new_category: isNewCategory ? newCategoryName.trim() : null,
                    name: name.trim(),
                    prompt: prompt.trim(),
                    image: imageFilename || null,
                });
            } else {
                await apiPostWithBackup('/edit_item', {
                    file: origFileId,
                    category: origCategoryId,
                    name: origName,
                    new_name: name.trim(),
                    new_prompt: prompt.trim(),
                    new_file: isNewFile ? '__new__' : fileId,
                    new_file_name: isNewFile ? newFileName.trim() : null,
                    new_category: isNewCategory ? '__new__' : effectiveCategoryId,
                    new_category_name: isNewCategory ? newCategoryName.trim() : null,
                });
            }
            await fetchTags();
            // 編集完了時：余った temp 画像を掃除
            void cleanupTempImages();
            dialog.close();
            dispatch('done');
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
    <div class="d2ps-dialog d2ps-dialog--editor">
        <h3 class="d2ps-dialog__title">{$t(mode === 'add' ? 'tag.add.title' : 'tag.edit.title')}</h3>

        <!-- ファイル（タブ） -->
        <label class="d2ps-dialog__label">
            <span>{$t('tag.field.file')}</span>
            <div class="d2ps-dialog__row">
                {#if !isNewFile}
                    <select class="d2ps-dialog__select" bind:value={fileId} on:change={handleFileChange}>
                        {#each files as f (f.fileId)}
                            <option value={f.fileId}>{f.fileId}</option>
                        {/each}
                    </select>
                    <button
                        class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-dialog__new-btn"
                        on:click={() => {
                            isNewFile = true;
                            newFileName = '';
                        }}>{$t('common.new')}</button
                    >
                {:else}
                    <input
                        class="d2ps-dialog__input"
                        type="text"
                        placeholder={$t('tag.field.newFileName')}
                        bind:value={newFileName}
                    />
                    <button
                        class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-dialog__new-btn"
                        on:click={() => {
                            isNewFile = false;
                        }}>{$t('common.existing')}</button
                    >
                {/if}
            </div>
        </label>

        <!-- カテゴリ -->
        <label class="d2ps-dialog__label">
            <span>{$t('tag.field.category')}</span>
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
                        }}>{$t('common.new')}</button
                    >
                {:else}
                    <input
                        class="d2ps-dialog__input"
                        type="text"
                        placeholder={$t('tag.field.newCategoryName')}
                        bind:value={newCategoryName}
                    />
                    {#if !isNewFile}
                        <button
                            class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-dialog__new-btn"
                            on:click={() => {
                                isNewCategory = false;
                            }}>{$t('common.existing')}</button
                        >
                    {/if}
                {/if}
            </div>
        </label>

        <!-- 名前 -->
        <label class="d2ps-dialog__label">
            <span>{$t('tag.field.name')}</span>
            <input class="d2ps-dialog__input" type="text" bind:value={name} />
        </label>

        <!-- プロンプト -->
        <label class="d2ps-dialog__label">
            <span>{$t('tag.field.prompt')}</span>
            <textarea class="d2ps-dialog__input" bind:value={prompt}></textarea>
        </label>

        <!-- 画像 -->
        <div class="d2ps-dialog__label">
            <span>{$t('tag.field.image')}</span>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="d2ps-image-drop"
                class:d2ps-image-drop--dragover={imageDragOver}
                on:dragover={handleImageDragOver}
                on:dragleave={handleImageDragLeave}
                on:drop={handleImageDrop}
            >
                {#if imageFilename}
                    <div class="d2ps-image-thumb">
                        <img src={imageUrl(imageFilename)} alt={name} />
                        <button
                            class="d2ps-image-delete"
                            on:click|preventDefault={handleImageDelete}
                            title={$t('tag.image.delete')}>×</button
                        >
                    </div>
                {:else}
                    <span class="d2ps-image-drop__hint">
                        {imageUploading ? $t('common.saving') : $t('tag.image.drop')}
                    </span>
                {/if}
            </div>
            {#if imageError}
                <p class="d2ps-dialog__error">{imageError}</p>
            {/if}
        </div>

        <!-- エラー・重複 -->
        {#if isDuplicate}
            <p class="d2ps-dialog__error">{$t('tag.error.duplicate')}</p>
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
