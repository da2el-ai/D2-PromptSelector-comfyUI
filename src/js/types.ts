type TConfig = {
    sort: string[];
};

type TTagsArray = string[];
type TTagsDict = { [key: string]: any };
type TTags = TTagsArray | TTagsDict | { [key: string]: string };

type TTagButtonClick = (tag: string, toNegative: boolean) => void;

type TElementParams = {
    size?: string;
    color?: string;
    onClick?: (e: MouseEvent) => void;
    onRightClick?: (e: MouseEvent) => void;
    onChange?: (checked: boolean) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
};

type TOpts = {
    d2_ps_enable_tooltip: boolean;
    d2_ps_enable_realtime_search: boolean;
};

export type { TConfig, TTags, TTagsArray, TTagsDict, TTagButtonClick, TElementParams, TOpts };
