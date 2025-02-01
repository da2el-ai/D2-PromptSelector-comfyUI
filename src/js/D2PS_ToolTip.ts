/**
プロンプトの内容を画面下部に表示
 */

import { D2PS_ElementBuilder } from './D2PS_ElementBuilder';
import { TOpts } from "./types";

declare var opts: TOpts;

class D2PS_ToolTip {
    static container: HTMLElement | undefined;
    static toHide = false;

    /**
     * 初期化
     */
    static init():HTMLElement {
        const self = D2PS_ToolTip;

        if (self.container !== undefined) return self.container;

        self.container = D2PS_ElementBuilder.toolTipContainer();
        // self.container.addEventListener('animationend', () => {
        //     self.container?.setAttribute('data-show', '');
        // });
        // document.body.appendChild(self.container);

        return self.container;
    }

    /**
     * ツールチップの表示は有効か
     */
    static get isEnabled(): boolean {
        // return opts.d2_ps_enable_tooltip;
        return true;
    }

    /**
     * タグを表示
     */
    static showTip(tag: string) {
        const self = D2PS_ToolTip;
        if (!self.isEnabled || !self.container) return;

        self.toHide = false;
        self.container.textContent = tag;
        // self.container.setAttribute('data-show', 'true');
    }

    /**
     * 非表示
     */
    static hideTip() {
        const self = D2PS_ToolTip;
        if (!self.isEnabled || !self.container) return;

        self.toHide = true;

        // setTimeout(() => {
        //     if (!self.toHide) return;

        //     self.container.setAttribute('data-show', 'false');
        // }, 500);
        self.container.textContent = "";
    }
}

export { D2PS_ToolTip };
