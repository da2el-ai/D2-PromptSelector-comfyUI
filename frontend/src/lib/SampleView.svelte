<script lang="ts">
    import { get } from 'svelte/store';
    import { sampleItem, isSampleLocked } from '../stores/ui';
    import type { SampleItem } from '../stores/ui';
    import { fetchTags } from '../stores/tags';
    import { imageUrl, uploadImage, deleteImage } from '../utils';
    import { t } from '../i18n';

    // 表示中の項目を編集ダイアログで開く（編集モード外でも有効）
    export let onEdit: (item: SampleItem) => void;

    let isDragOver = false;
    let errorMsg = '';
    let uploading = false;

    function handleUnlock() {
        isSampleLocked.set(false);
    }

    function handleDragOver(e: DragEvent) {
        if (!$sampleItem) return;
        e.preventDefault();
        isDragOver = true;
    }

    function handleDragLeave() {
        isDragOver = false;
    }

    // 画像/プレースホルダへの直接ドロップ：ダイアログを経由せず即時登録／差し替え
    async function handleDrop(e: DragEvent) {
        isDragOver = false;
        const item = $sampleItem;
        if (!item) return;
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;

        errorMsg = '';
        uploading = true;
        try {
            const res = await uploadImage(item.fileId, item.categoryId, item.name, file, file.name);
            if (res.error) {
                errorMsg = res.error === 'invalid_format' ? get(t)('tag.image.invalidFormat') : get(t)('common.error.generic');
                return;
            }
            // sampleItem の image を更新（fetchTags だけでは古いまま。固定中でも更新）
            if (res.image) {
                const newImage = res.image;
                sampleItem.update((s) => (s ? { ...s, image: newImage } : s));
            }
            await fetchTags();
        } catch {
            errorMsg = get(t)('common.error.generic');
        } finally {
            uploading = false;
        }
    }

    // 画像削除（×）：YAML をプレーン文字列に戻し、sampleItem.image をクリア
    async function handleDelete() {
        const item = $sampleItem;
        if (!item || !item.image) return;
        errorMsg = '';
        uploading = true;
        try {
            const res = await deleteImage(item.fileId, item.categoryId, item.name);
            if (res.error) {
                errorMsg = get(t)('common.error.generic');
                return;
            }
            sampleItem.update((s) => (s ? { ...s, image: undefined } : s));
            await fetchTags();
        } catch {
            errorMsg = get(t)('common.error.generic');
        } finally {
            uploading = false;
        }
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

    <!-- 画像エリア：ドロップで直接登録／差し替え -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="d2ps-sample__image"
        class:d2ps-sample__image--dragover={isDragOver}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
    >
        {#if $sampleItem?.image}
            <img src={imageUrl($sampleItem.image)} alt={$sampleItem.name} />
            <button class="d2ps-image-delete" on:click|preventDefault={handleDelete} title={$t('tag.image.delete')}
                >×</button
            >
        {:else}
            <div class="d2ps-sample__placeholder">
                {#if $sampleItem}<span class="d2ps-sample__drophint">{$t('tag.image.drop')}</span>{/if}
            </div>
        {/if}
    </div>

    <div class="d2ps-sample__prompt">
        {#if errorMsg}
            <span class="d2ps-sample__error">{errorMsg}</span>
        {:else if uploading}
            {$t('common.saving')}
        {:else if $sampleItem}
            {$sampleItem.prompt}
        {:else}
            <span class="d2ps-sample__empty">{$t('sample.empty')}</span>
        {/if}
    </div>
</div>
