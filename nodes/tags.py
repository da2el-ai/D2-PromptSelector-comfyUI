import yaml
import json
import shutil
from pathlib import Path
from aiohttp import web
from server import PromptServer


"""
タグファイルを取得
"""
@PromptServer.instance.routes.get("/D2_prompt-selector/get_tags")
async def route_d2_ps_get_tags(request):
    TagsUtil.load_tags()

    # JSON応答を返す
    json_data = json.dumps(TagsUtil.tags)
    return web.Response(text=json_data, content_type='application/json')


"""
旧形式チェック
レスポンス: { "needed": true/false }
"""
@PromptServer.instance.routes.get("/D2_prompt-selector/check_migration_needed")
async def route_d2_ps_check_migration_needed(request):
    needed = TagsUtil.check_migration_needed()
    return web.json_response({"needed": needed})


"""
マイグレーション実行
tags/ を tags_bak/ にバックアップしてから新形式に変換する
"""
@PromptServer.instance.routes.post("/D2_prompt-selector/migrate")
async def route_d2_ps_migrate(request):
    try:
        TagsUtil.do_migrate()
        return web.json_response({"success": True})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


"""
タグ追加
"""
@PromptServer.instance.routes.post("/D2_prompt-selector/add_item")
async def route_d2_ps_add_item(request):
    try:
        body = await request.json()
        result = TagsUtil.add_item(
            file=body["file"],
            category=body["category"],
            new_category=body.get("new_category"),
            name=body["name"],
            prompt=body["prompt"],
            new_file=body.get("new_file"),
        )
        return web.json_response(result)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


"""
タグ編集
"""
@PromptServer.instance.routes.post("/D2_prompt-selector/edit_item")
async def route_d2_ps_edit_item(request):
    try:
        body = await request.json()
        result = TagsUtil.edit_item(
            file=body["file"],
            category=body["category"],
            name=body["name"],
            new_name=body["new_name"],
            new_prompt=body["new_prompt"],
            new_file=body.get("new_file"),
            new_category=body.get("new_category"),
            new_file_name=body.get("new_file_name"),
        )
        return web.json_response(result)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


"""
カテゴリ編集（リネーム / ファイル間移動）
"""
@PromptServer.instance.routes.post("/D2_prompt-selector/edit_category")
async def route_d2_ps_edit_category(request):
    try:
        body = await request.json()
        result = TagsUtil.edit_category(
            file=body["file"],
            category=body["category"],
            new_file=body["new_file"],
            new_category=body["new_category"],
            new_file_name=body.get("new_file_name"),
        )
        return web.json_response(result)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


"""
タグ / カテゴリ削除
"""
@PromptServer.instance.routes.post("/D2_prompt-selector/delete_item")
async def route_d2_ps_delete_item(request):
    try:
        body = await request.json()
        result = TagsUtil.delete_item(
            type=body["type"],
            file=body["file"],
            category=body["category"],
            name=body.get("name"),
        )
        return web.json_response(result)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


