import { Constants } from './Constants';
import { D2PS_ElementBuilder } from './D2PS_ElementBuilder';
import { TConfig, TTags, TTagsDict } from './types';

class D2PS_TabButton {
    button: HTMLButtonElement;
    id: string;

    constructor(id: string, onClick: (id: string) => void) {
        this.id = id;
        this.button = D2PS_ElementBuilder.tabButton(id, {
            onClick: () => {
                onClick(this.id);
            },
        });
    }

    setActive(bool: boolean) {
        this.button.setAttribute('data-active', bool ? 'true' : 'false');
    }
}

///////////////////
class D2PS_TabNavi {
    tabButtons: D2PS_TabButton[];
    activeCategory: string;
    onChange: () => void;

    constructor(onChange: () => void) {
        this.onChange = onChange;
        this.tabButtons = [];
        this.activeCategory = '';
    }

    /**
     * タブ切り替えボタンを作る
     */
    createTabNavi(config: TConfig, tags: TTags): HTMLElement {
        const idList = Object.keys(tags);
        const sortItems: string[] = Array.from(new Set([...config.sort, ...idList]));
        const container = D2PS_ElementBuilder.tabContainer();
        // 検索用タブを追加
        sortItems.push(Constants.ICON_SEARCH);

        sortItems.forEach((id: string) => {
            // ソート指定にあるが、実際にタグカテゴリが存在しないものは無視
            if (id !== Constants.ICON_SEARCH && !(tags as TTagsDict).hasOwnProperty(id)) return;

            const tabButton = new D2PS_TabButton(id, () => {
                this.$_clickTabButton(id);
            });
            this.tabButtons.push(tabButton);
            container.appendChild(tabButton.button);
        });
        this.$_clickTabButton(sortItems[0]);
        return container;
    }

    /**
     * タブボタンがクリックされた
     */
    private $_clickTabButton(id: string) {
        this.activeCategory = id;

        this.tabButtons.forEach((tabButton) => {
            tabButton.setActive(tabButton.id === id);
        });

        this.onChange();
    }
}

export { D2PS_TabNavi };
