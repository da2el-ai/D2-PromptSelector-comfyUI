import { app } from "../../scripts/app.js";
import { loadCssFile } from "./utils.js";

const D2_PS_SETTING_LOCATION_ID = "D2.PromptSelector.ShowButtonLocation";
const D2_PS_SETTING_LOCATION_DEFAULT = "left-bottom";
const D2_PS_SETTING_X_MARGIN_ID = "D2.PromptSelector.ShowButtonHorizontalMargin";
const D2_PS_SETTING_X_MARGIN_DEFAULT = 50;
const D2_PS_SETTING_Y_MARGIN_ID = "D2.PromptSelector.ShowButtonVerticalMargin";
const D2_PS_SETTING_Y_MARGIN_DEFAULT = 10;

const D2_PS_BUTTON_CSS_FILEPATH = "/D2_prompt-selector/assets/css/D2_PS_ShowButton.css";
const D2_PS_DIALOG_CSS_FILEPATH = "/D2_prompt-selector/assets/css/D2_PS_Dialog.css";

/**
 * プロンプトセレクターダイアログ
 */
class D2_PromptConvertDialog {
    container = undefined;

    constructor() {
        this._createDialog();
        loadCssFile(D2_PS_DIALOG_CSS_FILEPATH);
    }

    /**
     * モーダルの表示
     */
    showModal() {
        // this.container.showModal();
        this.container.style.display = "block";
    }

    /**
     * モーダルの非表示
     */
    hideModal() {
        // this.container.showModal();
        this.container.style.display = "none";
    }
    
    _createDialog() {
        // 全体
        this.container = document.createElement("div");
        this.container.classList.add("d2-ps");
        document.body.appendChild(this.container);

        // 閉じるボタン
        const closeBtn = document.createElement("button");
        closeBtn.classList.add("d2-ps__close-btn");
        closeBtn.textContent = "CLOSE";
        closeBtn.addEventListener("click", () => {
            this.hideModal();
        });
        this.container.appendChild(closeBtn);

        // コンテンツ枠
        const content = document.createElement("div");
        content.classList.add("d2-ps__content");
        this.container.appendChild(content);



    }

    /**
     * プロンプトエリア作成
     * @param {string} placeholder
     * @returns HTMLElement
     */
    static createPromptArea(placeholder) {
        const textArea = document.createElement("textarea");
        textArea.classList.add("comfy-multiline-input", "d2-ps__prompt-area");
        textArea.placeholder = placeholder;
        return textArea;
    }

    /**
     * ボタン作成
     * @param {string} text
     * @param {function} onClick
     * @returns
     */
    static createButton(text, onClick) {
        const btn = document.createElement("button");
        btn.classList.add("d2-ps__btn");
        btn.textContent = text;
        btn.addEventListener("click", () => {
            onClick();
        });
        return btn;
    }
}

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

/**
 * ウィンドウ表示ボタンを作るクラス
 */
class D2_PS_ShowButton {
    constructor() {
        loadCssFile(D2_PS_BUTTON_CSS_FILEPATH);

        // this._visible = true;
        this._button = this._createButton();
        this.changeLocation();

        // // 表示切り替え
        // const visible = app.ui.settings.getSettingValue("D2.PromptSelector.Visible", true);
        // this.changeVisible(visible);
    }

    /**
     * ボタン位置
     */
    changeLocation(params = { type: "", value: "" }) {
        const location =
            params.type === "location"
                ? params.value
                : app.ui.settings.getSettingValue(D2_PS_SETTING_LOCATION_ID, D2_PS_SETTING_LOCATION_DEFAULT);
        const x =
            params.type === "x"
                ? params.value
                : app.ui.settings.getSettingValue(D2_PS_SETTING_X_MARGIN_ID, D2_PS_SETTING_X_MARGIN_DEFAULT);
        const y =
            params.type === "y"
                ? params.value
                : app.ui.settings.getSettingValue(D2_PS_SETTING_Y_MARGIN_ID, D2_PS_SETTING_Y_MARGIN_DEFAULT);

        this._button.setAttribute("data-location", location);

        this._button.style.left = "auto";
        this._button.style.right = "auto";
        this._button.style.top = "auto";
        this._button.style.bottom = "auto";

        if (location === "left-bottom") {
            this._button.style.left = `${x}px`;
            this._button.style.bottom = `${y}px`;
        } else if (location === "left-top") {
            this._button.style.left = `${x}px`;
            this._button.style.top = `${y}px`;
        } else if (location === "right-top") {
            this._button.style.right = `${x}px`;
            this._button.style.top = `${y}px`;
        } else if (location === "right-bottom") {
            this._button.style.right = `${x}px`;
            this._button.style.bottom = `${y}px`;
        }
    }

    /**
     * PSパネルが閉じられた
     */
    onPanelClosed() {
        this._button.style.display = "block";
        // this.floatContainer.changeVisible(bool);
    }

    /**
     * PSパネル表示
     */
    _showPanel() {
        this._button.style.display = "none";
        // this.floatContainer.changeVisible(bool);
    }

    /**
     * ボタン作成
     */
    _createButton() {
        const button = document.createElement("button");
        button.classList.add("p-button", "d2-ps-showbutton");
        button.textContent = "PS";
        button.addEventListener("click", function (event) {
            app.queuePrompt(event.shiftKey ? -1 : 0, count);
        });
        document.querySelector("body").appendChild(button);

        return button;
    }

    // /**
    //  * 設定からボタン設定を読む
    //  */
    // static _getCounts(string) {
    //     const setting = app.ui.settings.getSettingValue("D2.PromptSelector.BatchCount", D2_QUEUE_DEFAULT_COUNT);
    //     if (!setting || setting.trim() === "") return [];

    //     return setting
    //         .split(",")
    //         .map((item) => item.trim())
    //         .filter((item) => item !== "")
    //         .map((item) => Number(item));
    // }
}

(function () {
    const showButton = new D2_PS_ShowButton();

    // 表示ボタンの位置
    app.ui.settings.addSetting({
        id: D2_PS_SETTING_LOCATION_ID,
        name: "ShowButton Location",
        type: "combo",
        options: [
            { value: "left-top", text: "Left Top" },
            { value: "left-bottom", text: "Left Bottom" },
            { value: "right-top", text: "Right Top" },
            { value: "right-bottom", text: "Right Bottom" },
        ],
        defaultValue: D2_PS_SETTING_LOCATION_DEFAULT,
        onChange(value) {
            showButton.changeLocation({ type: "location", value: value });
        },
    });

    // 表示ボタンの座標：X
    app.ui.settings.addSetting({
        id: D2_PS_SETTING_X_MARGIN_ID,
        name: "ShowButton Horizontal Margin(px)",
        type: "number",
        defaultValue: D2_PS_SETTING_X_MARGIN_DEFAULT,
        onChange(value) {
            showButton.changeLocation({ type: "x", value: value });
        },
    });

    // 表示ボタンの座標：Y
    app.ui.settings.addSetting({
        id: D2_PS_SETTING_Y_MARGIN_ID,
        name: "ShowButton Vertical Margin(px)",
        type: "number",
        defaultValue: D2_PS_SETTING_Y_MARGIN_DEFAULT,
        onChange(value) {
            showButton.changeLocation({ type: "y", value: value });
        },
    });

    // app.ui.settings.addSetting({
    //     id: "D2.PromptSelector.Visible",
    //     name: "Show queue button",
    //     type: "boolean",
    //     defaultValue: true,
    //     onChange(value) {
    //         PromptSelector.changeVisible(value);
    //     },
    // });
})();
