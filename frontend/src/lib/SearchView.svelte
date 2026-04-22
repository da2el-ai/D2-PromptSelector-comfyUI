<script lang="ts">
    import TagButton from './TagButton.svelte';
    import { sortedTagFiles } from '../stores/tags';
    import { activeTabId, isEditMode } from '../stores/ui';
    import { Constants } from '../Constants';
    import { flattenLeaves } from '../utils';
    import { t } from '../i18n';

    export let onClickTag: (prompt: string, closePanel: boolean) => void;
    export let onEditTag: (fileId: string, categoryId: string, name: string, prompt: string) => void;
    export let onDeleteItem: (fileId: string, categoryId: string, itemName: string) => void;

    const SEARCH_TAB = Constants.ICON_SEARCH;
    let keyword = '';

    $: isActive = $activeTabId === SEARCH_TAB;

    type SearchHit = { fileId: string; categoryId: string; name: string; prompt: string };

    // 全タグのリーフノードをフラットに検索（fileId/categoryId も保持）
    $: results = (() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return [] as SearchHit[];
        const found: SearchHit[] = [];
        for (const file of $sortedTagFiles) {
            for (const cat of file.categories) {
                for (const item of flattenLeaves(cat.items)) {
                    if (item.name.toLowerCase().includes(kw) || item.prompt.toLowerCase().includes(kw)) {
                        found.push({
                            fileId: file.fileId,
                            categoryId: cat.categoryId,
                            name: item.name,
                            prompt: item.prompt,
                        });
                    }
                }
            }
        }
        return found;
    })();
</script>

<div class="d2ps-tag-field d2ps-tag-field--top d2ps-tag-field--with-random" style:display={isActive ? 'flex' : 'none'}>
    <div class="d2ps-search">
        <input
            class="d2ps-search__input"
            type="text"
            placeholder={$t('search.placeholder')}
            bind:value={keyword}
        />
    </div>
    <div class="d2ps-tag-field">
        {#each results as item (item.fileId + item.categoryId + item.name + item.prompt)}
            {#if $isEditMode}
                <TagButton
                    name={item.name}
                    prompt={item.prompt}
                    onClickTag={(_p, _c) => onEditTag(item.fileId, item.categoryId, item.name, item.prompt)}
                    onDeleteItem={(name) => onDeleteItem(item.fileId, item.categoryId, name)}
                />
            {:else}
                <TagButton name={item.name} prompt={item.prompt} {onClickTag} />
            {/if}
        {/each}
        {#if keyword.trim() && results.length === 0}
            <span style="color: var(--descrip-text)">{$t('search.empty')}</span>
        {/if}
    </div>
</div>
