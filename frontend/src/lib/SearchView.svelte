<script lang="ts">
  import TagButton from './TagButton.svelte';
  import { sortedTagFiles } from '../stores/tags';
  import { activeTabId } from '../stores/ui';
  import { Constants } from '../Constants';

  export let onClickTag: (prompt: string, closePanel: boolean) => void;

  const SEARCH_TAB = Constants.ICON_SEARCH;
  let keyword = '';

  $: isActive = $activeTabId === SEARCH_TAB;

  // 全タグをフラットに検索
  $: results = (() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return [];
    const found: { name: string; prompt: string }[] = [];
    for (const file of $sortedTagFiles) {
      for (const cat of file.categories) {
        for (const item of cat.items) {
          if (item.name.toLowerCase().includes(kw) || item.prompt.toLowerCase().includes(kw)) {
            found.push(item);
          }
        }
      }
    }
    return found;
  })();
</script>

<div
  class="d2ps-tag-field d2ps-tag-field--top d2ps-tag-field--with-random"
  style:display={isActive ? 'flex' : 'none'}
>
  <div class="d2ps-search">
    <input
      class="d2ps-search__input"
      type="text"
      placeholder="Search..."
      bind:value={keyword}
    />
  </div>
  <div class="d2ps-tag-field">
    {#each results as item (item.name + item.prompt)}
      <TagButton name={item.name} prompt={item.prompt} {onClickTag} />
    {/each}
    {#if keyword.trim() && results.length === 0}
      <span style="color: var(--descrip-text)">No results</span>
    {/if}
  </div>
</div>
