import { app } from "../../scripts/app.js";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
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
function select_option(select, value, mounting) {
  for (let i = 0; i < select.options.length; i += 1) {
    const option = select.options[i];
    if (option.__value === value) {
      option.selected = true;
      return;
    }
  }
  if (!mounting || value !== void 0) {
    select.selectedIndex = -1;
  }
}
function select_value(select) {
  const selected_option = select.querySelector(":checked");
  return selected_option && selected_option.__value;
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  return new CustomEvent(type, { detail, bubbles, cancelable });
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component) throw new Error("Function called outside component initialization");
  return current_component;
}
function createEventDispatcher() {
  const component = get_current_component();
  return (type, detail, { cancelable = false } = {}) => {
    const callbacks = component.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(
        /** @type {string} */
        type,
        detail,
        { cancelable }
      );
      callbacks.slice().forEach((fn) => {
        fn.call(component, event);
      });
      return !event.defaultPrevented;
    }
    return true;
  };
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
class Constants {
}
__publicField(Constants, "API_GET_TAGS", "/D2_prompt-selector/get_tags");
// ComfyUI 標準ボタンクラス
__publicField(Constants, "CSS_CLASS_BUTTON_BASE", "inline-flex items-center justify-center cursor-pointer touch-manipulation appearance-none border-none text-sm font-inter transition-colors h-8 rounded-lg px-4 font-light");
__publicField(Constants, "CSS_CLSSS_BUTTON_PRIMARY", "text-base-foreground bg-primary-background hover:bg-primary-background-hover");
__publicField(Constants, "CSS_CLSSS_BUTTON_SECONDARY", "text-secondary-foreground bg-secondary-background hover:bg-secondary-background-hover");
__publicField(Constants, "CSS_CLSSS_BUTTON_DESTRUCTIVE", "text-secondary-foreground bg-destructive-background hover:bg-destructive-background-hover");
// アイコン
__publicField(Constants, "ICON_SEARCH", "🔍");
// Settings
__publicField(Constants, "D2_PS_SETTING_LOCATION_ID", "D2.PromptSelector.ShowButtonLocation");
__publicField(Constants, "D2_PS_SETTING_LOCATION_DEFAULT", "left-bottom");
__publicField(Constants, "D2_PS_SETTING_X_MARGIN_ID", "D2.PromptSelector.ShowButtonHorizontalMargin");
__publicField(Constants, "D2_PS_SETTING_X_MARGIN_DEFAULT", 50);
__publicField(Constants, "D2_PS_SETTING_Y_MARGIN_ID", "D2.PromptSelector.ShowButtonVerticalMargin");
__publicField(Constants, "D2_PS_SETTING_Y_MARGIN_DEFAULT", 10);
__publicField(Constants, "D2_PS_SETTING_BACKUP_COUNT_ID", "D2.PromptSelector.BackupCount");
__publicField(Constants, "D2_PS_SETTING_BACKUP_COUNT_DEFAULT", 10);
const backupCount = writable(Constants.D2_PS_SETTING_BACKUP_COUNT_DEFAULT);
const BASE = "/D2_prompt-selector";
function getWildCardPrompt(value) {
  if (Array.isArray(value)) {
    const strs2 = value.filter((v) => typeof v === "string");
    return strs2.length > 0 ? `{ ${strs2.map((v) => `${v},`).join(" | ")} }` : "";
  }
  const vals = Object.values(value);
  if (vals.some((v) => typeof v === "object" && v !== null)) return "";
  const strs = vals.filter((v) => typeof v === "string");
  return strs.length > 0 ? `{ ${strs.map((v) => `${v},`).join(" | ")} }` : "";
}
function parseTagNode(name, value) {
  if (value === null || value === void 0) {
    return { name, prompt: name };
  }
  if (typeof value === "string") {
    return { name, prompt: value };
  }
  if (Array.isArray(value)) {
    const children22 = value.filter((v) => typeof v === "string").map((v) => ({ name: v, prompt: v }));
    return { name, prompt: getWildCardPrompt(value), children: children22 };
  }
  const children2 = Object.entries(value).map(([k, v]) => parseTagNode(k, v));
  return { name, prompt: getWildCardPrompt(value), children: children2 };
}
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
        for (const [name, value] of Object.entries(items)) {
          tagItems.push(parseTagNode(name, value));
        }
      }
      const category = { categoryId, items: tagItems };
      tagFile.categories.push(category);
    }
    result.push(tagFile);
  }
  return result;
}
function flattenLeaves(items) {
  const result = [];
  for (const item of items) {
    if (item.children) {
      result.push(...flattenLeaves(item.children));
    } else {
      result.push(item);
    }
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
async function apiPost(endpoint, body) {
  const res = await fetch(BASE + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}
async function apiPostWithBackup(endpoint, body) {
  return apiPost(endpoint, { ...body, backup_count: get_store_value(backupCount) });
}
async function apiGet(endpoint) {
  const res = await fetch(BASE + endpoint);
  return res.json();
}
const isPanelVisible = writable(false);
const activeTabId = writable("");
const isEditMode = writable(false);
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
const FALLBACK_LOCALE = "en";
const BASE_URL = "/D2_prompt-selector/assets/locales";
const dicts = {};
const locale = writable("");
const t = derived(locale, ($locale) => {
  return (key, vars) => {
    const primary = dicts[$locale];
    const fallback = dicts[FALLBACK_LOCALE];
    let s = (primary == null ? void 0 : primary[key]) ?? (fallback == null ? void 0 : fallback[key]) ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  };
});
function normalizeLocale(raw) {
  if (!raw) return FALLBACK_LOCALE;
  const lower = raw.toLowerCase();
  if (lower === "zh-tw" || lower === "zh-hk") return "zh-TW";
  if (lower.startsWith("zh")) return "zh";
  const primary = lower.split("-")[0];
  return primary || FALLBACK_LOCALE;
}
async function loadDict(lang) {
  try {
    const res = await fetch(`${BASE_URL}/${lang}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
async function initLocale(app2) {
  const comfyLocale = (() => {
    var _a2, _b, _c;
    try {
      const v = (_c = (_b = (_a2 = app2 == null ? void 0 : app2.extensionManager) == null ? void 0 : _a2.setting) == null ? void 0 : _b.get) == null ? void 0 : _c.call(_b, "Comfy.Locale");
      return typeof v === "string" ? v : "";
    } catch {
      return "";
    }
  })();
  const raw = comfyLocale || navigator.language || "";
  const resolved = normalizeLocale(raw);
  let dict = await loadDict(resolved);
  let active = resolved;
  if (!dict && resolved !== FALLBACK_LOCALE) {
    dict = await loadDict(FALLBACK_LOCALE);
    active = FALLBACK_LOCALE;
  }
  if (dict) dicts[active] = dict;
  if (active !== FALLBACK_LOCALE && !dicts[FALLBACK_LOCALE]) {
    const fb = await loadDict(FALLBACK_LOCALE);
    if (fb) dicts[FALLBACK_LOCALE] = fb;
  }
  locale.set(active);
}
function get_each_context$7(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  return child_ctx;
}
function create_if_block$a(ctx) {
  let button;
  let t_1;
  let button_title_value;
  let mounted;
  let dispose;
  function click_handler() {
    return (
      /*click_handler*/
      ctx[7](
        /*tabId*/
        ctx[9]
      )
    );
  }
  return {
    c() {
      button = element("button");
      t_1 = text("x");
      attr(button, "type", "button");
      attr(button, "class", "d2ps-btn d2ps-btn--delete");
      attr(button, "title", button_title_value = /*$t*/
      ctx[4]("tabNavi.deleteFile.title"));
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t_1);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*$t*/
      16 && button_title_value !== (button_title_value = /*$t*/
      ctx[4]("tabNavi.deleteFile.title"))) {
        attr(button, "title", button_title_value);
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
function create_each_block$7(key_1, ctx) {
  let span;
  let t0;
  let button;
  let t1_value = (
    /*tabId*/
    ctx[9] + ""
  );
  let t1;
  let button_data_active_value;
  let t2;
  let mounted;
  let dispose;
  let if_block = (
    /*$isEditMode*/
    ctx[3] && /*tabId*/
    ctx[9] !== /*SEARCH_TAB*/
    ctx[5] && create_if_block$a(ctx)
  );
  function click_handler_1() {
    return (
      /*click_handler_1*/
      ctx[8](
        /*tabId*/
        ctx[9]
      )
    );
  }
  return {
    key: key_1,
    first: null,
    c() {
      span = element("span");
      if (if_block) if_block.c();
      t0 = space();
      button = element("button");
      t1 = text(t1_value);
      t2 = space();
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " text-base-foreground d2ps-tab__button");
      attr(button, "data-active", button_data_active_value = /*$activeTabId*/
      ctx[1] === /*tabId*/
      ctx[9] ? "true" : "false");
      attr(span, "class", "d2ps-btn-wrapper");
      this.first = span;
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block) if_block.m(span, null);
      append(span, t0);
      append(span, button);
      append(button, t1);
      append(span, t2);
      if (!mounted) {
        dispose = listen(button, "click", click_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (
        /*$isEditMode*/
        ctx[3] && /*tabId*/
        ctx[9] !== /*SEARCH_TAB*/
        ctx[5]
      ) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block$a(ctx);
          if_block.c();
          if_block.m(span, t0);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*tabs*/
      4 && t1_value !== (t1_value = /*tabId*/
      ctx[9] + "")) set_data(t1, t1_value);
      if (dirty & /*$activeTabId, tabs*/
      6 && button_data_active_value !== (button_data_active_value = /*$activeTabId*/
      ctx[1] === /*tabId*/
      ctx[9] ? "true" : "false")) {
        attr(button, "data-active", button_data_active_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block) if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$f(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_value = ensure_array_like(
    /*tabs*/
    ctx[2]
  );
  const get_key = (ctx2) => (
    /*tabId*/
    ctx2[9]
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$7(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
  }
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "d2ps-tab");
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
      if (dirty & /*$activeTabId, tabs, $t, onDeleteFile, $isEditMode, SEARCH_TAB*/
      63) {
        each_value = ensure_array_like(
          /*tabs*/
          ctx2[2]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, destroy_block, create_each_block$7, null, get_each_context$7);
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
function instance$f($$self, $$props, $$invalidate) {
  let tabs;
  let $sortedTagFiles;
  let $activeTabId;
  let $isEditMode;
  let $t;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(6, $sortedTagFiles = $$value));
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(1, $activeTabId = $$value));
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(3, $isEditMode = $$value));
  component_subscribe($$self, t, ($$value) => $$invalidate(4, $t = $$value));
  let { onDeleteFile = () => {
  } } = $$props;
  const SEARCH_TAB = Constants.ICON_SEARCH;
  const click_handler = (tabId) => onDeleteFile(tabId);
  const click_handler_1 = (tabId) => activeTabId.set(tabId);
  $$self.$$set = ($$props2) => {
    if ("onDeleteFile" in $$props2) $$invalidate(0, onDeleteFile = $$props2.onDeleteFile);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$sortedTagFiles*/
    64) {
      $$invalidate(2, tabs = [...$sortedTagFiles.map((f) => f.fileId), SEARCH_TAB]);
    }
    if ($$self.$$.dirty & /*$activeTabId, $sortedTagFiles*/
    66) {
      if ($activeTabId === "" && $sortedTagFiles.length > 0) {
        activeTabId.set($sortedTagFiles[0].fileId);
      }
    }
  };
  return [
    onDeleteFile,
    $activeTabId,
    tabs,
    $isEditMode,
    $t,
    SEARCH_TAB,
    $sortedTagFiles,
    click_handler,
    click_handler_1
  ];
}
class TabNavi extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$f, create_fragment$f, safe_not_equal, { onDeleteFile: 0 });
  }
}
function create_if_block$9(ctx) {
  let button;
  let t_1;
  let button_title_value;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t_1 = text("x");
      attr(button, "class", "d2ps-btn d2ps-btn--delete");
      attr(button, "title", button_title_value = /*$t*/
      ctx[4]("common.delete"));
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t_1);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*click_handler*/
          ctx[8]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*$t*/
      16 && button_title_value !== (button_title_value = /*$t*/
      ctx2[4]("common.delete"))) {
        attr(button, "title", button_title_value);
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
function create_fragment$e(ctx) {
  let span;
  let t0;
  let button;
  let t1;
  let mounted;
  let dispose;
  let if_block = (
    /*$isEditMode*/
    ctx[3] && create_if_block$9(ctx)
  );
  return {
    c() {
      span = element("span");
      if (if_block) if_block.c();
      t0 = space();
      button = element("button");
      t1 = text(
        /*name*/
        ctx[0]
      );
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-btn d2ps-btn--tag");
      attr(span, "class", "d2ps-btn-wrapper");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block) if_block.m(span, null);
      append(span, t0);
      append(span, button);
      append(button, t1);
      if (!mounted) {
        dispose = [
          listen(
            button,
            "click",
            /*handleClick*/
            ctx[5]
          ),
          listen(
            button,
            "contextmenu",
            /*handleRightClick*/
            ctx[6]
          ),
          listen(
            button,
            "mouseenter",
            /*mouseenter_handler*/
            ctx[9]
          ),
          listen(
            button,
            "mouseleave",
            /*mouseleave_handler*/
            ctx[10]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*$isEditMode*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$9(ctx2);
          if_block.c();
          if_block.m(span, t0);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*name*/
      1) set_data(
        t1,
        /*name*/
        ctx2[0]
      );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block) if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$e($$self, $$props, $$invalidate) {
  let $isEditMode;
  let $t;
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(3, $isEditMode = $$value));
  component_subscribe($$self, t, ($$value) => $$invalidate(4, $t = $$value));
  let { name } = $$props;
  let { prompt } = $$props;
  let { onClickTag } = $$props;
  let { onDeleteItem = void 0 } = $$props;
  function handleClick(e) {
    onClickTag(prompt, e.ctrlKey);
  }
  function handleRightClick(e) {
    e.preventDefault();
    onClickTag(prompt, true);
  }
  const click_handler = () => onDeleteItem == null ? void 0 : onDeleteItem(name);
  const mouseenter_handler = () => tooltip.set(prompt);
  const mouseleave_handler = () => tooltip.set("");
  $$self.$$set = ($$props2) => {
    if ("name" in $$props2) $$invalidate(0, name = $$props2.name);
    if ("prompt" in $$props2) $$invalidate(1, prompt = $$props2.prompt);
    if ("onClickTag" in $$props2) $$invalidate(7, onClickTag = $$props2.onClickTag);
    if ("onDeleteItem" in $$props2) $$invalidate(2, onDeleteItem = $$props2.onDeleteItem);
  };
  return [
    name,
    prompt,
    onDeleteItem,
    $isEditMode,
    $t,
    handleClick,
    handleRightClick,
    onClickTag,
    click_handler,
    mouseenter_handler,
    mouseleave_handler
  ];
}
class TagButton extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$e, create_fragment$e, safe_not_equal, {
      name: 0,
      prompt: 1,
      onClickTag: 7,
      onDeleteItem: 2
    });
  }
}
function create_if_block$8(ctx) {
  let button;
  let t_1;
  let button_title_value;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t_1 = text("x");
      attr(button, "class", "d2ps-btn d2ps-btn--delete");
      attr(button, "title", button_title_value = /*$t*/
      ctx[4]("common.delete"));
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t_1);
      if (!mounted) {
        dispose = listen(button, "click", function() {
          if (is_function(
            /*onDelete*/
            ctx[2]
          )) ctx[2].apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*$t*/
      16 && button_title_value !== (button_title_value = /*$t*/
      ctx[4]("common.delete"))) {
        attr(button, "title", button_title_value);
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
function create_fragment$d(ctx) {
  let span;
  let t0;
  let button;
  let t1;
  let button_class_value;
  let mounted;
  let dispose;
  let if_block = (
    /*$isEditMode*/
    ctx[3] && /*onDelete*/
    ctx[2] && create_if_block$8(ctx)
  );
  return {
    c() {
      span = element("span");
      if (if_block) if_block.c();
      t0 = space();
      button = element("button");
      t1 = text(
        /*label*/
        ctx[0]
      );
      attr(button, "class", button_class_value = Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY + " d2ps-btn d2ps-btn--random" + /*prompt*/
      (ctx[1] ? "" : " d2ps-btn--none") + " d2ps-btn");
      attr(span, "class", "d2ps-btn-wrapper");
      set_style(span, "width", "100%");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block) if_block.m(span, null);
      append(span, t0);
      append(span, button);
      append(button, t1);
      if (!mounted) {
        dispose = [
          listen(
            button,
            "click",
            /*handleClick*/
            ctx[5]
          ),
          listen(
            button,
            "contextmenu",
            /*handleContextMenu*/
            ctx[6]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*$isEditMode*/
        ctx2[3] && /*onDelete*/
        ctx2[2]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$8(ctx2);
          if_block.c();
          if_block.m(span, t0);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*label*/
      1) set_data(
        t1,
        /*label*/
        ctx2[0]
      );
      if (dirty & /*prompt*/
      2 && button_class_value !== (button_class_value = Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY + " d2ps-btn d2ps-btn--random" + /*prompt*/
      (ctx2[1] ? "" : " d2ps-btn--none") + " d2ps-btn")) {
        attr(button, "class", button_class_value);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(span);
      }
      if (if_block) if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$d($$self, $$props, $$invalidate) {
  let $isEditMode;
  let $t;
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(3, $isEditMode = $$value));
  component_subscribe($$self, t, ($$value) => $$invalidate(4, $t = $$value));
  let { label } = $$props;
  let { prompt } = $$props;
  let { onClickTag } = $$props;
  let { onDelete = void 0 } = $$props;
  let { onEditCategory = void 0 } = $$props;
  function handleClick(e) {
    if ($isEditMode) {
      if (onEditCategory) onEditCategory();
    } else if (prompt) {
      onClickTag(prompt, e.ctrlKey || e.metaKey);
    }
  }
  function handleContextMenu(e) {
    e.preventDefault();
    if (!$isEditMode && prompt) onClickTag(prompt, true);
  }
  $$self.$$set = ($$props2) => {
    if ("label" in $$props2) $$invalidate(0, label = $$props2.label);
    if ("prompt" in $$props2) $$invalidate(1, prompt = $$props2.prompt);
    if ("onClickTag" in $$props2) $$invalidate(7, onClickTag = $$props2.onClickTag);
    if ("onDelete" in $$props2) $$invalidate(2, onDelete = $$props2.onDelete);
    if ("onEditCategory" in $$props2) $$invalidate(8, onEditCategory = $$props2.onEditCategory);
  };
  return [
    label,
    prompt,
    onDelete,
    $isEditMode,
    $t,
    handleClick,
    handleContextMenu,
    onClickTag,
    onEditCategory
  ];
}
class CategoryButton extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$d, create_fragment$d, safe_not_equal, {
      label: 0,
      prompt: 1,
      onClickTag: 7,
      onDelete: 2,
      onEditCategory: 8
    });
  }
}
function get_each_context$6(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[6] = list[i];
  return child_ctx;
}
function create_else_block$4(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_1$6, create_else_block_1$1];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    if (
      /*$isEditMode*/
      ctx2[4] && /*onEditItem*/
      ctx2[2] && /*onDeleteItem*/
      ctx2[3]
    ) return 0;
    return 1;
  }
  current_block_type_index = select_block_type_1(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_1(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
      if_blocks[current_block_type_index].d(detaching);
    }
  };
}
function create_if_block$7(ctx) {
  let div1;
  let categorybutton;
  let t2;
  let div0;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let current;
  categorybutton = new CategoryButton({
    props: {
      label: (
        /*item*/
        ctx[0].name
      ),
      prompt: (
        /*item*/
        ctx[0].prompt
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[1]
      )
    }
  });
  let each_value = ensure_array_like(
    /*item*/
    ctx[0].children
  );
  const get_key = (ctx2) => (
    /*child*/
    ctx2[6].name
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$6(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
  }
  return {
    c() {
      div1 = element("div");
      create_component(categorybutton.$$.fragment);
      t2 = space();
      div0 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div0, "class", "d2ps-tag-field");
      attr(div1, "class", "d2ps-tag-field d2ps-tag-field--with-random");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      mount_component(categorybutton, div1, null);
      append(div1, t2);
      append(div1, div0);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div0, null);
        }
      }
      current = true;
    },
    p(ctx2, dirty) {
      const categorybutton_changes = {};
      if (dirty & /*item*/
      1) categorybutton_changes.label = /*item*/
      ctx2[0].name;
      if (dirty & /*item*/
      1) categorybutton_changes.prompt = /*item*/
      ctx2[0].prompt;
      if (dirty & /*onClickTag*/
      2) categorybutton_changes.onClickTag = /*onClickTag*/
      ctx2[1];
      categorybutton.$set(categorybutton_changes);
      if (dirty & /*item, onClickTag, undefined, onEditItem, onDeleteItem*/
      15) {
        each_value = ensure_array_like(
          /*item*/
          ctx2[0].children
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$6, null, get_each_context$6);
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(categorybutton.$$.fragment, local);
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      transition_out(categorybutton.$$.fragment, local);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      destroy_component(categorybutton);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
}
function create_else_block_1$1(ctx) {
  let tagbutton;
  let current;
  tagbutton = new TagButton({
    props: {
      name: (
        /*item*/
        ctx[0].name
      ),
      prompt: (
        /*item*/
        ctx[0].prompt
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[1]
      )
    }
  });
  return {
    c() {
      create_component(tagbutton.$$.fragment);
    },
    m(target, anchor) {
      mount_component(tagbutton, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const tagbutton_changes = {};
      if (dirty & /*item*/
      1) tagbutton_changes.name = /*item*/
      ctx2[0].name;
      if (dirty & /*item*/
      1) tagbutton_changes.prompt = /*item*/
      ctx2[0].prompt;
      if (dirty & /*onClickTag*/
      2) tagbutton_changes.onClickTag = /*onClickTag*/
      ctx2[1];
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
      destroy_component(tagbutton, detaching);
    }
  };
}
function create_if_block_1$6(ctx) {
  let tagbutton;
  let current;
  tagbutton = new TagButton({
    props: {
      name: (
        /*item*/
        ctx[0].name
      ),
      prompt: (
        /*item*/
        ctx[0].prompt
      ),
      onClickTag: (
        /*func*/
        ctx[5]
      ),
      onDeleteItem: (
        /*onDeleteItem*/
        ctx[3]
      )
    }
  });
  return {
    c() {
      create_component(tagbutton.$$.fragment);
    },
    m(target, anchor) {
      mount_component(tagbutton, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const tagbutton_changes = {};
      if (dirty & /*item*/
      1) tagbutton_changes.name = /*item*/
      ctx2[0].name;
      if (dirty & /*item*/
      1) tagbutton_changes.prompt = /*item*/
      ctx2[0].prompt;
      if (dirty & /*onEditItem, item*/
      5) tagbutton_changes.onClickTag = /*func*/
      ctx2[5];
      if (dirty & /*onDeleteItem*/
      8) tagbutton_changes.onDeleteItem = /*onDeleteItem*/
      ctx2[3];
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
      destroy_component(tagbutton, detaching);
    }
  };
}
function create_each_block$6(key_1, ctx) {
  let first;
  let tagnodeitem;
  let current;
  tagnodeitem = new TagNodeItem({
    props: {
      item: (
        /*child*/
        ctx[6]
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[1]
      ),
      onEditItem: (
        /*child*/
        ctx[6].children ? void 0 : (
          /*onEditItem*/
          ctx[2]
        )
      ),
      onDeleteItem: (
        /*child*/
        ctx[6].children ? void 0 : (
          /*onDeleteItem*/
          ctx[3]
        )
      )
    }
  });
  return {
    key: key_1,
    first: null,
    c() {
      first = empty();
      create_component(tagnodeitem.$$.fragment);
      this.first = first;
    },
    m(target, anchor) {
      insert(target, first, anchor);
      mount_component(tagnodeitem, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const tagnodeitem_changes = {};
      if (dirty & /*item*/
      1) tagnodeitem_changes.item = /*child*/
      ctx[6];
      if (dirty & /*onClickTag*/
      2) tagnodeitem_changes.onClickTag = /*onClickTag*/
      ctx[1];
      if (dirty & /*item, onEditItem*/
      5) tagnodeitem_changes.onEditItem = /*child*/
      ctx[6].children ? void 0 : (
        /*onEditItem*/
        ctx[2]
      );
      if (dirty & /*item, onDeleteItem*/
      9) tagnodeitem_changes.onDeleteItem = /*child*/
      ctx[6].children ? void 0 : (
        /*onDeleteItem*/
        ctx[3]
      );
      tagnodeitem.$set(tagnodeitem_changes);
    },
    i(local) {
      if (current) return;
      transition_in(tagnodeitem.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tagnodeitem.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(first);
      }
      destroy_component(tagnodeitem, detaching);
    }
  };
}
function create_fragment$c(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block$7, create_else_block$4];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*item*/
      ctx2[0].children
    ) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
      if_blocks[current_block_type_index].d(detaching);
    }
  };
}
function instance$c($$self, $$props, $$invalidate) {
  let $isEditMode;
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(4, $isEditMode = $$value));
  let { item } = $$props;
  let { onClickTag } = $$props;
  let { onEditItem = void 0 } = $$props;
  let { onDeleteItem = void 0 } = $$props;
  const func = (_p, _c) => onEditItem(item.name, item.prompt);
  $$self.$$set = ($$props2) => {
    if ("item" in $$props2) $$invalidate(0, item = $$props2.item);
    if ("onClickTag" in $$props2) $$invalidate(1, onClickTag = $$props2.onClickTag);
    if ("onEditItem" in $$props2) $$invalidate(2, onEditItem = $$props2.onEditItem);
    if ("onDeleteItem" in $$props2) $$invalidate(3, onDeleteItem = $$props2.onDeleteItem);
  };
  return [item, onClickTag, onEditItem, onDeleteItem, $isEditMode, func];
}
class TagNodeItem extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$c, create_fragment$c, safe_not_equal, {
      item: 0,
      onClickTag: 1,
      onEditItem: 2,
      onDeleteItem: 3
    });
  }
}
function get_each_context$5(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  const constants_0 = getRandomPrompt(
    /*category*/
    child_ctx[13].items
  );
  child_ctx[14] = constants_0;
  return child_ctx;
}
function get_each_context_1$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[17] = list[i];
  return child_ctx;
}
function create_each_block_1$2(key_1, ctx) {
  let first;
  let tagnodeitem;
  let current;
  function func_2(...args) {
    return (
      /*func_2*/
      ctx[11](
        /*category*/
        ctx[13],
        ...args
      )
    );
  }
  function func_3(...args) {
    return (
      /*func_3*/
      ctx[12](
        /*category*/
        ctx[13],
        ...args
      )
    );
  }
  tagnodeitem = new TagNodeItem({
    props: {
      item: (
        /*item*/
        ctx[17]
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[1]
      ),
      onEditItem: (
        /*$isEditMode*/
        ctx[7] ? func_2 : void 0
      ),
      onDeleteItem: (
        /*$isEditMode*/
        ctx[7] ? func_3 : void 0
      )
    }
  });
  return {
    key: key_1,
    first: null,
    c() {
      first = empty();
      create_component(tagnodeitem.$$.fragment);
      this.first = first;
    },
    m(target, anchor) {
      insert(target, first, anchor);
      mount_component(tagnodeitem, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const tagnodeitem_changes = {};
      if (dirty & /*file*/
      1) tagnodeitem_changes.item = /*item*/
      ctx[17];
      if (dirty & /*onClickTag*/
      2) tagnodeitem_changes.onClickTag = /*onClickTag*/
      ctx[1];
      if (dirty & /*$isEditMode, onEditTag, file*/
      133) tagnodeitem_changes.onEditItem = /*$isEditMode*/
      ctx[7] ? func_2 : void 0;
      if (dirty & /*$isEditMode, onDeleteItem, file*/
      145) tagnodeitem_changes.onDeleteItem = /*$isEditMode*/
      ctx[7] ? func_3 : void 0;
      tagnodeitem.$set(tagnodeitem_changes);
    },
    i(local) {
      if (current) return;
      transition_in(tagnodeitem.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tagnodeitem.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(first);
      }
      destroy_component(tagnodeitem, detaching);
    }
  };
}
function create_each_block$5(key_1, ctx) {
  let div2;
  let div0;
  let categorybutton;
  let t0;
  let div1;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t1;
  let current;
  function func() {
    return (
      /*func*/
      ctx[9](
        /*category*/
        ctx[13]
      )
    );
  }
  function func_1() {
    return (
      /*func_1*/
      ctx[10](
        /*category*/
        ctx[13]
      )
    );
  }
  categorybutton = new CategoryButton({
    props: {
      label: (
        /*category*/
        ctx[13].categoryId
      ),
      prompt: (
        /*randomPrompt*/
        ctx[14]
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[1]
      ),
      onDelete: func,
      onEditCategory: func_1
    }
  });
  let each_value_1 = ensure_array_like(
    /*category*/
    ctx[13].items
  );
  const get_key = (ctx2) => (
    /*item*/
    ctx2[17].name
  );
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1$2(key, child_ctx));
  }
  return {
    key: key_1,
    first: null,
    c() {
      div2 = element("div");
      div0 = element("div");
      create_component(categorybutton.$$.fragment);
      t0 = space();
      div1 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t1 = space();
      attr(div0, "class", "d2ps-category-header svelte-19xe0ax");
      attr(div1, "class", "d2ps-tag-field");
      attr(div2, "class", "d2ps-tag-field d2ps-tag-field--with-random");
      this.first = div2;
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      mount_component(categorybutton, div0, null);
      append(div2, t0);
      append(div2, div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div1, null);
        }
      }
      append(div2, t1);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const categorybutton_changes = {};
      if (dirty & /*file*/
      1) categorybutton_changes.label = /*category*/
      ctx[13].categoryId;
      if (dirty & /*file*/
      1) categorybutton_changes.prompt = /*randomPrompt*/
      ctx[14];
      if (dirty & /*onClickTag*/
      2) categorybutton_changes.onClickTag = /*onClickTag*/
      ctx[1];
      if (dirty & /*onDeleteCategory, file*/
      33) categorybutton_changes.onDelete = func;
      if (dirty & /*onEditCategory, file*/
      9) categorybutton_changes.onEditCategory = func_1;
      categorybutton.$set(categorybutton_changes);
      if (dirty & /*file, onClickTag, $isEditMode, onEditTag, undefined, onDeleteItem*/
      151) {
        each_value_1 = ensure_array_like(
          /*category*/
          ctx[13].items
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div1, outro_and_destroy_block, create_each_block_1$2, null, get_each_context_1$2);
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(categorybutton.$$.fragment, local);
      for (let i = 0; i < each_value_1.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      transition_out(categorybutton.$$.fragment, local);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      destroy_component(categorybutton);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
}
function create_fragment$b(ctx) {
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
    ctx2[13].categoryId
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$5(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
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
        ctx[6] ? "flex" : "none"
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
      if (dirty & /*file, onClickTag, $isEditMode, onEditTag, undefined, onDeleteItem, getRandomPrompt, onDeleteCategory, onEditCategory*/
      191) {
        each_value = ensure_array_like(
          /*file*/
          ctx2[0].categories
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
        check_outros();
      }
      if (dirty & /*isActive*/
      64) {
        set_style(
          div,
          "display",
          /*isActive*/
          ctx2[6] ? "flex" : "none"
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
function getRandomPrompt(items) {
  if (items.some((item) => item.children !== void 0)) return "";
  const parts = items.map((item) => `${item.prompt},`);
  return parts.length > 0 ? `{ ${parts.join(" | ")} }` : "";
}
function instance$b($$self, $$props, $$invalidate) {
  let isActive;
  let $activeTabId;
  let $isEditMode;
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(8, $activeTabId = $$value));
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(7, $isEditMode = $$value));
  let { file } = $$props;
  let { onClickTag } = $$props;
  let { onEditTag } = $$props;
  let { onEditCategory } = $$props;
  let { onDeleteItem } = $$props;
  let { onDeleteCategory } = $$props;
  const func = (category) => onDeleteCategory(category.categoryId);
  const func_1 = (category) => onEditCategory(category.categoryId);
  const func_2 = (category, name, prompt) => onEditTag(category.categoryId, name, prompt);
  const func_3 = (category, name) => onDeleteItem(category.categoryId, name);
  $$self.$$set = ($$props2) => {
    if ("file" in $$props2) $$invalidate(0, file = $$props2.file);
    if ("onClickTag" in $$props2) $$invalidate(1, onClickTag = $$props2.onClickTag);
    if ("onEditTag" in $$props2) $$invalidate(2, onEditTag = $$props2.onEditTag);
    if ("onEditCategory" in $$props2) $$invalidate(3, onEditCategory = $$props2.onEditCategory);
    if ("onDeleteItem" in $$props2) $$invalidate(4, onDeleteItem = $$props2.onDeleteItem);
    if ("onDeleteCategory" in $$props2) $$invalidate(5, onDeleteCategory = $$props2.onDeleteCategory);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$activeTabId, file*/
    257) {
      $$invalidate(6, isActive = $activeTabId === file.fileId);
    }
  };
  return [
    file,
    onClickTag,
    onEditTag,
    onEditCategory,
    onDeleteItem,
    onDeleteCategory,
    isActive,
    $isEditMode,
    $activeTabId,
    func,
    func_1,
    func_2,
    func_3
  ];
}
class CategoryView extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$b, create_fragment$b, safe_not_equal, {
      file: 0,
      onClickTag: 1,
      onEditTag: 2,
      onEditCategory: 3,
      onDeleteItem: 4,
      onDeleteCategory: 5
    });
  }
}
function get_each_context$4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  return child_ctx;
}
function create_else_block$3(ctx) {
  let tagbutton;
  let current;
  tagbutton = new TagButton({
    props: {
      name: (
        /*item*/
        ctx[14].name
      ),
      prompt: (
        /*item*/
        ctx[14].prompt
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[0]
      )
    }
  });
  return {
    c() {
      create_component(tagbutton.$$.fragment);
    },
    m(target, anchor) {
      mount_component(tagbutton, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const tagbutton_changes = {};
      if (dirty & /*results*/
      16) tagbutton_changes.name = /*item*/
      ctx2[14].name;
      if (dirty & /*results*/
      16) tagbutton_changes.prompt = /*item*/
      ctx2[14].prompt;
      if (dirty & /*onClickTag*/
      1) tagbutton_changes.onClickTag = /*onClickTag*/
      ctx2[0];
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
      destroy_component(tagbutton, detaching);
    }
  };
}
function create_if_block_1$5(ctx) {
  let tagbutton;
  let current;
  function func(...args) {
    return (
      /*func*/
      ctx[11](
        /*item*/
        ctx[14],
        ...args
      )
    );
  }
  function func_1(...args) {
    return (
      /*func_1*/
      ctx[12](
        /*item*/
        ctx[14],
        ...args
      )
    );
  }
  tagbutton = new TagButton({
    props: {
      name: (
        /*item*/
        ctx[14].name
      ),
      prompt: (
        /*item*/
        ctx[14].prompt
      ),
      onClickTag: func,
      onDeleteItem: func_1
    }
  });
  return {
    c() {
      create_component(tagbutton.$$.fragment);
    },
    m(target, anchor) {
      mount_component(tagbutton, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const tagbutton_changes = {};
      if (dirty & /*results*/
      16) tagbutton_changes.name = /*item*/
      ctx[14].name;
      if (dirty & /*results*/
      16) tagbutton_changes.prompt = /*item*/
      ctx[14].prompt;
      if (dirty & /*onEditTag, results*/
      18) tagbutton_changes.onClickTag = func;
      if (dirty & /*onDeleteItem, results*/
      20) tagbutton_changes.onDeleteItem = func_1;
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
      destroy_component(tagbutton, detaching);
    }
  };
}
function create_each_block$4(key_1, ctx) {
  let first;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_1$5, create_else_block$3];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*$isEditMode*/
      ctx2[7]
    ) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    key: key_1,
    first: null,
    c() {
      first = empty();
      if_block.c();
      if_block_anchor = empty();
      this.first = first;
    },
    m(target, anchor) {
      insert(target, first, anchor);
      if_blocks[current_block_type_index].m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
          if_block.c();
        } else {
          if_block.p(ctx, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
        detach(first);
        detach(if_block_anchor);
      }
      if_blocks[current_block_type_index].d(detaching);
    }
  };
}
function create_if_block$6(ctx) {
  let span;
  let t_1_value = (
    /*$t*/
    ctx[6]("search.empty") + ""
  );
  let t_1;
  return {
    c() {
      span = element("span");
      t_1 = text(t_1_value);
      set_style(span, "color", "var(--descrip-text)");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t_1);
    },
    p(ctx2, dirty) {
      if (dirty & /*$t*/
      64 && t_1_value !== (t_1_value = /*$t*/
      ctx2[6]("search.empty") + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_fragment$a(ctx) {
  let div2;
  let div0;
  let input;
  let input_placeholder_value;
  let t0;
  let div1;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t1;
  let show_if = (
    /*keyword*/
    ctx[3].trim() && /*results*/
    ctx[4].length === 0
  );
  let current;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(
    /*results*/
    ctx[4]
  );
  const get_key = (ctx2) => (
    /*item*/
    ctx2[14].fileId + /*item*/
    ctx2[14].categoryId + /*item*/
    ctx2[14].name + /*item*/
    ctx2[14].prompt
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$4(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
  }
  let if_block = show_if && create_if_block$6(ctx);
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
      attr(input, "placeholder", input_placeholder_value = /*$t*/
      ctx[6]("search.placeholder"));
      attr(div0, "class", "d2ps-search");
      attr(div1, "class", "d2ps-tag-field");
      attr(div2, "class", "d2ps-tag-field d2ps-tag-field--top d2ps-tag-field--with-random");
      set_style(
        div2,
        "display",
        /*isActive*/
        ctx[5] ? "flex" : "none"
      );
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, input);
      set_input_value(
        input,
        /*keyword*/
        ctx[3]
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
          ctx[10]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & /*$t*/
      64 && input_placeholder_value !== (input_placeholder_value = /*$t*/
      ctx2[6]("search.placeholder"))) {
        attr(input, "placeholder", input_placeholder_value);
      }
      if (dirty & /*keyword*/
      8 && input.value !== /*keyword*/
      ctx2[3]) {
        set_input_value(
          input,
          /*keyword*/
          ctx2[3]
        );
      }
      if (dirty & /*results, onEditTag, onDeleteItem, $isEditMode, onClickTag*/
      151) {
        each_value = ensure_array_like(
          /*results*/
          ctx2[4]
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$4, t1, get_each_context$4);
        check_outros();
      }
      if (dirty & /*keyword, results*/
      24) show_if = /*keyword*/
      ctx2[3].trim() && /*results*/
      ctx2[4].length === 0;
      if (show_if) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$6(ctx2);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*isActive*/
      32) {
        set_style(
          div2,
          "display",
          /*isActive*/
          ctx2[5] ? "flex" : "none"
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
function instance$a($$self, $$props, $$invalidate) {
  let isActive;
  let results;
  let $sortedTagFiles;
  let $activeTabId;
  let $t;
  let $isEditMode;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(8, $sortedTagFiles = $$value));
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(9, $activeTabId = $$value));
  component_subscribe($$self, t, ($$value) => $$invalidate(6, $t = $$value));
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(7, $isEditMode = $$value));
  let { onClickTag } = $$props;
  let { onEditTag } = $$props;
  let { onDeleteItem } = $$props;
  const SEARCH_TAB = Constants.ICON_SEARCH;
  let keyword = "";
  function input_input_handler() {
    keyword = this.value;
    $$invalidate(3, keyword);
  }
  const func = (item, _p, _c) => onEditTag(item.fileId, item.categoryId, item.name, item.prompt);
  const func_1 = (item, name) => onDeleteItem(item.fileId, item.categoryId, name);
  $$self.$$set = ($$props2) => {
    if ("onClickTag" in $$props2) $$invalidate(0, onClickTag = $$props2.onClickTag);
    if ("onEditTag" in $$props2) $$invalidate(1, onEditTag = $$props2.onEditTag);
    if ("onDeleteItem" in $$props2) $$invalidate(2, onDeleteItem = $$props2.onDeleteItem);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$activeTabId*/
    512) {
      $$invalidate(5, isActive = $activeTabId === SEARCH_TAB);
    }
    if ($$self.$$.dirty & /*keyword, $sortedTagFiles*/
    264) {
      $$invalidate(4, results = (() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return [];
        const found = [];
        for (const file of $sortedTagFiles) {
          for (const cat of file.categories) {
            for (const item of flattenLeaves(cat.items)) {
              if (item.name.toLowerCase().includes(kw) || item.prompt.toLowerCase().includes(kw)) {
                found.push({
                  fileId: file.fileId,
                  categoryId: cat.categoryId,
                  name: item.name,
                  prompt: item.prompt
                });
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
    onEditTag,
    onDeleteItem,
    keyword,
    results,
    isActive,
    $t,
    $isEditMode,
    $sortedTagFiles,
    $activeTabId,
    input_input_handler,
    func,
    func_1
  ];
}
class SearchView extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$a, create_fragment$a, safe_not_equal, {
      onClickTag: 0,
      onEditTag: 1,
      onDeleteItem: 2
    });
  }
}
function create_fragment$9(ctx) {
  let div;
  let t2;
  return {
    c() {
      div = element("div");
      t2 = text(
        /*$tooltip*/
        ctx[0]
      );
      attr(div, "class", "d2ps-tooltip-container");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t2);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$tooltip*/
      1) set_data(
        t2,
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
function instance$9($$self, $$props, $$invalidate) {
  let $tooltip;
  component_subscribe($$self, tooltip, ($$value) => $$invalidate(0, $tooltip = $$value));
  return [$tooltip];
}
class ToolTip extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$9, create_fragment$9, safe_not_equal, {});
  }
}
function create_fragment$8(ctx) {
  let dialog_1;
  let div1;
  let p;
  let raw_value = (
    /*$t*/
    ctx[1]("migration.message") + ""
  );
  let t0;
  let div0;
  let button0;
  let t1_value = (
    /*$t*/
    ctx[1]("migration.confirm") + ""
  );
  let t1;
  let t2;
  let button1;
  let t3_value = (
    /*$t*/
    ctx[1]("common.cancel") + ""
  );
  let t3;
  let mounted;
  let dispose;
  return {
    c() {
      dialog_1 = element("dialog");
      div1 = element("div");
      p = element("p");
      t0 = space();
      div0 = element("div");
      button0 = element("button");
      t1 = text(t1_value);
      t2 = space();
      button1 = element("button");
      t3 = text(t3_value);
      attr(p, "class", "d2ps-dialog__message");
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY);
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY);
      attr(div0, "class", "d2ps-dialog__buttons");
      attr(div1, "class", "d2ps-dialog");
      attr(dialog_1, "class", "d2ps-dialog-root");
    },
    m(target, anchor) {
      insert(target, dialog_1, anchor);
      append(dialog_1, div1);
      append(div1, p);
      p.innerHTML = raw_value;
      append(div1, t0);
      append(div1, div0);
      append(div0, button0);
      append(button0, t1);
      append(div0, t2);
      append(div0, button1);
      append(button1, t3);
      ctx[5](dialog_1);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "click",
            /*handleConfirm*/
            ctx[2]
          ),
          listen(
            button1,
            "click",
            /*handleCancel*/
            ctx[3]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$t*/
      2 && raw_value !== (raw_value = /*$t*/
      ctx2[1]("migration.message") + "")) p.innerHTML = raw_value;
      if (dirty & /*$t*/
      2 && t1_value !== (t1_value = /*$t*/
      ctx2[1]("migration.confirm") + "")) set_data(t1, t1_value);
      if (dirty & /*$t*/
      2 && t3_value !== (t3_value = /*$t*/
      ctx2[1]("common.cancel") + "")) set_data(t3, t3_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(dialog_1);
      }
      ctx[5](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$8($$self, $$props, $$invalidate) {
  let $t;
  component_subscribe($$self, t, ($$value) => $$invalidate(1, $t = $$value));
  const dispatch = createEventDispatcher();
  let dialog;
  function open() {
    dialog.showModal();
  }
  function handleConfirm() {
    dialog.close();
    dispatch("confirm");
  }
  function handleCancel() {
    dialog.close();
    dispatch("cancel");
  }
  function dialog_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      dialog = $$value;
      $$invalidate(0, dialog);
    });
  }
  return [dialog, $t, handleConfirm, handleCancel, open, dialog_1_binding];
}
class MigrationDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$8, create_fragment$8, safe_not_equal, { open: 4 });
  }
  get open() {
    return this.$$.ctx[4];
  }
}
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[41] = list[i];
  return child_ctx;
}
function get_each_context_1$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[44] = list[i];
  return child_ctx;
}
function create_else_block_1(ctx) {
  let input;
  let input_placeholder_value;
  let t0;
  let button;
  let t1_value = (
    /*$t*/
    ctx[16]("common.existing") + ""
  );
  let t1;
  let mounted;
  let dispose;
  return {
    c() {
      input = element("input");
      t0 = space();
      button = element("button");
      t1 = text(t1_value);
      attr(input, "class", "d2ps-dialog__input");
      attr(input, "type", "text");
      attr(input, "placeholder", input_placeholder_value = /*$t*/
      ctx[16]("tag.field.newFileName"));
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-dialog__new-btn");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      set_input_value(
        input,
        /*newFileName*/
        ctx[6]
      );
      insert(target, t0, anchor);
      insert(target, button, anchor);
      append(button, t1);
      if (!mounted) {
        dispose = [
          listen(
            input,
            "input",
            /*input_input_handler*/
            ctx[31]
          ),
          listen(
            button,
            "click",
            /*click_handler_1*/
            ctx[32]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t*/
      65536 && input_placeholder_value !== (input_placeholder_value = /*$t*/
      ctx2[16]("tag.field.newFileName"))) {
        attr(input, "placeholder", input_placeholder_value);
      }
      if (dirty[0] & /*newFileName*/
      64 && input.value !== /*newFileName*/
      ctx2[6]) {
        set_input_value(
          input,
          /*newFileName*/
          ctx2[6]
        );
      }
      if (dirty[0] & /*$t*/
      65536 && t1_value !== (t1_value = /*$t*/
      ctx2[16]("common.existing") + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(input);
        detach(t0);
        detach(button);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_4(ctx) {
  let select;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let button;
  let t1_value = (
    /*$t*/
    ctx[16]("common.new") + ""
  );
  let t1;
  let mounted;
  let dispose;
  let each_value_1 = ensure_array_like(
    /*files*/
    ctx[10]
  );
  const get_key = (ctx2) => (
    /*f*/
    ctx2[44].fileId
  );
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
  }
  return {
    c() {
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      button = element("button");
      t1 = text(t1_value);
      attr(select, "class", "d2ps-dialog__select");
      if (
        /*fileId*/
        ctx[1] === void 0
      ) add_render_callback(() => (
        /*select_change_handler*/
        ctx[29].call(select)
      ));
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-dialog__new-btn");
    },
    m(target, anchor) {
      insert(target, select, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(select, null);
        }
      }
      select_option(
        select,
        /*fileId*/
        ctx[1],
        true
      );
      insert(target, t0, anchor);
      insert(target, button, anchor);
      append(button, t1);
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[29]
          ),
          listen(
            select,
            "change",
            /*handleFileChange*/
            ctx[17]
          ),
          listen(
            button,
            "click",
            /*click_handler*/
            ctx[30]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*files*/
      1024) {
        each_value_1 = ensure_array_like(
          /*files*/
          ctx2[10]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_1, each_1_lookup, select, destroy_block, create_each_block_1$1, null, get_each_context_1$1);
      }
      if (dirty[0] & /*fileId, files*/
      1026) {
        select_option(
          select,
          /*fileId*/
          ctx2[1]
        );
      }
      if (dirty[0] & /*$t*/
      65536 && t1_value !== (t1_value = /*$t*/
      ctx2[16]("common.new") + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(select);
        detach(t0);
        detach(button);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block_1$1(key_1, ctx) {
  let option;
  let t_1_value = (
    /*f*/
    ctx[44].fileId + ""
  );
  let t_1;
  let option_value_value;
  return {
    key: key_1,
    first: null,
    c() {
      option = element("option");
      t_1 = text(t_1_value);
      option.__value = option_value_value = /*f*/
      ctx[44].fileId;
      set_input_value(option, option.__value);
      this.first = option;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t_1);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*files*/
      1024 && t_1_value !== (t_1_value = /*f*/
      ctx[44].fileId + "")) set_data(t_1, t_1_value);
      if (dirty[0] & /*files*/
      1024 && option_value_value !== (option_value_value = /*f*/
      ctx[44].fileId)) {
        option.__value = option_value_value;
        set_input_value(option, option.__value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(option);
      }
    }
  };
}
function create_else_block$2(ctx) {
  let input;
  let input_placeholder_value;
  let t_1;
  let if_block_anchor;
  let mounted;
  let dispose;
  let if_block = !/*isNewFile*/
  ctx[5] && create_if_block_3(ctx);
  return {
    c() {
      input = element("input");
      t_1 = space();
      if (if_block) if_block.c();
      if_block_anchor = empty();
      attr(input, "class", "d2ps-dialog__input");
      attr(input, "type", "text");
      attr(input, "placeholder", input_placeholder_value = /*$t*/
      ctx[16]("tag.field.newCategoryName"));
    },
    m(target, anchor) {
      insert(target, input, anchor);
      set_input_value(
        input,
        /*newCategoryName*/
        ctx[8]
      );
      insert(target, t_1, anchor);
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      if (!mounted) {
        dispose = listen(
          input,
          "input",
          /*input_input_handler_1*/
          ctx[35]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t*/
      65536 && input_placeholder_value !== (input_placeholder_value = /*$t*/
      ctx2[16]("tag.field.newCategoryName"))) {
        attr(input, "placeholder", input_placeholder_value);
      }
      if (dirty[0] & /*newCategoryName*/
      256 && input.value !== /*newCategoryName*/
      ctx2[8]) {
        set_input_value(
          input,
          /*newCategoryName*/
          ctx2[8]
        );
      }
      if (!/*isNewFile*/
      ctx2[5]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_3(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(input);
        detach(t_1);
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_2$3(ctx) {
  let select;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let button;
  let t1_value = (
    /*$t*/
    ctx[16]("common.new") + ""
  );
  let t1;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(
    /*categories*/
    ctx[15]
  );
  const get_key = (ctx2) => (
    /*cat*/
    ctx2[41]
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$3(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
  }
  return {
    c() {
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      button = element("button");
      t1 = text(t1_value);
      attr(select, "class", "d2ps-dialog__select");
      if (
        /*categoryId*/
        ctx[2] === void 0
      ) add_render_callback(() => (
        /*select_change_handler_1*/
        ctx[33].call(select)
      ));
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-dialog__new-btn");
    },
    m(target, anchor) {
      insert(target, select, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(select, null);
        }
      }
      select_option(
        select,
        /*categoryId*/
        ctx[2],
        true
      );
      insert(target, t0, anchor);
      insert(target, button, anchor);
      append(button, t1);
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*select_change_handler_1*/
            ctx[33]
          ),
          listen(
            button,
            "click",
            /*click_handler_2*/
            ctx[34]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*categories*/
      32768) {
        each_value = ensure_array_like(
          /*categories*/
          ctx2[15]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, select, destroy_block, create_each_block$3, null, get_each_context$3);
      }
      if (dirty[0] & /*categoryId, categories*/
      32772) {
        select_option(
          select,
          /*categoryId*/
          ctx2[2]
        );
      }
      if (dirty[0] & /*$t*/
      65536 && t1_value !== (t1_value = /*$t*/
      ctx2[16]("common.new") + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(select);
        detach(t0);
        detach(button);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_3(ctx) {
  let button;
  let t_1_value = (
    /*$t*/
    ctx[16]("common.existing") + ""
  );
  let t_1;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t_1 = text(t_1_value);
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-dialog__new-btn");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t_1);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*click_handler_3*/
          ctx[36]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t*/
      65536 && t_1_value !== (t_1_value = /*$t*/
      ctx2[16]("common.existing") + "")) set_data(t_1, t_1_value);
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
function create_each_block$3(key_1, ctx) {
  let option;
  let t_1_value = (
    /*cat*/
    ctx[41] + ""
  );
  let t_1;
  let option_value_value;
  return {
    key: key_1,
    first: null,
    c() {
      option = element("option");
      t_1 = text(t_1_value);
      option.__value = option_value_value = /*cat*/
      ctx[41];
      set_input_value(option, option.__value);
      this.first = option;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t_1);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*categories*/
      32768 && t_1_value !== (t_1_value = /*cat*/
      ctx[41] + "")) set_data(t_1, t_1_value);
      if (dirty[0] & /*categories*/
      32768 && option_value_value !== (option_value_value = /*cat*/
      ctx[41])) {
        option.__value = option_value_value;
        set_input_value(option, option.__value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(option);
      }
    }
  };
}
function create_if_block_1$4(ctx) {
  let p;
  let t_1_value = (
    /*$t*/
    ctx[16]("tag.error.duplicate") + ""
  );
  let t_1;
  return {
    c() {
      p = element("p");
      t_1 = text(t_1_value);
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t*/
      65536 && t_1_value !== (t_1_value = /*$t*/
      ctx2[16]("tag.error.duplicate") + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_if_block$5(ctx) {
  let p;
  let t_1;
  return {
    c() {
      p = element("p");
      t_1 = text(
        /*errorMsg*/
        ctx[13]
      );
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*errorMsg*/
      8192) set_data(
        t_1,
        /*errorMsg*/
        ctx2[13]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_fragment$7(ctx) {
  let dialog_1;
  let div3;
  let h3;
  let t0_value = (
    /*$t*/
    ctx[16](
      /*mode*/
      ctx[0] === "add" ? "tag.add.title" : "tag.edit.title"
    ) + ""
  );
  let t0;
  let t1;
  let label0;
  let span0;
  let t2_value = (
    /*$t*/
    ctx[16]("tag.field.file") + ""
  );
  let t2;
  let t3;
  let div0;
  let t4;
  let label1;
  let span1;
  let t5_value = (
    /*$t*/
    ctx[16]("tag.field.category") + ""
  );
  let t5;
  let t6;
  let div1;
  let t7;
  let label2;
  let span2;
  let t8_value = (
    /*$t*/
    ctx[16]("tag.field.name") + ""
  );
  let t8;
  let t9;
  let input;
  let t10;
  let label3;
  let span3;
  let t11_value = (
    /*$t*/
    ctx[16]("tag.field.prompt") + ""
  );
  let t11;
  let t12;
  let textarea;
  let t13;
  let t14;
  let t15;
  let div2;
  let button0;
  let t16_value = (
    /*saving*/
    (ctx[9] ? (
      /*$t*/
      ctx[16]("common.saving")
    ) : (
      /*$t*/
      ctx[16]("common.save")
    )) + ""
  );
  let t16;
  let button0_disabled_value;
  let t17;
  let button1;
  let t18_value = (
    /*$t*/
    ctx[16]("common.cancel") + ""
  );
  let t18;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (!/*isNewFile*/
    ctx2[5]) return create_if_block_4;
    return create_else_block_1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  function select_block_type_1(ctx2, dirty) {
    if (!/*isNewCategory*/
    ctx2[7]) return create_if_block_2$3;
    return create_else_block$2;
  }
  let current_block_type_1 = select_block_type_1(ctx);
  let if_block1 = current_block_type_1(ctx);
  let if_block2 = (
    /*isDuplicate*/
    ctx[11] && create_if_block_1$4(ctx)
  );
  let if_block3 = (
    /*errorMsg*/
    ctx[13] && create_if_block$5(ctx)
  );
  return {
    c() {
      dialog_1 = element("dialog");
      div3 = element("div");
      h3 = element("h3");
      t0 = text(t0_value);
      t1 = space();
      label0 = element("label");
      span0 = element("span");
      t2 = text(t2_value);
      t3 = space();
      div0 = element("div");
      if_block0.c();
      t4 = space();
      label1 = element("label");
      span1 = element("span");
      t5 = text(t5_value);
      t6 = space();
      div1 = element("div");
      if_block1.c();
      t7 = space();
      label2 = element("label");
      span2 = element("span");
      t8 = text(t8_value);
      t9 = space();
      input = element("input");
      t10 = space();
      label3 = element("label");
      span3 = element("span");
      t11 = text(t11_value);
      t12 = space();
      textarea = element("textarea");
      t13 = space();
      if (if_block2) if_block2.c();
      t14 = space();
      if (if_block3) if_block3.c();
      t15 = space();
      div2 = element("div");
      button0 = element("button");
      t16 = text(t16_value);
      t17 = space();
      button1 = element("button");
      t18 = text(t18_value);
      attr(h3, "class", "d2ps-dialog__title");
      attr(div0, "class", "d2ps-dialog__row");
      attr(label0, "class", "d2ps-dialog__label");
      attr(div1, "class", "d2ps-dialog__row");
      attr(label1, "class", "d2ps-dialog__label");
      attr(input, "class", "d2ps-dialog__input");
      attr(input, "type", "text");
      attr(label2, "class", "d2ps-dialog__label");
      attr(textarea, "class", "d2ps-dialog__input");
      attr(label3, "class", "d2ps-dialog__label");
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY);
      button0.disabled = button0_disabled_value = !/*canSave*/
      ctx[14];
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY);
      attr(div2, "class", "d2ps-dialog__buttons");
      attr(div3, "class", "d2ps-dialog d2ps-dialog--editor");
      attr(dialog_1, "class", "d2ps-dialog-root");
    },
    m(target, anchor) {
      insert(target, dialog_1, anchor);
      append(dialog_1, div3);
      append(div3, h3);
      append(h3, t0);
      append(div3, t1);
      append(div3, label0);
      append(label0, span0);
      append(span0, t2);
      append(label0, t3);
      append(label0, div0);
      if_block0.m(div0, null);
      append(div3, t4);
      append(div3, label1);
      append(label1, span1);
      append(span1, t5);
      append(label1, t6);
      append(label1, div1);
      if_block1.m(div1, null);
      append(div3, t7);
      append(div3, label2);
      append(label2, span2);
      append(span2, t8);
      append(label2, t9);
      append(label2, input);
      set_input_value(
        input,
        /*name*/
        ctx[3]
      );
      append(div3, t10);
      append(div3, label3);
      append(label3, span3);
      append(span3, t11);
      append(label3, t12);
      append(label3, textarea);
      set_input_value(
        textarea,
        /*prompt*/
        ctx[4]
      );
      append(div3, t13);
      if (if_block2) if_block2.m(div3, null);
      append(div3, t14);
      if (if_block3) if_block3.m(div3, null);
      append(div3, t15);
      append(div3, div2);
      append(div2, button0);
      append(button0, t16);
      append(div2, t17);
      append(div2, button1);
      append(button1, t18);
      ctx[39](dialog_1);
      if (!mounted) {
        dispose = [
          listen(
            input,
            "input",
            /*input_input_handler_2*/
            ctx[37]
          ),
          listen(
            textarea,
            "input",
            /*textarea_input_handler*/
            ctx[38]
          ),
          listen(
            button0,
            "click",
            /*handleSave*/
            ctx[18]
          ),
          listen(
            button1,
            "click",
            /*handleCancel*/
            ctx[19]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t, mode*/
      65537 && t0_value !== (t0_value = /*$t*/
      ctx2[16](
        /*mode*/
        ctx2[0] === "add" ? "tag.add.title" : "tag.edit.title"
      ) + "")) set_data(t0, t0_value);
      if (dirty[0] & /*$t*/
      65536 && t2_value !== (t2_value = /*$t*/
      ctx2[16]("tag.field.file") + "")) set_data(t2, t2_value);
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div0, null);
        }
      }
      if (dirty[0] & /*$t*/
      65536 && t5_value !== (t5_value = /*$t*/
      ctx2[16]("tag.field.category") + "")) set_data(t5, t5_value);
      if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx2)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type_1(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div1, null);
        }
      }
      if (dirty[0] & /*$t*/
      65536 && t8_value !== (t8_value = /*$t*/
      ctx2[16]("tag.field.name") + "")) set_data(t8, t8_value);
      if (dirty[0] & /*name*/
      8 && input.value !== /*name*/
      ctx2[3]) {
        set_input_value(
          input,
          /*name*/
          ctx2[3]
        );
      }
      if (dirty[0] & /*$t*/
      65536 && t11_value !== (t11_value = /*$t*/
      ctx2[16]("tag.field.prompt") + "")) set_data(t11, t11_value);
      if (dirty[0] & /*prompt*/
      16) {
        set_input_value(
          textarea,
          /*prompt*/
          ctx2[4]
        );
      }
      if (
        /*isDuplicate*/
        ctx2[11]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block_1$4(ctx2);
          if_block2.c();
          if_block2.m(div3, t14);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (
        /*errorMsg*/
        ctx2[13]
      ) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block$5(ctx2);
          if_block3.c();
          if_block3.m(div3, t15);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (dirty[0] & /*saving, $t*/
      66048 && t16_value !== (t16_value = /*saving*/
      (ctx2[9] ? (
        /*$t*/
        ctx2[16]("common.saving")
      ) : (
        /*$t*/
        ctx2[16]("common.save")
      )) + "")) set_data(t16, t16_value);
      if (dirty[0] & /*canSave*/
      16384 && button0_disabled_value !== (button0_disabled_value = !/*canSave*/
      ctx2[14])) {
        button0.disabled = button0_disabled_value;
      }
      if (dirty[0] & /*$t*/
      65536 && t18_value !== (t18_value = /*$t*/
      ctx2[16]("common.cancel") + "")) set_data(t18, t18_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(dialog_1);
      }
      if_block0.d();
      if_block1.d();
      if (if_block2) if_block2.d();
      if (if_block3) if_block3.d();
      ctx[39](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$7($$self, $$props, $$invalidate) {
  let files;
  let selectedFile;
  let categories;
  let isDuplicate;
  let effectiveCategoryId;
  let effectiveFileId;
  let canSave;
  let $sortedTagFiles;
  let $t;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(28, $sortedTagFiles = $$value));
  component_subscribe($$self, t, ($$value) => $$invalidate(16, $t = $$value));
  const dispatch = createEventDispatcher();
  let mode = "add";
  let dialog;
  let fileId = "";
  let categoryId = "";
  let name = "";
  let prompt = "";
  let origFileId = "";
  let origCategoryId = "";
  let origName = "";
  let isNewFile = false;
  let newFileName = "";
  let isNewCategory = false;
  let newCategoryName = "";
  let errorMsg = "";
  let saving = false;
  function openAdd() {
    $$invalidate(0, mode = "add");
    const first = files[0];
    $$invalidate(1, fileId = first ? first.fileId : "");
    $$invalidate(2, categoryId = first && first.categories[0] ? first.categories[0].categoryId : "");
    $$invalidate(3, name = "");
    $$invalidate(4, prompt = "");
    $$invalidate(22, origFileId = "");
    $$invalidate(23, origCategoryId = "");
    $$invalidate(24, origName = "");
    $$invalidate(5, isNewFile = false);
    $$invalidate(6, newFileName = "");
    $$invalidate(7, isNewCategory = false);
    $$invalidate(8, newCategoryName = "");
    $$invalidate(13, errorMsg = "");
    $$invalidate(9, saving = false);
    dialog.showModal();
  }
  function openEdit(fId, catId, itemName, itemPrompt) {
    $$invalidate(0, mode = "edit");
    $$invalidate(1, fileId = fId);
    $$invalidate(2, categoryId = catId);
    $$invalidate(3, name = itemName);
    $$invalidate(4, prompt = itemPrompt);
    $$invalidate(22, origFileId = fId);
    $$invalidate(23, origCategoryId = catId);
    $$invalidate(24, origName = itemName);
    $$invalidate(5, isNewFile = false);
    $$invalidate(6, newFileName = "");
    $$invalidate(7, isNewCategory = false);
    $$invalidate(8, newCategoryName = "");
    $$invalidate(13, errorMsg = "");
    $$invalidate(9, saving = false);
    dialog.showModal();
  }
  function handleFileChange() {
    $$invalidate(7, isNewCategory = false);
    $$invalidate(8, newCategoryName = "");
    const f = files.find((f2) => f2.fileId === fileId);
    $$invalidate(2, categoryId = f && f.categories[0] ? f.categories[0].categoryId : "");
  }
  async function handleSave() {
    if (!canSave) return;
    $$invalidate(9, saving = true);
    $$invalidate(13, errorMsg = "");
    try {
      if (mode === "add") {
        await apiPostWithBackup("/add_item", {
          file: isNewFile ? "__new__" : fileId,
          new_file: isNewFile ? newFileName.trim() : null,
          category: isNewCategory ? "__new__" : categoryId,
          new_category: isNewCategory ? newCategoryName.trim() : null,
          name: name.trim(),
          prompt: prompt.trim()
        });
      } else {
        await apiPostWithBackup("/edit_item", {
          file: origFileId,
          category: origCategoryId,
          name: origName,
          new_name: name.trim(),
          new_prompt: prompt.trim(),
          new_file: isNewFile ? "__new__" : fileId,
          new_file_name: isNewFile ? newFileName.trim() : null,
          new_category: isNewCategory ? "__new__" : effectiveCategoryId,
          new_category_name: isNewCategory ? newCategoryName.trim() : null
        });
      }
      await fetchTags();
      dialog.close();
      dispatch("done");
    } catch (e) {
      $$invalidate(13, errorMsg = get_store_value(t)("common.error.generic"));
    } finally {
      $$invalidate(9, saving = false);
    }
  }
  function handleCancel() {
    dialog.close();
  }
  function select_change_handler() {
    fileId = select_value(this);
    $$invalidate(1, fileId);
    $$invalidate(10, files), $$invalidate(28, $sortedTagFiles);
  }
  const click_handler = () => {
    $$invalidate(5, isNewFile = true);
    $$invalidate(6, newFileName = "");
  };
  function input_input_handler() {
    newFileName = this.value;
    $$invalidate(6, newFileName);
  }
  const click_handler_1 = () => {
    $$invalidate(5, isNewFile = false);
  };
  function select_change_handler_1() {
    categoryId = select_value(this);
    $$invalidate(2, categoryId);
    $$invalidate(15, categories), $$invalidate(27, selectedFile), $$invalidate(10, files), $$invalidate(1, fileId), $$invalidate(28, $sortedTagFiles);
  }
  const click_handler_2 = () => {
    $$invalidate(7, isNewCategory = true);
    $$invalidate(8, newCategoryName = "");
  };
  function input_input_handler_1() {
    newCategoryName = this.value;
    $$invalidate(8, newCategoryName);
  }
  const click_handler_3 = () => {
    $$invalidate(7, isNewCategory = false);
  };
  function input_input_handler_2() {
    name = this.value;
    $$invalidate(3, name);
  }
  function textarea_input_handler() {
    prompt = this.value;
    $$invalidate(4, prompt);
  }
  function dialog_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      dialog = $$value;
      $$invalidate(12, dialog);
    });
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$sortedTagFiles*/
    268435456) {
      $$invalidate(10, files = $sortedTagFiles);
    }
    if ($$self.$$.dirty[0] & /*files, fileId*/
    1026) {
      $$invalidate(27, selectedFile = files.find((f) => f.fileId === fileId));
    }
    if ($$self.$$.dirty[0] & /*selectedFile*/
    134217728) {
      $$invalidate(15, categories = selectedFile ? selectedFile.categories.map((c) => c.categoryId) : []);
    }
    if ($$self.$$.dirty[0] & /*isNewFile, isNewCategory*/
    160) {
      if (isNewFile && !isNewCategory) {
        $$invalidate(7, isNewCategory = true);
      }
    }
    if ($$self.$$.dirty[0] & /*isNewFile, name, isNewCategory, newCategoryName, categoryId, files, fileId, mode, origFileId, origCategoryId, origName*/
    29361583) {
      $$invalidate(11, isDuplicate = (() => {
        if (isNewFile) return false;
        if (!name.trim()) return false;
        const targetCategory = isNewCategory ? newCategoryName : categoryId;
        const targetFile = files.find((f) => f.fileId === fileId);
        const cat = targetFile == null ? void 0 : targetFile.categories.find((c) => c.categoryId === targetCategory);
        if (!cat) return false;
        return cat.items.some((item) => {
          if (mode === "edit" && !isNewFile && fileId === origFileId && targetCategory === origCategoryId && item.name === origName) {
            return false;
          }
          return item.name === name.trim();
        });
      })());
    }
    if ($$self.$$.dirty[0] & /*isNewCategory, newCategoryName, categoryId*/
    388) {
      $$invalidate(25, effectiveCategoryId = isNewCategory ? newCategoryName.trim() : categoryId);
    }
    if ($$self.$$.dirty[0] & /*isNewFile, newFileName, fileId*/
    98) {
      $$invalidate(26, effectiveFileId = isNewFile ? newFileName.trim() : fileId);
    }
    if ($$self.$$.dirty[0] & /*name, prompt, effectiveFileId, effectiveCategoryId, isDuplicate, saving*/
    100665880) {
      $$invalidate(14, canSave = name.trim() !== "" && prompt.trim() !== "" && effectiveFileId !== "" && effectiveCategoryId !== "" && !isDuplicate && !saving);
    }
  };
  return [
    mode,
    fileId,
    categoryId,
    name,
    prompt,
    isNewFile,
    newFileName,
    isNewCategory,
    newCategoryName,
    saving,
    files,
    isDuplicate,
    dialog,
    errorMsg,
    canSave,
    categories,
    $t,
    handleFileChange,
    handleSave,
    handleCancel,
    openAdd,
    openEdit,
    origFileId,
    origCategoryId,
    origName,
    effectiveCategoryId,
    effectiveFileId,
    selectedFile,
    $sortedTagFiles,
    select_change_handler,
    click_handler,
    input_input_handler,
    click_handler_1,
    select_change_handler_1,
    click_handler_2,
    input_input_handler_1,
    click_handler_3,
    input_input_handler_2,
    textarea_input_handler,
    dialog_1_binding
  ];
}
class TagEditorDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$7, safe_not_equal, { openAdd: 20, openEdit: 21 }, null, [-1, -1]);
  }
  get openAdd() {
    return this.$$.ctx[20];
  }
  get openEdit() {
    return this.$$.ctx[21];
  }
}
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[25] = list[i];
  return child_ctx;
}
function create_else_block$1(ctx) {
  let input;
  let input_placeholder_value;
  let t0;
  let button;
  let t1_value = (
    /*$t*/
    ctx[10]("common.existing") + ""
  );
  let t1;
  let mounted;
  let dispose;
  return {
    c() {
      input = element("input");
      t0 = space();
      button = element("button");
      t1 = text(t1_value);
      attr(input, "class", "d2ps-dialog__input");
      attr(input, "type", "text");
      attr(input, "placeholder", input_placeholder_value = /*$t*/
      ctx[10]("category.field.newFileName"));
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-dialog__new-btn");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      set_input_value(
        input,
        /*newFileName*/
        ctx[3]
      );
      insert(target, t0, anchor);
      insert(target, button, anchor);
      append(button, t1);
      if (!mounted) {
        dispose = [
          listen(
            input,
            "input",
            /*input_input_handler*/
            ctx[20]
          ),
          listen(
            button,
            "click",
            /*click_handler_1*/
            ctx[21]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*$t*/
      1024 && input_placeholder_value !== (input_placeholder_value = /*$t*/
      ctx2[10]("category.field.newFileName"))) {
        attr(input, "placeholder", input_placeholder_value);
      }
      if (dirty & /*newFileName*/
      8 && input.value !== /*newFileName*/
      ctx2[3]) {
        set_input_value(
          input,
          /*newFileName*/
          ctx2[3]
        );
      }
      if (dirty & /*$t*/
      1024 && t1_value !== (t1_value = /*$t*/
      ctx2[10]("common.existing") + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(input);
        detach(t0);
        detach(button);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_2$2(ctx) {
  let select;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let button;
  let t1_value = (
    /*$t*/
    ctx[10]("common.new") + ""
  );
  let t1;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(
    /*files*/
    ctx[6]
  );
  const get_key = (ctx2) => (
    /*f*/
    ctx2[25].fileId
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$2(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
  }
  return {
    c() {
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      button = element("button");
      t1 = text(t1_value);
      attr(select, "class", "d2ps-dialog__select");
      if (
        /*fileId*/
        ctx[0] === void 0
      ) add_render_callback(() => (
        /*select_change_handler*/
        ctx[18].call(select)
      ));
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-dialog__new-btn");
    },
    m(target, anchor) {
      insert(target, select, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(select, null);
        }
      }
      select_option(
        select,
        /*fileId*/
        ctx[0],
        true
      );
      insert(target, t0, anchor);
      insert(target, button, anchor);
      append(button, t1);
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[18]
          ),
          listen(
            button,
            "click",
            /*click_handler*/
            ctx[19]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*files*/
      64) {
        each_value = ensure_array_like(
          /*files*/
          ctx2[6]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, select, destroy_block, create_each_block$2, null, get_each_context$2);
      }
      if (dirty & /*fileId, files*/
      65) {
        select_option(
          select,
          /*fileId*/
          ctx2[0]
        );
      }
      if (dirty & /*$t*/
      1024 && t1_value !== (t1_value = /*$t*/
      ctx2[10]("common.new") + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(select);
        detach(t0);
        detach(button);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block$2(key_1, ctx) {
  let option;
  let t_1_value = (
    /*f*/
    ctx[25].fileId + ""
  );
  let t_1;
  let option_value_value;
  return {
    key: key_1,
    first: null,
    c() {
      option = element("option");
      t_1 = text(t_1_value);
      option.__value = option_value_value = /*f*/
      ctx[25].fileId;
      set_input_value(option, option.__value);
      this.first = option;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t_1);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*files*/
      64 && t_1_value !== (t_1_value = /*f*/
      ctx[25].fileId + "")) set_data(t_1, t_1_value);
      if (dirty & /*files*/
      64 && option_value_value !== (option_value_value = /*f*/
      ctx[25].fileId)) {
        option.__value = option_value_value;
        set_input_value(option, option.__value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(option);
      }
    }
  };
}
function create_if_block_1$3(ctx) {
  let p;
  let t_1_value = (
    /*$t*/
    ctx[10]("category.error.duplicate") + ""
  );
  let t_1;
  return {
    c() {
      p = element("p");
      t_1 = text(t_1_value);
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty & /*$t*/
      1024 && t_1_value !== (t_1_value = /*$t*/
      ctx2[10]("category.error.duplicate") + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_if_block$4(ctx) {
  let p;
  let t_1;
  return {
    c() {
      p = element("p");
      t_1 = text(
        /*errorMsg*/
        ctx[8]
      );
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty & /*errorMsg*/
      256) set_data(
        t_1,
        /*errorMsg*/
        ctx2[8]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_fragment$6(ctx) {
  let dialog_1;
  let div2;
  let h3;
  let t0_value = (
    /*$t*/
    ctx[10]("category.edit.title") + ""
  );
  let t0;
  let t1;
  let label0;
  let span0;
  let t2_value = (
    /*$t*/
    ctx[10]("category.field.file") + ""
  );
  let t2;
  let t3;
  let div0;
  let t4;
  let label1;
  let span1;
  let t5_value = (
    /*$t*/
    ctx[10]("category.field.name") + ""
  );
  let t5;
  let t6;
  let input;
  let t7;
  let t8;
  let t9;
  let div1;
  let button0;
  let t10_value = (
    /*saving*/
    (ctx[4] ? (
      /*$t*/
      ctx[10]("common.saving")
    ) : (
      /*$t*/
      ctx[10]("common.save")
    )) + ""
  );
  let t10;
  let button0_disabled_value;
  let t11;
  let button1;
  let t12_value = (
    /*$t*/
    ctx[10]("common.cancel") + ""
  );
  let t12;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (!/*isNewFile*/
    ctx2[2]) return create_if_block_2$2;
    return create_else_block$1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  let if_block1 = (
    /*isDuplicate*/
    ctx[5] && create_if_block_1$3(ctx)
  );
  let if_block2 = (
    /*errorMsg*/
    ctx[8] && create_if_block$4(ctx)
  );
  return {
    c() {
      dialog_1 = element("dialog");
      div2 = element("div");
      h3 = element("h3");
      t0 = text(t0_value);
      t1 = space();
      label0 = element("label");
      span0 = element("span");
      t2 = text(t2_value);
      t3 = space();
      div0 = element("div");
      if_block0.c();
      t4 = space();
      label1 = element("label");
      span1 = element("span");
      t5 = text(t5_value);
      t6 = space();
      input = element("input");
      t7 = space();
      if (if_block1) if_block1.c();
      t8 = space();
      if (if_block2) if_block2.c();
      t9 = space();
      div1 = element("div");
      button0 = element("button");
      t10 = text(t10_value);
      t11 = space();
      button1 = element("button");
      t12 = text(t12_value);
      attr(h3, "class", "d2ps-dialog__title");
      attr(div0, "class", "d2ps-dialog__row");
      attr(label0, "class", "d2ps-dialog__label");
      attr(input, "class", "d2ps-dialog__input");
      attr(input, "type", "text");
      attr(label1, "class", "d2ps-dialog__label");
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY);
      button0.disabled = button0_disabled_value = !/*canSave*/
      ctx[9];
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY);
      attr(div1, "class", "d2ps-dialog__buttons");
      attr(div2, "class", "d2ps-dialog");
      attr(dialog_1, "class", "d2ps-dialog-root");
    },
    m(target, anchor) {
      insert(target, dialog_1, anchor);
      append(dialog_1, div2);
      append(div2, h3);
      append(h3, t0);
      append(div2, t1);
      append(div2, label0);
      append(label0, span0);
      append(span0, t2);
      append(label0, t3);
      append(label0, div0);
      if_block0.m(div0, null);
      append(div2, t4);
      append(div2, label1);
      append(label1, span1);
      append(span1, t5);
      append(label1, t6);
      append(label1, input);
      set_input_value(
        input,
        /*categoryName*/
        ctx[1]
      );
      append(div2, t7);
      if (if_block1) if_block1.m(div2, null);
      append(div2, t8);
      if (if_block2) if_block2.m(div2, null);
      append(div2, t9);
      append(div2, div1);
      append(div1, button0);
      append(button0, t10);
      append(div1, t11);
      append(div1, button1);
      append(button1, t12);
      ctx[23](dialog_1);
      if (!mounted) {
        dispose = [
          listen(
            input,
            "input",
            /*input_input_handler_1*/
            ctx[22]
          ),
          listen(
            button0,
            "click",
            /*handleSave*/
            ctx[11]
          ),
          listen(
            button1,
            "click",
            /*handleCancel*/
            ctx[12]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$t*/
      1024 && t0_value !== (t0_value = /*$t*/
      ctx2[10]("category.edit.title") + "")) set_data(t0, t0_value);
      if (dirty & /*$t*/
      1024 && t2_value !== (t2_value = /*$t*/
      ctx2[10]("category.field.file") + "")) set_data(t2, t2_value);
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div0, null);
        }
      }
      if (dirty & /*$t*/
      1024 && t5_value !== (t5_value = /*$t*/
      ctx2[10]("category.field.name") + "")) set_data(t5, t5_value);
      if (dirty & /*categoryName*/
      2 && input.value !== /*categoryName*/
      ctx2[1]) {
        set_input_value(
          input,
          /*categoryName*/
          ctx2[1]
        );
      }
      if (
        /*isDuplicate*/
        ctx2[5]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_1$3(ctx2);
          if_block1.c();
          if_block1.m(div2, t8);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (
        /*errorMsg*/
        ctx2[8]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block$4(ctx2);
          if_block2.c();
          if_block2.m(div2, t9);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty & /*saving, $t*/
      1040 && t10_value !== (t10_value = /*saving*/
      (ctx2[4] ? (
        /*$t*/
        ctx2[10]("common.saving")
      ) : (
        /*$t*/
        ctx2[10]("common.save")
      )) + "")) set_data(t10, t10_value);
      if (dirty & /*canSave*/
      512 && button0_disabled_value !== (button0_disabled_value = !/*canSave*/
      ctx2[9])) {
        button0.disabled = button0_disabled_value;
      }
      if (dirty & /*$t*/
      1024 && t12_value !== (t12_value = /*$t*/
      ctx2[10]("common.cancel") + "")) set_data(t12, t12_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(dialog_1);
      }
      if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      ctx[23](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$6($$self, $$props, $$invalidate) {
  let files;
  let isDuplicate;
  let effectiveFileId;
  let canSave;
  let $sortedTagFiles;
  let $t;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(17, $sortedTagFiles = $$value));
  component_subscribe($$self, t, ($$value) => $$invalidate(10, $t = $$value));
  const dispatch = createEventDispatcher();
  let dialog;
  let fileId = "";
  let categoryName = "";
  let isNewFile = false;
  let newFileName = "";
  let origFileId = "";
  let origCategoryName = "";
  let errorMsg = "";
  let saving = false;
  function openEdit(fId, catId) {
    $$invalidate(0, fileId = fId);
    $$invalidate(1, categoryName = catId);
    $$invalidate(14, origFileId = fId);
    $$invalidate(15, origCategoryName = catId);
    $$invalidate(2, isNewFile = false);
    $$invalidate(3, newFileName = "");
    $$invalidate(8, errorMsg = "");
    $$invalidate(4, saving = false);
    dialog.showModal();
  }
  async function handleSave() {
    if (!canSave) return;
    $$invalidate(4, saving = true);
    $$invalidate(8, errorMsg = "");
    try {
      await apiPostWithBackup("/edit_category", {
        file: origFileId,
        category: origCategoryName,
        new_file: isNewFile ? "__new__" : fileId,
        new_file_name: isNewFile ? newFileName.trim() : null,
        new_category: categoryName.trim()
      });
      await fetchTags();
      dialog.close();
      dispatch("done");
    } catch (e) {
      $$invalidate(8, errorMsg = get_store_value(t)("common.error.generic"));
    } finally {
      $$invalidate(4, saving = false);
    }
  }
  function handleCancel() {
    dialog.close();
  }
  function select_change_handler() {
    fileId = select_value(this);
    $$invalidate(0, fileId);
    $$invalidate(6, files), $$invalidate(17, $sortedTagFiles);
  }
  const click_handler = () => {
    $$invalidate(2, isNewFile = true);
    $$invalidate(3, newFileName = "");
  };
  function input_input_handler() {
    newFileName = this.value;
    $$invalidate(3, newFileName);
  }
  const click_handler_1 = () => {
    $$invalidate(2, isNewFile = false);
  };
  function input_input_handler_1() {
    categoryName = this.value;
    $$invalidate(1, categoryName);
  }
  function dialog_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      dialog = $$value;
      $$invalidate(7, dialog);
    });
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$sortedTagFiles*/
    131072) {
      $$invalidate(6, files = $sortedTagFiles);
    }
    if ($$self.$$.dirty & /*isNewFile, categoryName, fileId, origFileId, origCategoryName, files*/
    49223) {
      $$invalidate(5, isDuplicate = (() => {
        if (isNewFile) return false;
        const trimmed = categoryName.trim();
        if (!trimmed) return false;
        if (fileId === origFileId && trimmed === origCategoryName) return false;
        const targetFile = files.find((f) => f.fileId === fileId);
        if (!targetFile) return false;
        return targetFile.categories.some((c) => c.categoryId === trimmed);
      })());
    }
    if ($$self.$$.dirty & /*isNewFile, newFileName, fileId*/
    13) {
      $$invalidate(16, effectiveFileId = isNewFile ? newFileName.trim() : fileId);
    }
    if ($$self.$$.dirty & /*categoryName, effectiveFileId, isDuplicate, saving*/
    65586) {
      $$invalidate(9, canSave = categoryName.trim() !== "" && effectiveFileId !== "" && !isDuplicate && !saving);
    }
  };
  return [
    fileId,
    categoryName,
    isNewFile,
    newFileName,
    saving,
    isDuplicate,
    files,
    dialog,
    errorMsg,
    canSave,
    $t,
    handleSave,
    handleCancel,
    openEdit,
    origFileId,
    origCategoryName,
    effectiveFileId,
    $sortedTagFiles,
    select_change_handler,
    click_handler,
    input_input_handler,
    click_handler_1,
    input_input_handler_1,
    dialog_1_binding
  ];
}
class CategoryEditorDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, { openEdit: 13 });
  }
  get openEdit() {
    return this.$$.ctx[13];
  }
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[43] = list[i];
  const constants_0 = makeFileInfo(
    /*file*/
    child_ctx[43].fileId
  );
  child_ctx[44] = constants_0;
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[47] = list[i];
  const constants_0 = `${/*file*/
  child_ctx[43].fileId}::${/*category*/
  child_ctx[47].categoryId}`;
  child_ctx[48] = constants_0;
  const constants_1 = makeCategoryInfo(
    /*file*/
    child_ctx[43].fileId,
    /*category*/
    child_ctx[47].categoryId
  );
  child_ctx[49] = constants_1;
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[52] = list[i];
  const constants_0 = makeItemInfo(
    /*file*/
    child_ctx[43].fileId,
    /*category*/
    child_ctx[47].categoryId,
    /*item*/
    child_ctx[52].name
  );
  child_ctx[53] = constants_0;
  return child_ctx;
}
function create_if_block$3(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let each_value_1 = ensure_array_like(displayedCategories(
    /*file*/
    ctx[43],
    /*workingOrder*/
    ctx[10]
  ));
  const get_key = (ctx2) => (
    /*category*/
    ctx2[47].categoryId
  );
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$sortedTagFiles, workingOrder, dragging, handleDragOver, handleDrop, $t, handleDragStart, handleDragEnd, onDeleteItem, onEditItem, expandedCategories, onDeleteCategory, onEditCategory, toggleCategory*/
      1023774) {
        each_value_1 = ensure_array_like(displayedCategories(
          /*file*/
          ctx2[43],
          /*workingOrder*/
          ctx2[10]
        ));
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
    }
  };
}
function create_if_block_1$2(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let each_value_2 = ensure_array_like(displayedItems(
    /*file*/
    ctx[43],
    /*category*/
    ctx[47],
    /*workingOrder*/
    ctx[10]
  ));
  const get_key = (ctx2) => (
    /*item*/
    ctx2[52].name
  );
  for (let i = 0; i < each_value_2.length; i += 1) {
    let child_ctx = get_each_context_2(ctx, each_value_2, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$sortedTagFiles, workingOrder, dragging, handleDragOver, handleDrop, $t, handleDragStart, handleDragEnd, onDeleteItem, onEditItem*/
      990740) {
        each_value_2 = ensure_array_like(displayedItems(
          /*file*/
          ctx2[43],
          /*category*/
          ctx2[47],
          /*workingOrder*/
          ctx2[10]
        ));
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_2, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_2, each_1_anchor, get_each_context_2);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
    }
  };
}
function create_each_block_2(key_1, ctx) {
  let div;
  let span0;
  let t1;
  let button0;
  let t2_value = (
    /*item*/
    ctx[52].name + ""
  );
  let t2;
  let t3;
  let button1;
  let t4;
  let button1_aria_label_value;
  let t5;
  let span1;
  let span1_aria_label_value;
  let t6;
  let div_class_value;
  let mounted;
  let dispose;
  function click_handler_6() {
    return (
      /*click_handler_6*/
      ctx[33](
        /*file*/
        ctx[43],
        /*category*/
        ctx[47],
        /*item*/
        ctx[52]
      )
    );
  }
  function click_handler_7() {
    return (
      /*click_handler_7*/
      ctx[34](
        /*file*/
        ctx[43],
        /*category*/
        ctx[47],
        /*item*/
        ctx[52]
      )
    );
  }
  function dragstart_handler_2(...args) {
    return (
      /*dragstart_handler_2*/
      ctx[35](
        /*itemInfo*/
        ctx[53],
        ...args
      )
    );
  }
  function dragover_handler_2(...args) {
    return (
      /*dragover_handler_2*/
      ctx[36](
        /*itemInfo*/
        ctx[53],
        ...args
      )
    );
  }
  function drop_handler_2(...args) {
    return (
      /*drop_handler_2*/
      ctx[37](
        /*itemInfo*/
        ctx[53],
        ...args
      )
    );
  }
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      span0 = element("span");
      span0.textContent = "・";
      t1 = space();
      button0 = element("button");
      t2 = text(t2_value);
      t3 = space();
      button1 = element("button");
      t4 = text("x");
      t5 = space();
      span1 = element("span");
      t6 = space();
      attr(span0, "class", "d2ps-sort-row__toggle d2ps-sort-row__toggle--leaf");
      attr(button0, "type", "button");
      attr(button0, "class", "d2ps-sort-row__label d2ps-sort-row__label--clickable");
      attr(button1, "type", "button");
      attr(button1, "class", "d2ps-sort-row__close");
      attr(button1, "aria-label", button1_aria_label_value = /*$t*/
      ctx[11]("sort.aria.deleteTag"));
      attr(span1, "class", "d2ps-sort-row__drag-handle drag-handle w-3");
      attr(span1, "role", "button");
      attr(span1, "tabindex", "-1");
      attr(span1, "aria-label", span1_aria_label_value = /*$t*/
      ctx[11]("sort.aria.drag"));
      attr(span1, "draggable", "true");
      attr(div, "class", div_class_value = rowClasses(
        /*itemInfo*/
        ctx[53],
        "d2ps-sort-row d2ps-sort-row--item",
        /*dragging*/
        ctx[9]
      ));
      attr(div, "role", "listitem");
      this.first = div;
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, span0);
      append(div, t1);
      append(div, button0);
      append(button0, t2);
      append(div, t3);
      append(div, button1);
      append(button1, t4);
      append(div, t5);
      append(div, span1);
      append(div, t6);
      if (!mounted) {
        dispose = [
          listen(button0, "click", click_handler_6),
          listen(button1, "click", click_handler_7),
          listen(span1, "dragstart", dragstart_handler_2),
          listen(
            span1,
            "dragend",
            /*handleDragEnd*/
            ctx[17]
          ),
          listen(div, "dragover", dragover_handler_2),
          listen(div, "drop", drop_handler_2)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*$sortedTagFiles, workingOrder*/
      5120 && t2_value !== (t2_value = /*item*/
      ctx[52].name + "")) set_data(t2, t2_value);
      if (dirty[0] & /*$t*/
      2048 && button1_aria_label_value !== (button1_aria_label_value = /*$t*/
      ctx[11]("sort.aria.deleteTag"))) {
        attr(button1, "aria-label", button1_aria_label_value);
      }
      if (dirty[0] & /*$t*/
      2048 && span1_aria_label_value !== (span1_aria_label_value = /*$t*/
      ctx[11]("sort.aria.drag"))) {
        attr(span1, "aria-label", span1_aria_label_value);
      }
      if (dirty[0] & /*$sortedTagFiles, workingOrder, dragging*/
      5632 && div_class_value !== (div_class_value = rowClasses(
        /*itemInfo*/
        ctx[53],
        "d2ps-sort-row d2ps-sort-row--item",
        /*dragging*/
        ctx[9]
      ))) {
        attr(div, "class", div_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block_1(key_1, ctx) {
  let div;
  let button0;
  let t0_value = (
    /*expandedCategories*/
    ctx[8].has(
      /*catKey*/
      ctx[48]
    ) ? "▼" : "▷"
  );
  let t0;
  let button0_aria_label_value;
  let t1;
  let button1;
  let t2_value = (
    /*category*/
    ctx[47].categoryId + ""
  );
  let t2;
  let t3;
  let button2;
  let t4;
  let button2_aria_label_value;
  let t5;
  let span;
  let span_aria_label_value;
  let div_class_value;
  let t6;
  let show_if = (
    /*expandedCategories*/
    ctx[8].has(
      /*catKey*/
      ctx[48]
    )
  );
  let if_block_anchor;
  let mounted;
  let dispose;
  function click_handler_3() {
    return (
      /*click_handler_3*/
      ctx[27](
        /*file*/
        ctx[43],
        /*category*/
        ctx[47]
      )
    );
  }
  function click_handler_4() {
    return (
      /*click_handler_4*/
      ctx[28](
        /*file*/
        ctx[43],
        /*category*/
        ctx[47]
      )
    );
  }
  function click_handler_5() {
    return (
      /*click_handler_5*/
      ctx[29](
        /*file*/
        ctx[43],
        /*category*/
        ctx[47]
      )
    );
  }
  function dragstart_handler_1(...args) {
    return (
      /*dragstart_handler_1*/
      ctx[30](
        /*catInfo*/
        ctx[49],
        ...args
      )
    );
  }
  function dragover_handler_1(...args) {
    return (
      /*dragover_handler_1*/
      ctx[31](
        /*catInfo*/
        ctx[49],
        ...args
      )
    );
  }
  function drop_handler_1(...args) {
    return (
      /*drop_handler_1*/
      ctx[32](
        /*catInfo*/
        ctx[49],
        ...args
      )
    );
  }
  let if_block = show_if && create_if_block_1$2(ctx);
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      button0 = element("button");
      t0 = text(t0_value);
      t1 = space();
      button1 = element("button");
      t2 = text(t2_value);
      t3 = space();
      button2 = element("button");
      t4 = text("x");
      t5 = space();
      span = element("span");
      t6 = space();
      if (if_block) if_block.c();
      if_block_anchor = empty();
      attr(button0, "class", "d2ps-sort-row__toggle");
      attr(button0, "aria-label", button0_aria_label_value = /*expandedCategories*/
      ctx[8].has(
        /*catKey*/
        ctx[48]
      ) ? (
        /*$t*/
        ctx[11]("sort.aria.collapse")
      ) : (
        /*$t*/
        ctx[11]("sort.aria.expand")
      ));
      attr(button1, "type", "button");
      attr(button1, "class", "d2ps-sort-row__label d2ps-sort-row__label--clickable");
      attr(button2, "type", "button");
      attr(button2, "class", "d2ps-sort-row__close");
      attr(button2, "aria-label", button2_aria_label_value = /*$t*/
      ctx[11]("sort.aria.deleteCategory"));
      attr(span, "class", "d2ps-sort-row__drag-handle drag-handle w-3");
      attr(span, "role", "button");
      attr(span, "tabindex", "-1");
      attr(span, "aria-label", span_aria_label_value = /*$t*/
      ctx[11]("sort.aria.drag"));
      attr(span, "draggable", "true");
      attr(div, "class", div_class_value = rowClasses(
        /*catInfo*/
        ctx[49],
        "d2ps-sort-row d2ps-sort-row--category",
        /*dragging*/
        ctx[9]
      ));
      attr(div, "role", "listitem");
      this.first = div;
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, button0);
      append(button0, t0);
      append(div, t1);
      append(div, button1);
      append(button1, t2);
      append(div, t3);
      append(div, button2);
      append(button2, t4);
      append(div, t5);
      append(div, span);
      insert(target, t6, anchor);
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      if (!mounted) {
        dispose = [
          listen(button0, "click", click_handler_3),
          listen(button1, "click", click_handler_4),
          listen(button2, "click", click_handler_5),
          listen(span, "dragstart", dragstart_handler_1),
          listen(
            span,
            "dragend",
            /*handleDragEnd*/
            ctx[17]
          ),
          listen(div, "dragover", dragover_handler_1),
          listen(div, "drop", drop_handler_1)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*expandedCategories, $sortedTagFiles, workingOrder*/
      5376 && t0_value !== (t0_value = /*expandedCategories*/
      ctx[8].has(
        /*catKey*/
        ctx[48]
      ) ? "▼" : "▷")) set_data(t0, t0_value);
      if (dirty[0] & /*expandedCategories, $sortedTagFiles, workingOrder, $t*/
      7424 && button0_aria_label_value !== (button0_aria_label_value = /*expandedCategories*/
      ctx[8].has(
        /*catKey*/
        ctx[48]
      ) ? (
        /*$t*/
        ctx[11]("sort.aria.collapse")
      ) : (
        /*$t*/
        ctx[11]("sort.aria.expand")
      ))) {
        attr(button0, "aria-label", button0_aria_label_value);
      }
      if (dirty[0] & /*$sortedTagFiles, workingOrder*/
      5120 && t2_value !== (t2_value = /*category*/
      ctx[47].categoryId + "")) set_data(t2, t2_value);
      if (dirty[0] & /*$t*/
      2048 && button2_aria_label_value !== (button2_aria_label_value = /*$t*/
      ctx[11]("sort.aria.deleteCategory"))) {
        attr(button2, "aria-label", button2_aria_label_value);
      }
      if (dirty[0] & /*$t*/
      2048 && span_aria_label_value !== (span_aria_label_value = /*$t*/
      ctx[11]("sort.aria.drag"))) {
        attr(span, "aria-label", span_aria_label_value);
      }
      if (dirty[0] & /*$sortedTagFiles, workingOrder, dragging*/
      5632 && div_class_value !== (div_class_value = rowClasses(
        /*catInfo*/
        ctx[49],
        "d2ps-sort-row d2ps-sort-row--category",
        /*dragging*/
        ctx[9]
      ))) {
        attr(div, "class", div_class_value);
      }
      if (dirty[0] & /*expandedCategories, $sortedTagFiles, workingOrder*/
      5376) show_if = /*expandedCategories*/
      ctx[8].has(
        /*catKey*/
        ctx[48]
      );
      if (show_if) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_1$2(ctx);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
        detach(t6);
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block$1(key_1, ctx) {
  let div;
  let button0;
  let t0_value = (
    /*expandedFiles*/
    ctx[7].has(
      /*file*/
      ctx[43].fileId
    ) ? "▼" : "▷"
  );
  let t0;
  let button0_aria_label_value;
  let t1;
  let button1;
  let t2_value = (
    /*file*/
    ctx[43].fileId + ""
  );
  let t2;
  let t3;
  let button2;
  let t4;
  let button2_aria_label_value;
  let t5;
  let span;
  let span_aria_label_value;
  let div_class_value;
  let t6;
  let show_if = (
    /*expandedFiles*/
    ctx[7].has(
      /*file*/
      ctx[43].fileId
    )
  );
  let if_block_anchor;
  let mounted;
  let dispose;
  function click_handler() {
    return (
      /*click_handler*/
      ctx[21](
        /*file*/
        ctx[43]
      )
    );
  }
  function click_handler_1() {
    return (
      /*click_handler_1*/
      ctx[22](
        /*file*/
        ctx[43]
      )
    );
  }
  function click_handler_2() {
    return (
      /*click_handler_2*/
      ctx[23](
        /*file*/
        ctx[43]
      )
    );
  }
  function dragstart_handler(...args) {
    return (
      /*dragstart_handler*/
      ctx[24](
        /*fileInfo*/
        ctx[44],
        ...args
      )
    );
  }
  function dragover_handler(...args) {
    return (
      /*dragover_handler*/
      ctx[25](
        /*fileInfo*/
        ctx[44],
        ...args
      )
    );
  }
  function drop_handler(...args) {
    return (
      /*drop_handler*/
      ctx[26](
        /*fileInfo*/
        ctx[44],
        ...args
      )
    );
  }
  let if_block = show_if && create_if_block$3(ctx);
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      button0 = element("button");
      t0 = text(t0_value);
      t1 = space();
      button1 = element("button");
      t2 = text(t2_value);
      t3 = space();
      button2 = element("button");
      t4 = text("x");
      t5 = space();
      span = element("span");
      t6 = space();
      if (if_block) if_block.c();
      if_block_anchor = empty();
      attr(button0, "class", "d2ps-sort-row__toggle");
      attr(button0, "aria-label", button0_aria_label_value = /*expandedFiles*/
      ctx[7].has(
        /*file*/
        ctx[43].fileId
      ) ? (
        /*$t*/
        ctx[11]("sort.aria.collapse")
      ) : (
        /*$t*/
        ctx[11]("sort.aria.expand")
      ));
      attr(button1, "type", "button");
      attr(button1, "class", "d2ps-sort-row__label d2ps-sort-row__label--clickable");
      attr(button2, "type", "button");
      attr(button2, "class", "d2ps-sort-row__close");
      attr(button2, "aria-label", button2_aria_label_value = /*$t*/
      ctx[11]("sort.aria.deleteFile"));
      attr(span, "class", "d2ps-sort-row__drag-handle drag-handle w-3");
      attr(span, "role", "button");
      attr(span, "tabindex", "-1");
      attr(span, "aria-label", span_aria_label_value = /*$t*/
      ctx[11]("sort.aria.drag"));
      attr(span, "draggable", "true");
      attr(div, "class", div_class_value = rowClasses(
        /*fileInfo*/
        ctx[44],
        "d2ps-sort-row d2ps-sort-row--file",
        /*dragging*/
        ctx[9]
      ));
      attr(div, "role", "listitem");
      this.first = div;
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, button0);
      append(button0, t0);
      append(div, t1);
      append(div, button1);
      append(button1, t2);
      append(div, t3);
      append(div, button2);
      append(button2, t4);
      append(div, t5);
      append(div, span);
      insert(target, t6, anchor);
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      if (!mounted) {
        dispose = [
          listen(button0, "click", click_handler),
          listen(button1, "click", click_handler_1),
          listen(button2, "click", click_handler_2),
          listen(span, "dragstart", dragstart_handler),
          listen(
            span,
            "dragend",
            /*handleDragEnd*/
            ctx[17]
          ),
          listen(div, "dragover", dragover_handler),
          listen(div, "drop", drop_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*expandedFiles, $sortedTagFiles, workingOrder*/
      5248 && t0_value !== (t0_value = /*expandedFiles*/
      ctx[7].has(
        /*file*/
        ctx[43].fileId
      ) ? "▼" : "▷")) set_data(t0, t0_value);
      if (dirty[0] & /*expandedFiles, $sortedTagFiles, workingOrder, $t*/
      7296 && button0_aria_label_value !== (button0_aria_label_value = /*expandedFiles*/
      ctx[7].has(
        /*file*/
        ctx[43].fileId
      ) ? (
        /*$t*/
        ctx[11]("sort.aria.collapse")
      ) : (
        /*$t*/
        ctx[11]("sort.aria.expand")
      ))) {
        attr(button0, "aria-label", button0_aria_label_value);
      }
      if (dirty[0] & /*$sortedTagFiles, workingOrder*/
      5120 && t2_value !== (t2_value = /*file*/
      ctx[43].fileId + "")) set_data(t2, t2_value);
      if (dirty[0] & /*$t*/
      2048 && button2_aria_label_value !== (button2_aria_label_value = /*$t*/
      ctx[11]("sort.aria.deleteFile"))) {
        attr(button2, "aria-label", button2_aria_label_value);
      }
      if (dirty[0] & /*$t*/
      2048 && span_aria_label_value !== (span_aria_label_value = /*$t*/
      ctx[11]("sort.aria.drag"))) {
        attr(span, "aria-label", span_aria_label_value);
      }
      if (dirty[0] & /*$sortedTagFiles, workingOrder, dragging*/
      5632 && div_class_value !== (div_class_value = rowClasses(
        /*fileInfo*/
        ctx[44],
        "d2ps-sort-row d2ps-sort-row--file",
        /*dragging*/
        ctx[9]
      ))) {
        attr(div, "class", div_class_value);
      }
      if (dirty[0] & /*expandedFiles, $sortedTagFiles, workingOrder*/
      5248) show_if = /*expandedFiles*/
      ctx[7].has(
        /*file*/
        ctx[43].fileId
      );
      if (show_if) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block$3(ctx);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
        detach(t6);
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$5(ctx) {
  let dialog_1;
  let div2;
  let h3;
  let t0_value = (
    /*$t*/
    ctx[11]("sort.title") + ""
  );
  let t0;
  let t1;
  let div0;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t2;
  let div1;
  let button;
  let t3_value = (
    /*$t*/
    ctx[11]("common.close") + ""
  );
  let t3;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(displayedFiles(
    /*$sortedTagFiles*/
    ctx[12],
    /*workingOrder*/
    ctx[10]
  ));
  const get_key = (ctx2) => (
    /*file*/
    ctx2[43].fileId
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$1(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
  }
  return {
    c() {
      dialog_1 = element("dialog");
      div2 = element("div");
      h3 = element("h3");
      t0 = text(t0_value);
      t1 = space();
      div0 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t2 = space();
      div1 = element("div");
      button = element("button");
      t3 = text(t3_value);
      attr(h3, "class", "d2ps-dialog__title");
      attr(div0, "class", "d2ps-sort-tree text-sm font-inter font-light");
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY);
      attr(div1, "class", "d2ps-dialog__buttons");
      attr(div2, "class", "d2ps-dialog d2ps-dialog--sort");
      attr(dialog_1, "class", "d2ps-dialog-root");
    },
    m(target, anchor) {
      insert(target, dialog_1, anchor);
      append(dialog_1, div2);
      append(div2, h3);
      append(h3, t0);
      append(div2, t1);
      append(div2, div0);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div0, null);
        }
      }
      append(div2, t2);
      append(div2, div1);
      append(div1, button);
      append(button, t3);
      ctx[38](dialog_1);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*close*/
          ctx[13]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t*/
      2048 && t0_value !== (t0_value = /*$t*/
      ctx2[11]("sort.title") + "")) set_data(t0, t0_value);
      if (dirty[0] & /*$sortedTagFiles, workingOrder, dragging, handleDragOver, handleDrop, $t, handleDragStart, handleDragEnd, onDeleteItem, onEditItem, expandedCategories, onDeleteCategory, onEditCategory, toggleCategory, expandedFiles, onDeleteFile, onEditFile, toggleFile*/
      1040319) {
        each_value = ensure_array_like(displayedFiles(
          /*$sortedTagFiles*/
          ctx2[12],
          /*workingOrder*/
          ctx2[10]
        ));
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div0, destroy_block, create_each_block$1, null, get_each_context$1);
      }
      if (dirty[0] & /*$t*/
      2048 && t3_value !== (t3_value = /*$t*/
      ctx2[11]("common.close") + "")) set_data(t3, t3_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(dialog_1);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      ctx[38](null);
      mounted = false;
      dispose();
    }
  };
}
function fileKey(fileId) {
  return `file::${fileId}`;
}
function categoryKey(fileId, categoryId) {
  return `cat::${fileId}::${categoryId}`;
}
function itemKey(fileId, categoryId, name) {
  return `item::${fileId}::${categoryId}::${name}`;
}
function makeFileInfo(fileId) {
  return { type: "file", fileId };
}
function makeCategoryInfo(fileId, categoryId) {
  return { type: "category", fileId, categoryId };
}
function makeItemInfo(fileId, categoryId, name) {
  return { type: "item", fileId, categoryId, name };
}
function keyOf(info) {
  if (info.type === "file") return fileKey(info.fileId);
  if (info.type === "category") return categoryKey(info.fileId, info.categoryId);
  return itemKey(info.fileId, info.categoryId, info.name);
}
function displayedFiles(files, wo) {
  if ((wo == null ? void 0 : wo.type) !== "file") return files;
  const order = wo.sort;
  return [...files].sort((a, b) => order.indexOf(a.fileId) - order.indexOf(b.fileId));
}
function displayedCategories(file, wo) {
  if ((wo == null ? void 0 : wo.type) !== "category" || wo.fileId !== file.fileId) {
    return file.categories;
  }
  const order = wo.sort;
  return [...file.categories].sort((a, b) => order.indexOf(a.categoryId) - order.indexOf(b.categoryId));
}
function displayedItems(file, category, wo) {
  if ((wo == null ? void 0 : wo.type) !== "item" || wo.fileId !== file.fileId || wo.categoryId !== category.categoryId) {
    return category.items;
  }
  const order = wo.sort;
  return [...category.items].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
}
function computePosition(e, el) {
  const rect = el.getBoundingClientRect();
  return e.clientY < rect.top + rect.height / 2 ? "before" : "after";
}
function reorderArray(arr, from, to, position) {
  if (from === to) return arr.slice();
  const next = arr.filter((x) => x !== from);
  const targetIdx = next.indexOf(to);
  if (targetIdx === -1) return arr.slice();
  const insertIdx = position === "before" ? targetIdx : targetIdx + 1;
  next.splice(insertIdx, 0, from);
  return next;
}
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function isDragAffected(info, d) {
  if (!d) return false;
  if (d.type === "file") {
    return info.fileId === d.fileId;
  }
  if (d.type === "category") {
    if (info.type === "file") return false;
    return info.fileId === d.fileId && info.categoryId === d.categoryId;
  }
  if (info.type !== "item") return false;
  return info.fileId === d.fileId && info.categoryId === d.categoryId && info.name === d.name;
}
function rowClasses(info, base, d) {
  const classes = [base];
  if (isDragAffected(info, d)) {
    classes.push("d2ps-sort-row--dragging");
  }
  return classes.join(" ");
}
function instance$5($$self, $$props, $$invalidate) {
  let $t;
  let $sortedTagFiles;
  component_subscribe($$self, t, ($$value) => $$invalidate(11, $t = $$value));
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(12, $sortedTagFiles = $$value));
  let { onEditFile = () => {
  } } = $$props;
  let { onEditCategory = () => {
  } } = $$props;
  let { onEditItem = () => {
  } } = $$props;
  let { onDeleteCategory = () => {
  } } = $$props;
  let { onDeleteItem = () => {
  } } = $$props;
  let { onDeleteFile = () => {
  } } = $$props;
  let dialog;
  let expandedFiles = /* @__PURE__ */ new Set();
  let expandedCategories = /* @__PURE__ */ new Set();
  let dragging = null;
  let workingOrder = null;
  function open() {
    $$invalidate(7, expandedFiles = /* @__PURE__ */ new Set());
    $$invalidate(8, expandedCategories = /* @__PURE__ */ new Set());
    $$invalidate(9, dragging = null);
    $$invalidate(10, workingOrder = null);
    dialog.showModal();
  }
  function close() {
    dialog.close();
  }
  function toggleFile(fileId) {
    if (expandedFiles.has(fileId)) {
      expandedFiles.delete(fileId);
    } else {
      expandedFiles.add(fileId);
    }
    $$invalidate(7, expandedFiles);
  }
  function toggleCategory(fileId, categoryId) {
    const key = `${fileId}::${categoryId}`;
    if (expandedCategories.has(key)) {
      expandedCategories.delete(key);
    } else {
      expandedCategories.add(key);
    }
    $$invalidate(8, expandedCategories);
  }
  function isSameHierarchy(target) {
    if (!dragging || dragging.type !== target.type) return false;
    if (dragging.type === "file") return true;
    if (dragging.type === "category" && target.type === "category") {
      return target.fileId === dragging.fileId;
    }
    if (dragging.type === "item" && target.type === "item") {
      return target.fileId === dragging.fileId && target.categoryId === dragging.categoryId;
    }
    return false;
  }
  function currentFileOrder() {
    if ((workingOrder == null ? void 0 : workingOrder.type) === "file") return workingOrder.sort;
    return get_store_value(sortedTagFiles).map((f) => f.fileId);
  }
  function currentCategoryOrder(fileId) {
    if ((workingOrder == null ? void 0 : workingOrder.type) === "category" && workingOrder.fileId === fileId) {
      return workingOrder.sort;
    }
    const file = get_store_value(sortedTagFiles).find((f) => f.fileId === fileId);
    return file ? file.categories.map((c) => c.categoryId) : [];
  }
  function currentItemOrder(fileId, categoryId) {
    if ((workingOrder == null ? void 0 : workingOrder.type) === "item" && workingOrder.fileId === fileId && workingOrder.categoryId === categoryId) {
      return workingOrder.sort;
    }
    const file = get_store_value(sortedTagFiles).find((f) => f.fileId === fileId);
    const cat = file == null ? void 0 : file.categories.find((c) => c.categoryId === categoryId);
    return cat ? cat.items.map((i) => i.name) : [];
  }
  function handleDragStart(info, e) {
    $$invalidate(9, dragging = info);
    $$invalidate(10, workingOrder = null);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", keyOf(info));
      const handle = e.currentTarget;
      const row = handle.closest(".d2ps-sort-row");
      if (row) {
        const rect = row.getBoundingClientRect();
        e.dataTransfer.setDragImage(row, e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  }
  function handleDragEnd() {
    if (dragging) {
      $$invalidate(9, dragging = null);
      $$invalidate(10, workingOrder = null);
    }
  }
  function handleDragOver(target, e) {
    if (!dragging) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    if (!isSameHierarchy(target)) return;
    const el = e.currentTarget;
    const position = computePosition(e, el);
    if (dragging.type === "file" && target.type === "file") {
      const current = currentFileOrder();
      const next = reorderArray(current, dragging.fileId, target.fileId, position);
      if (!arraysEqual(current, next)) {
        $$invalidate(10, workingOrder = { type: "file", sort: next });
      }
    } else if (dragging.type === "category" && target.type === "category") {
      const current = currentCategoryOrder(dragging.fileId);
      const next = reorderArray(current, dragging.categoryId, target.categoryId, position);
      if (!arraysEqual(current, next)) {
        $$invalidate(10, workingOrder = {
          type: "category",
          fileId: dragging.fileId,
          sort: next
        });
      }
    } else if (dragging.type === "item" && target.type === "item") {
      const current = currentItemOrder(dragging.fileId, dragging.categoryId);
      const next = reorderArray(current, dragging.name, target.name, position);
      if (!arraysEqual(current, next)) {
        $$invalidate(10, workingOrder = {
          type: "item",
          fileId: dragging.fileId,
          categoryId: dragging.categoryId,
          sort: next
        });
      }
    }
  }
  async function handleDrop(_target, e) {
    if (!dragging) return;
    e.preventDefault();
    const order = workingOrder;
    $$invalidate(9, dragging = null);
    if (!order) {
      $$invalidate(10, workingOrder = null);
      return;
    }
    try {
      if (order.type === "file") {
        await apiPost("/reorder_files", { sort: order.sort });
      } else if (order.type === "category") {
        await apiPost("/reorder_categories", { file: order.fileId, sort: order.sort });
      } else if (order.type === "item") {
        await apiPost("/reorder_items", {
          file: order.fileId,
          category: order.categoryId,
          sort: order.sort
        });
      }
      await fetchTags();
    } catch (err) {
      console.error("[D2PS-Sort] reorder failed", err);
      await fetchTags();
    } finally {
      $$invalidate(10, workingOrder = null);
    }
  }
  const click_handler = (file) => toggleFile(file.fileId);
  const click_handler_1 = (file) => onEditFile(file.fileId);
  const click_handler_2 = (file) => onDeleteFile(file.fileId);
  const dragstart_handler = (fileInfo, e) => handleDragStart(fileInfo, e);
  const dragover_handler = (fileInfo, e) => handleDragOver(fileInfo, e);
  const drop_handler = (fileInfo, e) => handleDrop(fileInfo, e);
  const click_handler_3 = (file, category) => toggleCategory(file.fileId, category.categoryId);
  const click_handler_4 = (file, category) => onEditCategory(file.fileId, category.categoryId);
  const click_handler_5 = (file, category) => onDeleteCategory(file.fileId, category.categoryId);
  const dragstart_handler_1 = (catInfo, e) => handleDragStart(catInfo, e);
  const dragover_handler_1 = (catInfo, e) => handleDragOver(catInfo, e);
  const drop_handler_1 = (catInfo, e) => handleDrop(catInfo, e);
  const click_handler_6 = (file, category, item) => onEditItem(file.fileId, category.categoryId, item.name, item.prompt);
  const click_handler_7 = (file, category, item) => onDeleteItem(file.fileId, category.categoryId, item.name);
  const dragstart_handler_2 = (itemInfo, e) => handleDragStart(itemInfo, e);
  const dragover_handler_2 = (itemInfo, e) => handleDragOver(itemInfo, e);
  const drop_handler_2 = (itemInfo, e) => handleDrop(itemInfo, e);
  function dialog_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      dialog = $$value;
      $$invalidate(6, dialog);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("onEditFile" in $$props2) $$invalidate(0, onEditFile = $$props2.onEditFile);
    if ("onEditCategory" in $$props2) $$invalidate(1, onEditCategory = $$props2.onEditCategory);
    if ("onEditItem" in $$props2) $$invalidate(2, onEditItem = $$props2.onEditItem);
    if ("onDeleteCategory" in $$props2) $$invalidate(3, onDeleteCategory = $$props2.onDeleteCategory);
    if ("onDeleteItem" in $$props2) $$invalidate(4, onDeleteItem = $$props2.onDeleteItem);
    if ("onDeleteFile" in $$props2) $$invalidate(5, onDeleteFile = $$props2.onDeleteFile);
  };
  return [
    onEditFile,
    onEditCategory,
    onEditItem,
    onDeleteCategory,
    onDeleteItem,
    onDeleteFile,
    dialog,
    expandedFiles,
    expandedCategories,
    dragging,
    workingOrder,
    $t,
    $sortedTagFiles,
    close,
    toggleFile,
    toggleCategory,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    open,
    click_handler,
    click_handler_1,
    click_handler_2,
    dragstart_handler,
    dragover_handler,
    drop_handler,
    click_handler_3,
    click_handler_4,
    click_handler_5,
    dragstart_handler_1,
    dragover_handler_1,
    drop_handler_1,
    click_handler_6,
    click_handler_7,
    dragstart_handler_2,
    dragover_handler_2,
    drop_handler_2,
    dialog_1_binding
  ];
}
class SortDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$5,
      create_fragment$5,
      safe_not_equal,
      {
        onEditFile: 0,
        onEditCategory: 1,
        onEditItem: 2,
        onDeleteCategory: 3,
        onDeleteItem: 4,
        onDeleteFile: 5,
        open: 20
      },
      null,
      [-1, -1]
    );
  }
  get open() {
    return this.$$.ctx[20];
  }
}
function create_if_block$2(ctx) {
  let h3;
  let t_1;
  return {
    c() {
      h3 = element("h3");
      t_1 = text(
        /*title*/
        ctx[1]
      );
      attr(h3, "class", "d2ps-dialog__title");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      append(h3, t_1);
    },
    p(ctx2, dirty) {
      if (dirty & /*title*/
      2) set_data(
        t_1,
        /*title*/
        ctx2[1]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(h3);
      }
    }
  };
}
function create_fragment$4(ctx) {
  let dialog_1;
  let div1;
  let t0;
  let p;
  let t1;
  let t2;
  let div0;
  let button0;
  let t3;
  let t4;
  let button1;
  let t5;
  let mounted;
  let dispose;
  let if_block = (
    /*title*/
    ctx[1] && create_if_block$2(ctx)
  );
  return {
    c() {
      dialog_1 = element("dialog");
      div1 = element("div");
      if (if_block) if_block.c();
      t0 = space();
      p = element("p");
      t1 = text(
        /*message*/
        ctx[2]
      );
      t2 = space();
      div0 = element("div");
      button0 = element("button");
      t3 = text(
        /*confirmLabel*/
        ctx[3]
      );
      t4 = space();
      button1 = element("button");
      t5 = text(
        /*cancelLabel*/
        ctx[4]
      );
      attr(p, "class", "d2ps-dialog__message");
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY);
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY);
      attr(div0, "class", "d2ps-dialog__buttons");
      attr(div1, "class", "d2ps-dialog");
      attr(dialog_1, "class", "d2ps-dialog-root");
    },
    m(target, anchor) {
      insert(target, dialog_1, anchor);
      append(dialog_1, div1);
      if (if_block) if_block.m(div1, null);
      append(div1, t0);
      append(div1, p);
      append(p, t1);
      append(div1, t2);
      append(div1, div0);
      append(div0, button0);
      append(button0, t3);
      append(div0, t4);
      append(div0, button1);
      append(button1, t5);
      ctx[8](dialog_1);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "click",
            /*handleConfirm*/
            ctx[5]
          ),
          listen(
            button1,
            "click",
            /*handleCancel*/
            ctx[6]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*title*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$2(ctx2);
          if_block.c();
          if_block.m(div1, t0);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*message*/
      4) set_data(
        t1,
        /*message*/
        ctx2[2]
      );
      if (dirty & /*confirmLabel*/
      8) set_data(
        t3,
        /*confirmLabel*/
        ctx2[3]
      );
      if (dirty & /*cancelLabel*/
      16) set_data(
        t5,
        /*cancelLabel*/
        ctx2[4]
      );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(dialog_1);
      }
      if (if_block) if_block.d();
      ctx[8](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
  let dialog;
  let title = "";
  let message = "";
  let confirmLabel = "";
  let cancelLabel = "";
  let resolver = null;
  function open(opts) {
    const translate = get_store_value(t);
    $$invalidate(1, title = opts.title ?? "");
    $$invalidate(2, message = opts.message);
    $$invalidate(3, confirmLabel = opts.confirmLabel ?? translate("common.ok"));
    $$invalidate(4, cancelLabel = opts.cancelLabel ?? translate("common.cancel"));
    return new Promise((resolve) => {
      resolver = resolve;
      dialog.showModal();
    });
  }
  function handleConfirm() {
    dialog.close();
    resolver == null ? void 0 : resolver(true);
    resolver = null;
  }
  function handleCancel() {
    dialog.close();
    resolver == null ? void 0 : resolver(false);
    resolver = null;
  }
  function dialog_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      dialog = $$value;
      $$invalidate(0, dialog);
    });
  }
  return [
    dialog,
    title,
    message,
    confirmLabel,
    cancelLabel,
    handleConfirm,
    handleCancel,
    open,
    dialog_1_binding
  ];
}
class ConfirmDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, { open: 7 });
  }
  get open() {
    return this.$$.ctx[7];
  }
}
function create_fragment$3(ctx) {
  let dialog_1;
  let div1;
  let h3;
  let t0_value = (
    /*$t*/
    ctx[6]("file.delete.confirm.title") + ""
  );
  let t0;
  let t1;
  let p0;
  let raw0_value = (
    /*$t*/
    ctx[6]("file.delete.confirm.message", {
      fileId: (
        /*fileId*/
        ctx[0]
      ),
      categoryCount: (
        /*categoryCount*/
        ctx[3]
      ),
      itemCount: (
        /*itemCount*/
        ctx[4]
      )
    }) + ""
  );
  let t2;
  let p1;
  let raw1_value = (
    /*$t*/
    ctx[6]("file.delete.confirm.typePrompt", { fileId: (
      /*fileId*/
      ctx[0]
    ) }) + ""
  );
  let t3;
  let input;
  let t4;
  let div0;
  let button0;
  let t5_value = (
    /*$t*/
    ctx[6]("common.delete") + ""
  );
  let t5;
  let button0_disabled_value;
  let t6;
  let button1;
  let t7_value = (
    /*$t*/
    ctx[6]("common.cancel") + ""
  );
  let t7;
  let mounted;
  let dispose;
  return {
    c() {
      dialog_1 = element("dialog");
      div1 = element("div");
      h3 = element("h3");
      t0 = text(t0_value);
      t1 = space();
      p0 = element("p");
      t2 = space();
      p1 = element("p");
      t3 = space();
      input = element("input");
      t4 = space();
      div0 = element("div");
      button0 = element("button");
      t5 = text(t5_value);
      t6 = space();
      button1 = element("button");
      t7 = text(t7_value);
      attr(h3, "class", "d2ps-dialog__title");
      attr(p0, "class", "d2ps-dialog__message");
      attr(p1, "class", "d2ps-dialog__message");
      attr(input, "class", "d2ps-dialog__input d2ps-dialog__input--confirm");
      attr(input, "type", "text");
      attr(
        input,
        "placeholder",
        /*fileId*/
        ctx[0]
      );
      attr(input, "autocomplete", "off");
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_DESTRUCTIVE);
      button0.disabled = button0_disabled_value = !/*canDelete*/
      ctx[5];
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY);
      attr(div0, "class", "d2ps-dialog__buttons");
      attr(div1, "class", "d2ps-dialog d2ps-dialog--file-delete");
      attr(dialog_1, "class", "d2ps-dialog-root");
    },
    m(target, anchor) {
      insert(target, dialog_1, anchor);
      append(dialog_1, div1);
      append(div1, h3);
      append(h3, t0);
      append(div1, t1);
      append(div1, p0);
      p0.innerHTML = raw0_value;
      append(div1, t2);
      append(div1, p1);
      p1.innerHTML = raw1_value;
      append(div1, t3);
      append(div1, input);
      set_input_value(
        input,
        /*typedName*/
        ctx[1]
      );
      append(div1, t4);
      append(div1, div0);
      append(div0, button0);
      append(button0, t5);
      append(div0, t6);
      append(div0, button1);
      append(button1, t7);
      ctx[11](dialog_1);
      if (!mounted) {
        dispose = [
          listen(
            input,
            "input",
            /*input_input_handler*/
            ctx[10]
          ),
          listen(
            button0,
            "click",
            /*handleConfirm*/
            ctx[7]
          ),
          listen(
            button1,
            "click",
            /*handleCancel*/
            ctx[8]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$t*/
      64 && t0_value !== (t0_value = /*$t*/
      ctx2[6]("file.delete.confirm.title") + "")) set_data(t0, t0_value);
      if (dirty & /*$t, fileId, categoryCount, itemCount*/
      89 && raw0_value !== (raw0_value = /*$t*/
      ctx2[6]("file.delete.confirm.message", {
        fileId: (
          /*fileId*/
          ctx2[0]
        ),
        categoryCount: (
          /*categoryCount*/
          ctx2[3]
        ),
        itemCount: (
          /*itemCount*/
          ctx2[4]
        )
      }) + "")) p0.innerHTML = raw0_value;
      if (dirty & /*$t, fileId*/
      65 && raw1_value !== (raw1_value = /*$t*/
      ctx2[6]("file.delete.confirm.typePrompt", { fileId: (
        /*fileId*/
        ctx2[0]
      ) }) + "")) p1.innerHTML = raw1_value;
      if (dirty & /*fileId*/
      1) {
        attr(
          input,
          "placeholder",
          /*fileId*/
          ctx2[0]
        );
      }
      if (dirty & /*typedName*/
      2 && input.value !== /*typedName*/
      ctx2[1]) {
        set_input_value(
          input,
          /*typedName*/
          ctx2[1]
        );
      }
      if (dirty & /*$t*/
      64 && t5_value !== (t5_value = /*$t*/
      ctx2[6]("common.delete") + "")) set_data(t5, t5_value);
      if (dirty & /*canDelete*/
      32 && button0_disabled_value !== (button0_disabled_value = !/*canDelete*/
      ctx2[5])) {
        button0.disabled = button0_disabled_value;
      }
      if (dirty & /*$t*/
      64 && t7_value !== (t7_value = /*$t*/
      ctx2[6]("common.cancel") + "")) set_data(t7, t7_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(dialog_1);
      }
      ctx[11](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let canDelete;
  let $t;
  component_subscribe($$self, t, ($$value) => $$invalidate(6, $t = $$value));
  let dialog;
  let fileId = "";
  let categoryCount = 0;
  let itemCount = 0;
  let typedName = "";
  let resolver = null;
  function open(opts) {
    $$invalidate(0, fileId = opts.fileId);
    $$invalidate(3, categoryCount = opts.categoryCount);
    $$invalidate(4, itemCount = opts.itemCount);
    $$invalidate(1, typedName = "");
    return new Promise((resolve) => {
      resolver = resolve;
      dialog.showModal();
    });
  }
  function handleConfirm() {
    if (typedName !== fileId) return;
    dialog.close();
    resolver == null ? void 0 : resolver(true);
    resolver = null;
  }
  function handleCancel() {
    dialog.close();
    resolver == null ? void 0 : resolver(false);
    resolver = null;
  }
  function input_input_handler() {
    typedName = this.value;
    $$invalidate(1, typedName);
  }
  function dialog_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      dialog = $$value;
      $$invalidate(2, dialog);
    });
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*typedName, fileId*/
    3) {
      $$invalidate(5, canDelete = typedName === fileId);
    }
  };
  return [
    fileId,
    typedName,
    dialog,
    categoryCount,
    itemCount,
    canDelete,
    $t,
    handleConfirm,
    handleCancel,
    open,
    input_input_handler,
    dialog_1_binding
  ];
}
class FileDeleteConfirmDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, { open: 9 });
  }
  get open() {
    return this.$$.ctx[9];
  }
}
function create_if_block_2$1(ctx) {
  let p;
  let t_1_value = (
    /*$t*/
    ctx[7]("file.error.invalidChar") + ""
  );
  let t_1;
  return {
    c() {
      p = element("p");
      t_1 = text(t_1_value);
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty & /*$t*/
      128 && t_1_value !== (t_1_value = /*$t*/
      ctx2[7]("file.error.invalidChar") + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_if_block_1$1(ctx) {
  let p;
  let t_1_value = (
    /*$t*/
    ctx[7]("file.error.duplicate") + ""
  );
  let t_1;
  return {
    c() {
      p = element("p");
      t_1 = text(t_1_value);
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty & /*$t*/
      128 && t_1_value !== (t_1_value = /*$t*/
      ctx2[7]("file.error.duplicate") + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_if_block$1(ctx) {
  let p;
  let t_1;
  return {
    c() {
      p = element("p");
      t_1 = text(
        /*errorMsg*/
        ctx[5]
      );
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty & /*errorMsg*/
      32) set_data(
        t_1,
        /*errorMsg*/
        ctx2[5]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_fragment$2(ctx) {
  let dialog_1;
  let div1;
  let h3;
  let t0_value = (
    /*$t*/
    ctx[7]("file.rename.title") + ""
  );
  let t0;
  let t1;
  let label;
  let span;
  let t2_value = (
    /*$t*/
    ctx[7]("file.field.name") + ""
  );
  let t2;
  let t3;
  let input;
  let t4;
  let show_if;
  let t5;
  let t6;
  let div0;
  let button0;
  let t7_value = (
    /*saving*/
    (ctx[1] ? (
      /*$t*/
      ctx[7]("common.saving")
    ) : (
      /*$t*/
      ctx[7]("common.save")
    )) + ""
  );
  let t7;
  let button0_disabled_value;
  let t8;
  let button1;
  let t9_value = (
    /*$t*/
    ctx[7]("common.cancel") + ""
  );
  let t9;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (dirty & /*isInvalid, fileName*/
    9) show_if = null;
    if (
      /*isDuplicate*/
      ctx2[2]
    ) return create_if_block_1$1;
    if (show_if == null) show_if = !!/*isInvalid*/
    (ctx2[3] && /*fileName*/
    ctx2[0].trim() !== "");
    if (show_if) return create_if_block_2$1;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block0 = current_block_type && current_block_type(ctx);
  let if_block1 = (
    /*errorMsg*/
    ctx[5] && create_if_block$1(ctx)
  );
  return {
    c() {
      dialog_1 = element("dialog");
      div1 = element("div");
      h3 = element("h3");
      t0 = text(t0_value);
      t1 = space();
      label = element("label");
      span = element("span");
      t2 = text(t2_value);
      t3 = space();
      input = element("input");
      t4 = space();
      if (if_block0) if_block0.c();
      t5 = space();
      if (if_block1) if_block1.c();
      t6 = space();
      div0 = element("div");
      button0 = element("button");
      t7 = text(t7_value);
      t8 = space();
      button1 = element("button");
      t9 = text(t9_value);
      attr(h3, "class", "d2ps-dialog__title");
      attr(input, "class", "d2ps-dialog__input");
      attr(input, "type", "text");
      attr(label, "class", "d2ps-dialog__label");
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY);
      button0.disabled = button0_disabled_value = !/*canSave*/
      ctx[6];
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY);
      attr(div0, "class", "d2ps-dialog__buttons");
      attr(div1, "class", "d2ps-dialog");
      attr(dialog_1, "class", "d2ps-dialog-root");
    },
    m(target, anchor) {
      insert(target, dialog_1, anchor);
      append(dialog_1, div1);
      append(div1, h3);
      append(h3, t0);
      append(div1, t1);
      append(div1, label);
      append(label, span);
      append(span, t2);
      append(label, t3);
      append(label, input);
      set_input_value(
        input,
        /*fileName*/
        ctx[0]
      );
      append(div1, t4);
      if (if_block0) if_block0.m(div1, null);
      append(div1, t5);
      if (if_block1) if_block1.m(div1, null);
      append(div1, t6);
      append(div1, div0);
      append(div0, button0);
      append(button0, t7);
      append(div0, t8);
      append(div0, button1);
      append(button1, t9);
      ctx[14](dialog_1);
      if (!mounted) {
        dispose = [
          listen(
            input,
            "input",
            /*input_input_handler*/
            ctx[13]
          ),
          listen(
            button0,
            "click",
            /*handleSave*/
            ctx[8]
          ),
          listen(
            button1,
            "click",
            /*handleCancel*/
            ctx[9]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$t*/
      128 && t0_value !== (t0_value = /*$t*/
      ctx2[7]("file.rename.title") + "")) set_data(t0, t0_value);
      if (dirty & /*$t*/
      128 && t2_value !== (t2_value = /*$t*/
      ctx2[7]("file.field.name") + "")) set_data(t2, t2_value);
      if (dirty & /*fileName*/
      1 && input.value !== /*fileName*/
      ctx2[0]) {
        set_input_value(
          input,
          /*fileName*/
          ctx2[0]
        );
      }
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if (if_block0) if_block0.d(1);
        if_block0 = current_block_type && current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div1, t5);
        }
      }
      if (
        /*errorMsg*/
        ctx2[5]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block$1(ctx2);
          if_block1.c();
          if_block1.m(div1, t6);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*saving, $t*/
      130 && t7_value !== (t7_value = /*saving*/
      (ctx2[1] ? (
        /*$t*/
        ctx2[7]("common.saving")
      ) : (
        /*$t*/
        ctx2[7]("common.save")
      )) + "")) set_data(t7, t7_value);
      if (dirty & /*canSave*/
      64 && button0_disabled_value !== (button0_disabled_value = !/*canSave*/
      ctx2[6])) {
        button0.disabled = button0_disabled_value;
      }
      if (dirty & /*$t*/
      128 && t9_value !== (t9_value = /*$t*/
      ctx2[7]("common.cancel") + "")) set_data(t9, t9_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(dialog_1);
      }
      if (if_block0) {
        if_block0.d();
      }
      if (if_block1) if_block1.d();
      ctx[14](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let isDuplicate;
  let isInvalid;
  let canSave;
  let $sortedTagFiles;
  let $t;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(12, $sortedTagFiles = $$value));
  component_subscribe($$self, t, ($$value) => $$invalidate(7, $t = $$value));
  const dispatch = createEventDispatcher();
  let dialog;
  let fileName = "";
  let origFileName = "";
  let errorMsg = "";
  let saving = false;
  function openEdit(fileId) {
    $$invalidate(0, fileName = fileId);
    $$invalidate(11, origFileName = fileId);
    $$invalidate(5, errorMsg = "");
    $$invalidate(1, saving = false);
    dialog.showModal();
  }
  async function handleSave() {
    if (!canSave) return;
    const newId = fileName.trim();
    if (newId === origFileName) {
      dialog.close();
      return;
    }
    $$invalidate(1, saving = true);
    $$invalidate(5, errorMsg = "");
    try {
      const res = await apiPostWithBackup("/edit_file", { file: origFileName, new_file_name: newId });
      const translate = get_store_value(t);
      if (res.error === "duplicate") {
        $$invalidate(5, errorMsg = translate("file.error.duplicate"));
        return;
      }
      if (res.error === "not_found") {
        $$invalidate(5, errorMsg = translate("file.error.notFound"));
        return;
      }
      if (res.error === "invalid_file_name") {
        $$invalidate(5, errorMsg = translate("file.error.invalidName"));
        return;
      }
      if (!res.success) {
        $$invalidate(5, errorMsg = translate("common.error.generic"));
        return;
      }
      await fetchTags();
      dialog.close();
      dispatch("done", { oldId: origFileName, newId });
    } catch (e) {
      $$invalidate(5, errorMsg = get_store_value(t)("common.error.generic"));
    } finally {
      $$invalidate(1, saving = false);
    }
  }
  function handleCancel() {
    dialog.close();
  }
  function input_input_handler() {
    fileName = this.value;
    $$invalidate(0, fileName);
  }
  function dialog_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      dialog = $$value;
      $$invalidate(4, dialog);
    });
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*fileName, origFileName, $sortedTagFiles*/
    6145) {
      $$invalidate(2, isDuplicate = (() => {
        const trimmed = fileName.trim();
        if (!trimmed || trimmed === origFileName) return false;
        return $sortedTagFiles.some((f) => f.fileId === trimmed);
      })());
    }
    if ($$self.$$.dirty & /*fileName*/
    1) {
      $$invalidate(3, isInvalid = (() => {
        const trimmed = fileName.trim();
        if (!trimmed) return true;
        if (trimmed === "__config__") return true;
        return /[\/\\:*?"<>|]/.test(trimmed);
      })());
    }
    if ($$self.$$.dirty & /*isInvalid, isDuplicate, saving*/
    14) {
      $$invalidate(6, canSave = !isInvalid && !isDuplicate && !saving);
    }
  };
  return [
    fileName,
    saving,
    isDuplicate,
    isInvalid,
    dialog,
    errorMsg,
    canSave,
    $t,
    handleSave,
    handleCancel,
    openEdit,
    origFileName,
    $sortedTagFiles,
    input_input_handler,
    dialog_1_binding
  ];
}
class FileEditorDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { openEdit: 10 });
  }
  get openEdit() {
    return this.$$.ctx[10];
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[36] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let div3;
  let div0;
  let t0;
  let t1;
  let button0;
  let t3;
  let button1;
  let t5;
  let div2;
  let div1;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t6;
  let searchview;
  let t7;
  let tabnavi;
  let t8;
  let tooltip2;
  let current;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (
      /*$isEditMode*/
      ctx2[7]
    ) return create_if_block_2;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  let if_block1 = (
    /*$isEditMode*/
    ctx[7] && create_if_block_1(ctx)
  );
  let each_value = ensure_array_like(
    /*$sortedTagFiles*/
    ctx[10]
  );
  const get_key = (ctx2) => (
    /*file*/
    ctx2[36].fileId
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
  }
  searchview = new SearchView({
    props: {
      onClickTag: (
        /*handleClickTag*/
        ctx[13]
      ),
      onEditTag: (
        /*handleEditTag*/
        ctx[18]
      ),
      onDeleteItem: (
        /*handleDeleteItem*/
        ctx[22]
      )
    }
  });
  tabnavi = new TabNavi({
    props: {
      onDeleteFile: (
        /*handleDeleteFile*/
        ctx[24]
      )
    }
  });
  tooltip2 = new ToolTip({});
  return {
    c() {
      div3 = element("div");
      div0 = element("div");
      if_block0.c();
      t0 = space();
      if (if_block1) if_block1.c();
      t1 = space();
      button0 = element("button");
      button0.textContent = "🔄";
      t3 = space();
      button1 = element("button");
      button1.textContent = "✖";
      t5 = space();
      div2 = element("div");
      div1 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t6 = space();
      create_component(searchview.$$.fragment);
      t7 = space();
      create_component(tabnavi.$$.fragment);
      t8 = space();
      create_component(tooltip2.$$.fragment);
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY + " d2ps-btn d2ps-btn--controller");
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY + " d2ps-btn d2ps-btn--controller");
      attr(div0, "class", "d2ps-controller");
      attr(div1, "class", "d2ps-tag-container");
      attr(div2, "class", "d2ps-tag-wrapper");
      attr(div3, "class", "d2ps");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div0);
      if_block0.m(div0, null);
      append(div0, t0);
      if (if_block1) if_block1.m(div0, null);
      append(div0, t1);
      append(div0, button0);
      append(div0, t3);
      append(div0, button1);
      append(div3, t5);
      append(div3, div2);
      append(div2, div1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div1, null);
        }
      }
      append(div1, t6);
      mount_component(searchview, div1, null);
      append(div1, t7);
      mount_component(tabnavi, div1, null);
      append(div3, t8);
      mount_component(tooltip2, div3, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "click",
            /*handleReload*/
            ctx[11]
          ),
          listen(
            button1,
            "click",
            /*handleClose*/
            ctx[12]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div0, t0);
        }
      }
      if (
        /*$isEditMode*/
        ctx2[7]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_1(ctx2);
          if_block1.c();
          if_block1.m(div0, t1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty[0] & /*$sortedTagFiles, handleClickTag, handleEditTag, handleEditCategory, handleDeleteItem, handleDeleteCategory*/
      13378560) {
        each_value = ensure_array_like(
          /*$sortedTagFiles*/
          ctx2[10]
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block, t6, get_each_context);
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
      if_block0.d();
      if (if_block1) if_block1.d();
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
function create_else_block(ctx) {
  let button;
  let t_1_value = (
    /*$t*/
    ctx[9]("button.edit") + ""
  );
  let t_1;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t_1 = text(t_1_value);
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY + " d2ps-btn d2ps-btn--controller");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t_1);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*handleEditClick*/
          ctx[14]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t*/
      512 && t_1_value !== (t_1_value = /*$t*/
      ctx2[9]("button.edit") + "")) set_data(t_1, t_1_value);
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
function create_if_block_2(ctx) {
  let button;
  let t_1_value = (
    /*$t*/
    ctx[9]("button.editDone") + ""
  );
  let t_1;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t_1 = text(t_1_value);
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_DESTRUCTIVE + " d2ps-btn d2ps-btn--controller");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, t_1);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*handleEditClick*/
          ctx[14]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t*/
      512 && t_1_value !== (t_1_value = /*$t*/
      ctx2[9]("button.editDone") + "")) set_data(t_1, t_1_value);
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
function create_if_block_1(ctx) {
  let button0;
  let t0_value = (
    /*$t*/
    ctx[9]("button.add") + ""
  );
  let t0;
  let t1;
  let button1;
  let t2_value = (
    /*$t*/
    ctx[9]("button.sort") + ""
  );
  let t2;
  let mounted;
  let dispose;
  return {
    c() {
      button0 = element("button");
      t0 = text(t0_value);
      t1 = space();
      button1 = element("button");
      t2 = text(t2_value);
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-btn d2ps-btn--controller");
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-btn d2ps-btn--controller");
    },
    m(target, anchor) {
      insert(target, button0, anchor);
      append(button0, t0);
      insert(target, t1, anchor);
      insert(target, button1, anchor);
      append(button1, t2);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "click",
            /*handleAddTag*/
            ctx[16]
          ),
          listen(
            button1,
            "click",
            /*handleOpenSort*/
            ctx[17]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$t*/
      512 && t0_value !== (t0_value = /*$t*/
      ctx2[9]("button.add") + "")) set_data(t0, t0_value);
      if (dirty[0] & /*$t*/
      512 && t2_value !== (t2_value = /*$t*/
      ctx2[9]("button.sort") + "")) set_data(t2, t2_value);
    },
    d(detaching) {
      if (detaching) {
        detach(button0);
        detach(t1);
        detach(button1);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block(key_1, ctx) {
  let first;
  let categoryview;
  let current;
  function func(...args) {
    return (
      /*func*/
      ctx[25](
        /*file*/
        ctx[36],
        ...args
      )
    );
  }
  function func_1(...args) {
    return (
      /*func_1*/
      ctx[26](
        /*file*/
        ctx[36],
        ...args
      )
    );
  }
  function func_2(...args) {
    return (
      /*func_2*/
      ctx[27](
        /*file*/
        ctx[36],
        ...args
      )
    );
  }
  function func_3(...args) {
    return (
      /*func_3*/
      ctx[28](
        /*file*/
        ctx[36],
        ...args
      )
    );
  }
  categoryview = new CategoryView({
    props: {
      file: (
        /*file*/
        ctx[36]
      ),
      onClickTag: (
        /*handleClickTag*/
        ctx[13]
      ),
      onEditTag: func,
      onEditCategory: func_1,
      onDeleteItem: func_2,
      onDeleteCategory: func_3
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
      if (dirty[0] & /*$sortedTagFiles*/
      1024) categoryview_changes.file = /*file*/
      ctx[36];
      if (dirty[0] & /*$sortedTagFiles*/
      1024) categoryview_changes.onEditTag = func;
      if (dirty[0] & /*$sortedTagFiles*/
      1024) categoryview_changes.onEditCategory = func_1;
      if (dirty[0] & /*$sortedTagFiles*/
      1024) categoryview_changes.onDeleteItem = func_2;
      if (dirty[0] & /*$sortedTagFiles*/
      1024) categoryview_changes.onDeleteCategory = func_3;
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
  let t0;
  let migrationdialog;
  let t1;
  let tageditordialog;
  let t2;
  let categoryeditordialog;
  let t3;
  let sortdialog;
  let t4;
  let confirmdialog;
  let t5;
  let filedeleteconfirmdialog;
  let t6;
  let fileeditordialog;
  let current;
  let if_block = (
    /*$isPanelVisible*/
    ctx[8] && create_if_block(ctx)
  );
  let migrationdialog_props = {};
  migrationdialog = new MigrationDialog({ props: migrationdialog_props });
  ctx[29](migrationdialog);
  migrationdialog.$on(
    "confirm",
    /*handleMigrationConfirm*/
    ctx[15]
  );
  migrationdialog.$on("cancel", cancel_handler);
  let tageditordialog_props = {};
  tageditordialog = new TagEditorDialog({ props: tageditordialog_props });
  ctx[30](tageditordialog);
  tageditordialog.$on("done", done_handler);
  let categoryeditordialog_props = {};
  categoryeditordialog = new CategoryEditorDialog({ props: categoryeditordialog_props });
  ctx[31](categoryeditordialog);
  categoryeditordialog.$on("done", done_handler_1);
  let sortdialog_props = {
    onEditCategory: (
      /*handleEditCategory*/
      ctx[19]
    ),
    onEditItem: (
      /*handleEditTag*/
      ctx[18]
    ),
    onEditFile: (
      /*handleEditFile*/
      ctx[20]
    ),
    onDeleteCategory: (
      /*handleDeleteCategory*/
      ctx[23]
    ),
    onDeleteItem: (
      /*handleDeleteItem*/
      ctx[22]
    ),
    onDeleteFile: (
      /*handleDeleteFile*/
      ctx[24]
    )
  };
  sortdialog = new SortDialog({ props: sortdialog_props });
  ctx[32](sortdialog);
  let confirmdialog_props = {};
  confirmdialog = new ConfirmDialog({ props: confirmdialog_props });
  ctx[33](confirmdialog);
  let filedeleteconfirmdialog_props = {};
  filedeleteconfirmdialog = new FileDeleteConfirmDialog({ props: filedeleteconfirmdialog_props });
  ctx[34](filedeleteconfirmdialog);
  let fileeditordialog_props = {};
  fileeditordialog = new FileEditorDialog({ props: fileeditordialog_props });
  ctx[35](fileeditordialog);
  fileeditordialog.$on(
    "done",
    /*handleFileRenamed*/
    ctx[21]
  );
  return {
    c() {
      if (if_block) if_block.c();
      t0 = space();
      create_component(migrationdialog.$$.fragment);
      t1 = space();
      create_component(tageditordialog.$$.fragment);
      t2 = space();
      create_component(categoryeditordialog.$$.fragment);
      t3 = space();
      create_component(sortdialog.$$.fragment);
      t4 = space();
      create_component(confirmdialog.$$.fragment);
      t5 = space();
      create_component(filedeleteconfirmdialog.$$.fragment);
      t6 = space();
      create_component(fileeditordialog.$$.fragment);
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, t0, anchor);
      mount_component(migrationdialog, target, anchor);
      insert(target, t1, anchor);
      mount_component(tageditordialog, target, anchor);
      insert(target, t2, anchor);
      mount_component(categoryeditordialog, target, anchor);
      insert(target, t3, anchor);
      mount_component(sortdialog, target, anchor);
      insert(target, t4, anchor);
      mount_component(confirmdialog, target, anchor);
      insert(target, t5, anchor);
      mount_component(filedeleteconfirmdialog, target, anchor);
      insert(target, t6, anchor);
      mount_component(fileeditordialog, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*$isPanelVisible*/
        ctx2[8]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*$isPanelVisible*/
          256) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(t0.parentNode, t0);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      const migrationdialog_changes = {};
      migrationdialog.$set(migrationdialog_changes);
      const tageditordialog_changes = {};
      tageditordialog.$set(tageditordialog_changes);
      const categoryeditordialog_changes = {};
      categoryeditordialog.$set(categoryeditordialog_changes);
      const sortdialog_changes = {};
      sortdialog.$set(sortdialog_changes);
      const confirmdialog_changes = {};
      confirmdialog.$set(confirmdialog_changes);
      const filedeleteconfirmdialog_changes = {};
      filedeleteconfirmdialog.$set(filedeleteconfirmdialog_changes);
      const fileeditordialog_changes = {};
      fileeditordialog.$set(fileeditordialog_changes);
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      transition_in(migrationdialog.$$.fragment, local);
      transition_in(tageditordialog.$$.fragment, local);
      transition_in(categoryeditordialog.$$.fragment, local);
      transition_in(sortdialog.$$.fragment, local);
      transition_in(confirmdialog.$$.fragment, local);
      transition_in(filedeleteconfirmdialog.$$.fragment, local);
      transition_in(fileeditordialog.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      transition_out(migrationdialog.$$.fragment, local);
      transition_out(tageditordialog.$$.fragment, local);
      transition_out(categoryeditordialog.$$.fragment, local);
      transition_out(sortdialog.$$.fragment, local);
      transition_out(confirmdialog.$$.fragment, local);
      transition_out(filedeleteconfirmdialog.$$.fragment, local);
      transition_out(fileeditordialog.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t0);
        detach(t1);
        detach(t2);
        detach(t3);
        detach(t4);
        detach(t5);
        detach(t6);
      }
      if (if_block) if_block.d(detaching);
      ctx[29](null);
      destroy_component(migrationdialog, detaching);
      ctx[30](null);
      destroy_component(tageditordialog, detaching);
      ctx[31](null);
      destroy_component(categoryeditordialog, detaching);
      ctx[32](null);
      destroy_component(sortdialog, detaching);
      ctx[33](null);
      destroy_component(confirmdialog, detaching);
      ctx[34](null);
      destroy_component(filedeleteconfirmdialog, detaching);
      ctx[35](null);
      destroy_component(fileeditordialog, detaching);
    }
  };
}
const cancel_handler = () => {
};
const done_handler = () => {
};
const done_handler_1 = () => {
};
function instance$1($$self, $$props, $$invalidate) {
  let $isEditMode;
  let $isPanelVisible;
  let $t;
  let $sortedTagFiles;
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(7, $isEditMode = $$value));
  component_subscribe($$self, isPanelVisible, ($$value) => $$invalidate(8, $isPanelVisible = $$value));
  component_subscribe($$self, t, ($$value) => $$invalidate(9, $t = $$value));
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(10, $sortedTagFiles = $$value));
  let migrationDialog;
  let editorDialog;
  let categoryEditorDialog;
  let sortDialog;
  let confirmDialog;
  let fileDeleteDialog;
  let fileEditorDialog;
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
  async function handleEditClick() {
    if ($isEditMode) {
      isEditMode.set(false);
      return;
    }
    const res = await apiGet("/check_migration_needed");
    if (res.needed) {
      migrationDialog.open();
    } else {
      isEditMode.set(true);
    }
  }
  async function handleMigrationConfirm() {
    await apiPost("/migrate", {});
    await fetchTags();
    isEditMode.set(true);
  }
  function handleAddTag() {
    editorDialog.openAdd();
  }
  function handleOpenSort() {
    sortDialog.open();
  }
  function handleEditTag(fileId, categoryId, name, prompt) {
    editorDialog.openEdit(fileId, categoryId, name, prompt);
  }
  function handleEditCategory(fileId, categoryId) {
    categoryEditorDialog.openEdit(fileId, categoryId);
  }
  function handleEditFile(fileId) {
    fileEditorDialog.openEdit(fileId);
  }
  function handleFileRenamed(e) {
    if (get_store_value(activeTabId) === e.detail.oldId) {
      activeTabId.set(e.detail.newId);
    }
  }
  async function handleDeleteItem(fileId, categoryId, itemName) {
    const translate = get_store_value(t);
    const ok = await confirmDialog.open({
      title: translate("tag.delete.confirm.title"),
      message: translate("tag.delete.confirm.message", { name: itemName }),
      confirmLabel: translate("common.delete")
    });
    if (!ok) return;
    await apiPostWithBackup("/delete_item", {
      type: "item",
      file: fileId,
      category: categoryId,
      name: itemName
    });
    await fetchTags();
  }
  async function handleDeleteCategory(fileId, categoryId) {
    const translate = get_store_value(t);
    const ok = await confirmDialog.open({
      title: translate("category.delete.confirm.title"),
      message: translate("category.delete.confirm.message", { name: categoryId }),
      confirmLabel: translate("common.delete")
    });
    if (!ok) return;
    await apiPostWithBackup("/delete_item", {
      type: "category",
      file: fileId,
      category: categoryId
    });
    await fetchTags();
  }
  async function handleDeleteFile(fileId) {
    var _a2;
    const file = get_store_value(sortedTagFiles).find((f) => f.fileId === fileId);
    if (!file) return;
    const categoryCount = file.categories.length;
    const itemCount = file.categories.reduce((sum, c) => sum + c.items.length, 0);
    const ok = await fileDeleteDialog.open({ fileId, categoryCount, itemCount });
    if (!ok) return;
    const wasActive = get_store_value(activeTabId) === fileId;
    await apiPostWithBackup("/delete_item", { type: "file", file: fileId });
    await fetchTags();
    if (wasActive) {
      const first = ((_a2 = get_store_value(sortedTagFiles)[0]) == null ? void 0 : _a2.fileId) ?? "";
      activeTabId.set(first);
    }
  }
  const func = (file, catId, name, prompt) => handleEditTag(file.fileId, catId, name, prompt);
  const func_1 = (file, catId) => handleEditCategory(file.fileId, catId);
  const func_2 = (file, catId, name) => handleDeleteItem(file.fileId, catId, name);
  const func_3 = (file, catId) => handleDeleteCategory(file.fileId, catId);
  function migrationdialog_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      migrationDialog = $$value;
      $$invalidate(0, migrationDialog);
    });
  }
  function tageditordialog_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      editorDialog = $$value;
      $$invalidate(1, editorDialog);
    });
  }
  function categoryeditordialog_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      categoryEditorDialog = $$value;
      $$invalidate(2, categoryEditorDialog);
    });
  }
  function sortdialog_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      sortDialog = $$value;
      $$invalidate(3, sortDialog);
    });
  }
  function confirmdialog_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      confirmDialog = $$value;
      $$invalidate(4, confirmDialog);
    });
  }
  function filedeleteconfirmdialog_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      fileDeleteDialog = $$value;
      $$invalidate(5, fileDeleteDialog);
    });
  }
  function fileeditordialog_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      fileEditorDialog = $$value;
      $$invalidate(6, fileEditorDialog);
    });
  }
  return [
    migrationDialog,
    editorDialog,
    categoryEditorDialog,
    sortDialog,
    confirmDialog,
    fileDeleteDialog,
    fileEditorDialog,
    $isEditMode,
    $isPanelVisible,
    $t,
    $sortedTagFiles,
    handleReload,
    handleClose,
    handleClickTag,
    handleEditClick,
    handleMigrationConfirm,
    handleAddTag,
    handleOpenSort,
    handleEditTag,
    handleEditCategory,
    handleEditFile,
    handleFileRenamed,
    handleDeleteItem,
    handleDeleteCategory,
    handleDeleteFile,
    func,
    func_1,
    func_2,
    func_3,
    migrationdialog_binding,
    tageditordialog_binding,
    categoryeditordialog_binding,
    sortdialog_binding,
    confirmdialog_binding,
    filedeleteconfirmdialog_binding,
    fileeditordialog_binding
  ];
}
class PromptSelector extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1]);
  }
}
function create_fragment(ctx) {
  let button;
  let t2;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t2 = text("PS");
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-show-button");
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
      append(button, t2);
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
    void initLocale(app2);
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
    app2.ui.settings.addSetting({
      id: Constants.D2_PS_SETTING_BACKUP_COUNT_ID,
      name: "Backup Count (0 = disabled, max 100)",
      type: "number",
      defaultValue: Constants.D2_PS_SETTING_BACKUP_COUNT_DEFAULT,
      onChange(value) {
        backupCount.set(value);
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
isPanelVisible.subscribe(() => {
  isEditMode.set(false);
});
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
