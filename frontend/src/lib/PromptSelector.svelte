<script lang="ts">
    import { Constants } from '../Constants';
    import { isPanelVisible, isEditMode } from '../stores/ui';
    import { sortedTagFiles, fetchTags } from '../stores/tags';
    import TabNavi from './TabNavi.svelte';
    import CategoryView from './CategoryView.svelte';
    import SearchView from './SearchView.svelte';
    import ToolTip from './ToolTip.svelte';
    import MigrationDialog from './MigrationDialog.svelte';
    import TagEditorDialog from './TagEditorDialog.svelte';
    import ConfirmDialog from './ConfirmDialog.svelte';
    import { insertTextToTarget, apiGet, apiPost } from '../utils';
    import { get } from 'svelte/store';
    import { targetTextArea } from '../stores/ui';

    let migrationDialog: MigrationDialog;
    let editorDialog: TagEditorDialog;
    let confirmDialog: ConfirmDialog;

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

    /** タグ編集ダイアログを開く */
    function handleEditTag(fileId: string, categoryId: string, name: string, prompt: string) {
        editorDialog.openEdit(fileId, categoryId, name, prompt);
    }

    /** タグ削除：確認ダイアログ → API */
    async function handleDeleteItem(fileId: string, categoryId: string, itemName: string) {
        const ok = await confirmDialog.open({
            title: 'タグを削除',
            message: `「${itemName}」を削除しますか？`,
            confirmLabel: '削除',
        });
        if (!ok) return;
        await apiPost('/delete_item', {
            type: 'item',
            file: fileId,
            category: categoryId,
            name: itemName,
        });
        await fetchTags();
    }

    /** カテゴリ削除：確認ダイアログ → API */
    async function handleDeleteCategory(fileId: string, categoryId: string) {
        const ok = await confirmDialog.open({
            title: 'カテゴリを削除',
            message: `カテゴリ「${categoryId}」を削除しますか？\n（含まれるタグもすべて削除されます）`,
            confirmLabel: '削除',
        });
        if (!ok) return;
        await apiPost('/delete_item', {
            type: 'category',
            file: fileId,
            category: categoryId,
        });
        await fetchTags();
    }
</script>

{#if $isPanelVisible}
    <div class="d2ps">
        <!-- コントローラー -->
        <div class="d2ps-controller">
            <!-- 編集ボタン（左端） -->
            {#if $isEditMode}
                <button
                    class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-btn d2ps-btn--controller"
                    on:click={handleEditClick}>編集解除</button
                >
            {:else}
                <button
                    class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY} d2ps-btn d2ps-btn--controller"
                    on:click={handleEditClick}>編集</button
                >
            {/if}
            {#if $isEditMode}
                <!-- タグ追加ボタン -->
                <button
                    class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-btn d2ps-btn--controller"
                    on:click={handleAddTag}>＋ 追加</button
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

        <!-- タグラッパー -->
        <div class="d2ps-tag-wrapper">
            <div class="d2ps-tag-container">
                <!-- 全ファイル（常にDOM、display で表示切替） -->
                {#each $sortedTagFiles as file (file.fileId)}
                    <CategoryView
                        {file}
                        onClickTag={handleClickTag}
                        onEditTag={(catId, name, prompt) => handleEditTag(file.fileId, catId, name, prompt)}
                        onDeleteItem={(catId, name) => handleDeleteItem(file.fileId, catId, name)}
                        onDeleteCategory={(catId) => handleDeleteCategory(file.fileId, catId)}
                    />
                {/each}
                <!-- 検索（常にDOM、display で表示切替） -->
                <SearchView onClickTag={handleClickTag} />
                <!-- タブナビ（タグコンテナの最後） -->
                <TabNavi />
            </div>
        </div>

        <!-- ツールチップ -->
        <ToolTip />
    </div>
{/if}

<!-- マイグレーション確認ダイアログ -->
<MigrationDialog bind:this={migrationDialog} on:confirm={handleMigrationConfirm} on:cancel={() => {}} />

<!-- タグ追加・編集ダイアログ -->
<TagEditorDialog bind:this={editorDialog} on:done={() => {}} />

<!-- 共通の確認ダイアログ -->
<ConfirmDialog bind:this={confirmDialog} />

<style>
    :global(.d2ps-btn--active) {
        outline: 2px solid #5af;
    }
</style>
