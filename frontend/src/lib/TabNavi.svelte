<script lang="ts">
    import { Constants } from '../Constants';
    import { activeTabId } from '../stores/ui';
    import { sortedTagFiles } from '../stores/tags';

    const SEARCH_TAB = Constants.ICON_SEARCH;

    // タブリスト（ファイル名 + 検索タブ）
    $: tabs = [...$sortedTagFiles.map((f) => f.fileId), SEARCH_TAB];

    // 初期タブを設定（ファイルデータが揃ってから最初のファイルを選択）
    $: if ($activeTabId === '' && $sortedTagFiles.length > 0) {
        activeTabId.set($sortedTagFiles[0].fileId);
    }
</script>

<div class="d2ps-tab">
    {#each tabs as tabId (tabId)}
        <!-- <button
            class="{Constants.CSS_CLASS_BUTTON_BASE} d2ps-tab__button"
            data-active={$activeTabId === tabId ? 'true' : 'false'}
            on:click={() => activeTabId.set(tabId)}
        > -->
        <button
            class="{Constants.CSS_CLASS_BUTTON_BASE} text-base-foreground d2ps-tab__button"
            data-active={$activeTabId === tabId ? 'true' : 'false'}
            on:click={() => activeTabId.set(tabId)}
        >
            {tabId}
        </button>
    {/each}
</div>
