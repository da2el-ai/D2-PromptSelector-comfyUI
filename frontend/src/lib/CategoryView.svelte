<script lang="ts">
  import TagButton from './TagButton.svelte';
  import type { TagFile } from '../types';
  import { activeTabId } from '../stores/ui';

  export let file: TagFile;
  export let onClickTag: (prompt: string, closePanel: boolean) => void;

  $: isActive = $activeTabId === file.fileId;
</script>

<div
  class="d2ps-tag-field d2ps-tag-field--top"
  style:display={isActive ? 'flex' : 'none'}
>
  {#each file.categories as category (category.categoryId)}
    {#each category.items as item (item.name)}
      <TagButton name={item.name} prompt={item.prompt} {onClickTag} />
    {/each}
  {/each}
</div>
