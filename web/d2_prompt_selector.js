import { app } from "../../scripts/app.js";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
const BASE = "/D2_prompt-selector";
function parseTagsResponse(raw) {
  const configKey = "__config__";
  const result = [];
  for (const [fileId, categories] of Object.entries(raw)) {
    if (fileId === configKey) continue;
    const tagFile = { fileId, categories: [] };
    for (const [categoryId, items] of Object.entries(categories)) {
      if (categoryId === configKey || items == null) continue;
      const tagItems = [];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (typeof item === "string") {
            tagItems.push({ name: item, prompt: item });
          }
        }
      } else {
        for (const [name, prompt] of Object.entries(items)) {
          tagItems.push({ name, prompt: String(prompt) });
        }
      }
      const category = { categoryId, items: tagItems };
      tagFile.categories.push(category);
    }
    result.push(tagFile);
  }
  return result;
}
function insertTextToTarget(textarea, text2) {
  var _a2;
  const nativeInputValueSetter = (_a2 = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )) == null ? void 0 : _a2.set;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  const newValue = before + text2 + after;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(textarea, newValue);
  } else {
    textarea.value = newValue;
  }
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  const newCursor = start + text2.length;
  textarea.setSelectionRange(newCursor, newCursor);
  textarea.focus();
}
function loadCssFile(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = href;
  document.head.appendChild(link);
}
async function apiGet(endpoint) {
  const res = await fetch(BASE + endpoint);
  return res.json();
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a && typeof a === "object" || typeof a === "function";
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    for (const callback of callbacks) {
      callback(void 0);
    }
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
  let value;
  subscribe(store, (_) => value = _)();
  return value;
}
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null) node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.data === data) return;
  text2.data = /** @type {string} */
  data;
}
function set_input_value(input, value) {
  input.value = value == null ? "" : value;
}
function set_style(node, key, value, important) {
  if (value == null) {
    node.style.removeProperty(key);
  } else {
    node.style.setProperty(key, value, "");
  }
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length) binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
function flush_render_callbacks(fns) {
  const filtered = [];
  const targets = [];
  render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
  targets.forEach((c) => c());
  render_callbacks = filtered;
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
    // parent group
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block)) return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2) block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
function ensure_array_like(array_like_or_iterator) {
  return (array_like_or_iterator == null ? void 0 : array_like_or_iterator.length) !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
}
function destroy_block(block, lookup) {
  block.d(1);
  lookup.delete(block.key);
}
function outro_and_destroy_block(block, lookup) {
  transition_out(block, 1, 1, () => {
    lookup.delete(block.key);
  });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block2, next, get_context) {
  let o = old_blocks.length;
  let n = list.length;
  let i = o;
  const old_indexes = {};
  while (i--) old_indexes[old_blocks[i].key] = i;
  const new_blocks = [];
  const new_lookup = /* @__PURE__ */ new Map();
  const deltas = /* @__PURE__ */ new Map();
  const updates = [];
  i = n;
  while (i--) {
    const child_ctx = get_context(ctx, list, i);
    const key = get_key(child_ctx);
    let block = lookup.get(key);
    if (!block) {
      block = create_each_block2(key, child_ctx);
      block.c();
    } else {
      updates.push(() => block.p(child_ctx, dirty));
    }
    new_lookup.set(key, new_blocks[i] = block);
    if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
  }
  const will_move = /* @__PURE__ */ new Set();
  const did_move = /* @__PURE__ */ new Set();
  function insert2(block) {
    transition_in(block, 1);
    block.m(node, next);
    lookup.set(block.key, block);
    next = block.first;
    n--;
  }
  while (o && n) {
    const new_block = new_blocks[n - 1];
    const old_block = old_blocks[o - 1];
    const new_key = new_block.key;
    const old_key = old_block.key;
    if (new_block === old_block) {
      next = new_block.first;
      o--;
      n--;
    } else if (!new_lookup.has(old_key)) {
      destroy(old_block, lookup);
      o--;
    } else if (!lookup.has(new_key) || will_move.has(new_key)) {
      insert2(new_block);
    } else if (did_move.has(old_key)) {
      o--;
    } else if (deltas.get(new_key) > deltas.get(old_key)) {
      did_move.add(new_key);
      insert2(new_block);
    } else {
      will_move.add(old_key);
      o--;
    }
  }
  while (o--) {
    const old_block = old_blocks[o];
    if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
  }
  while (n) insert2(new_blocks[n - 1]);
  run_all(updates);
  return new_blocks;
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  add_render_callback(() => {
    const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
    if (component.$$.on_destroy) {
      component.$$.on_destroy.push(...new_on_destroy);
    } else {
      run_all(new_on_destroy);
    }
    component.$$.on_mount = [];
  });
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    flush_render_callbacks($$.after_update);
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles = null, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
      if (ready) make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro) transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor);
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
  constructor() {
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    __publicField(this, "$$");
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    __publicField(this, "$$set");
  }
  /** @returns {void} */
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  /**
   * @template {Extract<keyof Events, string>} K
   * @param {K} type
   * @param {((e: Events[K]) => void) | null | undefined} callback
   * @returns {() => void}
   */
  $on(type, callback) {
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    };
  }
  /**
   * @param {Partial<Props>} props
   * @returns {void}
   */
  $set(props) {
    if (this.$$set && !is_empty(props)) {
      this.$$.skip_bound = true;
      this.$$set(props);
      this.$$.skip_bound = false;
    }
  }
}
const PUBLIC_VERSION = "4";
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update2(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set, update2) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update: update2, subscribe: subscribe2 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  if (!stores_array.every(Boolean)) {
    throw new Error("derived() expects stores as input, got a falsy value");
  }
  const auto = fn.length < 2;
  return readable(initial_value, (set, update2) => {
    let started = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set, update2);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map(
      (store, i) => subscribe(
        store,
        (value) => {
          values[i] = value;
          pending &= ~(1 << i);
          if (started) {
            sync();
          }
        },
        () => {
          pending |= 1 << i;
        }
      )
    );
    started = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
      started = false;
    };
  });
}
const isPanelVisible = writable(false);
const activeTabId = writable("");
const targetTextArea = writable(null);
const tooltip = writable("");
const allTags = writable([]);
const tabOrder = writable([]);
const sortedTagFiles = derived([allTags, tabOrder], ([$allTags, $tabOrder]) => {
  if ($tabOrder.length === 0) return $allTags;
  return [...$allTags].sort((a, b) => {
    const ia = $tabOrder.indexOf(a.fileId);
    const ib = $tabOrder.indexOf(b.fileId);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
});
async function fetchTags() {
  const raw = await apiGet("/get_tags");
  const config = raw["__config__"];
  if (config == null ? void 0 : config.sort) {
    tabOrder.set(config.sort);
  }
  allTags.set(parseTagsResponse(raw));
}
if (typeof window !== "undefined")
  (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
class Constants {
}
__publicField(Constants, "API_GET_TAGS", "/D2_prompt-selector/get_tags");
// ComfyUI 標準ボタンクラス
__publicField(Constants, "CSS_CLASS_BUTTON", "inline-flex items-center justify-center cursor-pointer touch-manipulation appearance-none border-none text-sm font-inter transition-colors bg-primary-background text-base-foreground hover:bg-primary-background-hover h-8 rounded-lg px-4 font-light");
// PromptSelector 表示ボタン
__publicField(Constants, "CSS_CLASS_SHOW_BUTTON", "d2ps-show-button");
// パネル全体
__publicField(Constants, "CSS_CLASS_TOP_CONTAINER", "d2ps");
// コントローラー
__publicField(Constants, "CSS_CLASS_CONTROL_CONTAINER", "d2ps__controller");
__publicField(Constants, "CSS_CLASS_BUTTON_OPEN", "d2ps-button--open");
// タグラッパー
__publicField(Constants, "CSS_CLASS_TAG_WRAPPER", "d2ps__tag-wrapper");
__publicField(Constants, "CSS_CLASS_TAG_CONTAINER", "d2ps__tag-container");
// タグフィールド
__publicField(Constants, "CSS_CLASS_TAG_FIELD", "d2ps-tag-field");
__publicField(Constants, "CSS_CLASS_TAG_FIELD_TOP", "d2ps-tag-field--top");
__publicField(Constants, "CSS_CLASS_TAG_FIELD_RANDOM", "d2ps-tag-field--with-random");
// タグボタン
__publicField(Constants, "CSS_CLASS_TAG_BUTTON", "d2ps-button--tag");
__publicField(Constants, "CSS_CLASS_RANDOM_BUTTON", "d2ps-button--random");
// タブ（p-button が基底クラス）
__publicField(Constants, "CSS_CLASS_TAB", "d2ps-tab");
__publicField(Constants, "CSS_CLASS_TAB_BUTTON", "d2ps-tab__button");
// 検索
__publicField(Constants, "CSS_CLASS_SEARCH", "d2ps-search");
__publicField(Constants, "CSS_CLASS_SEARCH_INPUT", "d2ps-search__input");
// ツールチップ
__publicField(Constants, "CSS_CLASS_TOOLTIP_CONTAINER", "d2ps-tooltip-container");
// アイコン
__publicField(Constants, "ICON_SEARCH", "🔍");
// Settings
__publicField(Constants, "D2_PS_SETTING_LOCATION_ID", "D2.PromptSelector.ShowButtonLocation");
__publicField(Constants, "D2_PS_SETTING_LOCATION_DEFAULT", "left-bottom");
__publicField(Constants, "D2_PS_SETTING_X_MARGIN_ID", "D2.PromptSelector.ShowButtonHorizontalMargin");
__publicField(Constants, "D2_PS_SETTING_X_MARGIN_DEFAULT", 50);
__publicField(Constants, "D2_PS_SETTING_Y_MARGIN_ID", "D2.PromptSelector.ShowButtonVerticalMargin");
__publicField(Constants, "D2_PS_SETTING_Y_MARGIN_DEFAULT", 10);
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i];
  return child_ctx;
}
function create_each_block$3(key_1, ctx) {
  let button;
  let t0_value = (
    /*tabId*/
    ctx[5] + ""
  );
  let t0;
  let t1;
  let button_data_active_value;
  let mounted;
  let dispose;
  function click_handler() {
    return (
      /*click_handler*/
      ctx[3](
        /*tabId*/
        ctx[5]
      )
    );
  }
  return {
    key: key_1,
    first: null,
    c() {
      button = element("button");
      t0 = text(t0_value);
      t1 = space();
      attr(button, "class", "p-button " + Constants.CSS_CLASS_TAB_BUTTON);
      attr(button, "data-active", button_data_active_value = /*$activeTabId*/
      ctx[1] === /*tabId*/
      ctx[5] ? "true" : "false");
      this.first = button;
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t0);
      append(button, t1);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*tabs*/
      1 && t0_value !== (t0_value = /*tabId*/
      ctx[5] + "")) set_data(t0, t0_value);
      if (dirty & /*$activeTabId, tabs*/
      3 && button_data_active_value !== (button_data_active_value = /*$activeTabId*/
      ctx[1] === /*tabId*/
      ctx[5] ? "true" : "false")) {
        attr(button, "data-active", button_data_active_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$6(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_value = ensure_array_like(
    /*tabs*/
    ctx[0]
  );
  const get_key = (ctx2) => (
    /*tabId*/
    ctx2[5]
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$3(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
  }
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", Constants.CSS_CLASS_TAB);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$activeTabId, tabs*/
      3) {
        each_value = ensure_array_like(
          /*tabs*/
          ctx2[0]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, destroy_block, create_each_block$3, null, get_each_context$3);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
}
function instance$6($$self, $$props, $$invalidate) {
  let tabs;
  let $activeTabId;
  let $sortedTagFiles;
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(1, $activeTabId = $$value));
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(2, $sortedTagFiles = $$value));
  const SEARCH_TAB = Constants.ICON_SEARCH;
  const click_handler = (tabId) => activeTabId.set(tabId);
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$sortedTagFiles*/
    4) {
      $$invalidate(0, tabs = [...$sortedTagFiles.map((f) => f.fileId), SEARCH_TAB]);
    }
    if ($$self.$$.dirty & /*$activeTabId, tabs*/
    3) {
      if ($activeTabId === "" && tabs.length > 0) {
        activeTabId.set(tabs[0]);
      }
    }
  };
  return [tabs, $activeTabId, $sortedTagFiles, click_handler];
}
class TabNavi extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {});
  }
}
function create_fragment$5(ctx) {
  let button;
  let t;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t = text(
        /*name*/
        ctx[0]
      );
      attr(button, "class", Constants.CSS_CLASS_BUTTON + " d2ps-button--tag");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t);
      if (!mounted) {
        dispose = [
          listen(
            button,
            "click",
            /*handleClick*/
            ctx[2]
          ),
          listen(
            button,
            "contextmenu",
            /*handleRightClick*/
            ctx[3]
          ),
          listen(
            button,
            "mouseenter",
            /*mouseenter_handler*/
            ctx[5]
          ),
          listen(
            button,
            "mouseleave",
            /*mouseleave_handler*/
            ctx[6]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*name*/
      1) set_data(
        t,
        /*name*/
        ctx2[0]
      );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$5($$self, $$props, $$invalidate) {
  let { name } = $$props;
  let { prompt } = $$props;
  let { onClickTag } = $$props;
  function handleClick(e) {
    onClickTag(prompt, e.ctrlKey);
  }
  function handleRightClick(e) {
    e.preventDefault();
    onClickTag(prompt, true);
  }
  const mouseenter_handler = () => tooltip.set(prompt);
  const mouseleave_handler = () => tooltip.set("");
  $$self.$$set = ($$props2) => {
    if ("name" in $$props2) $$invalidate(0, name = $$props2.name);
    if ("prompt" in $$props2) $$invalidate(1, prompt = $$props2.prompt);
    if ("onClickTag" in $$props2) $$invalidate(4, onClickTag = $$props2.onClickTag);
  };
  return [
    name,
    prompt,
    handleClick,
    handleRightClick,
    onClickTag,
    mouseenter_handler,
    mouseleave_handler
  ];
}
class TagButton extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 0, prompt: 1, onClickTag: 4 });
  }
}
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i];
  return child_ctx;
}
function create_each_block_1(key_1, ctx) {
  let first;
  let tagbutton;
  let current;
  tagbutton = new TagButton({
    props: {
      name: (
        /*item*/
        ctx[7].name
      ),
      prompt: (
        /*item*/
        ctx[7].prompt
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[1]
      )
    }
  });
  return {
    key: key_1,
    first: null,
    c() {
      first = empty();
      create_component(tagbutton.$$.fragment);
      this.first = first;
    },
    m(target, anchor) {
      insert(target, first, anchor);
      mount_component(tagbutton, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const tagbutton_changes = {};
      if (dirty & /*file*/
      1) tagbutton_changes.name = /*item*/
      ctx[7].name;
      if (dirty & /*file*/
      1) tagbutton_changes.prompt = /*item*/
      ctx[7].prompt;
      if (dirty & /*onClickTag*/
      2) tagbutton_changes.onClickTag = /*onClickTag*/
      ctx[1];
      tagbutton.$set(tagbutton_changes);
    },
    i(local) {
      if (current) return;
      transition_in(tagbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tagbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(first);
      }
      destroy_component(tagbutton, detaching);
    }
  };
}
function create_each_block$2(key_1, ctx) {
  let first;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let current;
  let each_value_1 = ensure_array_like(
    /*category*/
    ctx[4].items
  );
  const get_key = (ctx2) => (
    /*item*/
    ctx2[7].name
  );
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
  }
  return {
    key: key_1,
    first: null,
    c() {
      first = empty();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      this.first = first;
    },
    m(target, anchor) {
      insert(target, first, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*file, onClickTag*/
      3) {
        each_value_1 = ensure_array_like(
          /*category*/
          ctx[4].items
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value_1.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(first);
        detach(each_1_anchor);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
    }
  };
}
function create_fragment$4(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let current;
  let each_value = ensure_array_like(
    /*file*/
    ctx[0].categories
  );
  const get_key = (ctx2) => (
    /*category*/
    ctx2[4].categoryId
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$2(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
  }
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "d2ps-tag-field d2ps-tag-field--top");
      set_style(
        div,
        "display",
        /*isActive*/
        ctx[2] ? "flex" : "none"
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*file, onClickTag*/
      3) {
        each_value = ensure_array_like(
          /*file*/
          ctx2[0].categories
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
        check_outros();
      }
      if (dirty & /*isActive*/
      4) {
        set_style(
          div,
          "display",
          /*isActive*/
          ctx2[2] ? "flex" : "none"
        );
      }
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
  let isActive;
  let $activeTabId;
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(3, $activeTabId = $$value));
  let { file } = $$props;
  let { onClickTag } = $$props;
  $$self.$$set = ($$props2) => {
    if ("file" in $$props2) $$invalidate(0, file = $$props2.file);
    if ("onClickTag" in $$props2) $$invalidate(1, onClickTag = $$props2.onClickTag);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$activeTabId, file*/
    9) {
      $$invalidate(2, isActive = $activeTabId === file.fileId);
    }
  };
  return [file, onClickTag, isActive, $activeTabId];
}
class CategoryView extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, { file: 0, onClickTag: 1 });
  }
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  return child_ctx;
}
function create_each_block$1(key_1, ctx) {
  let first;
  let tagbutton;
  let current;
  tagbutton = new TagButton({
    props: {
      name: (
        /*item*/
        ctx[8].name
      ),
      prompt: (
        /*item*/
        ctx[8].prompt
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[0]
      )
    }
  });
  return {
    key: key_1,
    first: null,
    c() {
      first = empty();
      create_component(tagbutton.$$.fragment);
      this.first = first;
    },
    m(target, anchor) {
      insert(target, first, anchor);
      mount_component(tagbutton, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const tagbutton_changes = {};
      if (dirty & /*results*/
      4) tagbutton_changes.name = /*item*/
      ctx[8].name;
      if (dirty & /*results*/
      4) tagbutton_changes.prompt = /*item*/
      ctx[8].prompt;
      if (dirty & /*onClickTag*/
      1) tagbutton_changes.onClickTag = /*onClickTag*/
      ctx[0];
      tagbutton.$set(tagbutton_changes);
    },
    i(local) {
      if (current) return;
      transition_in(tagbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tagbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(first);
      }
      destroy_component(tagbutton, detaching);
    }
  };
}
function create_if_block$1(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "No results";
      set_style(span, "color", "var(--descrip-text)");
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_fragment$3(ctx) {
  let div2;
  let div0;
  let input;
  let t0;
  let div1;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t1;
  let show_if = (
    /*keyword*/
    ctx[1].trim() && /*results*/
    ctx[2].length === 0
  );
  let current;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(
    /*results*/
    ctx[2]
  );
  const get_key = (ctx2) => (
    /*item*/
    ctx2[8].name + /*item*/
    ctx2[8].prompt
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$1(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
  }
  let if_block = show_if && create_if_block$1();
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      input = element("input");
      t0 = space();
      div1 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t1 = space();
      if (if_block) if_block.c();
      attr(input, "class", "d2ps-search__input");
      attr(input, "type", "text");
      attr(input, "placeholder", "Search...");
      attr(div0, "class", "d2ps-search");
      attr(div1, "class", "d2ps-tag-field");
      attr(div2, "class", "d2ps-tag-field d2ps-tag-field--top d2ps-tag-field--with-random");
      set_style(
        div2,
        "display",
        /*isActive*/
        ctx[3] ? "flex" : "none"
      );
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, input);
      set_input_value(
        input,
        /*keyword*/
        ctx[1]
      );
      append(div2, t0);
      append(div2, div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div1, null);
        }
      }
      append(div1, t1);
      if (if_block) if_block.m(div1, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          input,
          "input",
          /*input_input_handler*/
          ctx[6]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*keyword*/
      2 && input.value !== /*keyword*/
      ctx2[1]) {
        set_input_value(
          input,
          /*keyword*/
          ctx2[1]
        );
      }
      if (dirty & /*results, onClickTag*/
      5) {
        each_value = ensure_array_like(
          /*results*/
          ctx2[2]
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$1, t1, get_each_context$1);
        check_outros();
      }
      if (dirty & /*keyword, results*/
      6) show_if = /*keyword*/
      ctx2[1].trim() && /*results*/
      ctx2[2].length === 0;
      if (show_if) {
        if (if_block) ;
        else {
          if_block = create_if_block$1();
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*isActive*/
      8) {
        set_style(
          div2,
          "display",
          /*isActive*/
          ctx2[3] ? "flex" : "none"
        );
      }
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      if (if_block) if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let isActive;
  let results;
  let $sortedTagFiles;
  let $activeTabId;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(4, $sortedTagFiles = $$value));
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(5, $activeTabId = $$value));
  let { onClickTag } = $$props;
  const SEARCH_TAB = Constants.ICON_SEARCH;
  let keyword = "";
  function input_input_handler() {
    keyword = this.value;
    $$invalidate(1, keyword);
  }
  $$self.$$set = ($$props2) => {
    if ("onClickTag" in $$props2) $$invalidate(0, onClickTag = $$props2.onClickTag);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$activeTabId*/
    32) {
      $$invalidate(3, isActive = $activeTabId === SEARCH_TAB);
    }
    if ($$self.$$.dirty & /*keyword, $sortedTagFiles*/
    18) {
      $$invalidate(2, results = (() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return [];
        const found = [];
        for (const file of $sortedTagFiles) {
          for (const cat of file.categories) {
            for (const item of cat.items) {
              if (item.name.toLowerCase().includes(kw) || item.prompt.toLowerCase().includes(kw)) {
                found.push(item);
              }
            }
          }
        }
        return found;
      })());
    }
  };
  return [
    onClickTag,
    keyword,
    results,
    isActive,
    $sortedTagFiles,
    $activeTabId,
    input_input_handler
  ];
}
class SearchView extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, { onClickTag: 0 });
  }
}
function create_fragment$2(ctx) {
  let div;
  let t;
  return {
    c() {
      div = element("div");
      t = text(
        /*$tooltip*/
        ctx[0]
      );
      attr(div, "class", Constants.CSS_CLASS_TOOLTIP_CONTAINER);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$tooltip*/
      1) set_data(
        t,
        /*$tooltip*/
        ctx2[0]
      );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let $tooltip;
  component_subscribe($$self, tooltip, ($$value) => $$invalidate(0, $tooltip = $$value));
  return [$tooltip];
}
class ToolTip extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let div3;
  let div0;
  let button0;
  let t1;
  let button1;
  let t3;
  let div2;
  let div1;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t4;
  let searchview;
  let t5;
  let tabnavi;
  let t6;
  let tooltip2;
  let current;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(
    /*$sortedTagFiles*/
    ctx[1]
  );
  const get_key = (ctx2) => (
    /*file*/
    ctx2[5].fileId
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
  }
  searchview = new SearchView({
    props: { onClickTag: (
      /*handleClickTag*/
      ctx[4]
    ) }
  });
  tabnavi = new TabNavi({});
  tooltip2 = new ToolTip({});
  return {
    c() {
      div3 = element("div");
      div0 = element("div");
      button0 = element("button");
      button0.textContent = "🔄";
      t1 = space();
      button1 = element("button");
      button1.textContent = "✖";
      t3 = space();
      div2 = element("div");
      div1 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t4 = space();
      create_component(searchview.$$.fragment);
      t5 = space();
      create_component(tabnavi.$$.fragment);
      t6 = space();
      create_component(tooltip2.$$.fragment);
      attr(button0, "class", Constants.CSS_CLASS_BUTTON + " " + Constants.CSS_CLASS_BUTTON_OPEN);
      attr(button1, "class", Constants.CSS_CLASS_BUTTON + " " + Constants.CSS_CLASS_BUTTON_OPEN);
      attr(div0, "class", Constants.CSS_CLASS_CONTROL_CONTAINER);
      attr(div1, "class", Constants.CSS_CLASS_TAG_CONTAINER);
      attr(div2, "class", Constants.CSS_CLASS_TAG_WRAPPER);
      attr(div3, "class", Constants.CSS_CLASS_TOP_CONTAINER);
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div0);
      append(div0, button0);
      append(div0, t1);
      append(div0, button1);
      append(div3, t3);
      append(div3, div2);
      append(div2, div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div1, null);
        }
      }
      append(div1, t4);
      mount_component(searchview, div1, null);
      append(div1, t5);
      mount_component(tabnavi, div1, null);
      append(div3, t6);
      mount_component(tooltip2, div3, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "click",
            /*handleReload*/
            ctx[2]
          ),
          listen(
            button1,
            "click",
            /*handleClose*/
            ctx[3]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*$sortedTagFiles, handleClickTag*/
      18) {
        each_value = ensure_array_like(
          /*$sortedTagFiles*/
          ctx2[1]
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block, t4, get_each_context);
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(searchview.$$.fragment, local);
      transition_in(tabnavi.$$.fragment, local);
      transition_in(tooltip2.$$.fragment, local);
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(searchview.$$.fragment, local);
      transition_out(tabnavi.$$.fragment, local);
      transition_out(tooltip2.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      destroy_component(searchview);
      destroy_component(tabnavi);
      destroy_component(tooltip2);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block(key_1, ctx) {
  let first;
  let categoryview;
  let current;
  categoryview = new CategoryView({
    props: {
      file: (
        /*file*/
        ctx[5]
      ),
      onClickTag: (
        /*handleClickTag*/
        ctx[4]
      )
    }
  });
  return {
    key: key_1,
    first: null,
    c() {
      first = empty();
      create_component(categoryview.$$.fragment);
      this.first = first;
    },
    m(target, anchor) {
      insert(target, first, anchor);
      mount_component(categoryview, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const categoryview_changes = {};
      if (dirty & /*$sortedTagFiles*/
      2) categoryview_changes.file = /*file*/
      ctx[5];
      categoryview.$set(categoryview_changes);
    },
    i(local) {
      if (current) return;
      transition_in(categoryview.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(categoryview.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(first);
      }
      destroy_component(categoryview, detaching);
    }
  };
}
function create_fragment$1(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*$isPanelVisible*/
    ctx[0] && create_if_block(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*$isPanelVisible*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*$isPanelVisible*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let $isPanelVisible;
  let $sortedTagFiles;
  component_subscribe($$self, isPanelVisible, ($$value) => $$invalidate(0, $isPanelVisible = $$value));
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(1, $sortedTagFiles = $$value));
  async function handleReload() {
    await fetchTags();
  }
  function handleClose() {
    isPanelVisible.set(false);
  }
  function handleClickTag(prompt, closePanel) {
    const ta = get_store_value(targetTextArea);
    if (ta) {
      insertTextToTarget(ta, prompt + ",");
    }
    if (closePanel) {
      isPanelVisible.set(false);
    }
  }
  return [$isPanelVisible, $sortedTagFiles, handleReload, handleClose, handleClickTag];
}
class PromptSelector extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
}
function create_fragment(ctx) {
  let button;
  let t;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t = text("PS");
      attr(button, "class", Constants.CSS_CLASS_BUTTON + " " + Constants.CSS_CLASS_SHOW_BUTTON);
      attr(
        button,
        "data-location",
        /*location*/
        ctx[1]
      );
      attr(
        button,
        "style",
        /*style*/
        ctx[2]
      );
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t);
      if (!mounted) {
        dispose = listen(button, "click", function() {
          if (is_function(
            /*onToggle*/
            ctx[0]
          )) ctx[0].apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, [dirty]) {
      ctx = new_ctx;
      if (dirty & /*location*/
      2) {
        attr(
          button,
          "data-location",
          /*location*/
          ctx[1]
        );
      }
      if (dirty & /*style*/
      4) {
        attr(
          button,
          "style",
          /*style*/
          ctx[2]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      mounted = false;
      dispose();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let style;
  let { app: app2 } = $$props;
  let { onToggle } = $$props;
  let location = Constants.D2_PS_SETTING_LOCATION_DEFAULT;
  let xMargin = Constants.D2_PS_SETTING_X_MARGIN_DEFAULT;
  let yMargin = Constants.D2_PS_SETTING_Y_MARGIN_DEFAULT;
  function setup() {
    app2.ui.settings.addSetting({
      id: Constants.D2_PS_SETTING_LOCATION_ID,
      name: "ShowButton Location",
      type: "combo",
      options: [
        { value: "left-top", text: "Left Top" },
        {
          value: "left-bottom",
          text: "Left Bottom"
        },
        { value: "right-top", text: "Right Top" },
        {
          value: "right-bottom",
          text: "Right Bottom"
        }
      ],
      defaultValue: Constants.D2_PS_SETTING_LOCATION_DEFAULT,
      onChange(value) {
        $$invalidate(1, location = value);
      }
    });
    app2.ui.settings.addSetting({
      id: Constants.D2_PS_SETTING_X_MARGIN_ID,
      name: "ShowButton Horizontal Margin(px)",
      type: "number",
      defaultValue: Constants.D2_PS_SETTING_X_MARGIN_DEFAULT,
      onChange(value) {
        $$invalidate(5, xMargin = value);
      }
    });
    app2.ui.settings.addSetting({
      id: Constants.D2_PS_SETTING_Y_MARGIN_ID,
      name: "ShowButton Vertical Margin(px)",
      type: "number",
      defaultValue: Constants.D2_PS_SETTING_Y_MARGIN_DEFAULT,
      onChange(value) {
        $$invalidate(6, yMargin = value);
      }
    });
  }
  $$self.$$set = ($$props2) => {
    if ("app" in $$props2) $$invalidate(3, app2 = $$props2.app);
    if ("onToggle" in $$props2) $$invalidate(0, onToggle = $$props2.onToggle);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*location, xMargin, yMargin*/
    98) {
      $$invalidate(2, style = (() => {
        const base = "left: auto; right: auto; top: auto; bottom: auto;";
        if (location === "left-bottom") return `${base} left: ${xMargin}px; bottom: ${yMargin}px;`;
        if (location === "left-top") return `${base} left: ${xMargin}px; top: ${yMargin}px;`;
        if (location === "right-top") return `${base} right: ${xMargin}px; top: ${yMargin}px;`;
        if (location === "right-bottom") return `${base} right: ${xMargin}px; bottom: ${yMargin}px;`;
        return base;
      })());
    }
  };
  return [onToggle, location, style, app2, setup, xMargin, yMargin];
}
class ShowButton extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { app: 3, onToggle: 0, setup: 4 });
  }
  get setup() {
    return this.$$.ctx[4];
  }
}
const D2_PS_CSS_FILEPATH = "/D2_prompt-selector/assets/style.css";
loadCssFile(D2_PS_CSS_FILEPATH);
document.addEventListener(
  "focus",
  (e) => {
    if (e.target instanceof HTMLTextAreaElement) {
      targetTextArea.set(e.target);
    }
  },
  true
);
const selectorContainer = document.createElement("div");
document.body.appendChild(selectorContainer);
new PromptSelector({ target: selectorContainer });
const showButtonContainer = document.createElement("div");
document.body.appendChild(showButtonContainer);
const showButtonInstance = new ShowButton({
  target: showButtonContainer,
  props: {
    app,
    onToggle: () => {
      isPanelVisible.update((v) => !v);
      fetchTags();
    }
  }
});
(_a = showButtonInstance.setup) == null ? void 0 : _a.call(showButtonInstance);
//# sourceMappingURL=d2_prompt_selector.js.map
