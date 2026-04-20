// タグアイテム（1件）
// children がある場合はグループノード（ランダムボタン）、ない場合はリーフタグ
export type TagItem = {
  name: string;       // 表示名
  prompt: string;     // リーフ: 挿入プロンプト / グループ: ワイルドカード or ''
  children?: TagItem[]; // 旧形式の多階層ネスト
};

// カテゴリ（タグアイテムの集合）
export type TagCategory = {
  categoryId: string;
  items: TagItem[];
};

// ファイル（タブ1枚分）
export type TagFile = {
  fileId: string;
  categories: TagCategory[];
};

// 全タグデータ
export type AllTags = TagFile[];

// バックエンドの生レスポンス形式（再帰的にネストをサポート）
export type RawTagValue = string | string[] | { [key: string]: RawTagValue } | null;

export type RawTagsResponse = {
  [fileId: string]: {
    [categoryId: string]: { [name: string]: RawTagValue } | string[] | null;
  };
};
