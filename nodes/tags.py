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
