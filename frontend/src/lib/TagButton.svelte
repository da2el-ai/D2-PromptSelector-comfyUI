<script lang="ts">
    import { Constants } from '../Constants';
    import { tooltip } from '../stores/ui';
    import { isEditMode } from '../stores/ui';

    export let name: string;
    export let prompt: string;
    export let onClickTag: (prompt: string, closePanel: boolean) => void;
    export let onDeleteItem: ((name: string) => void) | undefined = undefined;

    function handleClick(e: MouseEvent) {
        onClickTag(prompt, e.ctrlKey);
    }

    function handleRightClick(e: MouseEvent) {
        e.preventDefault();
        onClickTag(prompt, true);
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span class="d2ps-btn-wrapper">
    {#if $isEditMode}
        <button class="d2ps-btn d2ps-btn--delete" on:click={() => onDeleteItem?.(name)} title="削除">x</button>
    {/if}
    <button
        class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-btn d2ps-btn--tag"
        on:click={handleClick}
        on:contextmenu={handleRightClick}
        on:mouseenter={() => tooltip.set(prompt)}
        on:mouseleave={() => tooltip.set('')}
    >
        {name}
    </button>
</span>
