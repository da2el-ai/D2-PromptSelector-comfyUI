<script lang="ts">
    import TagButton from './TagButton.svelte';
    import CategoryButton from './CategoryButton.svelte';
    import { isEditMode } from '../stores/ui';
    import { Constants } from '../Constants';
    import type { TagItem } from '../types';

    export let item: TagItem;
    export let onClickTag: (prompt: string, closePanel: boolean) => void;
    // 編集・削除コールバック（リーフノードのみ有効）
    export let onEditItem: ((name: string, prompt: string) => void) | undefined = undefined;
    export let onDeleteItem: ((name: string) => void) | undefined = undefined;
    // サンプルビュー更新（lock=false: ホバー / lock=true: ピン固定）
    export let onSample: ((item: TagItem, lock: boolean) => void) | undefined = undefined;
</script>

{#if item.children}
    <!-- グループノード：ランダムボタン + 子ノードを再帰レンダリング -->
    <div class="d2ps-tag-field d2ps-tag-field--with-random">
        <CategoryButton label={item.name} prompt={item.prompt} {onClickTag} />
        <div class="d2ps-tag-field">
            {#each item.children as child (child.name)}
                <svelte:self
                    item={child}
                    {onClickTag}
                    onEditItem={child.children ? undefined : onEditItem}
                    onDeleteItem={child.children ? undefined : onDeleteItem}
                    {onSample}
                />
            {/each}
        </div>
    </div>
{:else}
    <!-- リーフノード：タグボタン（編集モード時はクリックで編集ダイアログ＋削除ボタン付き） -->
    {#if $isEditMode && onEditItem && onDeleteItem}
        <TagButton
            name={item.name}
            prompt={item.prompt}
            image={item.image}
            onClickTag={(_p, _c) => onEditItem(item.name, item.prompt)}
            {onDeleteItem}
            onHover={onSample ? () => onSample(item, false) : undefined}
            onPin={onSample ? () => onSample(item, true) : undefined}
        />
    {:else}
        <TagButton
            name={item.name}
            prompt={item.prompt}
            image={item.image}
            {onClickTag}
            onHover={onSample ? () => onSample(item, false) : undefined}
            onPin={onSample ? () => onSample(item, true) : undefined}
        />
    {/if}
{/if}
