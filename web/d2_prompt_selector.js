import { app } from "../../scripts/app.js";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const loadCssFile = (filePath) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = filePath;
  document.head.appendChild(link);
};
class Constants {
}
__publicField(Constants, "CSS_CLASS_BUTTON", "p-button");
// PromptSelect表示ボタン
__publicField(Constants, "CSS_CLASS_SHOW_BUTTON", "d2ps-show-button");
///////////////////////////
// 全体
__publicField(Constants, "CSS_CLASS_TOP_CONTAINER", "d2ps");
// コントローラーコンテナ
__publicField(Constants, "CSS_CLASS_CONTROL_CONTAINER", "d2ps__controller");
// タグコンテナ
__publicField(Constants, "CSS_CLASS_TAG_WRAPPER", "d2ps__tag-wrapper");
__publicField(Constants, "CSS_CLASS_TAG_CONTAINER", "d2ps__tag-container");
// タグボタンコンテナ
__publicField(Constants, "CSS_CLASS_TAG_FIELD", "d2ps-tag-field");
__publicField(Constants, "CSS_CLASS_TAG_FIELD_TOP", "d2ps-tag-field--top");
__publicField(Constants, "CSS_CLASS_TAG_FIELD_RANDOM", "d2ps-tag-field--with-random");
///////////////////////////
__publicField(Constants, "CSS_CLASS_BUTTON_BASE", "d2ps-button");
__publicField(Constants, "CSS_CLASS_TAG_BUTTON", "d2ps-button--tag");
__publicField(Constants, "CSS_CLASS_RANDOM_BUTTON", "d2ps-button--random");
///////////////////////////
// 検索
__publicField(Constants, "CSS_CLASS_SEARCH", "d2ps-search");
__publicField(Constants, "CSS_CLASS_SEARCH_INPUT", "d2ps-search__input");
__publicField(Constants, "ICON_SEARCH", "🔍");
///////////////////////////
// タブ
__publicField(Constants, "CSS_CLASS_TAB", "d2ps-tab");
__publicField(Constants, "CSS_CLASS_TAB_BUTTON", "d2ps-tab__button");
///////////////////////////
// ツールチップ
__publicField(Constants, "CSS_CLASS_TOOLTIP_CONTAINER", "d2ps-tooltip-container");
__publicField(Constants, "API_GET_TAGS", "/D2_prompt-selector/get_tags");
const _D2PS_ShowButton = class _D2PS_ShowButton {
  constructor(app2, clickFunc) {
    __publicField(this, "button");
    __publicField(this, "app");
    this.app = app2;
    this.button = this._createButton(clickFunc);
    this.changeLocation();
  }
  /**
   * ボタン位置
   */
  changeLocation(params = { type: "", value: "" }) {
    const location = params.type === "location" ? params.value : this.app.ui.settings.getSettingValue(_D2PS_ShowButton.D2_PS_SETTING_LOCATION_ID, _D2PS_ShowButton.D2_PS_SETTING_LOCATION_DEFAULT);
    const x = params.type === "x" ? params.value : this.app.ui.settings.getSettingValue(_D2PS_ShowButton.D2_PS_SETTING_X_MARGIN_ID, _D2PS_ShowButton.D2_PS_SETTING_X_MARGIN_DEFAULT);
    const y = params.type === "y" ? params.value : this.app.ui.settings.getSettingValue(_D2PS_ShowButton.D2_PS_SETTING_Y_MARGIN_ID, _D2PS_ShowButton.D2_PS_SETTING_Y_MARGIN_DEFAULT);
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
  _createButton(clickFunc) {
    var _a;
    const button = document.createElement("button");
    button.classList.add(Constants.CSS_CLASS_BUTTON, Constants.CSS_CLASS_SHOW_BUTTON);
    button.textContent = "PS";
    button.addEventListener("click", function() {
      clickFunc();
    });
    (_a = document.querySelector("body")) == null ? void 0 : _a.appendChild(button);
    return button;
  }
};
__publicField(_D2PS_ShowButton, "D2_PS_SETTING_LOCATION_ID", "D2.PromptSelector.ShowButtonLocation");
__publicField(_D2PS_ShowButton, "D2_PS_SETTING_LOCATION_DEFAULT", "left-bottom");
__publicField(_D2PS_ShowButton, "D2_PS_SETTING_X_MARGIN_ID", "D2.PromptSelector.ShowButtonHorizontalMargin");
__publicField(_D2PS_ShowButton, "D2_PS_SETTING_X_MARGIN_DEFAULT", 50);
__publicField(_D2PS_ShowButton, "D2_PS_SETTING_Y_MARGIN_ID", "D2.PromptSelector.ShowButtonVerticalMargin");
__publicField(_D2PS_ShowButton, "D2_PS_SETTING_Y_MARGIN_DEFAULT", 10);
let D2PS_ShowButton = _D2PS_ShowButton;
class D2PS_ElementBuilder {
  /**
   * ボタン作成
   * @param {*} text ボタンに表示するテキスト
   * @param {*} param1 サイズ、色の指定
   */
  static baseButton(text, { size = "", color = "" }) {
    const button = document.createElement("button");
    button.classList.add("p-button");
    if (size) button.classList.add(size);
    if (color) button.classList.add(color);
    button.textContent = text;
    return button;
  }
  /**
   * シンプルボタン
   */
  static simpleButton(text, { onClick = () => {
  } }) {
    const button = D2PS_ElementBuilder.baseButton(text, {
      size: "",
      color: ""
    });
    button.classList.add(Constants.CSS_CLASS_BUTTON_BASE, "d2ps-button--open");
    button.addEventListener("click", onClick);
    return button;
  }
  /**
   * 全体を覆うコンテナ
   */
  static psContainer(id = "") {
    const container = document.createElement("div");
    container.id = id;
    container.classList.add(Constants.CSS_CLASS_TAG_CONTAINER);
    return container;
  }
  /**
   * ネガティブ送信チェックボックス
   */
  static negativeCheckbox(text, { onChange }) {
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.classList.add("d2ps-checkbox");
    checkbox.addEventListener("change", () => {
      onChange(checkbox.checked);
    });
    const labelText = document.createElement("span");
    labelText.classList.add("d2ps-label__text");
    labelText.textContent = text;
    const label = document.createElement("label");
    label.classList.add("d2ps-label");
    label.appendChild(checkbox);
    label.appendChild(labelText);
    return label;
  }
  /**
   * タブコンテナ
   */
  static tabContainer() {
    const container = document.createElement("div");
    container.classList.add(Constants.CSS_CLASS_TAB);
    return container;
  }
  /**
   * タブボタン
   */
  static tabButton(text, { onClick = () => {
  } }) {
    const button = D2PS_ElementBuilder.baseButton(text, {});
    button.addEventListener("click", onClick);
    button.classList.add(Constants.CSS_CLASS_TAB_BUTTON);
    return button;
  }
  // /**
  //  * タグのカテゴリ（ファイル単位）を覆うコンテナ
  //  */
  // static categoryContainer(id: string = ''): HTMLElement {
  //     const container = document.createElement('div');
  //     container.id = id;
  //     container.classList.add('d2ps-category-container', 'tabitem', 'gradio-tabitem');
  //     return container;
  // }
  // /**
  //  * グループボタン（ランダムボタン）とタグフィールドを格納する枠
  //  */
  // static groupContainer(): HTMLElement {
  //     const container = document.createElement('div');
  //     container.classList.add('d2ps-group-container');
  //     return container;
  // }
  /**
   * タグボタン、グループを格納する枠
   */
  static tagField() {
    const field = document.createElement("div");
    field.classList.add(Constants.CSS_CLASS_TAG_FIELD);
    return field;
  }
  /**
   * タグボタン
   */
  static tagButton(title, {
    onClick = () => {
    },
    onRightClick = () => {
    },
    onMouseEnter = () => {
    },
    onMouseLeave = () => {
    },
    color = ""
  }) {
    const button = D2PS_ElementBuilder.baseButton(title, { color });
    button.classList.add(Constants.CSS_CLASS_BUTTON_BASE, Constants.CSS_CLASS_TAG_BUTTON);
    button.addEventListener("click", onClick);
    button.addEventListener("contextmenu", onRightClick);
    button.addEventListener("mouseenter", onMouseEnter);
    button.addEventListener("mouseleave", onMouseLeave);
    return button;
  }
  /**
   * ランダムボタン
   */
  static randomButton(title, {
    onClick = () => {
    },
    onRightClick = () => {
    },
    onMouseEnter = () => {
    },
    onMouseLeave = () => {
    },
    color = "primary"
  }) {
    const button = D2PS_ElementBuilder.baseButton(title, { color });
    button.classList.add(Constants.CSS_CLASS_BUTTON_BASE, Constants.CSS_CLASS_RANDOM_BUTTON);
    button.addEventListener("click", onClick);
    button.addEventListener("contextmenu", onRightClick);
    button.addEventListener("mouseenter", onMouseEnter);
    button.addEventListener("mouseleave", onMouseLeave);
    return button;
  }
  /**
   * ツールチップ
   */
  static toolTipContainer() {
    const container = document.createElement("div");
    container.classList.add(Constants.CSS_CLASS_TOOLTIP_CONTAINER);
    return container;
  }
  /**
   * 検索入力エリア
   */
  // static searchContainer(input: HTMLInputElement, { onClick = () => {} }: TElementParams) {
  static searchContainer(input) {
    const container = document.createElement("div");
    container.classList.add(Constants.CSS_CLASS_SEARCH);
    container.appendChild(input);
    return container;
  }
  static searchInput() {
    const input = document.createElement("input");
    input.classList.add(Constants.CSS_CLASS_SEARCH_INPUT);
    return input;
  }
}
class D2PS_TabButton {
  constructor(id, onClick) {
    __publicField(this, "button");
    __publicField(this, "id");
    this.id = id;
    this.button = D2PS_ElementBuilder.tabButton(id, {
      onClick: () => {
        onClick(this.id);
      }
    });
  }
  setActive(bool) {
    this.button.setAttribute("data-active", bool ? "true" : "false");
  }
}
class D2PS_TabNavi {
  constructor(onChange) {
    __publicField(this, "tabButtons");
    __publicField(this, "activeCategory");
    __publicField(this, "onChange");
    this.onChange = onChange;
    this.tabButtons = [];
    this.activeCategory = "";
  }
  /**
   * タブ切り替えボタンを作る
   */
  createTabNavi(config, tags) {
    const idList = Object.keys(tags);
    const sortItems = Array.from(/* @__PURE__ */ new Set([...config.sort, ...idList]));
    const container = D2PS_ElementBuilder.tabContainer();
    sortItems.push(Constants.ICON_SEARCH);
    sortItems.forEach((id) => {
      if (id !== Constants.ICON_SEARCH && !tags.hasOwnProperty(id)) return;
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
  $_clickTabButton(id) {
    this.activeCategory = id;
    this.tabButtons.forEach((tabButton) => {
      tabButton.setActive(tabButton.id === id);
    });
    this.onChange();
  }
}
const _D2PS_ToolTip = class _D2PS_ToolTip {
  /**
   * 初期化
   */
  static init() {
    const self = _D2PS_ToolTip;
    if (self.container !== void 0) return self.container;
    self.container = D2PS_ElementBuilder.toolTipContainer();
    return self.container;
  }
  /**
   * ツールチップの表示は有効か
   */
  static get isEnabled() {
    return true;
  }
  /**
   * タグを表示
   */
  static showTip(tag) {
    const self = _D2PS_ToolTip;
    if (!self.container) return;
    self.toHide = false;
    self.container.textContent = tag;
  }
  /**
   * 非表示
   */
  static hideTip() {
    const self = _D2PS_ToolTip;
    if (!self.container) return;
    self.toHide = true;
    self.container.textContent = "";
  }
};
__publicField(_D2PS_ToolTip, "container");
__publicField(_D2PS_ToolTip, "toHide", false);
let D2PS_ToolTip = _D2PS_ToolTip;
const tagConvert = (orgTags) => {
  const conved = { ___: [] };
  function traverse(tags) {
    if (Array.isArray(tags)) {
      conved.___.push(...tags);
      return;
    }
    Object.keys(tags).forEach((key) => {
      const value = tags[key];
      if (typeof value === "string") {
        conved[key] = value;
        return;
      }
      traverse(value);
    });
  }
  traverse(orgTags);
  return conved;
};
const tagSearch = (convedTags, keyword) => {
  const filtered = {};
  convedTags.___.filter((value) => {
    return value.includes(keyword);
  }).forEach((value) => {
    filtered[value] = value;
  });
  Object.keys(convedTags).forEach((key) => {
    if (key === "___") return;
    const value = convedTags[key];
    if (key.includes(keyword) || value.includes(keyword)) {
      filtered[key] = value;
    }
  });
  return filtered;
};
const _D2PS_Search = class _D2PS_Search {
  constructor() {
    __publicField(this, "container");
    __publicField(this, "input");
  }
  /**
   * タグ一覧を受け取って検索用に変換
   */
  static setTags(tags) {
    _D2PS_Search.convedTags = tagConvert(tags);
  }
  /**
   * タグ入力コンテナ作成
   */
  createSearchContainer(onSearch) {
    this.input = D2PS_ElementBuilder.searchInput();
    this.input.addEventListener("keydown", (ev) => {
      {
        const value = this.input ? this.input.value : "";
        onSearch(tagSearch(_D2PS_Search.convedTags, value));
      }
    });
    this.container = D2PS_ElementBuilder.searchContainer(this.input);
    return this.container;
  }
};
__publicField(_D2PS_Search, "convedTags", { ___: [] });
let D2PS_Search = _D2PS_Search;
class D2PS_Category {
  // constructor(categoryId: string, onClick: TTagButtonClick, onRightClick: TTagButtonClick) {
  constructor(categoryId, onClick) {
    __publicField(this, "onClick");
    // onRightClick: TTagButtonClick;
    __publicField(this, "categoryId", "");
    __publicField(this, "container");
    this.categoryId = categoryId;
    this.onClick = onClick;
    this.container = D2PS_ElementBuilder.tagField();
    this.container.classList.add(Constants.CSS_CLASS_TAG_FIELD_TOP);
    this.container.style.display = "none";
  }
  /**
   * 検索を作る
   */
  createSearch() {
    this.container.classList.add(Constants.CSS_CLASS_TAG_FIELD_RANDOM);
    const search = new D2PS_Search();
    const searchContainer = search.createSearchContainer((filtered) => {
      const children = this.container.children;
      if (children.length >= 2) {
        children[1].remove();
      }
      const buttonField = D2PS_ElementBuilder.tagField();
      this.container.appendChild(buttonField);
      this.$_createButtons(filtered, "").forEach((button) => {
        buttonField.appendChild(button);
      });
    });
    this.container.appendChild(searchContainer);
    return this.container;
  }
  /**
   * カテゴリーを作る
   */
  createCategory(tags) {
    this.$_createButtons(tags, this.categoryId).forEach((button) => {
      this.container.appendChild(button);
    });
    return this.container;
  }
  /**
   * ボタンかフィールドを配列で受け取る
   * @param tags
   * @param prefix 階層テキスト
   * @returns
   */
  $_createButtons(tags, prefix = "") {
    if (Array.isArray(tags)) {
      return tags.map((tag) => {
        return this.$_createTagButton("tag", tag, `${tag},`, "secondary");
      });
    }
    return Object.keys(tags).map((key) => {
      const values = tags[key];
      const randomKey = `${prefix}:${key}`;
      if (typeof values === "string") {
        return this.$_createTagButton("tag", key, `${values},`, "");
      }
      const field = D2PS_ElementBuilder.tagField();
      field.classList.add(Constants.CSS_CLASS_TAG_FIELD_RANDOM);
      const randomPrompt = this.$_getWildCardPrompt(values);
      if (randomPrompt) {
        field.appendChild(this.$_createTagButton("random", key, randomPrompt, ""));
      } else {
        field.appendChild(this.$_createTagButton("random", key, randomPrompt, "d2ps-button--none"));
      }
      const buttonField = D2PS_ElementBuilder.tagField();
      field.appendChild(buttonField);
      this.$_createButtons(values, randomKey).forEach((button) => {
        buttonField.appendChild(button);
      });
      return field;
    });
  }
  /**
   * 配列、連想配列から文字列を連結してワイルドカードプロンプトを生成
   */
  $_getWildCardPrompt(value) {
    if (Array.isArray(value)) {
      return `{ ${value.map((str) => `${str},`).join(" | ")} }`;
    }
    const values = Object.values(value);
    if (values.some((v) => typeof v === "object" && v !== null)) {
      return "";
    }
    const validValues = values.filter((v) => typeof v === "string").map((v) => `${v},`);
    return validValues.length > 0 ? `{ ${validValues.join(" | ")} }` : "";
  }
  /**
   * タグボタンを作成
   * @param title ボタンに表示するテキスト
   * @param value プロンプトタグ
   * @param color ボタン色
   * @returns ボタン
   */
  $_createTagButton(type, title, value, color = "primary", tooltip) {
    const param = {
      onClick: (e) => {
        e.preventDefault();
        this.onClick(value, e.metaKey || e.ctrlKey);
      },
      // onRightClick: (e: MouseEvent) => {
      //     e.preventDefault();
      //     this.onRightClick(value, e.metaKey || e.ctrlKey);
      // },
      onMouseEnter: () => {
        D2PS_ToolTip.showTip(tooltip || value);
      },
      onMouseLeave: () => {
        D2PS_ToolTip.hideTip();
      },
      color
    };
    if (type === "random") {
      return D2PS_ElementBuilder.randomButton(title, param);
    } else {
      return D2PS_ElementBuilder.tagButton(title, param);
    }
  }
}
class D2PS_PromptSelectorUnit {
  // onRightClick: TTagButtonClick;
  /**
   * コンストラクタ
   */
  // constructor(onClick: TTagButtonClick, onRightClick: TTagButtonClick) {
  constructor(onClick) {
    // type: string;
    __publicField(this, "container");
    __publicField(this, "tagWrapper");
    __publicField(this, "visible");
    __publicField(this, "toNegative");
    __publicField(this, "tags");
    __publicField(this, "config");
    __publicField(this, "categories");
    __publicField(this, "tabNavi");
    __publicField(this, "onClick");
    this.container = document.createElement("div");
    this.tagWrapper = document.createElement("div");
    this.visible = false;
    this.toNegative = false;
    this.tags = {};
    this.categories = [];
    this.onClick = onClick;
  }
  /**
   * 閉じるボタンなど基本コントローラー作成
   */
  createControl(reloadClick) {
    this.container = document.createElement("div");
    this.container.classList.add(Constants.CSS_CLASS_TOP_CONTAINER);
    document.body.appendChild(this.container);
    const controllerArea = document.createElement("div");
    controllerArea.classList.add(Constants.CSS_CLASS_CONTROL_CONTAINER);
    this.container.appendChild(controllerArea);
    const reloadButton = D2PS_ElementBuilder.simpleButton("🔄", {
      onClick: async () => {
        await reloadClick();
      }
    });
    controllerArea.appendChild(reloadButton);
    const closeButton = D2PS_ElementBuilder.simpleButton("✖", {
      onClick: () => {
        this.changeVisible();
      }
    });
    controllerArea.appendChild(closeButton);
    this.tagWrapper = document.createElement("div");
    this.tagWrapper.classList.add(Constants.CSS_CLASS_TAG_WRAPPER);
    this.container.appendChild(this.tagWrapper);
    this.container.appendChild(D2PS_ToolTip.init());
    this.changeVisible(false);
  }
  /**
   * 初期化
   */
  init(tags, config) {
    this.tags = tags;
    this.config = config;
    let tagContainer = document.querySelector(`.${Constants.CSS_CLASS_TAG_CONTAINER}`);
    if (tagContainer) {
      tagContainer.remove();
      this.categories = [];
    }
    tagContainer = this.$_render();
    this.tagWrapper.appendChild(tagContainer);
  }
  /**
   * 表示状態切り替え
   */
  changeVisible(bool = void 0) {
    this.visible = bool !== void 0 ? bool : !this.visible;
    this.container.style.display = this.visible ? "grid" : "none";
  }
  /**
   * タグエリア全体を作る
   */
  $_render() {
    const tagContainer = D2PS_ElementBuilder.psContainer("");
    this.$_renderCategory(tagContainer);
    tagContainer.appendChild(this.$_renderTabNavi());
    this.$_changeCategory();
    return tagContainer;
  }
  /**
   * タブ切り替えを作る
   */
  $_renderTabNavi() {
    this.tabNavi = new D2PS_TabNavi(() => {
      this.$_changeCategory();
    });
    return this.tabNavi.createTabNavi(this.config, this.tags);
  }
  /**
   * アクティブカテゴリーを切り替える
   */
  $_changeCategory() {
    this.categories.forEach((category) => {
      if (this.tabNavi.activeCategory === category.categoryId) {
        category.container.style.display = "flex";
      } else {
        category.container.style.display = "none";
      }
    });
  }
  /**
   * タグカテゴリを作る
   */
  $_renderCategory(parentContainer) {
    Object.keys(this.tags).forEach((categoryId) => {
      const category = new D2PS_Category(
        categoryId,
        this.onClick
      );
      const categoryContainer2 = category.createCategory(this.tags[categoryId]);
      parentContainer.appendChild(categoryContainer2);
      this.categories.push(category);
    });
    const searchCategory = new D2PS_Category(
      "🔍",
      this.onClick
    );
    const categoryContainer = searchCategory.createSearch();
    parentContainer.appendChild(categoryContainer);
    this.categories.push(searchCategory);
  }
}
class D2PS_PromptSelector {
  /**
   * コンストラクタ
   */
  constructor() {
    __publicField(this, "tags");
    __publicField(this, "config");
    __publicField(this, "psUnit");
    __publicField(this, "targetTextArea");
    this.psUnit = new D2PS_PromptSelectorUnit(this.onTagClick.bind(this));
    this.tags = {};
    this.targetTextArea = void 0;
    document.addEventListener("focus", (e) => {
      if (e.target.tagName.toLowerCase() === "textarea") {
        this.targetTextArea = e.target;
      }
    }, true);
  }
  /**
   * 表示切り替えボタンなどを作成
   * 再読み込みボタンの動作も指定
   */
  createControl() {
    this.psUnit.createControl(() => {
      this.init();
    });
  }
  /**
   * 初期化
   */
  async init() {
    await this.getTags();
    this.psUnit.init(this.tags, this.config);
  }
  /**
   * 表示状態切り替え
   */
  changeVisible() {
    this.psUnit.changeVisible();
  }
  /**
   * タグファイルをjsonで取得
   * @returns object タグリスト
   */
  async getTags() {
    const response = await fetch(`${Constants.API_GET_TAGS}?${(/* @__PURE__ */ new Date()).getTime()}`);
    const tags = await response.json();
    this.config = tags.__config__;
    delete tags["__config__"];
    this.tags = tags;
    D2PS_Search.setTags(tags);
  }
  /**
   * タグボタンクリック
   * @param tag 
   * @param toNegative 
   */
  // onTagClick(tag: string, toNegative: boolean = false) {
  onTagClick(tag) {
    if (!this.targetTextArea) return;
    const tag2 = `${tag} `;
    const startPos = this.targetTextArea.selectionStart;
    const endPos = this.targetTextArea.selectionEnd;
    const currentValue = this.targetTextArea.value;
    const beforeText = currentValue.substring(0, startPos);
    const afterText = currentValue.substring(endPos);
    this.targetTextArea.value = beforeText + tag2 + afterText;
    const newPosition = startPos + tag2.length;
    this.targetTextArea.setSelectionRange(newPosition, newPosition);
    this.targetTextArea.focus();
  }
  // onTagRightClick(tag: string, toNegative: boolean = false) {
  //     // this.$_addTag(tag, toNegative);
  //     // console.log("aaa right click", tag, toNegative);
  // }
}
const D2_PS_CSS_FILEPATH = "/D2_prompt-selector/assets/style.css";
loadCssFile(D2_PS_CSS_FILEPATH);
(function() {
  const promptSelector = new D2PS_PromptSelector();
  const showButton = new D2PS_ShowButton(app, () => {
    promptSelector.changeVisible();
  });
  promptSelector.createControl();
  promptSelector.init();
  app.ui.settings.addSetting({
    id: D2PS_ShowButton.D2_PS_SETTING_LOCATION_ID,
    name: "ShowButton Location",
    type: "combo",
    options: [
      { value: "left-top", text: "Left Top" },
      { value: "left-bottom", text: "Left Bottom" },
      { value: "right-top", text: "Right Top" },
      { value: "right-bottom", text: "Right Bottom" }
    ],
    defaultValue: D2PS_ShowButton.D2_PS_SETTING_LOCATION_DEFAULT,
    onChange(value) {
      showButton.changeLocation({ type: "location", value });
    }
  });
  app.ui.settings.addSetting({
    id: D2PS_ShowButton.D2_PS_SETTING_X_MARGIN_ID,
    name: "ShowButton Horizontal Margin(px)",
    type: "number",
    defaultValue: D2PS_ShowButton.D2_PS_SETTING_X_MARGIN_DEFAULT,
    onChange(value) {
      showButton.changeLocation({ type: "x", value });
    }
  });
  app.ui.settings.addSetting({
    id: D2PS_ShowButton.D2_PS_SETTING_Y_MARGIN_ID,
    name: "ShowButton Vertical Margin(px)",
    type: "number",
    defaultValue: D2PS_ShowButton.D2_PS_SETTING_Y_MARGIN_DEFAULT,
    onChange(value) {
      showButton.changeLocation({ type: "y", value });
    }
  });
})();
//# sourceMappingURL=d2_prompt_selector.js.map
