import { Constants } from "./Constants";


/**
 * ウィンドウ表示ボタンを作るクラス
 */
class D2PS_ShowButton {

    static D2_PS_SETTING_LOCATION_ID = "D2.PromptSelector.ShowButtonLocation";
    static D2_PS_SETTING_LOCATION_DEFAULT = "left-bottom";
    static D2_PS_SETTING_X_MARGIN_ID = "D2.PromptSelector.ShowButtonHorizontalMargin";
    static D2_PS_SETTING_X_MARGIN_DEFAULT = 50;
    static D2_PS_SETTING_Y_MARGIN_ID = "D2.PromptSelector.ShowButtonVerticalMargin";
    static D2_PS_SETTING_Y_MARGIN_DEFAULT = 10;

    button: HTMLButtonElement;
    app: any;

    constructor(app:any, clickFunc:()=>void) {

        // this._visible = true;
        this.app = app;
        this.button = this._createButton(clickFunc);
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
                : this.app.ui.settings.getSettingValue(D2PS_ShowButton.D2_PS_SETTING_LOCATION_ID, D2PS_ShowButton.D2_PS_SETTING_LOCATION_DEFAULT);
        const x =
            params.type === "x"
                ? params.value
                : this.app.ui.settings.getSettingValue(D2PS_ShowButton.D2_PS_SETTING_X_MARGIN_ID, D2PS_ShowButton.D2_PS_SETTING_X_MARGIN_DEFAULT);
        const y =
            params.type === "y"
                ? params.value
                : this.app.ui.settings.getSettingValue(D2PS_ShowButton.D2_PS_SETTING_Y_MARGIN_ID, D2PS_ShowButton.D2_PS_SETTING_Y_MARGIN_DEFAULT);

        this.button.setAttribute("data-location", location);

        this.button.style.left = "auto";
        this.button.style.right = "auto";
        this.button.style.top = "auto";
        this.button.style.bottom = "auto";

        if (location === "left-bottom") {
            this.button.style.left = `${x}px`;
            this.button.style.bottom = `${y}px`;
        } else if (location === "left-top") {
            this.button.style.left = `${x}px`;
            this.button.style.top = `${y}px`;
        } else if (location === "right-top") {
            this.button.style.right = `${x}px`;
            this.button.style.top = `${y}px`;
        } else if (location === "right-bottom") {
            this.button.style.right = `${x}px`;
            this.button.style.bottom = `${y}px`;
        }
    }

    /**
     * ボタン作成
     */
    _createButton(clickFunc:()=>void): HTMLButtonElement {
        const button = document.createElement("button");
        button.classList.add(Constants.CSS_CLASS_BUTTON, Constants.CSS_CLASS_SHOW_BUTTON);
        button.textContent = "PS";
        button.addEventListener("click", function () {
            clickFunc();
        });
        document.querySelector("body")?.appendChild(button);

        return button;
    }
}

export {D2PS_ShowButton}
