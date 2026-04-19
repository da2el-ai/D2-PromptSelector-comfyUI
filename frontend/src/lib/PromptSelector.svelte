<script lang="ts">
  import { Constants } from '../Constants';
  import { isPanelVisible } from '../stores/ui';
  import { sortedTagFiles, fetchTags } from '../stores/tags';
  import TabNavi from './TabNavi.svelte';
  import CategoryView from './CategoryView.svelte';
  import SearchView from './SearchView.svelte';
  import ToolTip from './ToolTip.svelte';
  import { insertTextToTarget } from '../utils';
  import { get } from 'svelte/store';
  import { targetTextArea } from '../stores/ui';

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
</script>

{#if $isPanelVisible}
  <div class={Constants.CSS_CLASS_TOP_CONTAINER}>
    <!-- コントローラー -->
    <div class={Constants.CSS_CLASS_CONTROL_CONTAINER}>
      <button
        class="{Constants.CSS_CLASS_BUTTON} {Constants.CSS_CLASS_BUTTON_OPEN}"
        on:click={handleReload}
      >🔄</button>
      <button
        class="{Constants.CSS_CLASS_BUTTON} {Constants.CSS_CLASS_BUTTON_OPEN}"
        on:click={handleClose}
      >✖</button>
    </div>

    <!-- タグラッパー -->
    <div class={Constants.CSS_CLASS_TAG_WRAPPER}>
      <div class={Constants.CSS_CLASS_TAG_CONTAINER}>
        <!-- 全ファイル（常にDOM、display で表示切替） -->
        {#each $sortedTagFiles as file (file.fileId)}
          <CategoryView {file} onClickTag={handleClickTag} />
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
