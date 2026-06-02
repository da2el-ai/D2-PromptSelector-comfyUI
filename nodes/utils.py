import os
import shutil
import yaml
from pathlib import Path
from typing import Dict, List, Union

"""
設定ファイルを読み込む
ファイルがなければ見本を複製する
"""
def load_config(config_path:Path, sample_path:Path):
    if not os.path.exists(config_path):
        shutil.copy2(sample_path, config_path)

    with open(config_path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


"""
コピー先フォルダが無い（または空）の場合、コピー元フォルダをまるごと複製する関数

tags フォルダが未作成・空のときに tags_sample を初期データとして配置する用途。
一時フォルダに複製してからリネームするため、途中で失敗しても中途半端な
コピー先フォルダが残らない（= __config__.yml だけ作られる等の事態を防ぐ）。

Args:
    src: コピー元のフォルダパス（例: tags_sample）
    dist: コピー先のフォルダパス（例: tags）
"""
def copy_if_empty(src: Union[str, Path], dist: Union[str, Path]):
    # Pathオブジェクトに変換
    dist = Path(dist)
    src = Path(src)

    # コピー先に中身があれば何もしない
    if dist.exists() and any(dist.iterdir()):
        return

    # コピー元が無ければ何もできない
    if not src.exists():
        return

    # 空フォルダが残っていれば削除しておく（copytree はコピー先非存在が前提）
    if dist.exists():
        shutil.rmtree(dist)

    # 一時フォルダにまるごと複製してから tags にリネーム（原子的に切り替え）
    tmp = dist.parent / f"{dist.name}_tmp_copy"
    if tmp.exists():
        shutil.rmtree(tmp)
    shutil.copytree(src, tmp)
    tmp.rename(dist)

