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
    def add_item(cls, file: str, category: str, new_category: str | None,
                 name: str, prompt: str) -> dict:
        """
        タグを1件追加する。
        - category == "__new__" のとき new_category を実際のカテゴリ名として使う
        - 同一カテゴリ内に同名アイテムが存在する場合は {"error": "duplicate"} を返す
        - 成功時は {"success": True} を返す
        """
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
                  new_file: str | None, new_category: str | None) -> dict:
        """
        タグを1件編集する。
        - new_file / new_category が元と異なる場合は移動扱い
        - 移動先 or 同カテゴリ内で new_name が既存（かつ元の name と異なる）場合は {"error": "duplicate"}
        - 成功時は {"success": True} を返す
        """
        src_file = file
        dst_file = new_file if new_file else file
        dst_cat  = new_category if new_category else category

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

        # 元のアイテムを削除
        del src_data[category][name]

        # 元カテゴリが空になったら削除
        if not src_data[category]:
            del src_data[category]

        # 移動先に追加
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
                      new_file: str, new_category: str) -> dict:
        """
        カテゴリを編集（リネーム または ファイル間移動）。
        - new_file が file と異なる場合：カテゴリごと（含むタグも一緒に）移動
        - new_file == file かつ new_category == category：何も変更せず success
        - 移動先 / リネーム先に同名カテゴリが既存（かつ元と異なる）の場合は {"error": "duplicate"}
        - 元カテゴリが存在しない場合は {"error": "not_found"}
        """
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
