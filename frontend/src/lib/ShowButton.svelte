<script lang="ts">
    import { Constants } from '../Constants';
    import { backupCount } from '../stores/settings';

    export let app: any;
    export let onToggle: () => void;

    let location = Constants.D2_PS_SETTING_LOCATION_DEFAULT;
    let xMargin = Constants.D2_PS_SETTING_X_MARGIN_DEFAULT;
    let yMargin = Constants.D2_PS_SETTING_Y_MARGIN_DEFAULT;

    $: style = (() => {
        const base = 'left: auto; right: auto; top: auto; bottom: auto;';
        if (location === 'left-bottom') return `${base} left: ${xMargin}px; bottom: ${yMargin}px;`;
        if (location === 'left-top') return `${base} left: ${xMargin}px; top: ${yMargin}px;`;
        if (location === 'right-top') return `${base} right: ${xMargin}px; top: ${yMargin}px;`;
        if (location === 'right-bottom') return `${base} right: ${xMargin}px; bottom: ${yMargin}px;`;
        return base;
    })();

    export function setup() {
        app.ui.settings.addSetting({
            id: Constants.D2_PS_SETTING_LOCATION_ID,
            name: 'ShowButton Location',
            type: 'combo',
            options: [
                { value: 'left-top', text: 'Left Top' },
                { value: 'left-bottom', text: 'Left Bottom' },
                { value: 'right-top', text: 'Right Top' },
                { value: 'right-bottom', text: 'Right Bottom' },
            ],
            defaultValue: Constants.D2_PS_SETTING_LOCATION_DEFAULT,
            onChange(value: string) {
                location = value;
            },
        });

        app.ui.settings.addSetting({
            id: Constants.D2_PS_SETTING_X_MARGIN_ID,
            name: 'ShowButton Horizontal Margin(px)',
            type: 'number',
            defaultValue: Constants.D2_PS_SETTING_X_MARGIN_DEFAULT,
            onChange(value: number) {
                xMargin = value;
            },
        });

        app.ui.settings.addSetting({
            id: Constants.D2_PS_SETTING_Y_MARGIN_ID,
            name: 'ShowButton Vertical Margin(px)',
            type: 'number',
            defaultValue: Constants.D2_PS_SETTING_Y_MARGIN_DEFAULT,
            onChange(value: number) {
                yMargin = value;
            },
        });

        app.ui.settings.addSetting({
            id: Constants.D2_PS_SETTING_BACKUP_COUNT_ID,
            name: 'Backup Count (0 = disabled, max 100)',
            type: 'number',
            defaultValue: Constants.D2_PS_SETTING_BACKUP_COUNT_DEFAULT,
            onChange(value: number) {
                backupCount.set(value);
            },
        });
    }
</script>

<button
    class="{Constants.CSS_CLASS_BUTTON_BASE} {Constants.CSS_CLSSS_BUTTON_PRIMARY} d2ps-show-button"
    data-location={location}
    {style}
    on:click={onToggle}
>
    PS
</button>
