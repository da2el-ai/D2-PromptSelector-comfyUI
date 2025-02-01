declare var app: any;

// import { app } from "../../scripts/app.js";

import { loadCssFile } from "./utils.js";
import { D2PS_ShowButton } from "./D2PS_ShowButton.js";
import { D2PS_PromptSelector } from "./D2PS_PromptSelector.js";


const D2_PS_CSS_FILEPATH = "/D2_prompt-selector/assets/style.css";
loadCssFile(D2_PS_CSS_FILEPATH);

(function () {
    const promptSelector = new D2PS_PromptSelector();
    const showButton = new D2PS_ShowButton(app, ()=>{
        promptSelector.changeVisible();
    } );

    promptSelector.createControl();
    promptSelector.init();


    ////////////////////////////////
    // ボタン設定
    // 表示ボタンの位置
    app.ui.settings.addSetting({
        id: D2PS_ShowButton.D2_PS_SETTING_LOCATION_ID,
        name: "ShowButton Location",
        type: "combo",
        options: [
            { value: "left-top", text: "Left Top" },
            { value: "left-bottom", text: "Left Bottom" },
            { value: "right-top", text: "Right Top" },
            { value: "right-bottom", text: "Right Bottom" },
        ],
        defaultValue: D2PS_ShowButton.D2_PS_SETTING_LOCATION_DEFAULT,
        onChange(value:string) {
            showButton.changeLocation({ type: "location", value: value });
        },
    });

    // 表示ボタンの座標：X
    app.ui.settings.addSetting({
        id: D2PS_ShowButton.D2_PS_SETTING_X_MARGIN_ID,
        name: "ShowButton Horizontal Margin(px)",
        type: "number",
        defaultValue: D2PS_ShowButton.D2_PS_SETTING_X_MARGIN_DEFAULT,
        onChange(value:string) {
            showButton.changeLocation({ type: "x", value: value });
        },
    });

    // 表示ボタンの座標：Y
    app.ui.settings.addSetting({
        id: D2PS_ShowButton.D2_PS_SETTING_Y_MARGIN_ID,
        name: "ShowButton Vertical Margin(px)",
        type: "number",
        defaultValue: D2PS_ShowButton.D2_PS_SETTING_Y_MARGIN_DEFAULT,
        onChange(value:string) {
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
