# D2-PromptSelector-comfyUI

[English](README_en.md) | [日本語](README.md) | [繁體中文](README_zh.md)

只需點擊按鈕即可輸入已登錄提示詞的工具。

Ver.2 新增了提示詞編輯功能。

![](docs/img/main-panel.png)


---

## 主要功能

- **輕鬆輸入提示詞：** 點擊按鈕即可輸入已登錄的提示詞
- **編輯功能：** 新增、編輯、刪除、排序提示詞與分類
- **搜尋功能：** 即時搜尋名稱與提示詞
- **多語言對應：** 支援日文 / 英文 / 簡體中文 / 繁體中文（使用者也可自行新增語言）
- **自動備份：** 預設保留最多 10 個版本

![](docs/img/prompt-selector.gif)

---


## 開啟 Prompt Selector

點擊畫面左下角的「PS」按鈕開啟。

![](docs/img/ps-button2.png)


## 面板操作

![](docs/img/normal-mode.png)


### 提示詞

點擊提示詞按鈕後，提示詞會輸入到**最後一個處於作用中的文字區域**。

>【提示】 以右鍵點擊（或 Ctrl+點擊）輸入後，會關閉 Prompt Selector 面板。

### DynamicPrompt

點擊分類名稱按鈕後，該分類所包含的提示詞會以 DynamicPrompt 語法輸入。

範例：<br>
分類：`髮色`<br>
已登錄提示詞：`black hair` `blonde hair` `silver hair`<br>
輸入結果：`{ black hair, | blonde hair, | silver hair, }`

※ 若要使用 DynamicPrompt 語法，需要安裝 [comfyui-dynamicprompts](https://github.com/adieyal/comfyui-dynamicprompts) 等自訂節點。

### 切換檔案（分頁）

每個提示詞檔案即為一個分頁。<br>
在後述的編輯模式中新增檔案即可增加分頁。

### 搜尋

選擇 🔍 分頁即可搜尋。名稱與提示詞皆以部分相符的方式搜尋。

### 編輯

進入編輯模式（後述）。

### 重新載入

點擊 🔄 按鈕會重新載入提示詞檔案，並將提示詞列表更新為最新狀態。


---

## 編輯模式

以控制列左端的「編輯」按鈕進入編輯模式，以「完成」返回。

![](docs/img/edit-mode.png)



### 新增提示詞

在編輯模式中，點擊「＋ 新增」按鈕會開啟新增對話框，輸入以下項目：

- 分頁（檔案）：從現有項目選擇或新建
- 分類：從現有項目選擇或新建
- 名稱（顯示名稱）
- 提示詞（支援多行）

### 編輯／刪除提示詞

在編輯模式中，點擊提示詞按鈕會開啟編輯對話框。每個提示詞左側顯示的 `×` 可將其刪除。

### 編輯／刪除分類

在編輯模式中，點擊分類名稱按鈕會開啟編輯對話框，可重新命名或移動到其他檔案。分類名稱左側的 `×` 可將整個分類刪除（其中包含的提示詞也會一併刪除）。

### 刪除檔案

在編輯模式中，可透過各分頁左側的 `×` 按鈕刪除檔案。刪除時需在確認對話框中正確輸入檔案名稱（以防誤操作）。

變更檔案名稱可在後述的排序對話框中進行。

### 排序對話框

在編輯模式中，以「排序」按鈕開啟樹狀檢視的對話框。

![](docs/img/sort.png)


- 以樹狀結構顯示 檔案 → 分類 → 提示詞 的 3 個層級
- 點擊標籤可顯示編輯對話框
- 拖曳 `⋮⋮` 進行排序
- 點擊 `x` 進行刪除


### 給舊版本使用者：編輯功能的限制

首次嘗試進入編輯模式時，若提示詞檔案為舊格式（多層級・陣列混雜），會顯示轉換確認對話框。轉換前的狀態會備份到 `tags_migration/` 資料夾。

**轉換前：**
```
hair:
  color:        # 分類為多層級
    black: black hair,
    blonde: blonde hair,
hair style:
  - ponytail    # 無名稱的陣列
  - twintails
```
**轉換後：**
```
hair > color:   # 攤平為單層
  black: black hair,
  blonde: blonde hair,
hair style:
  ponytail: ponytail    # 變為具名清單
  twintails: twintails
```

---

## 備份

在進行寫入類操作（新增・編輯・刪除・變更檔案名稱）的前一刻，會自動將整個 `tags/` 的快照儲存到 `tags_bak_YYYYMMDD_HHMMSS/` 資料夾。

- 保留數量可透過 **Backup Count** 設定變更（預設 10、最大 100、設為 0 則停用）
- 超過數量的舊備份會自動刪除
- 排序變更（拖放）不會建立備份
- 轉換（舊格式 → 新格式）會儲存到專用的 `tags_migration/` 資料夾（不在輪替範圍內）

---

## 直接編輯提示詞檔案

你也可以直接編輯提示詞檔案（YAML 格式）。<br>
檔案儲存於 `{ComfyUI 安裝資料夾}/custom_nodes/D2-PromptSelector-comfyUI/tags/`。

```yaml
対象:
    1girl: 1girl
    1boy: 1boy

年齢:
    ティーン: teen
    ローティーン: early teen
```

- 每個分類為 `名稱: 提示詞` 的字典格式
- 名稱可使用非英數字字元
- 不支援兩層以上的巢狀與陣列格式（舊格式檔案會在首次編輯時顯示轉換對話框）

### 新增檔案

在 `tags/` 中新增 YAML 檔案後，將其追加到 `__config__.yml` 的 `sort`。<br>
順序可自由變更。

```yaml
# __config__.yml
sort:
    - 人
    - 人_顔
    - 人_髪
    - ポーズ
```

編輯後透過 🔄 按鈕或重新載入 ComfyUI 即可套用。

---

## 設定

可在 ComfyUI 的 Settings 進行以下設定。

![](docs/img/settings_2.png)

| 設定項目                         | 內容                                     |
| -------------------------------- | ---------------------------------------- |
| ShowButton Location              | 「PS」按鈕的畫面邊緣基準位置             |
| ShowButton Horizontal Margin(px) | 距畫面邊緣的 X 方向邊距                  |
| ShowButton Vertical Margin(px)   | 距畫面邊緣的 Y 方向邊距                  |
| Backup Count                     | 備份保留數量（0〜100、0 則停用）         |

---

## 多語言對應

關於支援的語言以及使用者新增語言的方式，請參閱 [docs/i18n_zh.md](docs/i18n_zh.md)。

---

## 授權

MIT
