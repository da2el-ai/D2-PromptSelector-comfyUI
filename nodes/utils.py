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
フォルダAが空の場合、フォルダBの内容をコピーする関数

Args:
    src: コピー元のフォルダパス
    dist: コピー先のフォルダパス

Returns:
    Dict with keys:
        - success: 処理が成功したかどうか
        - message: 処理結果のメッセージ
        - copied_files: コピーされたファイルのリスト（成功時のみ）
"""
def copy_if_empty(src: Union[str, Path], dist: Union[str, Path]):
    # print("//////// copy_if_empty")
    # print(src, dist)
    # Pathオブジェクトに変換
    dist = Path(dist)
    src = Path(src)
    
    # フォルダAが存在しない場合は作成
    dist.mkdir(parents=True, exist_ok=True)
    
    # フォルダAの中身を確認
    # 何かファイルがあったら何もしない
    files_in_a = list(dist.glob('*'))
    if files_in_a:
        return
    
    # print("//////// コピーする")

    # フォルダBの内容をコピー
    for item in src.glob('**/*'):
        # 相対パスを計算
        relative_path = item.relative_to(src)
        target_path = dist / relative_path
        
        if item.is_file():
            # ファイルの場合
            target_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target_path)
        elif item.is_dir():
            # ディレクトリの場合
            target_path.mkdir(parents=True, exist_ok=True)
        
