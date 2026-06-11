<script lang="ts">
    import { Constants } from '../Constants';
    import { isPanelVisible, isEditMode } from '../stores/ui';
    import { sortedTagFiles, fetchTags } from '../stores/tags';
    import TabNavi from './TabNavi.svelte';
    import CategoryView from './CategoryView.svelte';
    import SearchView from './SearchView.svelte';
    import SampleView from './SampleView.svelte';
    import MigrationDialog from './MigrationDialog.svelte';
    import TagEditorDialog from './TagEditorDialog.svelte';
    import CategoryEditorDialog from './CategoryEditorDialog.svelte';
    import SortDialog from './SortDialog.svelte';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import FileDeleteConfirmDialog from './FileDeleteConfirmDialog.svelte';
    import FileEditorDialog from './FileEditorDialog.svelte';
    import { insertTextToTarget, apiGet, apiPost, apiPostWithBackup } from '../utils';
    import { get } from 'svelte/store';
    import { targetTextArea, activeTabId, sampleItem, isSampleLocked } from '../stores/ui';
    import type { SampleItem } from '../stores/ui';
    import type { TagItem } from '../types';
    import { t } from '../i18n';

    let migrationDialog: MigrationDialog;
    let editorDialog: TagEditorDialog;
    let categoryEditorDialog: CategoryEditorDialog;
    let sortDialog: SortDialog;
    let confirmDialog: ConfirmDialog;
    let fileDeleteDialog: FileDeleteConfirmDialog;
    let fileEditorDialog: FileEditorDialog;

    async function handleReload() {
        await fetchTags();
    }

    function handleClose() {
        isPanelVisible.set(false);
    }

    function handleClickTag(prompt: string, closePanel: boolean) {
        const ta = get(targetTextArea);
        if (ta) {
            insertTextToTarget(ta, prompt + ',');
        }
        if (closePanel) {
            isPanelVisible.set(false);
        }
    }

    /** サンプルビュー更新：ホバー（lock=false）／ピン固定（lock=true）。fileId を注入 */
    function handleSample(fileId: string, categoryId: string, item: TagItem, lock: boolean) {
        // ホバーは固定中なら無視。ピンは常に切り替え（固定したまま対象を変更）
        if (!lock && get(isSampleLocked)) return;
        sampleItem.set({
            fileId,
            categoryId,
            name: item.name,
            prompt: item.prompt,
            image: item.image,
        });
        if (lock) isSampleLocked.set(true);
    }

    /** サンプルビューの編集ボタン：表示中の項目を編集ダイアログで開く（編集モード外でも可） */
    function handleEditFromSample(item: SampleItem) {
        editorDialog.openEdit(item.fileId, item.categoryId, item.name, item.prompt);
    }

    /** 編集ボタン押下：マイグレーション確認 → 編集モード ON */
    async function handleEditClick() {
        if ($isEditMode) {
            isEditMode.set(false);
            return;
        }
        const res = await apiGet<{ needed: boolean }>('/check_migration_needed');
        if (res.needed) {
            migrationDialog.open();
        } else {
            isEditMode.set(true);
        }
    }

    /** マイグレーション確認 → 実行 → 編集モード ON */
    async function handleMigrationConfirm() {
        await apiPost('/migrate', {});
        await fetchTags();
        isEditMode.set(true);
    }

    /** タグ追加ダイアログを開く */
    function handleAddTag() {
        editorDialog.openAdd();
    }

    /** 並び順ダイアログを開く */
    function handleOpenSort() {
        sortDialog.open();
    }

    /** タグ編集ダイアログを開く */
    function handleEditTag(fileId: string, categoryId: string, name: string, prompt: string) {
        editorDialog.openEdit(fileId, categoryId, name, prompt);
    }

    /** カテゴリ編集ダイアログを開く */
    function handleEditCategory(fileId: string, categoryId: string) {
        categoryEditorDialog.openEdit(fileId, categoryId);
    }

    /** ファイル名編集ダイアログを開く */
    function handleEditFile(fileId: string) {
        fileEditorDialog.openEdit(fileId);
    }

    /** ファイル名変更完了：アクティブタブがリネームされていたら新しい ID に差し替える */
    function handleFileRenamed(e: CustomEvent<{ oldId: string; newId: string }>) {
        if (get(activeTabId) === e.detail.oldId) {
            activeTabId.set(e.detail.newId);
        }
    }

    /** タグ削除：確認ダイアログ → API */
    async function handleDeleteItem(fileId: string, categoryId: string, itemName: string) {
        const translate = get(t);
        const ok = await confirmDialog.open({
            title: translate('tag.delete.confirm.title'),
            message: translate('tag.delete.confirm.message', { name: itemName }),
            confirmLabel: translate('common.delete'),
        });
        if (!ok) return;
        await apiPostWithBackup('/delete_item', {
            type: 'item',
            file: fileId,
            category: categoryId,
            name: itemName,
        });
        await fetchTags();
    }

    /** カテゴリ削除：確認ダイアログ → API */
    async function handleDeleteCategory(fileId: string, categoryId: string) {
        const translate = get(t);
        const ok = await confirmDialog.open({
            title: translate('category.delete.confirm.title'),
            message: translate('category.delete.confirm.message', { name: categoryId }),
            confirmLabel: translate('common.delete'),
        });
        if (!ok) return;
        await apiPostWithBackup('/delete_item', {
            type: 'category',
            file: fileId,
            category: categoryId,
        });
        await fetchTags();
    }

    /** ファイル削除：専用強確認ダイアログ → API → アクティブタブのフォールバック */
    async function handleDeleteFile(fileId: string) {
        const file = get(sortedTagFiles).find((f) => f.fileId === fileId);
        if (!file) return;
        const categoryCount = file.categories.length;
        const itemCount = file.categories.reduce((sum, c) => sum + c.items.length, 0);

        const ok = await fileDeleteDialog.open({ fileId, categoryCount, itemCount });
        if (!ok) return;

        const wasActive = get(activeTabId) === fileId;
        await apiPostWithBackup('/delete_item', { type: 'file', file: fileId });
        await fetchTags();

        // 削除したファイルがアクティブタブだった場合、先頭タブに切り替える
        if (wasActive) {
            const first = get(sortedTagFiles)[0]?.fileId ?? '';
            activeTabId.set(first);
        }
    }
