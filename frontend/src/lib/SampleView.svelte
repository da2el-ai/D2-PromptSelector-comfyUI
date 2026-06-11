<script lang="ts">
    import { sampleItem, isSampleLocked } from '../stores/ui';
    import type { SampleItem } from '../stores/ui';
    import { t } from '../i18n';

    // 表示中の項目を編集ダイアログで開く（編集モード外でも有効）
    export let onEdit: (item: SampleItem) => void;

    function handleUnlock() {
        isSampleLocked.set(false);
    }
</script>

<div class="d2ps-sample" data-is-pinned={$isSampleLocked}>
    <div class="d2ps-sample__header">
        {#if $isSampleLocked}
            <button class="d2ps-sample__btn" on:click={handleUnlock} title={$t('sample.unpin')}>🔓</button>
        {/if}
        <span class="d2ps-sample__spacer"></span>
        {#if $sampleItem}
            <button class="d2ps-sample__btn" on:click={() => onEdit($sampleItem)} title={$t('sample.edit')}>✏️</button>
        {/if}
    </div>

    <!-- 画像表示は手順4で実装。現状はプレースホルダ -->
    <div class="d2ps-sample__image">
        <div class="d2ps-sample__placeholder"></div>
    </div>

    <div class="d2ps-sample__prompt">
        {#if $sampleItem}
            {$sampleItem.prompt}
        {:else}
            <span class="d2ps-sample__empty">{$t('sample.empty')}</span>
        {/if}
    </div>
</div>
