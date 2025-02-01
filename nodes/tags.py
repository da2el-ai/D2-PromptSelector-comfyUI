import yaml
import json
from pathlib import Path
from aiohttp import web
from server import PromptServer


"""
タグファイルを取得
D2/folder-image-queue/get_image_count?folder=****&extension=***
という形式でリクエストが届く
"""
@PromptServer.instance.routes.get("/D2_prompt-selector/get_tags")
async def route_d2_ps_get_tags(request):
    TagsUtil.load_tags()

    # JSON応答を返す
    json_data = json.dumps(TagsUtil.tags)
    return web.Response(text=json_data, content_type='application/json')


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