</script>

{#if $isPanelVisible}
    <div class="d2ps">
        <!-- コントローラー -->
        <div class="d2ps-controller">
            <!-- 編集ボタン（左端） -->
            {#if $isEditMode}
                <button
                    class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_DESTRUCTIVE} d2ps-btn d2ps-btn--controller"
                    on:click={handleEditClick}>{$t('button.editDone')}</button
                >
            {:else}
                <button
                    class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY} d2ps-btn d2ps-btn--controller"
                    on:click={handleEditClick}>{$t('button.edit')}</button
                >
            {/if}
            {#if $isEditMode}
                <!-- タグ追加ボタン -->
                <button
                    class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-btn d2ps-btn--controller"
                    on:click={handleAddTag}>{$t('button.add')}</button
                >
                <!-- 並び順ボタン -->
                <button
                    class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-btn d2ps-btn--controller"
                    on:click={handleOpenSort}>{$t('button.sort')}</button
                >
            {/if}
            <!-- 再読み込みボタン -->
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY} d2ps-btn d2ps-btn--controller"
                on:click={handleReload}>🔄</button
            >
            <!-- 閉じるボタン -->
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY} d2ps-btn d2ps-btn--controller"
                on:click={handleClose}>✖</button
            >
        </div>

        <!-- タグラッパー（左：ボタンエリア / 右：サンプルビュー） -->
        <div class="d2ps-tag-wrapper">
            <div class="d2ps-tag-container">
                <!-- 全ファイル（常にDOM、display で表示切替） -->
                {#each $sortedTagFiles as file (file.fileId)}
                    <CategoryView
                        {file}
                        onClickTag={handleClickTag}
                        onEditTag={(catId, name, prompt) => handleEditTag(file.fileId, catId, name, prompt)}
                        onEditCategory={(catId) => handleEditCategory(file.fileId, catId)}
                        onDeleteItem={(catId, name) => handleDeleteItem(file.fileId, catId, name)}
                        onDeleteCategory={(catId) => handleDeleteCategory(file.fileId, catId)}
                        onSample={(catId, item, lock) => handleSample(file.fileId, catId, item, lock)}
                    />
                {/each}
                <!-- 検索（常にDOM、display で表示切替） -->
                <SearchView
                    onClickTag={handleClickTag}
                    onEditTag={handleEditTag}
                    onDeleteItem={handleDeleteItem}
                    onSample={(hit, lock) => handleSample(hit.fileId, hit.categoryId, hit, lock)}
                />
                <!-- タブナビ（タグコンテナの最後） -->
                <TabNavi onDeleteFile={handleDeleteFile} />
            </div>

            <!-- サンプルビュー（右側） -->
            <SampleView onEdit={handleEditFromSample} />
        </div>
    </div>
{/if}

<!-- マイグレーション確認ダイアログ -->
<MigrationDialog bind:this={migrationDialog} on:confirm={handleMigrationConfirm} on:cancel={() => {}} />

<!-- タグ追加・編集ダイアログ -->
<TagEditorDialog bind:this={editorDialog} on:done={() => {}} />

<!-- カテゴリ編集ダイアログ -->
<CategoryEditorDialog bind:this={categoryEditorDialog} on:done={() => {}} />

<!-- 並び順ダイアログ -->
<SortDialog
    bind:this={sortDialog}
    onEditCategory={handleEditCategory}
    onEditItem={handleEditTag}
    onEditFile={handleEditFile}
    onDeleteCategory={handleDeleteCategory}
    onDeleteItem={handleDeleteItem}
    onDeleteFile={handleDeleteFile}
/>

<!-- 共通の確認ダイアログ -->
<ConfirmDialog bind:this={confirmDialog} />

<!-- ファイル削除の強確認ダイアログ -->
<FileDeleteConfirmDialog bind:this={fileDeleteDialog} />

<!-- ファイル名変更ダイアログ -->
<FileEditorDialog bind:this={fileEditorDialog} on:done={handleFileRenamed} />

<style>
    :global(.d2ps-btn--active) {
        outline: 2px solid #5af;
    }
</style>
