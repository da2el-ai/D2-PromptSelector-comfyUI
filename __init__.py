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

# from .nodes.d2_ps import NODE_CLASS_MAPPINGS as D2_CLASS_MAPPIGS 
# from .nodes.d2_size_nodes import NODE_CLASS_MAPPINGS as D2_SIZE_CLASS_MAPPIGS 
# from .nodes.d2_xy_nodes import NODE_CLASS_MAPPINGS as D2_XY_CLASS_MAPPIGS 
# from .nodes.d2_refiner_nodes import NODE_CLASS_MAPPINGS as D2_REFINER_CLASS_MAPPIGS 

WEB_DIRECTORY = "./web"
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = []

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]



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


