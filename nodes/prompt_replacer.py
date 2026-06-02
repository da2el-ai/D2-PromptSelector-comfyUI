"""
登録プロンプト置換ロジック（ComfyUI 非依存の純粋関数群）

入力文字列内の特殊トークンを検出して、登録済みプロンプトに置き換える。
ノード本体（nodes.py）からはデータ（tags dict）と sort（ファイル順）を渡して呼ぶ。
ComfyUI / yaml に依存しないため、単体テストから直接 import できる。

トークン記法（デフォルトデリミタ）:
- 通常変換 `--...--`
    - `--ファイル/カテゴリ/登録名--` : 指定ファイル・指定カテゴリ内を完全一致検索
    - `--X/登録名--`                 : (a) X=ファイル名として全カテゴリ検索 → (b) X=カテゴリ名として全ファイル検索
    - `--登録名--`                   : 全ファイル・全カテゴリを精査し最初に一致したもの
- DynamicPrompt 変換 `@@...@@`
    - `@@ファイル/カテゴリ@@` : 指定ファイルの指定カテゴリ全体を展開
    - `@@カテゴリ@@`          : 全ファイルを精査し最初に見つけたカテゴリを展開

データ構造（1 階層目のみ対象）:
    tags = { ファイル名(stem): { カテゴリ名: { 登録名: prompt文字列 } } }
"""

import re

CONFIG_KEY = "__config__"


# ------------------------------------------------------------------ #
# ファイル精査順
# ------------------------------------------------------------------ #

def _iter_files(tags: dict, sort: list) -> list:
    """
    精査順にファイル名（stem）のリストを返す。
    - sort に載っているものを記載順で先に
    - sort に無いものはファイル名昇順で後ろに続ける
    - __config__ は除外
    """
    ordered = [f for f in sort if f in tags and f != CONFIG_KEY]
    rest = sorted(f for f in tags if f not in sort and f != CONFIG_KEY)
    return ordered + rest


# ------------------------------------------------------------------ #
# 検索ヘルパー（いずれも 1 階層目のみ対象。深いネスト・list は無視）
# ------------------------------------------------------------------ #

def _get_category(tags: dict, file: str, category: str):
    """指定ファイルの指定カテゴリ（{登録名: prompt} の dict）を返す。無ければ None"""
    cats = tags.get(file)
    if isinstance(cats, dict):
        cat = cats.get(category)
        if isinstance(cat, dict):
            return cat
    return None


def _find_exact(tags: dict, file: str, category: str, name: str):
    """ファイル/カテゴリ/登録名 を完全一致検索。prompt 文字列 or None"""
    cat = _get_category(tags, file, category)
    if cat is not None:
        val = cat.get(name)
        if isinstance(val, str):
            return val
    return None


def _find_in_file(tags: dict, file: str, name: str):
    """指定ファイル内の全カテゴリ（記載順）から登録名を検索。最初に一致した prompt or None"""
    cats = tags.get(file)
    if isinstance(cats, dict):
        for category, items in cats.items():
            if isinstance(items, dict):
                val = items.get(name)
                if isinstance(val, str):
                    return val
    return None


def _find_in_category_all_files(tags: dict, sort: list, category: str, name: str):
    """全ファイル（精査順）の指定カテゴリ内から登録名を検索。最初に一致した prompt or None"""
    for file in _iter_files(tags, sort):
        val = _find_exact(tags, file, category, name)
        if val is not None:
            return val
    return None


def _find_anywhere(tags: dict, sort: list, name: str):
    """全ファイル・全カテゴリ（精査順・記載順）から登録名を検索。最初に一致した prompt or None"""
    for file in _iter_files(tags, sort):
        val = _find_in_file(tags, file, name)
        if val is not None:
            return val
    return None


def _find_category_any_file(tags: dict, sort: list, category: str):
    """全ファイル（精査順）から指定カテゴリを検索。最初に見つけたカテゴリ dict or None"""
    for file in _iter_files(tags, sort):
        cat = _get_category(tags, file, category)
        if cat is not None:
            return cat
    return None


# ------------------------------------------------------------------ #
# DynamicPrompt 展開（frontend/src/utils.ts の getWildCardPrompt 相当）
# ------------------------------------------------------------------ #

def _wildcard_prompt(category: dict) -> str:
    """
    カテゴリ（{登録名: prompt}）を DynamicPrompt 構文 `{ v1, | v2, | ... }` に展開する。
    - 値が全て文字列なら展開
    - ネストした dict/list を含む場合は '' （ランダム不可）
    - 文字列が 1 件も無ければ ''
    """
    vals = list(category.values())
    if any(isinstance(v, (dict, list)) for v in vals):
        return ""
    strs = [v for v in vals if isinstance(v, str)]
    if not strs:
        return ""
    return "{ " + " | ".join(f"{v}," for v in strs) + " }"


