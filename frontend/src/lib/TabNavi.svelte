<script lang="ts">
  import { Constants } from '../Constants';
  import { activeTabId } from '../stores/ui';
  import { sortedTagFiles } from '../stores/tags';

  const SEARCH_TAB = Constants.ICON_SEARCH;

  // タブリスト（ファイル名 + 検索タブ）
  $: tabs = [...$sortedTagFiles.map((f) => f.fileId), SEARCH_TAB];

  // 初期タブを設定
  $: if ($activeTabId === '' && tabs.length > 0) {
    activeTabId.set(tabs[0]);
  }
</script>

<div class={Constants.CSS_CLASS_TAB}>
  {#each tabs as tabId (tabId)}
    <button
      class="p-button {Constants.CSS_CLASS_TAB_BUTTON}"
      data-active={$activeTabId === tabId ? 'true' : 'false'}
      on:click={() => activeTabId.set(tabId)}
    >
      {tabId}
    </button>
  {/each}
</div>
