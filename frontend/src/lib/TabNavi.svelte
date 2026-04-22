<script lang="ts">
    import { Constants } from '../Constants';
    import { isEditMode } from '../stores/ui';
    import { activeTabId } from '../stores/ui';
    import { sortedTagFiles } from '../stores/tags';

    // ファイル削除ハンドラ（親の PromptSelector が FileDeleteConfirmDialog → API → fetchTags → タブ切替を担当）
    export let onDeleteFile: (fileId: string) => void = () => {};

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
        <span class="d2ps-btn-wrapper">
            {#if $isEditMode && tabId !== SEARCH_TAB}
                <button
                    type="button"
                    class="d2ps-btn d2ps-btn--delete"
                    on:click={() => onDeleteFile(tabId)}
                    title="ファイルを削除"
                >
                    x
                </button>
            {/if}
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} text-base-foreground d2ps-tab__button"
                data-active={$activeTabId === tabId ? 'true' : 'false'}
                on:click={() => activeTabId.set(tabId)}
            >
                {tabId}
            </button>
        </span>
    {/each}
</div>
