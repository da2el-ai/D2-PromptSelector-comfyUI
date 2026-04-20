import { app } from "../../scripts/app.js";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
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
function prevent_default(fn) {
  return function(event) {
    event.preventDefault();
    return fn.call(this, event);
  };
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
class Constants {
}
__publicField(Constants, "API_GET_TAGS", "/D2_prompt-selector/get_tags");
// ComfyUI 標準ボタンクラス
__publicField(Constants, "CSS_CLASS_BUTTON_BASE", "inline-flex items-center justify-center cursor-pointer touch-manipulation appearance-none border-none text-sm font-inter transition-colors h-8 rounded-lg px-4 font-light");
__publicField(Constants, "CSS_CLSSS_BUTTON_PRIMARY", "text-base-foreground bg-primary-background hover:bg-primary-background-hover");
__publicField(Constants, "CSS_CLSSS_BUTTON_SECONDARY", "text-secondary-foreground bg-secondary-background hover:bg-secondary-background-hover");
// inline-flex items-center justify-center gap-2 cursor-pointer touch-manipulation whitespace-nowrap appearance-none border-none font-medium font-inter transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([width]):not([height])]:size-4 [&_svg]:shrink-0  h-8 rounded-lg p-2 text-xs relative px-3
// アイコン
__publicField(Constants, "ICON_SEARCH", "🔍");
// Settings
__publicField(Constants, "D2_PS_SETTING_LOCATION_ID", "D2.PromptSelector.ShowButtonLocation");
__publicField(Constants, "D2_PS_SETTING_LOCATION_DEFAULT", "left-bottom");
__publicField(Constants, "D2_PS_SETTING_X_MARGIN_ID", "D2.PromptSelector.ShowButtonHorizontalMargin");
__publicField(Constants, "D2_PS_SETTING_X_MARGIN_DEFAULT", 50);
__publicField(Constants, "D2_PS_SETTING_Y_MARGIN_ID", "D2.PromptSelector.ShowButtonVerticalMargin");
__publicField(Constants, "D2_PS_SETTING_Y_MARGIN_DEFAULT", 10);
function get_each_context$5(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i];
  return child_ctx;
}
function create_each_block$5(key_1, ctx) {
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
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " text-base-foreground d2ps-tab__button");
      attr(button, "data-active", button_data_active_value = /*$activeTabId*/
      ctx[0] === /*tabId*/
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
      2 && t0_value !== (t0_value = /*tabId*/
      ctx[5] + "")) set_data(t0, t0_value);
      if (dirty & /*$activeTabId, tabs*/
      3 && button_data_active_value !== (button_data_active_value = /*$activeTabId*/
      ctx[0] === /*tabId*/
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
function create_fragment$b(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_value = ensure_array_like(
    /*tabs*/
    ctx[1]
  );
  const get_key = (ctx2) => (
    /*tabId*/
    ctx2[5]
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
      if (dirty & /*$activeTabId, tabs*/
      3) {
        each_value = ensure_array_like(
          /*tabs*/
          ctx2[1]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, destroy_block, create_each_block$5, null, get_each_context$5);
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
function instance$b($$self, $$props, $$invalidate) {
  let tabs;
  let $sortedTagFiles;
  let $activeTabId;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(2, $sortedTagFiles = $$value));
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(0, $activeTabId = $$value));
  const SEARCH_TAB = Constants.ICON_SEARCH;
  const click_handler = (tabId) => activeTabId.set(tabId);
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$sortedTagFiles*/
    4) {
      $$invalidate(1, tabs = [...$sortedTagFiles.map((f) => f.fileId), SEARCH_TAB]);
    }
    if ($$self.$$.dirty & /*$activeTabId, $sortedTagFiles*/
    5) {
      if ($activeTabId === "" && $sortedTagFiles.length > 0) {
        activeTabId.set($sortedTagFiles[0].fileId);
      }
    }
  };
  return [$activeTabId, tabs, $sortedTagFiles, click_handler];
}
class TabNavi extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$b, create_fragment$b, safe_not_equal, {});
  }
}
function create_if_block$6(ctx) {
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "x";
      attr(button, "class", "d2ps-btn d2ps-btn--delete");
      attr(button, "title", "削除");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*click_handler*/
          ctx[7]
        );
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$a(ctx) {
  let span;
  let t0;
  let button;
  let t1;
  let mounted;
  let dispose;
  let if_block = (
    /*$isEditMode*/
    ctx[3] && create_if_block$6(ctx)
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
            ctx[4]
          ),
          listen(
            button,
            "contextmenu",
            /*handleRightClick*/
            ctx[5]
          ),
          listen(
            button,
            "mouseenter",
            /*mouseenter_handler*/
            ctx[8]
          ),
          listen(
            button,
            "mouseleave",
            /*mouseleave_handler*/
            ctx[9]
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
          if_block = create_if_block$6(ctx2);
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
function instance$a($$self, $$props, $$invalidate) {
  let $isEditMode;
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(3, $isEditMode = $$value));
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
    if ("onClickTag" in $$props2) $$invalidate(6, onClickTag = $$props2.onClickTag);
    if ("onDeleteItem" in $$props2) $$invalidate(2, onDeleteItem = $$props2.onDeleteItem);
  };
  return [
    name,
    prompt,
    onDeleteItem,
    $isEditMode,
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
    init(this, options, instance$a, create_fragment$a, safe_not_equal, {
      name: 0,
      prompt: 1,
      onClickTag: 6,
      onDeleteItem: 2
    });
  }
}
function create_if_block$5(ctx) {
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "x";
      attr(button, "class", "d2ps-btn d2ps-btn--delete");
      attr(button, "title", "削除");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(button, "click", function() {
          if (is_function(
            /*onDelete*/
            ctx[3]
          )) ctx[3].apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
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
function create_fragment$9(ctx) {
  let span;
  let t0;
  let button;
  let t1;
  let button_class_value;
  let mounted;
  let dispose;
  let if_block = (
    /*$isEditMode*/
    ctx[4] && /*onDelete*/
    ctx[3] && create_if_block$5(ctx)
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
            /*click_handler*/
            ctx[5]
          ),
          listen(button, "contextmenu", prevent_default(
            /*contextmenu_handler*/
            ctx[6]
          ))
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*$isEditMode*/
        ctx2[4] && /*onDelete*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$5(ctx2);
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
function instance$9($$self, $$props, $$invalidate) {
  let $isEditMode;
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(4, $isEditMode = $$value));
  let { label } = $$props;
  let { prompt } = $$props;
  let { onClickTag } = $$props;
  let { onDelete = void 0 } = $$props;
  const click_handler = (e) => prompt && !$isEditMode && onClickTag(prompt, e.ctrlKey || e.metaKey);
  const contextmenu_handler = (e) => prompt && !$isEditMode && onClickTag(prompt, true);
  $$self.$$set = ($$props2) => {
    if ("label" in $$props2) $$invalidate(0, label = $$props2.label);
    if ("prompt" in $$props2) $$invalidate(1, prompt = $$props2.prompt);
    if ("onClickTag" in $$props2) $$invalidate(2, onClickTag = $$props2.onClickTag);
    if ("onDelete" in $$props2) $$invalidate(3, onDelete = $$props2.onDelete);
  };
  return [
    label,
    prompt,
    onClickTag,
    onDelete,
    $isEditMode,
    click_handler,
    contextmenu_handler
  ];
}
class CategoryButton extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$9, create_fragment$9, safe_not_equal, {
      label: 0,
      prompt: 1,
      onClickTag: 2,
      onDelete: 3
    });
  }
}
function get_each_context$4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[6] = list[i];
  return child_ctx;
}
function create_else_block$3(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_1$3, create_else_block_1];
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
function create_if_block$4(ctx) {
  let div1;
  let categorybutton;
  let t;
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
    let child_ctx = get_each_context$4(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
  }
  return {
    c() {
      div1 = element("div");
      create_component(categorybutton.$$.fragment);
      t = space();
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
      append(div1, t);
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
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
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
function create_else_block_1(ctx) {
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
function create_if_block_1$3(ctx) {
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
function create_each_block$4(key_1, ctx) {
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
function create_fragment$8(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block$4, create_else_block$3];
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
function instance$8($$self, $$props, $$invalidate) {
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
    init(this, options, instance$8, create_fragment$8, safe_not_equal, {
      item: 0,
      onClickTag: 1,
      onEditItem: 2,
      onDeleteItem: 3
    });
  }
}
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[11] = list[i];
  const constants_0 = getRandomPrompt(
    /*category*/
    child_ctx[11].items
  );
  child_ctx[12] = constants_0;
  return child_ctx;
}
function get_each_context_1$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[15] = list[i];
  return child_ctx;
}
function create_each_block_1$1(key_1, ctx) {
  let first;
  let tagnodeitem;
  let current;
  function func_1(...args) {
    return (
      /*func_1*/
      ctx[9](
        /*category*/
        ctx[11],
        ...args
      )
    );
  }
  function func_2(...args) {
    return (
      /*func_2*/
      ctx[10](
        /*category*/
        ctx[11],
        ...args
      )
    );
  }
  tagnodeitem = new TagNodeItem({
    props: {
      item: (
        /*item*/
        ctx[15]
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[1]
      ),
      onEditItem: (
        /*$isEditMode*/
        ctx[6] ? func_1 : void 0
      ),
      onDeleteItem: (
        /*$isEditMode*/
        ctx[6] ? func_2 : void 0
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
      ctx[15];
      if (dirty & /*onClickTag*/
      2) tagnodeitem_changes.onClickTag = /*onClickTag*/
      ctx[1];
      if (dirty & /*$isEditMode, onEditTag, file*/
      69) tagnodeitem_changes.onEditItem = /*$isEditMode*/
      ctx[6] ? func_1 : void 0;
      if (dirty & /*$isEditMode, onDeleteItem, file*/
      73) tagnodeitem_changes.onDeleteItem = /*$isEditMode*/
      ctx[6] ? func_2 : void 0;
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
function create_each_block$3(key_1, ctx) {
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
      ctx[8](
        /*category*/
        ctx[11]
      )
    );
  }
  categorybutton = new CategoryButton({
    props: {
      label: (
        /*category*/
        ctx[11].categoryId
      ),
      prompt: (
        /*randomPrompt*/
        ctx[12]
      ),
      onClickTag: (
        /*onClickTag*/
        ctx[1]
      ),
      onDelete: func
    }
  });
  let each_value_1 = ensure_array_like(
    /*category*/
    ctx[11].items
  );
  const get_key = (ctx2) => (
    /*item*/
    ctx2[15].name
  );
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
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
      ctx[11].categoryId;
      if (dirty & /*file*/
      1) categorybutton_changes.prompt = /*randomPrompt*/
      ctx[12];
      if (dirty & /*onClickTag*/
      2) categorybutton_changes.onClickTag = /*onClickTag*/
      ctx[1];
      if (dirty & /*onDeleteCategory, file*/
      17) categorybutton_changes.onDelete = func;
      categorybutton.$set(categorybutton_changes);
      if (dirty & /*file, onClickTag, $isEditMode, onEditTag, undefined, onDeleteItem*/
      79) {
        each_value_1 = ensure_array_like(
          /*category*/
          ctx[11].items
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div1, outro_and_destroy_block, create_each_block_1$1, null, get_each_context_1$1);
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
function create_fragment$7(ctx) {
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
    ctx2[11].categoryId
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
      attr(div, "class", "d2ps-tag-field d2ps-tag-field--top");
      set_style(
        div,
        "display",
        /*isActive*/
        ctx[5] ? "flex" : "none"
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
      if (dirty & /*file, onClickTag, $isEditMode, onEditTag, undefined, onDeleteItem, getRandomPrompt, onDeleteCategory*/
      95) {
        each_value = ensure_array_like(
          /*file*/
          ctx2[0].categories
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
        check_outros();
      }
      if (dirty & /*isActive*/
      32) {
        set_style(
          div,
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
function instance$7($$self, $$props, $$invalidate) {
  let isActive;
  let $activeTabId;
  let $isEditMode;
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(7, $activeTabId = $$value));
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(6, $isEditMode = $$value));
  let { file } = $$props;
  let { onClickTag } = $$props;
  let { onEditTag } = $$props;
  let { onDeleteItem } = $$props;
  let { onDeleteCategory } = $$props;
  const func = (category) => onDeleteCategory(category.categoryId);
  const func_1 = (category, name, prompt) => onEditTag(category.categoryId, name, prompt);
  const func_2 = (category, name) => onDeleteItem(category.categoryId, name);
  $$self.$$set = ($$props2) => {
    if ("file" in $$props2) $$invalidate(0, file = $$props2.file);
    if ("onClickTag" in $$props2) $$invalidate(1, onClickTag = $$props2.onClickTag);
    if ("onEditTag" in $$props2) $$invalidate(2, onEditTag = $$props2.onEditTag);
    if ("onDeleteItem" in $$props2) $$invalidate(3, onDeleteItem = $$props2.onDeleteItem);
    if ("onDeleteCategory" in $$props2) $$invalidate(4, onDeleteCategory = $$props2.onDeleteCategory);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$activeTabId, file*/
    129) {
      $$invalidate(5, isActive = $activeTabId === file.fileId);
    }
  };
  return [
    file,
    onClickTag,
    onEditTag,
    onDeleteItem,
    onDeleteCategory,
    isActive,
    $isEditMode,
    $activeTabId,
    func,
    func_1,
    func_2
  ];
}
class CategoryView extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$7, safe_not_equal, {
      file: 0,
      onClickTag: 1,
      onEditTag: 2,
      onDeleteItem: 3,
      onDeleteCategory: 4
    });
  }
}
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  return child_ctx;
}
function create_else_block$2(ctx) {
  let tagbutton;
  let current;
  tagbutton = new TagButton({
    props: {
      name: (
        /*item*/
        ctx[13].name
      ),
      prompt: (
        /*item*/
        ctx[13].prompt
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
      ctx2[13].name;
      if (dirty & /*results*/
      16) tagbutton_changes.prompt = /*item*/
      ctx2[13].prompt;
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
function create_if_block_1$2(ctx) {
  let tagbutton;
  let current;
  function func(...args) {
    return (
      /*func*/
      ctx[10](
        /*item*/
        ctx[13],
        ...args
      )
    );
  }
  function func_1(...args) {
    return (
      /*func_1*/
      ctx[11](
        /*item*/
        ctx[13],
        ...args
      )
    );
  }
  tagbutton = new TagButton({
    props: {
      name: (
        /*item*/
        ctx[13].name
      ),
      prompt: (
        /*item*/
        ctx[13].prompt
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
      ctx[13].name;
      if (dirty & /*results*/
      16) tagbutton_changes.prompt = /*item*/
      ctx[13].prompt;
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
function create_each_block$2(key_1, ctx) {
  let first;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_1$2, create_else_block$2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*$isEditMode*/
      ctx2[6]
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
function create_if_block$3(ctx) {
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
function create_fragment$6(ctx) {
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
    ctx2[13].fileId + /*item*/
    ctx2[13].categoryId + /*item*/
    ctx2[13].name + /*item*/
    ctx2[13].prompt
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$2(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
  }
  let if_block = show_if && create_if_block$3();
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
          ctx[9]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
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
      87) {
        each_value = ensure_array_like(
          /*results*/
          ctx2[4]
        );
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$2, t1, get_each_context$2);
        check_outros();
      }
      if (dirty & /*keyword, results*/
      24) show_if = /*keyword*/
      ctx2[3].trim() && /*results*/
      ctx2[4].length === 0;
      if (show_if) {
        if (if_block) ;
        else {
          if_block = create_if_block$3();
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
function instance$6($$self, $$props, $$invalidate) {
  let isActive;
  let results;
  let $sortedTagFiles;
  let $activeTabId;
  let $isEditMode;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(7, $sortedTagFiles = $$value));
  component_subscribe($$self, activeTabId, ($$value) => $$invalidate(8, $activeTabId = $$value));
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(6, $isEditMode = $$value));
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
    256) {
      $$invalidate(5, isActive = $activeTabId === SEARCH_TAB);
    }
    if ($$self.$$.dirty & /*keyword, $sortedTagFiles*/
    136) {
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
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {
      onClickTag: 0,
      onEditTag: 1,
      onDeleteItem: 2
    });
  }
}
function create_fragment$5(ctx) {
  let div;
  let t;
  return {
    c() {
      div = element("div");
      t = text(
        /*$tooltip*/
        ctx[0]
      );
      attr(div, "class", "d2ps-tooltip-container");
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
function instance$5($$self, $$props, $$invalidate) {
  let $tooltip;
  component_subscribe($$self, tooltip, ($$value) => $$invalidate(0, $tooltip = $$value));
  return [$tooltip];
}
class ToolTip extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
  }
}
function create_fragment$4(ctx) {
  let dialog_1;
  let div1;
  let p;
  let t6;
  let div0;
  let button0;
  let t8;
  let button1;
  let mounted;
  let dispose;
  return {
    c() {
      dialog_1 = element("dialog");
      div1 = element("div");
      p = element("p");
      p.innerHTML = `辞書が旧形式（多階層・配列混在）を含んでいます。<br/>
            編集機能を使うには新形式（1階層 dict）への変換が必要です。<br/>
            変換前に <strong>tags_bak/</strong> へバックアップを作成します。<br/><br/>
            変換しますか？（多階層構造は使えなくなります）`;
      t6 = space();
      div0 = element("div");
      button0 = element("button");
      button0.textContent = "変換する";
      t8 = space();
      button1 = element("button");
      button1.textContent = "キャンセル";
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
      append(div1, t6);
      append(div1, div0);
      append(div0, button0);
      append(div0, t8);
      append(div0, button1);
      ctx[4](dialog_1);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "click",
            /*handleConfirm*/
            ctx[1]
          ),
          listen(
            button1,
            "click",
            /*handleCancel*/
            ctx[2]
          )
        ];
        mounted = true;
      }
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(dialog_1);
      }
      ctx[4](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
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
  return [dialog, handleConfirm, handleCancel, open, dialog_1_binding];
}
class MigrationDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, { open: 3 });
  }
  get open() {
    return this.$$.ctx[3];
  }
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[34] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[37] = list[i];
  return child_ctx;
}
function create_each_block_1(key_1, ctx) {
  let option;
  let t_value = (
    /*f*/
    ctx[37].fileId + ""
  );
  let t;
  let option_value_value;
  return {
    key: key_1,
    first: null,
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = /*f*/
      ctx[37].fileId;
      set_input_value(option, option.__value);
      this.first = option;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*files*/
      256 && t_value !== (t_value = /*f*/
      ctx[37].fileId + "")) set_data(t, t_value);
      if (dirty[0] & /*files*/
      256 && option_value_value !== (option_value_value = /*f*/
      ctx[37].fileId)) {
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
function create_else_block$1(ctx) {
  let input;
  let t0;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      input = element("input");
      t0 = space();
      button = element("button");
      button.textContent = "既存";
      attr(input, "class", "d2ps-dialog__input");
      attr(input, "type", "text");
      attr(input, "placeholder", "新しいカテゴリ名");
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-dialog__new-btn");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      set_input_value(
        input,
        /*newCategoryName*/
        ctx[6]
      );
      insert(target, t0, anchor);
      insert(target, button, anchor);
      if (!mounted) {
        dispose = [
          listen(
            input,
            "input",
            /*input_input_handler*/
            ctx[28]
          ),
          listen(
            button,
            "click",
            /*click_handler_1*/
            ctx[29]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*newCategoryName*/
      64 && input.value !== /*newCategoryName*/
      ctx2[6]) {
        set_input_value(
          input,
          /*newCategoryName*/
          ctx2[6]
        );
      }
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
function create_if_block_2$1(ctx) {
  let select;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t0;
  let button;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(
    /*categories*/
    ctx[13]
  );
  const get_key = (ctx2) => (
    /*cat*/
    ctx2[34]
  );
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$1(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
  }
  return {
    c() {
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t0 = space();
      button = element("button");
      button.textContent = "+ 新規";
      attr(select, "class", "d2ps-dialog__select");
      if (
        /*categoryId*/
        ctx[2] === void 0
      ) add_render_callback(() => (
        /*select_change_handler_1*/
        ctx[26].call(select)
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
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*select_change_handler_1*/
            ctx[26]
          ),
          listen(
            button,
            "click",
            /*click_handler*/
            ctx[27]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*categories*/
      8192) {
        each_value = ensure_array_like(
          /*categories*/
          ctx2[13]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, select, destroy_block, create_each_block$1, null, get_each_context$1);
      }
      if (dirty[0] & /*categoryId, categories*/
      8196) {
        select_option(
          select,
          /*categoryId*/
          ctx2[2]
        );
      }
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
function create_each_block$1(key_1, ctx) {
  let option;
  let t_value = (
    /*cat*/
    ctx[34] + ""
  );
  let t;
  let option_value_value;
  return {
    key: key_1,
    first: null,
    c() {
      option = element("option");
      t = text(t_value);
      option.__value = option_value_value = /*cat*/
      ctx[34];
      set_input_value(option, option.__value);
      this.first = option;
    },
    m(target, anchor) {
      insert(target, option, anchor);
      append(option, t);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*categories*/
      8192 && t_value !== (t_value = /*cat*/
      ctx[34] + "")) set_data(t, t_value);
      if (dirty[0] & /*categories*/
      8192 && option_value_value !== (option_value_value = /*cat*/
      ctx[34])) {
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
function create_if_block_1$1(ctx) {
  let p;
  return {
    c() {
      p = element("p");
      p.textContent = "同じアイテムが存在します";
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_if_block$2(ctx) {
  let p;
  let t;
  return {
    c() {
      p = element("p");
      t = text(
        /*errorMsg*/
        ctx[11]
      );
      attr(p, "class", "d2ps-dialog__error");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*errorMsg*/
      2048) set_data(
        t,
        /*errorMsg*/
        ctx2[11]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_fragment$3(ctx) {
  let dialog_1;
  let div2;
  let h3;
  let t0_value = (
    /*mode*/
    ctx[0] === "add" ? "タグを追加" : "タグを編集"
  );
  let t0;
  let t1;
  let label0;
  let span0;
  let t3;
  let select;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t4;
  let label1;
  let span1;
  let t6;
  let div0;
  let t7;
  let label2;
  let span2;
  let t9;
  let input;
  let t10;
  let label3;
  let span3;
  let t12;
  let textarea;
  let t13;
  let t14;
  let t15;
  let div1;
  let button0;
  let t16_value = (
    /*saving*/
    ctx[7] ? "保存中..." : "保存"
  );
  let t16;
  let button0_disabled_value;
  let t17;
  let button1;
  let mounted;
  let dispose;
  let each_value_1 = ensure_array_like(
    /*files*/
    ctx[8]
  );
  const get_key = (ctx2) => (
    /*f*/
    ctx2[37].fileId
  );
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
  }
  function select_block_type(ctx2, dirty) {
    if (!/*isNewCategory*/
    ctx2[5]) return create_if_block_2$1;
    return create_else_block$1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  let if_block1 = (
    /*isDuplicate*/
    ctx[9] && create_if_block_1$1()
  );
  let if_block2 = (
    /*errorMsg*/
    ctx[11] && create_if_block$2(ctx)
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
      span0.textContent = "タブ（ファイル）";
      t3 = space();
      select = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t4 = space();
      label1 = element("label");
      span1 = element("span");
      span1.textContent = "カテゴリ";
      t6 = space();
      div0 = element("div");
      if_block0.c();
      t7 = space();
      label2 = element("label");
      span2 = element("span");
      span2.textContent = "名前（表示名）";
      t9 = space();
      input = element("input");
      t10 = space();
      label3 = element("label");
      span3 = element("span");
      span3.textContent = "プロンプト";
      t12 = space();
      textarea = element("textarea");
      t13 = space();
      if (if_block1) if_block1.c();
      t14 = space();
      if (if_block2) if_block2.c();
      t15 = space();
      div1 = element("div");
      button0 = element("button");
      t16 = text(t16_value);
      t17 = space();
      button1 = element("button");
      button1.textContent = "キャンセル";
      attr(h3, "class", "d2ps-dialog__title");
      attr(select, "class", "d2ps-dialog__select");
      if (
        /*fileId*/
        ctx[1] === void 0
      ) add_render_callback(() => (
        /*select_change_handler*/
        ctx[25].call(select)
      ));
      attr(label0, "class", "d2ps-dialog__label");
      attr(div0, "class", "d2ps-dialog__row");
      attr(label1, "class", "d2ps-dialog__label");
      attr(input, "class", "d2ps-dialog__input");
      attr(input, "type", "text");
      attr(label2, "class", "d2ps-dialog__label");
      attr(textarea, "class", "d2ps-dialog__input");
      attr(label3, "class", "d2ps-dialog__label");
      attr(button0, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY);
      button0.disabled = button0_disabled_value = !/*canSave*/
      ctx[12];
      attr(button1, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY);
      attr(div1, "class", "d2ps-dialog__buttons");
      attr(div2, "class", "d2ps-dialog d2ps-dialog--editor");
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
      append(label0, t3);
      append(label0, select);
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
      append(div2, t4);
      append(div2, label1);
      append(label1, span1);
      append(label1, t6);
      append(label1, div0);
      if_block0.m(div0, null);
      append(div2, t7);
      append(div2, label2);
      append(label2, span2);
      append(label2, t9);
      append(label2, input);
      set_input_value(
        input,
        /*name*/
        ctx[3]
      );
      append(div2, t10);
      append(div2, label3);
      append(label3, span3);
      append(label3, t12);
      append(label3, textarea);
      set_input_value(
        textarea,
        /*prompt*/
        ctx[4]
      );
      append(div2, t13);
      if (if_block1) if_block1.m(div2, null);
      append(div2, t14);
      if (if_block2) if_block2.m(div2, null);
      append(div2, t15);
      append(div2, div1);
      append(div1, button0);
      append(button0, t16);
      append(div1, t17);
      append(div1, button1);
      ctx[32](dialog_1);
      if (!mounted) {
        dispose = [
          listen(
            select,
            "change",
            /*select_change_handler*/
            ctx[25]
          ),
          listen(
            select,
            "change",
            /*handleFileChange*/
            ctx[14]
          ),
          listen(
            input,
            "input",
            /*input_input_handler_1*/
            ctx[30]
          ),
          listen(
            textarea,
            "input",
            /*textarea_input_handler*/
            ctx[31]
          ),
          listen(
            button0,
            "click",
            /*handleSave*/
            ctx[15]
          ),
          listen(
            button1,
            "click",
            /*handleCancel*/
            ctx[16]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*mode*/
      1 && t0_value !== (t0_value = /*mode*/
      ctx2[0] === "add" ? "タグを追加" : "タグを編集")) set_data(t0, t0_value);
      if (dirty[0] & /*files*/
      256) {
        each_value_1 = ensure_array_like(
          /*files*/
          ctx2[8]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_1, each_1_lookup, select, destroy_block, create_each_block_1, null, get_each_context_1);
      }
      if (dirty[0] & /*fileId, files*/
      258) {
        select_option(
          select,
          /*fileId*/
          ctx2[1]
        );
      }
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
      if (dirty[0] & /*name*/
      8 && input.value !== /*name*/
      ctx2[3]) {
        set_input_value(
          input,
          /*name*/
          ctx2[3]
        );
      }
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
        ctx2[9]
      ) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block_1$1();
          if_block1.c();
          if_block1.m(div2, t14);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (
        /*errorMsg*/
        ctx2[11]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block$2(ctx2);
          if_block2.c();
          if_block2.m(div2, t15);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty[0] & /*saving*/
      128 && t16_value !== (t16_value = /*saving*/
      ctx2[7] ? "保存中..." : "保存")) set_data(t16, t16_value);
      if (dirty[0] & /*canSave*/
      4096 && button0_disabled_value !== (button0_disabled_value = !/*canSave*/
      ctx2[12])) {
        button0.disabled = button0_disabled_value;
      }
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
      if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      ctx[32](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let files;
  let selectedFile;
  let categories;
  let isDuplicate;
  let effectiveCategoryId;
  let canSave;
  let $sortedTagFiles;
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(24, $sortedTagFiles = $$value));
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
    $$invalidate(19, origFileId = "");
    $$invalidate(20, origCategoryId = "");
    $$invalidate(21, origName = "");
    $$invalidate(5, isNewCategory = false);
    $$invalidate(6, newCategoryName = "");
    $$invalidate(11, errorMsg = "");
    $$invalidate(7, saving = false);
    dialog.showModal();
  }
  function openEdit(fId, catId, itemName, itemPrompt) {
    $$invalidate(0, mode = "edit");
    $$invalidate(1, fileId = fId);
    $$invalidate(2, categoryId = catId);
    $$invalidate(3, name = itemName);
    $$invalidate(4, prompt = itemPrompt);
    $$invalidate(19, origFileId = fId);
    $$invalidate(20, origCategoryId = catId);
    $$invalidate(21, origName = itemName);
    $$invalidate(5, isNewCategory = false);
    $$invalidate(6, newCategoryName = "");
    $$invalidate(11, errorMsg = "");
    $$invalidate(7, saving = false);
    dialog.showModal();
  }
  function handleFileChange() {
    $$invalidate(5, isNewCategory = false);
    $$invalidate(6, newCategoryName = "");
    const f = files.find((f2) => f2.fileId === fileId);
    $$invalidate(2, categoryId = f && f.categories[0] ? f.categories[0].categoryId : "");
  }
  async function handleSave() {
    if (!canSave) return;
    $$invalidate(7, saving = true);
    $$invalidate(11, errorMsg = "");
    try {
      if (mode === "add") {
        await apiPost("/add_item", {
          file: fileId,
          category: isNewCategory ? "__new__" : categoryId,
          new_category: isNewCategory ? newCategoryName.trim() : null,
          name: name.trim(),
          prompt: prompt.trim()
        });
      } else {
        await apiPost("/edit_item", {
          file: origFileId,
          category: origCategoryId,
          name: origName,
          new_name: name.trim(),
          new_prompt: prompt.trim(),
          new_file: fileId,
          new_category: isNewCategory ? "__new__" : effectiveCategoryId,
          new_category_name: isNewCategory ? newCategoryName.trim() : null
        });
      }
      await fetchTags();
      dialog.close();
      dispatch("done");
    } catch (e) {
      $$invalidate(11, errorMsg = "保存中にエラーが発生しました");
    } finally {
      $$invalidate(7, saving = false);
    }
  }
  function handleCancel() {
    dialog.close();
  }
  function select_change_handler() {
    fileId = select_value(this);
    $$invalidate(1, fileId);
    $$invalidate(8, files), $$invalidate(24, $sortedTagFiles);
  }
  function select_change_handler_1() {
    categoryId = select_value(this);
    $$invalidate(2, categoryId);
    $$invalidate(13, categories), $$invalidate(23, selectedFile), $$invalidate(8, files), $$invalidate(1, fileId), $$invalidate(24, $sortedTagFiles);
  }
  const click_handler = () => {
    $$invalidate(5, isNewCategory = true);
    $$invalidate(6, newCategoryName = "");
  };
  function input_input_handler() {
    newCategoryName = this.value;
    $$invalidate(6, newCategoryName);
  }
  const click_handler_1 = () => {
    $$invalidate(5, isNewCategory = false);
  };
  function input_input_handler_1() {
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
      $$invalidate(10, dialog);
    });
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$sortedTagFiles*/
    16777216) {
      $$invalidate(8, files = $sortedTagFiles);
    }
    if ($$self.$$.dirty[0] & /*files, fileId*/
    258) {
      $$invalidate(23, selectedFile = files.find((f) => f.fileId === fileId));
    }
    if ($$self.$$.dirty[0] & /*selectedFile*/
    8388608) {
      $$invalidate(13, categories = selectedFile ? selectedFile.categories.map((c) => c.categoryId) : []);
    }
    if ($$self.$$.dirty[0] & /*name, isNewCategory, newCategoryName, categoryId, files, fileId, mode, origFileId, origCategoryId, origName*/
    3670383) {
      $$invalidate(9, isDuplicate = (() => {
        if (!name.trim()) return false;
        const targetCategory = isNewCategory ? newCategoryName : categoryId;
        const targetFile = files.find((f) => f.fileId === fileId);
        const cat = targetFile == null ? void 0 : targetFile.categories.find((c) => c.categoryId === targetCategory);
        if (!cat) return false;
        return cat.items.some((item) => {
          if (mode === "edit" && fileId === origFileId && targetCategory === origCategoryId && item.name === origName) {
            return false;
          }
          return item.name === name.trim();
        });
      })());
    }
    if ($$self.$$.dirty[0] & /*isNewCategory, newCategoryName, categoryId*/
    100) {
      $$invalidate(22, effectiveCategoryId = isNewCategory ? newCategoryName.trim() : categoryId);
    }
    if ($$self.$$.dirty[0] & /*name, prompt, fileId, effectiveCategoryId, isDuplicate, saving*/
    4194970) {
      $$invalidate(12, canSave = name.trim() !== "" && prompt.trim() !== "" && fileId !== "" && effectiveCategoryId !== "" && !isDuplicate && !saving);
    }
  };
  return [
    mode,
    fileId,
    categoryId,
    name,
    prompt,
    isNewCategory,
    newCategoryName,
    saving,
    files,
    isDuplicate,
    dialog,
    errorMsg,
    canSave,
    categories,
    handleFileChange,
    handleSave,
    handleCancel,
    openAdd,
    openEdit,
    origFileId,
    origCategoryId,
    origName,
    effectiveCategoryId,
    selectedFile,
    $sortedTagFiles,
    select_change_handler,
    select_change_handler_1,
    click_handler,
    input_input_handler,
    click_handler_1,
    input_input_handler_1,
    textarea_input_handler,
    dialog_1_binding
  ];
}
class TagEditorDialog extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, { openAdd: 17, openEdit: 18 }, null, [-1, -1]);
  }
  get openAdd() {
    return this.$$.ctx[17];
  }
  get openEdit() {
    return this.$$.ctx[18];
  }
}
function create_if_block$1(ctx) {
  let h3;
  let t;
  return {
    c() {
      h3 = element("h3");
      t = text(
        /*title*/
        ctx[1]
      );
      attr(h3, "class", "d2ps-dialog__title");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      append(h3, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*title*/
      2) set_data(
        t,
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
function create_fragment$2(ctx) {
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
    ctx[1] && create_if_block$1(ctx)
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
          if_block = create_if_block$1(ctx2);
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
function instance$2($$self, $$props, $$invalidate) {
  let dialog;
  let title = "";
  let message = "";
  let confirmLabel = "OK";
  let cancelLabel = "キャンセル";
  let resolver = null;
  function open(opts) {
    $$invalidate(1, title = opts.title ?? "");
    $$invalidate(2, message = opts.message);
    $$invalidate(3, confirmLabel = opts.confirmLabel ?? "OK");
    $$invalidate(4, cancelLabel = opts.cancelLabel ?? "キャンセル");
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
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { open: 7 });
  }
  get open() {
    return this.$$.ctx[7];
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[21] = list[i];
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
      ctx2[3]
    ) return create_if_block_2;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  let if_block1 = (
    /*$isEditMode*/
    ctx[3] && create_if_block_1(ctx)
  );
  let each_value = ensure_array_like(
    /*$sortedTagFiles*/
    ctx[5]
  );
  const get_key = (ctx2) => (
    /*file*/
    ctx2[21].fileId
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
        ctx[8]
      ),
      onEditTag: (
        /*handleEditTag*/
        ctx[12]
      ),
      onDeleteItem: (
        /*handleDeleteItem*/
        ctx[13]
      )
    }
  });
  tabnavi = new TabNavi({});
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
            ctx[6]
          ),
          listen(
            button1,
            "click",
            /*handleClose*/
            ctx[7]
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
        ctx2[3]
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
      if (dirty & /*$sortedTagFiles, handleClickTag, handleEditTag, handleDeleteItem, handleDeleteCategory*/
      28960) {
        each_value = ensure_array_like(
          /*$sortedTagFiles*/
          ctx2[5]
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
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "編集";
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_SECONDARY + " d2ps-btn d2ps-btn--controller");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*handleEditClick*/
          ctx[9]
        );
        mounted = true;
      }
    },
    p: noop,
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
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "編集解除";
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-btn d2ps-btn--controller");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*handleEditClick*/
          ctx[9]
        );
        mounted = true;
      }
    },
    p: noop,
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
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      button.textContent = "＋ 追加";
      attr(button, "class", Constants.CSS_CLASS_BUTTON_BASE + " " + Constants.CSS_CLSSS_BUTTON_PRIMARY + " d2ps-btn d2ps-btn--controller");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*handleAddTag*/
          ctx[11]
        );
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      mounted = false;
      dispose();
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
      ctx[15](
        /*file*/
        ctx[21],
        ...args
      )
    );
  }
  function func_1(...args) {
    return (
      /*func_1*/
      ctx[16](
        /*file*/
        ctx[21],
        ...args
      )
    );
  }
  function func_2(...args) {
    return (
      /*func_2*/
      ctx[17](
        /*file*/
        ctx[21],
        ...args
      )
    );
  }
  categoryview = new CategoryView({
    props: {
      file: (
        /*file*/
        ctx[21]
      ),
      onClickTag: (
        /*handleClickTag*/
        ctx[8]
      ),
      onEditTag: func,
      onDeleteItem: func_1,
      onDeleteCategory: func_2
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
      32) categoryview_changes.file = /*file*/
      ctx[21];
      if (dirty & /*$sortedTagFiles*/
      32) categoryview_changes.onEditTag = func;
      if (dirty & /*$sortedTagFiles*/
      32) categoryview_changes.onDeleteItem = func_1;
      if (dirty & /*$sortedTagFiles*/
      32) categoryview_changes.onDeleteCategory = func_2;
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
  let confirmdialog;
  let current;
  let if_block = (
    /*$isPanelVisible*/
    ctx[4] && create_if_block(ctx)
  );
  let migrationdialog_props = {};
  migrationdialog = new MigrationDialog({ props: migrationdialog_props });
  ctx[18](migrationdialog);
  migrationdialog.$on(
    "confirm",
    /*handleMigrationConfirm*/
    ctx[10]
  );
  migrationdialog.$on("cancel", cancel_handler);
  let tageditordialog_props = {};
  tageditordialog = new TagEditorDialog({ props: tageditordialog_props });
  ctx[19](tageditordialog);
  tageditordialog.$on("done", done_handler);
  let confirmdialog_props = {};
  confirmdialog = new ConfirmDialog({ props: confirmdialog_props });
  ctx[20](confirmdialog);
  return {
    c() {
      if (if_block) if_block.c();
      t0 = space();
      create_component(migrationdialog.$$.fragment);
      t1 = space();
      create_component(tageditordialog.$$.fragment);
      t2 = space();
      create_component(confirmdialog.$$.fragment);
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, t0, anchor);
      mount_component(migrationdialog, target, anchor);
      insert(target, t1, anchor);
      mount_component(tageditordialog, target, anchor);
      insert(target, t2, anchor);
      mount_component(confirmdialog, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*$isPanelVisible*/
        ctx2[4]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*$isPanelVisible*/
          16) {
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
      const confirmdialog_changes = {};
      confirmdialog.$set(confirmdialog_changes);
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      transition_in(migrationdialog.$$.fragment, local);
      transition_in(tageditordialog.$$.fragment, local);
      transition_in(confirmdialog.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      transition_out(migrationdialog.$$.fragment, local);
      transition_out(tageditordialog.$$.fragment, local);
      transition_out(confirmdialog.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t0);
        detach(t1);
        detach(t2);
      }
      if (if_block) if_block.d(detaching);
      ctx[18](null);
      destroy_component(migrationdialog, detaching);
      ctx[19](null);
      destroy_component(tageditordialog, detaching);
      ctx[20](null);
      destroy_component(confirmdialog, detaching);
    }
  };
}
const cancel_handler = () => {
};
const done_handler = () => {
};
function instance$1($$self, $$props, $$invalidate) {
  let $isEditMode;
  let $isPanelVisible;
  let $sortedTagFiles;
  component_subscribe($$self, isEditMode, ($$value) => $$invalidate(3, $isEditMode = $$value));
  component_subscribe($$self, isPanelVisible, ($$value) => $$invalidate(4, $isPanelVisible = $$value));
  component_subscribe($$self, sortedTagFiles, ($$value) => $$invalidate(5, $sortedTagFiles = $$value));
  let migrationDialog;
  let editorDialog;
  let confirmDialog;
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
  function handleEditTag(fileId, categoryId, name, prompt) {
    editorDialog.openEdit(fileId, categoryId, name, prompt);
  }
  async function handleDeleteItem(fileId, categoryId, itemName) {
    const ok = await confirmDialog.open({
      title: "タグを削除",
      message: `「${itemName}」を削除しますか？`,
      confirmLabel: "削除"
    });
    if (!ok) return;
    await apiPost("/delete_item", {
      type: "item",
      file: fileId,
      category: categoryId,
      name: itemName
    });
    await fetchTags();
  }
  async function handleDeleteCategory(fileId, categoryId) {
    const ok = await confirmDialog.open({
      title: "カテゴリを削除",
      message: `カテゴリ「${categoryId}」を削除しますか？
（含まれるタグもすべて削除されます）`,
      confirmLabel: "削除"
    });
    if (!ok) return;
    await apiPost("/delete_item", {
      type: "category",
      file: fileId,
      category: categoryId
    });
    await fetchTags();
  }
  const func = (file, catId, name, prompt) => handleEditTag(file.fileId, catId, name, prompt);
  const func_1 = (file, catId, name) => handleDeleteItem(file.fileId, catId, name);
  const func_2 = (file, catId) => handleDeleteCategory(file.fileId, catId);
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
  function confirmdialog_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      confirmDialog = $$value;
      $$invalidate(2, confirmDialog);
    });
  }
  return [
    migrationDialog,
    editorDialog,
    confirmDialog,
    $isEditMode,
    $isPanelVisible,
    $sortedTagFiles,
    handleReload,
    handleClose,
    handleClickTag,
    handleEditClick,
    handleMigrationConfirm,
    handleAddTag,
    handleEditTag,
    handleDeleteItem,
    handleDeleteCategory,
    func,
    func_1,
    func_2,
    migrationdialog_binding,
    tageditordialog_binding,
    confirmdialog_binding
  ];
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
