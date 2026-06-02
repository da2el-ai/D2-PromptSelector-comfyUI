"""
D2 Prompt Selector ノード（V3 スキーマ）

受け取った文字列内の特殊トークン（`--ファイル/カテゴリ/登録名--` 等）を検出し、
登録済みプロンプト（tags/*.yml）に置き換えて出力する。

置換ロジックは ComfyUI 非依存の prompt_replacer.py に分離している。
このファイルは ComfyUI V3 スキーマのノード定義と、データ読み込みの橋渡しを担う。
"""

from comfy_api.latest import ComfyExtension, io

from .tags import TagsUtil
from .prompt_replacer import replace_prompts, CONFIG_KEY


def _load_tags_and_sort():
    """tags/*.yml を読み込み、(tags dict, sort list) を返す"""
    TagsUtil.load_tags()
    tags = TagsUtil.tags or {}
    config = tags.get(CONFIG_KEY)
    sort = config.get("sort") if isinstance(config, dict) else None
    return tags, (sort or [])


class D2PromptSelector(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id="D2_PromptSelector",
            display_name="D2 Prompt Selector",
            category="D2/PromptSelector",
            description="登録プロンプトを指すトークン（--file/category/name-- 等）を実プロンプトに置換する",
            inputs=[
                io.String.Input(
                    "string",
                    force_input=True,
                    tooltip="置換対象の文字列。--file/category/name-- などのトークンを含められる",
                ),
                io.Boolean.Input(
                    "delete_unmatch",
                    default=True,
                    tooltip="変換できなかったトークンを削除する（隣接カンマも整形）。False で原文のまま残す",
                ),
                io.String.Input(
                    "delimiter",
                    default="--",
                    tooltip="通常変換トークンの囲み記号（開始＝終了の同記号）",
                ),
                io.String.Input(
                    "dynamic_delimiter",
                    default="@@",
                    tooltip="DynamicPrompt 変換トークンの囲み記号（開始＝終了の同記号）",
                ),
            ],
            outputs=[
                io.String.Output(),
            ],
        )

    @classmethod
    def execute(cls, string, delete_unmatch, delimiter, dynamic_delimiter) -> io.NodeOutput:
        tags, sort = _load_tags_and_sort()
        result = replace_prompts(
            string,
            tags,
            sort,
            delete_unmatch=delete_unmatch,
            delimiter=delimiter,
            dynamic_delimiter=dynamic_delimiter,
        )
        return io.NodeOutput(result)


class D2PromptSelectorExtension(ComfyExtension):
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        return [
            D2PromptSelector,
        ]


async def comfy_entrypoint() -> D2PromptSelectorExtension:
    return D2PromptSelectorExtension()
