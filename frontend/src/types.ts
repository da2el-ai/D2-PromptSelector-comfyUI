// タグアイテム（1件）
export type TagItem = {
  name: string;    // 表示名
  prompt: string;  // 挿入するプロンプト
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

// バックエンドの生レスポンス形式
export type RawTagsResponse = {
  [fileId: string]: {
    [categoryId: string]: { [name: string]: string } | string[] | null;
  };
};
