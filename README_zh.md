# D2-PromptSelector-comfyUI

[English](README_en.md) | [日本語](README.md) | [繁體中文](README_zh.md)

可透過按鈕一鍵插入已註冊提示詞的小工具。

Ver.2 新增了提示詞的編輯功能。

![](img/main-panel.png)


---

## 主要功能

- 提示詞快速輸入：點擊按鈕即可輸入已註冊的提示詞
- 編輯功能：新增、編輯、刪除、重新排序提示詞與分類
- 搜尋功能：對名稱與提示詞進行即時搜尋
- 多語系支援：日文 / 英文 / 簡體中文 / 繁體中文（使用者可自行新增語言）
- 自動備份：預設保留最近 10 個版本


![](img/prompt-selector.gif)

---


## 開啟 Prompt Selector

點擊畫面左下角的「PS」按鈕開啟。

![](img/ps-button2.png)


## 面板操作

![](img/normal-mode.png)


### 提示詞

點擊提示詞按鈕會將提示詞插入到 **最後一個作用中的文字區域**。

**【小技巧】** 按滑鼠右鍵（或 Ctrl+點擊）會在插入後關閉 Prompt Selector 面板。

### DynamicPrompt

點擊分類名稱按鈕會以 DynamicPrompt 語法一次插入該分類內的所有提示詞。

範例：<br>
分類：`髮色`<br>
已註冊提示詞：`black hair` `blonde hair` `silver hair`<br>
輸入結果：`{ black hair, | blonde hair, | silver hair, }`


### 搜尋

選擇 🔍 分頁即可搜尋。名稱與提示詞皆支援部分符合。

### 編輯

進入編輯模式（詳見下方）。

### 重新載入

點擊 🔄 按鈕會重新讀取字典檔，並更新提示詞清單。


---

## 編輯模式

點擊控制列左端的「編輯」按鈕進入編輯模式，點擊「完成」則離開。

![](img/edit-mode.png)



### 編輯前的限制

第一次嘗試進入編輯模式時，若已註冊內容為舊格式（多層級 / 陣列混合），會顯示轉換確認對話框。轉換前的狀態會備份至 `tags_migration/` 資料夾。

**轉換前：**
```
hair:
  color:        # 分類為多層級
    black: black hair,
    blonde: blonde hair,
hair style:
  - ponytail    # 無名稱的清單
  - twintails
```
**轉換後：**
```
hair > color:   # 扁平化
  black: black hair,
  blonde: blonde hair,
hair style:
  ponytail: ponytail    # 具名字典
  twintails: twintails
```


### 新增提示詞

於編輯模式中點擊「＋ 新增」按鈕，會開啟新增對話框，請輸入以下項目。

- 分頁（檔案）：從既有選擇 或 新增
- 分類：從既有選擇 或 新增
- 名稱（顯示名稱）
- 提示詞（支援多行）

### 編輯與刪除提示詞

於編輯模式中點擊提示詞按鈕會開啟編輯對話框。每個提示詞左側顯示的 × 可用來刪除。

### 編輯與刪除分類

於編輯模式中點擊分類名稱按鈕會開啟編輯對話框，可重新命名或移動至其他檔案。分類名稱左側的 × 會將整個分類刪除（包含其中的提示詞也會一併刪除）。

### 刪除檔案

於編輯模式中，各分頁左側的 × 按鈕可刪除檔案。刪除時會顯示確認對話框，必須輸入完全相符的檔案名稱（以防誤刪）。

檔案重新命名請於下方介紹的排序對話框中進行。

### 排序對話框

於編輯模式中，點擊「排序」按鈕會開啟樹狀檢視對話框。

![](img/sort.png)


- 以檔案 → 分類 → 提示詞的三層樹狀結構顯示
- 點擊標籤會顯示編輯對話框
- 拖曳 `⋮⋮` 可重新排序
- 點擊 `x` 會刪除

---

## 多語系支援

D2 Prompt Selector 原生支援下列語言。

| 語言     | 代碼    |
| -------- | ------- |
| 日文     | `ja`    |
| 英文     | `en`    |
| 簡體中文 | `zh`    |
| 繁體中文 | `zh-TW` |

會依照 ComfyUI 的 Settings > Comfy > Locale 所選的語言自動切換。

### 使用者自訂語言

於 `D2-PromptSelector-comfyUI/web/locales/` 資料夾中新增任意語言代碼的 JSON 檔案即可。

範例：韓文 → `ko.json`

請複製既有 JSON 檔案後進行翻譯。

若某個鍵未翻譯，將以英文作為後備顯示。

---

## 備份

在寫入類操作（新增 / 編輯 / 刪除 / 檔案重新命名）執行前，會自動將整個 `tags/` 資料夾的快照儲存至 `tags_bak_YYYYMMDD_HHMMSS/`。

- 保留數量可透過設定 **Backup Count** 變更（預設 10，最大 100，0 代表停用）
- 超過保留數量的舊備份會自動刪除
- 排序變更（拖放）不會建立備份
- 舊格式 → 新格式的轉換會儲存至專用的 `tags_migration/` 資料夾（不會被輪替刪除）

---

## 直接編輯檔案

您也可以直接編輯安裝目錄下 `tags/` 資料夾內的 YAML 檔。<br>
範例：`ComfyUI/custom_nodes/D2-PromptSelector-comfyUI/tags/`

### YAML 格式（單層字典）

```yaml
對象:
    1girl: 1girl
    1boy: 1boy

年齡:
    青少年: teen
    低年齡青少年: early teen
```

- 每個分類皆為 `名稱: 提示詞` 的字典形式
- 不支援兩層以上的巢狀以及清單格式（舊格式的檔案會在首次編輯時顯示轉換對話框）

### 新增檔案

在 `tags/` 中新增 YAML 檔案後，將其名稱加入 `__config__.yml` 的 `sort` 清單。順序可任意調整。

```yaml:__config__.yml
sort:
    - 人物
    - 人物_臉
    - 人物_頭髮
    - 姿勢
```

編輯後點擊 🔄 按鈕或重新載入 ComfyUI 即可反映變更。

---

## 設定

可於 ComfyUI 的 Settings 中設定下列項目。

![](img/settings_2.png)

| 設定項目                         | 說明                              |
| -------------------------------- | --------------------------------- |
| ShowButton Location              | 「PS」按鈕靠齊的畫面邊角位置      |
| ShowButton Horizontal Margin(px) | 距離畫面邊的 X 方向邊距           |
| ShowButton Vertical Margin(px)   | 距離畫面邊的 Y 方向邊距           |
| Backup Count                     | 備份保留數量（0–100，0 代表停用） |

---

## 授權

MIT
