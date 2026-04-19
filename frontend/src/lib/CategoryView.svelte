<script lang="ts">
    import TagButton from './TagButton.svelte';
    import type { TagFile } from '../types';
    import { activeTabId } from '../stores/ui';
    import { Constants } from '../Constants';

    export let file: TagFile;
    export let onClickTag: (prompt: string, closePanel: boolean) => void;

    $: isActive = $activeTabId === file.fileId;

    /** カテゴリの全アイテムから `{ prompt1, | prompt2, | ... }` を生成 */
    function getRandomPrompt(items: { name: string; prompt: string }[]): string {
        const parts = items.map((item) => `${item.prompt},`);
        return parts.length > 0 ? `{ ${parts.join(' | ')} }` : '';
    }
</script>

<div class="d2ps-tag-field {Constants.CSS_CLASS_TAG_FIELD_TOP}" style:display={isActive ? 'flex' : 'none'}>
    {#each file.categories as category (category.categoryId)}
        {@const randomPrompt = getRandomPrompt(category.items)}
        <div class="d2ps-tag-field {Constants.CSS_CLASS_TAG_FIELD_RANDOM}">
            <!-- カテゴリ名ボタン（ランダムプロンプト挿入） -->
            <button
                class="p-button {Constants.CSS_CLASS_RANDOM_BUTTON}{randomPrompt ? '' : ' d2ps-button--none'}"
                on:click={(e) => randomPrompt && onClickTag(randomPrompt, e.ctrlKey || e.metaKey)}
                on:contextmenu|preventDefault={(e) => randomPrompt && onClickTag(randomPrompt, true)}
            >
                {category.categoryId}
            </button>
            <!-- 個別タグボタン群 -->
            <div class="d2ps-tag-field">
                {#each category.items as item (item.name)}
                    <TagButton name={item.name} prompt={item.prompt} {onClickTag} />
                {/each}
            </div>
        </div>
    {/each}
</div>