class TagsUtil:
    BASE_DIR = Path(__file__).parent.parent
    TAGS_DIR = BASE_DIR / 'tags'
    tags = {}

    @classmethod
    def tag_files(cls):
        return cls.TAGS_DIR.rglob("*.yml")

    @classmethod
    def load_tags(cls):
        cls.tags = {}
        for filepath in cls.tag_files():
            with open(filepath, "r", encoding="utf-8") as file:
                yml = yaml.safe_load(file)
                cls.tags[filepath.stem] = yml

    # ------------------------------------------------------------------ #
    # マイグレーション関連
    # ------------------------------------------------------------------ #

    @classmethod
    def check_migration_needed(cls) -> bool:
        """tags/ 内のいずれかのファイルが旧形式かどうかを返す"""
        for filepath in cls.TAGS_DIR.glob("*.yml"):
            if filepath.stem == "__config__":
                continue
            data = yaml.safe_load(filepath.read_text(encoding="utf-8")) or {}
            if cls._needs_migration(data):
                return True
        return False

    @classmethod
    def _needs_migration(cls, data: dict) -> bool:
        """
        YAMLデータが旧形式かどうかを判定する。
        以下のいずれかに該当する場合は旧形式：
        - カテゴリ値がリスト（配列形式）
        - カテゴリ内の値が文字列以外（ネスト辞書・リスト）
        """
        for key, value in data.items():
            if key == "__config__":
                continue
            if isinstance(value, list):
                return True
            if isinstance(value, dict):
                for v in value.values():
                    if not isinstance(v, str):
                        return True
        return False

    @classmethod
    def do_migrate(cls):
        """
        tags/ を tags_bak/ にバックアップし、全 .yml を新形式に変換して保存する。
        """
        # バックアップ
        bak_dir = cls.BASE_DIR / "tags_bak"
        if bak_dir.exists():
            shutil.rmtree(bak_dir)
        shutil.copytree(cls.TAGS_DIR, bak_dir)

        # 各ファイルを変換
        for filepath in cls.TAGS_DIR.glob("*.yml"):
            if filepath.stem == "__config__":
                continue
            data = yaml.safe_load(filepath.read_text(encoding="utf-8")) or {}
            if cls._needs_migration(data):
                new_data = cls._migrate_yaml(data)
                filepath.write_text(
                    yaml.dump(new_data, allow_unicode=True, sort_keys=False),
                    encoding="utf-8",
                )

        cls.load_tags()

    @classmethod
    def _migrate_yaml(cls, data: dict) -> dict:
        """旧形式の YAML データを新しい1階層 dict 形式に変換する"""
        result = {}
        for cat_key, cat_value in data.items():
            if cat_key == "__config__":
                result[cat_key] = cat_value
                continue
            cls._flatten_category(cat_key, cat_value, result, parent=None)
        return result

    @classmethod
    def _flatten_category(cls, cat_name: str, cat_value, result: dict, parent):
        """
        カテゴリを再帰的にフラット化して result に追加する。
        - リスト要素のうち文字列は {prompt: prompt} に変換
        - ネストした辞書/リストは "親 > 子" 形式のキーに昇格
        """
        full_name = f"{parent} > {cat_name}" if parent else cat_name
        items = {}

        if isinstance(cat_value, list):
            for item in cat_value:
                if isinstance(item, str):
                    items[item] = item
                elif isinstance(item, dict):
                    for k, v in item.items():
                        if isinstance(v, str):
                            items[k] = v
                        else:
                            cls._flatten_category(k, v, result, parent=full_name)
        elif isinstance(cat_value, dict):
            for k, v in cat_value.items():
                if isinstance(v, str):
                    items[k] = v
                elif isinstance(v, (list, dict)):
                    cls._flatten_category(k, v, result, parent=full_name)

        if items:
            result[full_name] = items

    # ------------------------------------------------------------------ #
    # CRUD 操作
    # ------------------------------------------------------------------ #

    @classmethod
    def _load_file(cls, file_stem: str) -> dict:
        """指定ファイルの YAML を読み込んで返す。存在しない場合は空 dict"""
        filepath = cls.TAGS_DIR / f"{file_stem}.yml"
        if not filepath.exists():
            return {}
        return yaml.safe_load(filepath.read_text(encoding="utf-8")) or {}

    @classmethod
    def _save_file(cls, file_stem: str, data: dict):
        """dict を YAML として指定ファイルに保存する"""
        filepath = cls.TAGS_DIR / f"{file_stem}.yml"
        filepath.write_text(
            yaml.dump(data, allow_unicode=True, sort_keys=False),
            encoding="utf-8",
        )

    @classmethod
    def _create_new_file(cls, file_stem: str) -> dict:
        """
        新しい YAML ファイルを作成し、__config__.yml の sort 末尾に追加する。
        既存ファイルがあれば作成は skip するが、sort への追加は行う。
        - file_stem に不正文字を含む場合や予約名の場合は {"error": "invalid_file_name"} を返す
        - 成功時は {"ok": True} を返す
        """
        stem = file_stem.strip()
        if not stem or stem == "__config__":
            return {"error": "invalid_file_name"}
        # パス区切り文字や危険な文字を拒否
        if any(ch in stem for ch in ('/', '\\', ':', '*', '?', '"', '<', '>', '|')):
            return {"error": "invalid_file_name"}

        filepath = cls.TAGS_DIR / f"{stem}.yml"
        if not filepath.exists():
            filepath.write_text("", encoding="utf-8")

        config_path = cls.TAGS_DIR / "__config__.yml"
        if config_path.exists():
            config = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
        else:
            config = {}
        sort_list = config.get("sort") or []
        if stem not in sort_list:
            sort_list.append(stem)
            config["sort"] = sort_list
            config_path.write_text(
                yaml.dump(config, allow_unicode=True, sort_keys=False),
                encoding="utf-8",
            )
        return {"ok": True}

    @classmethod
    def _rename_key_in_place(cls, d: dict, old_key: str, new_key: str, new_value) -> None:
        """
        dict 内の old_key を new_key に変更しつつ、その位置に new_value を配置する。
        順序保持のために新しい dict を組み立てて中身を入れ替える。
        old_key == new_key の場合は単純に値を上書き。
        """
        if old_key == new_key:
            d[old_key] = new_value
            return
        rebuilt = {}
        for k, v in d.items():
            if k == old_key:
                rebuilt[new_key] = new_value
            else:
                rebuilt[k] = v
        d.clear()
        d.update(rebuilt)

    @classmethod
    def add_item(cls, file: str, category: str, new_category: str | None,
                 name: str, prompt: str, new_file: str | None = None) -> dict:
        """
        タグを1件追加する。
        - file == "__new__" のとき new_file を実際のファイル名として使い、必要なら新規作成
        - category == "__new__" のとき new_category を実際のカテゴリ名として使う
        - 同一カテゴリ内に同名アイテムが存在する場合は {"error": "duplicate"} を返す
        - 成功時は {"success": True} を返す
        """
        # 新規ファイル
        if file == "__new__":
            result = cls._create_new_file(new_file or "")
            if "error" in result:
                return result
            file = (new_file or "").strip()

        data = cls._load_file(file)
        if cls._needs_migration(data):
            return {"error": "migration_needed"}

        cat_name = new_category if category == "__new__" else category

        if cat_name not in data:
            data[cat_name] = {}

        if name in data[cat_name]:
            return {"error": "duplicate"}

        data[cat_name][name] = prompt
        cls._save_file(file, data)
        return {"success": True}

    @classmethod
    def edit_item(cls, file: str, category: str, name: str,
                  new_name: str, new_prompt: str,
                  new_file: str | None, new_category: str | None,
                  new_file_name: str | None = None) -> dict:
        """
        タグを1件編集する。
        - new_file / new_category が元と異なる場合は移動扱い
        - new_file == "__new__" のとき new_file_name を実際のファイル名として使い、必要なら新規作成
        - 移動先 or 同カテゴリ内で new_name が既存（かつ元の name と異なる）場合は {"error": "duplicate"}
        - 成功時は {"success": True} を返す
        """
        src_file = file

        # 新規ファイルへ移動
        if new_file == "__new__":
            result = cls._create_new_file(new_file_name or "")
            if "error" in result:
                return result
            dst_file = (new_file_name or "").strip()
        else:
            dst_file = new_file if new_file else file

        dst_cat = new_category if new_category else category

        src_data = cls._load_file(src_file)
        if cls._needs_migration(src_data):
            return {"error": "migration_needed"}

        # 元アイテムが存在するか確認
        if category not in src_data or name not in src_data[category]:
            return {"error": "not_found"}

        # 移動先データ（ファイルが同じ場合は同一オブジェクト）
        if dst_file == src_file:
            dst_data = src_data
        else:
            dst_data = cls._load_file(dst_file)

        if dst_cat not in dst_data:
            dst_data[dst_cat] = {}

        # 重複チェック（移動先で new_name が存在 かつ 元のエントリとは別の場合）
        is_same_slot = (dst_file == src_file and dst_cat == category and new_name == name)
        if not is_same_slot and new_name in dst_data[dst_cat]:
            return {"error": "duplicate"}

        # 同ファイル・同カテゴリ内の編集は順序を保持して in-place 更新
        if dst_file == src_file and dst_cat == category:
            cls._rename_key_in_place(src_data[category], name, new_name, new_prompt)
        else:
            # 移動：元を削除して移動先末尾に追加
            del src_data[category][name]
            if not src_data[category]:
                del src_data[category]
            dst_data[dst_cat][new_name] = new_prompt

        # 保存
        if dst_file == src_file:
            cls._save_file(src_file, src_data)
        else:
            cls._save_file(src_file, src_data)
            cls._save_file(dst_file, dst_data)

        return {"success": True}

    @classmethod
    def edit_category(cls, file: str, category: str,
                      new_file: str, new_category: str,
                      new_file_name: str | None = None) -> dict:
        """
        カテゴリを編集（リネーム または ファイル間移動）。
        - new_file が file と異なる場合：カテゴリごと（含むタグも一緒に）移動
        - new_file == "__new__" のとき new_file_name を実際のファイル名として使い、必要なら新規作成
        - new_file == file かつ new_category == category：何も変更せず success
        - 移動先 / リネーム先に同名カテゴリが既存（かつ元と異なる）の場合は {"error": "duplicate"}
        - 元カテゴリが存在しない場合は {"error": "not_found"}
        """
        # 新規ファイルへ移動
        if new_file == "__new__":
            result = cls._create_new_file(new_file_name or "")
            if "error" in result:
                return result
            new_file = (new_file_name or "").strip()

        src_data = cls._load_file(file)
        if cls._needs_migration(src_data):
            return {"error": "migration_needed"}

        if category not in src_data:
            return {"error": "not_found"}

        if file == new_file:
            dst_data = src_data
        else:
            dst_data = cls._load_file(new_file)
            if cls._needs_migration(dst_data):
                return {"error": "migration_needed"}

        is_same_slot = (file == new_file and new_category == category)
        if not is_same_slot and new_category in dst_data:
            return {"error": "duplicate"}

        # 同ファイル内のリネームは順序を保持して in-place 更新
        if file == new_file:
            cls._rename_key_in_place(src_data, category, new_category, src_data[category])
        else:
            # ファイル間移動：元を削除して移動先末尾に追加
            items = src_data[category]
            del src_data[category]
            dst_data[new_category] = items

        if file == new_file:
            cls._save_file(file, src_data)
        else:
            cls._save_file(file, src_data)
            cls._save_file(new_file, dst_data)

        return {"success": True}

    @classmethod
    def delete_item(cls, type: str, file: str,
                    category: str, name: str | None = None) -> dict:
        """
        タグ or カテゴリを削除する。
        - type == "item"     : 指定タグを削除。カテゴリが空になれば合わせて削除
        - type == "category" : カテゴリごと削除
        - 成功時は {"success": True} を返す
        """
        data = cls._load_file(file)
        if cls._needs_migration(data):
            return {"error": "migration_needed"}

        if type == "item":
            if category not in data or name not in data[category]:
                return {"error": "not_found"}
            del data[category][name]
            if not data[category]:
                del data[category]

        elif type == "category":
            if category not in data:
                return {"error": "not_found"}
            del data[category]

        else:
            return {"error": "invalid_type"}

        cls._save_file(file, data)
        return {"success": True}
