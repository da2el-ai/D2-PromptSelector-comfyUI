"""
@author: da2el
@title: D2 Prompt Selector
@description: 
"""

from pathlib import Path
import os
import server
from server import PromptServer
from aiohttp import web
from .nodes import tags
from .nodes.utils import copy_if_empty
from .nodes.nodes import comfy_entrypoint

WEB_DIRECTORY = "./web"

# ノードは V3 スキーマ（comfy_entrypoint / ComfyExtension）で登録する。
# ComfyUI のローダーは NODE_CLASS_MAPPINGS 属性があるとそちらを優先し
# comfy_entrypoint を無視する（nodes.py の load 分岐は elif）ため、
# NODE_CLASS_MAPPINGS はあえて定義しない。
__all__ = ["WEB_DIRECTORY", "comfy_entrypoint"]



"""
# css読み取り用のパスを設定
"""
d2_ps_path = os.path.join(os.path.dirname(__file__))
d2_web_path = os.path.join(d2_ps_path, "web")

if os.path.exists(d2_web_path):
    server.PromptServer.instance.app.add_routes([
        web.static("/D2_prompt-selector/assets/", d2_web_path)
    ])


# タグファイルがなかったらサンプルをコピーする
# ファイルがあったら何もしない
current_dir = Path(__file__).parent
src = current_dir / 'tags_sample'
dist = current_dir / 'tags'

copy_if_empty(src, dist)


