<script lang="ts">
    import TagNodeItem from './TagNodeItem.svelte';
    import CategoryButton from './CategoryButton.svelte';
    import type { TagFile, TagItem } from '../types';
    import { activeTabId, isEditMode } from '../stores/ui';

    export let file: TagFile;
    export let onClickTag: (prompt: string, closePanel: boolean) => void;
    export let onEditTag: (categoryId: string, name: string, prompt: string) => void;
    export let onDeleteItem: (categoryId: string, itemName: string) => void;
    export let onDeleteCategory: (categoryId: string) => void;

    $: isActive = $activeTabId === file.fileId;

    /**
     * カテゴリの全直接アイテムからワイルドカードプロンプトを生成
     * いずれかがグループノード（children あり）なら '' を返す（オリジナル仕様）
     */
    function getRandomPrompt(items: TagItem[]): string {
        if (items.some((item) => item.children !== undefined)) return '';
        const parts = items.map((item) => `${item.prompt},`);
        return parts.length > 0 ? `{ ${parts.join(' | ')} }` : '';
    }
</script>

<div class="d2ps-tag-field d2ps-tag-field--top" style:display={isActive ? 'flex' : 'none'}>
    {#each file.categories as category (category.categoryId)}
        {@const randomPrompt = getRandomPrompt(category.items)}
        <div class="d2ps-tag-field d2ps-tag-field--with-random">
            <!-- カテゴリ名行 -->
            <div class="d2ps-category-header">
                <CategoryButton
                    label={category.categoryId}
                    prompt={randomPrompt}
                    {onClickTag}
                    onDelete={() => onDeleteCategory(category.categoryId)}
                />
            </div>
            <!-- タグノード群（再帰レンダリング） -->
            <div class="d2ps-tag-field">
                {#each category.items as item (item.name)}
                    <TagNodeItem
                        {item}
                        {onClickTag}
                        onEditItem={$isEditMode
                            ? (name, prompt) => onEditTag(category.categoryId, name, prompt)
                            : undefined}
                        onDeleteItem={$isEditMode ? (name) => onDeleteItem(category.categoryId, name) : undefined}
                    />
                {/each}
            </div>
        </div>
    {/each}
</div>

<style>
    .d2ps-category-header {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
    }
</style>