# ------------------------------------------------------------------ #
# トークン解決
# ------------------------------------------------------------------ #

def _resolve_normal(inner: str, tags: dict, sort: list):
    """通常変換トークンの中身を解決する。置換文字列 or None（未一致）"""
    parts = inner.split("/")
    if len(parts) == 3:
        return _find_exact(tags, parts[0], parts[1], parts[2])
    if len(parts) == 2:
        # (a) ファイル名として解釈
        val = _find_in_file(tags, parts[0], parts[1])
        if val is not None:
            return val
        # (b) カテゴリ名として解釈（全ファイル精査）
        return _find_in_category_all_files(tags, sort, parts[0], parts[1])
    if len(parts) == 1:
        return _find_anywhere(tags, sort, parts[0])
    return None


def _resolve_dynamic(inner: str, tags: dict, sort: list):
    """DynamicPrompt トークンの中身を解決する。展開文字列 or None（未一致）"""
    parts = inner.split("/")
    if len(parts) == 2:
        cat = _get_category(tags, parts[0], parts[1])
    elif len(parts) == 1:
        cat = _find_category_any_file(tags, sort, parts[0])
    else:
        return None
    if cat is None:
        return None
    return _wildcard_prompt(cat)


# ------------------------------------------------------------------ #
# トークン走査・置換（整形含む）
# ------------------------------------------------------------------ #

# トークンと隣接するカンマ（＋空白）。未一致削除時に一体で飲み込む
_AFTER_COMMA_RE = re.compile(r"\s*,\s*")
_BEFORE_COMMA_RE = re.compile(r",\s*$")


def _process_tokens(text: str, delim: str, resolver, delete_unmatch: bool) -> str:
    """
    delim で囲まれたトークンを走査し、resolver で解決して置換する。
    - 解決成功（None 以外）: 前後テキストを保ったままトークンを置換
    - 未一致 かつ delete_unmatch=True : トークン＋隣接カンマ1つを一体で削除
        （後カンマ優先。後カンマが無ければ前カンマを削除）
    - 未一致 かつ delete_unmatch=False : 原文のまま残す
    delim が空文字の場合は何もしない（その記法を無効化）。
    """
    if not delim:
        return text

    d = re.escape(delim)
    pattern = re.compile(d + r"(.+?)" + d)

    parts = []
    last_end = 0
    for m in pattern.finditer(text):
        inner = m.group(1)
        resolved = resolver(inner)
        between = text[last_end:m.start()]

        if resolved is not None:
            parts.append(between)
            parts.append(resolved)
            last_end = m.end()
            continue

        if not delete_unmatch:
            parts.append(between)
            parts.append(m.group(0))
            last_end = m.end()
            continue

        # 未一致 → トークン＋隣接カンマ1つを削除
        after = _AFTER_COMMA_RE.match(text, m.end())
        if after:
            # 後カンマを飲み込む（前テキストはそのまま）
            parts.append(between)
            last_end = after.end()
        else:
            # 後カンマが無ければ前カンマを削除
            before = _BEFORE_COMMA_RE.search(between)
            if before:
                parts.append(between[:before.start()])
            else:
                parts.append(between)
            last_end = m.end()

    parts.append(text[last_end:])
    return "".join(parts)


def replace_prompts(text: str, tags: dict, sort: list,
                    delete_unmatch: bool = True,
                    delimiter: str = "--",
                    dynamic_delimiter: str = "@@") -> str:
    """
    入力文字列内の特殊トークンを登録プロンプトに置換して返す。

    - DynamicPrompt（dynamic_delimiter）を先に処理し、その後で通常変換（delimiter）を処理する。
    - __config__ は検索対象から除外する。
    - tags は { ファイル名: { カテゴリ: { 登録名: prompt } } } を想定（深いネストは無視）。
    """
    if not text:
        return text

    sort = sort or []
    # __config__ を除外したビューで検索する
    data = {k: v for k, v in tags.items() if k != CONFIG_KEY}

    text = _process_tokens(
        text, dynamic_delimiter,
        lambda inner: _resolve_dynamic(inner, data, sort),
        delete_unmatch,
    )
    text = _process_tokens(
        text, delimiter,
        lambda inner: _resolve_normal(inner, data, sort),
        delete_unmatch,
    )
    return text
