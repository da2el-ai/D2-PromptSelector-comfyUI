<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Constants } from '../Constants';
    import { t } from '../i18n';

    const dispatch = createEventDispatcher<{
        confirm: void;
        cancel: void;
    }>();

    let dialog: HTMLDialogElement;

    export function open() {
        dialog.showModal();
    }

    function handleConfirm() {
        dialog.close();
        dispatch('confirm');
    }

    function handleCancel() {
        dialog.close();
        dispatch('cancel');
    }
</script>

<dialog class="d2ps-dialog-root" bind:this={dialog}>
    <div class="d2ps-dialog">
        <p class="d2ps-dialog__message">
            {@html $t('migration.message')}
        </p>
        <div class="d2ps-dialog__buttons">
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY}"
                on:click={handleConfirm}>{$t('migration.confirm')}</button
            >
            <button
                class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_SECONDARY}"
                on:click={handleCancel}>{$t('common.cancel')}</button
            >
        </div>
    </div>
</dialog>
