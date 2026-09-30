# Multiverse Garden — design.md（v2.1）

> 品牌官網設計規範 **第 2 版**：依網站實作與調整後的數值更新（2026-09-22）；
> **v2.1（2026-09-30）** 再依 Figma 更新的 Logo、首頁主視覺、Footer 與插花說明同步（見 §11.1）。
> 初版保留在 `設計稿/design 舊版.md`；與初版的差異整理在最後的 **§11**。
> 所有數值以 **px** 為單位（1 pt = 1 px @1x）。網站的 design tokens 在 `css/tokens.css`，
> 其他 CSS 只能引用 token，不另外寫 HEX 或字級（間距、尺寸可寫 px）。

---

## 0. 品牌概述

- **品牌名稱**：Multiverse Garden
- **定位**：花藝藝術品牌官網。花草不依賴陽光與土壤，從花器與牆面生長成裝置藝術；花藝如同藝術品般被觸碰、雕塑與欣賞。
- **視覺調性**：安靜、留白、畫廊感。米白底色襯托攝影作品，文字為深炭色，僅以磚紅與橄欖綠做極小面積點綴。**照片是主角，按鈕與文字保持低調**（v2 參考 Gentle Monster 官網的尺度，把按鈕與介面文字縮小）。
- **語系**：介面主要為繁體中文，品牌名與標語為英文。
- **頁面（16 頁）**：首頁、商品列表（含篩選、搜尋結果）、商品說明、居家擺設、商業空間案例（Christmas Pop-up）、婚禮佈置、抓周派對、花束、節日系列、線上花禮推薦、線上插花體驗、聯絡我們／客製化需求、花藝體驗課程、購物車與結帳、訂單成立、付款失敗。

---

## 1. 色彩系統（Color）

### 1.1 色票

| 色塊 | HEX | Token | 角色 | 使用位置 |
|---|---|---|---|---|
| ![#EDECE7](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iI0VERUNFNyIgc3Ryb2tlPSIjOUY5RjlGIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=) | `#EDECE7` | `--color-bg-ivory` | 品牌底色／浮起的區塊 | Footer、置中版 Header、面板標題列、購物車側欄、篩選面板、彈窗、首頁左側面板、案例頁底色、圖片空位 |
| ![#8B1F18](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iIzhCMUYxOCIvPjwvc3ZnPg==) | `#8B1F18` | `--color-brand-red` | 品牌強調色 | 啟用中的分類 chip、花禮推薦拉桿滑塊。僅作小面積點綴 |
| ![#696931](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iIzY5NjkzMSIvPjwvc3ZnPg==) | `#696931` | `--color-brand-olive` | 品牌輔助色 | 商品頁拉桿、hover（導覽、連結、icon、主要按鈕）、鍵盤焦點框 |
| ![#212121](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iIzIxMjEyMSIvPjwvc3ZnPg==) | `#212121` | `--color-ink` | 主文字／深色 | 所有內文與標題、深色主要按鈕、icon、外框按鈕的框線 |
| ![#FAFAFA](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iI0ZBRkFGQSIgc3Ryb2tlPSIjOUY5RjlGIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=) | `#FAFAFA` | `--color-surface` | 頁面底色 | body 背景、Header／分類列、面板內容區、輸入框底 |
| ![#9F9F9F](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iIzlGOUY5RiIvPjwvc3ZnPg==) | `#9F9F9F` | `--color-gray-500` | 次要文字／停用 | placeholder、未啟用 chip 文字、灰底與米白按鈕的框線 |
| ![#D9D9D9](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iI0Q5RDlEOSIvPjwvc3ZnPg==) | `#D9D9D9` | `--color-gray-200` | 邊框／分隔線 | chip 與輸入框邊框、分隔線、灰底按鈕（Neutral） |

### 1.2 頁面底色（v2 新增）

一般頁面用 `#FAFAFA`；以下頁面依 Figma 設計稿使用各自的底色：

| 色塊 | HEX | Token | 頁面 |
|---|---|---|---|
| ![#FAFAFA](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iI0ZBRkFGQSIgc3Ryb2tlPSIjOUY5RjlGIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=) | `#FAFAFA` | `--bg-page` | 商品列表、商品說明、居家擺設、花束、節日系列、花禮推薦、線上插花、婚禮佈置、抓周派對 |
| ![#F2F2EF](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iI0YyRjJFRiIgc3Ryb2tlPSIjOUY5RjlGIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=) | `#F2F2EF` | `--bg-page-home` | 首頁 |
| ![#F5F5F5](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iI0Y1RjVGNSIgc3Ryb2tlPSIjOUY5RjlGIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=) | `#F5F5F5` | `--bg-page-checkout` | 購物車與結帳、訂單成立、付款失敗、聯絡我們、花藝體驗課程（面板內容區維持 `#FAFAFA`，靠底色差分出面板） |
| ![#EDECE7](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNzIiPjxyZWN0IHg9IjAuNSIgeT0iMC41IiB3aWR0aD0iMTE5IiBoZWlnaHQ9IjcxIiByeD0iOCIgZmlsbD0iI0VERUNFNyIgc3Ryb2tlPSIjOUY5RjlGIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=) | `#EDECE7` | `--bg-elevated` | 商業空間案例頁（Christmas Pop-up） |

> 婚禮佈置、抓周派對沿用案例頁版型，但頁面用 `#FAFAFA`：圖片空位是米白色塊，放在米白底上會看不見。

### 1.3 語意配對（前景／背景）

| 背景 | 前景 | 用途 |
|---|---|---|
| `#FAFAFA` | `#212121` | 一般內容區、頁面本體 |
| `#EDECE7` | `#212121` | Footer、面板標題列、側欄、彈窗 |
| `#8B1F18` | `#FAFAFA` | 啟用中的分類 chip |
| `#212121` | `#FAFAFA` | 主要行動按鈕（Primary） |
| `#D9D9D9` | `#212121` | 灰底按鈕（Neutral：檢視購物車、預約實體課） |
| `#EDECE7` + `#9F9F9F` 框 | `#212121` | 米白按鈕（Ivory：加入購物車、確認付款、送出需求單） |
| `#FAFAFA` | `#9F9F9F` | placeholder、未啟用 chip |

### 1.4 使用規則

1. 頁面底色依 §1.2；區塊要「浮起來」時用 `#EDECE7`，兩者之間不加邊框，靠底色差異區分。
2. `#8B1F18` 每個畫面最多出現在 **一個** 主要互動元素上（目前的分類 chip、花禮推薦拉桿），不可用於大面積底色或內文。
3. `#696931` 用於商品頁拉桿、hover 與焦點；不與 `#8B1F18` 在同一元件內並用。
4. 文字只用 `#212121`（主要）與 `#9F9F9F`（次要）；深色或紅色底上的文字用 `#FAFAFA`。**不使用純黑 `#000000`**（Figma 稿中的 `#000`、`#111`、`#6F6D6D` 一律換成上述色）。
5. 邊框、分隔線一律 `#D9D9D9` 1px。
6. 遮罩與陰影用 ink 色 `rgba(33,33,33,…)`，不用黑色。
7. 對比度：`#212121` on `#EDECE7` ≈ 13.9:1；`#9F9F9F` on `#FAFAFA` ≈ 2.7:1（僅限 placeholder／裝飾性文字，不可作為必讀資訊）。

### 1.5 CSS Tokens

```css
:root {
  /* Brand palette */
  --color-bg-ivory:    #EDECE7;
  --color-brand-red:   #8B1F18;
  --color-brand-olive: #696931;
  --color-ink:         #212121;
  --color-surface:     #FAFAFA;
  --color-gray-500:    #9F9F9F;
  --color-gray-200:    #D9D9D9;

  /* Semantic */
  --bg-page:          var(--color-surface);
  --bg-elevated:      var(--color-bg-ivory);
  --text-primary:     var(--color-ink);
  --text-secondary:   var(--color-gray-500);
  --border-default:   var(--color-gray-200);
  --accent:           var(--color-brand-red);
  --accent-secondary: var(--color-brand-olive);
  --btn-primary-bg:   var(--color-ink);
  --btn-primary-fg:   var(--color-surface);
  --btn-neutral-bg:   var(--color-gray-200);
  --btn-neutral-fg:   var(--color-ink);

  /* 頁面底色例外（依 Figma） */
  --bg-page-home:     #F2F2EF;
  --bg-page-checkout: #F5F5F5;

  /* 遮罩與陰影（ink 色） */
  --overlay-scrim:   rgba(33, 33, 33, 0.5);
  --shadow-elevated: 0 8px 24px rgba(33, 33, 33, 0.08);
  --shadow-header:   0 4px 60px rgba(33, 33, 33, 0.25);
  --shadow-footer:   0 -8px 32px rgba(33, 33, 33, 0.06);
  --shadow-panel:    -2px 2px 40px rgba(33, 33, 33, 0.25);
  --shadow-card:     -2px 2px 10px rgba(33, 33, 33, 0.25);
}
```

---

## 2. 字體系統（Typography）

### 2.1 字型

| 用途 | 字型 | 來源 | 備註 |
|---|---|---|---|
| Display（品牌標語、案例標題） | **Alice** | Google Fonts | 僅 Regular 400；只用於英文 |
| 首頁區塊標題（OUR GARDEN / PRODUCTS） | **Alkalami** | Google Fonts | 僅 Regular 400；v2.1 改回設計稿用字 |
| 標題、內文、介面 | **Inter** | Google Fonts | 400 / 500 / 700 |
| 中文 | **Noto Sans TC** | Google Fonts | Inter 不含中文，必須指定；字重對應 400 / 500 / 700 |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alice&family=Alkalami&family=Inter:wght@400;500;700&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
:root {
  --font-display: "Alice", "Noto Serif TC", Georgia, serif;
  --font-sans:    "Inter", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
  --font-alkalami: "Alkalami", "Noto Serif TC", Georgia, serif;   /* 只用於首頁區塊標題 */
}
```

> Figma 稿中的 Alegreya Sans SC 一律改成 Inter；Alkalami 只留在首頁 OUR GARDEN / PRODUCTS 兩個區塊標題（v2.1 依使用者指示對齊設計稿），其他標題仍用 Inter。

### 2.2 字級規範（Type Scale）

| 層級 | Token | 字型 | 大小 | 字重 | 行高 | 使用位置 |
|---|---|---|---|---|---|---|
| Display large | `--text-display-lg` | Alice | **72** | 400 | 1.1 | 首頁標語「A Garden You Enter Through Your Eyes.」 |
| Display med | `--text-display-md` | Alice | **64** | 400 | 1.1 | 案例標題（Christmas Pop-up、Wedding Decoration、First Birthday Party） |
| H1 | `--text-h1` | Inter | 48 | 500 | 1.2 | 頁面主標題（目前網站未使用） |
| H2 | `--text-h2` | Inter | 40 | 400 | 1.2 | 區塊標題 OUR GARDEN／PRODUCTS（全大寫） |
| H3 ✦ | `--text-h3` | Inter | **20** | 500 | 1.3 | 面板標題（購物車、訂購資訊、付款資訊…） |
| 商品編號 ✦ | `--text-code` | Inter | **32** | 400 | 1.2 | 商品頁右上的編號「013」 |
| Body | `--text-body` | Inter | 16 | 400 | 1.5 | 商品說明、段落、輸入框內文字 |
| Body Bold | `--text-body-bold` | Inter | 16 | 700 | 1.5 | 段落標題「{ 商品簡介 }」、價格、合計 |
| UI ✦ | `--text-ui` | Inter | **14** | 400 | 1.5 | 按鈕、表單標籤、文字連結、拉桿文字、篩選選項、Footer 資料 |
| UI Strong ✦ | `--text-ui-strong` | Inter | **14** | 500 | 1.5 | 篩選標題等小標（花禮推薦的「色調／個性」改用 Body Bold 16） |
| Nav | `--text-nav` | Inter | 14 | 400 | 1 | 導覽、分類 chip、「查看全部品項」 |
| Price | `--text-price` | Inter | 14 | 400 | 1.5 | 商品卡價格 |
| Label ✦ | `--text-label` | Inter | **12** | 500 | 1.5 | Footer 小標 ADDRESS／CONTACT…（全大寫＋字距 0.08em） |
| Caption | `--text-caption` | Inter | 12 | 400 | 1.5 | 商品卡編號（010、013）、圖說 |

✦ = v2 新增或調整

### 2.3 CSS Tokens

```css
:root {
  --text-display-lg: 400 72px/1.1 var(--font-display);
  --text-display-md: 400 64px/1.1 var(--font-display);
  --text-h1:         500 48px/1.2 var(--font-sans);
  --text-h2:         400 40px/1.2 var(--font-sans);
  --text-h3:         500 20px/1.3 var(--font-sans);
  --text-body:       400 16px/1.5 var(--font-sans);
  --text-body-bold:  700 16px/1.5 var(--font-sans);
  --text-caption:    400 12px/1.5 var(--font-sans);
  --text-price:      400 14px/1.5 var(--font-sans);
  --text-nav:        400 14px/1   var(--font-sans);
  --text-ui:         400 14px/1.5 var(--font-sans);
  --text-ui-strong:  500 14px/1.5 var(--font-sans);
  --text-label:      500 12px/1.5 var(--font-sans);
  --text-code:       400 32px/1.2 var(--font-sans);
  --text-section-title: 400 40px/1.2 var(--font-alkalami);   /* 首頁 OUR GARDEN / PRODUCTS；≤768 為 28px */
}

@media (max-width: 768px) {
  :root {
    --text-display-lg: 400 48px/1.1 var(--font-display);
    --text-display-md: 400 40px/1.1 var(--font-display);
    --text-h1:         500 32px/1.2 var(--font-sans);
    --text-h2:         400 28px/1.2 var(--font-sans);
  }
}
```

### 2.4 使用規則

- Display 只用 Alice、只用 Regular、只放英文；中文標題用 Inter／Noto Sans TC。
- **介面文字（按鈕、chip、標籤、連結）統一 14px；閱讀用的內文維持 16px。**
- 中文不得小於 14px；12px 只用於商品編號、圖說與 Footer 英文小標。
- 輸入框內文字維持 16px（手機輸入時才不會被瀏覽器自動放大）。
- Figma 中 line-height 200% 的文字一律改成 token 的 1.5。
- 響應式：≤ 768px 時 Display large 48、Display med 40、H1 32、H2 28；Body 維持 16。

---

## 3. 品牌 Logo

### 3.1 檔案

![Multiverse Garden logo](assets/logo.svg)

- 檔案：`assets/logo.svg`（由 Figma 向量圖層匯出，455 × 56，`#212121`）。2026-09-30 使用者在 Figma 更新標準字後重新匯出，比例由 9 : 1 變成約 8.1 : 1。
- 形式：純文字標準字「Multiverse Garden」，以 `<img>` 置入並等比縮放。

### 3.2 安全區

Logo 四周與其他元素的間距最小 24px、建議 32px；Header 內 Logo 與左側視窗邊緣 40px。

### 3.3 尺寸

| 位置 | 尺寸 | 備註 |
|---|---|---|
| Header（左對齊版） | 230 × 28 | 距左 40，垂直置中；≤ 768 時 180 × 22 |
| Header（置中版，線上插花） | 286 × 35 | 水平置中；≤ 768 時 230 × 28 |
| Footer | 201 × 25 | 左上 |
| 首頁主視覺大字 | 455 × 56 | 左側面板左下角 |
| 最小尺寸 | 高 16 | 低於此尺寸改用文字連結 |

### 3.4 使用規則

1. 只允許兩種顏色：`#212121`（淺底）與 `#EDECE7`（深色照片或深底）。
2. 不可變形、旋轉、加陰影、加外框、加漸層或改變字距。
3. 不可放在對比不足的照片區域上；必要時加 `rgba(33,33,33,.4)` 遮罩。
4. 標語「A Garden You Enter Through Your Eyes.」是獨立的 Display 文字，不與 Logo 鎖定組合。

---

## 4. 間距與版面（Spacing & Layout）

### 4.1 Spacing Scale（8px 基準）

| Token | 值 | 用途 |
|---|---|---|
| `--space-1` | 4px | icon 與文字間距 |
| `--space-2` | 8px | 標籤與輸入框、卡片內元素 |
| `--space-3` | 16px | chip 左右內距、卡片內距 |
| `--space-4` | 24px | 元件之間、表單列間距 |
| `--space-5` | 32px | 容器內距、區塊內元件 |
| `--space-6` | 48px | 區塊上下 |
| `--space-7` | 64px | 主要區塊之間 |
| `--space-8` | 96px | Landing 區塊之間 |

### 4.2 版面

- 桌機設計寬 **1440**，內容超過 1440 時置中；頁面左右留白（`--page-gutter`）**40px**，≤ 768 時 16px。
- **600px 以上一律維持設計稿的排版，依比例縮放；只有手機（< 600）才重排。**

| 區塊 | ≥ 1440 | 600–1439 | < 600 |
|---|---|---|---|
| 商品格線 | 4 欄，卡寬 280、欄距 53、列距 200、左右 80 | 4 欄，依比例縮放（左右 5.556vw、欄距 3.681vw、列距 13.889vw） | 2 欄，欄距 16、列距 48 |
| 花禮推薦 4 張 | 卡寬 280、欄距 57、置中 | 4 欄等比縮放 | 2 欄 |
| 首頁主視覺 | 左文字面板＋右圖片與圓球 | 維持兩欄等比縮放 | 上下排 |
| 商品說明／居家擺設／案例／婚禮／抓周 | 兩欄 | 兩欄 | 單欄 |
| 結帳／聯絡我們／課程 | 兩欄（每欄最寬 640、欄距 60） | 兩欄（欄距 24） | 單欄 |
| 表單欄位 | 標籤在左（最窄 80 + 間距 6） | 面板寬 < 400 時標籤移到欄位上方 | 同左 |
| Header | 一行 | ≤ 900 時換行：Logo＋icon 一行、導覽一行（可橫向滑動） | 同左 |
| Footer | 三欄一行 | ≤ 1279 換行 | ≤ 768 直排 |

---

## 5. 圓角、陰影、邊框

| Token | 值 | 用途 |
|---|---|---|
| `--radius-sm` | **8px** | 卡片、圖片、面板、彈窗、textarea、篩選面板左側 |
| `--radius-pill` | 999px | chip、按鈕、搜尋框、單行輸入框、數量控制 |
| `--radius-full` | 50% | icon 點擊範圍、拉桿滑塊、圓形選項 |

| 陰影 Token | 值 | 用途 |
|---|---|---|
| `--shadow-header` | `0 4px 60px rgba(33,33,33,.25)` | 保留定義，v2.1 起未套用於任何元件 |
| `--shadow-footer` ✦ | `0 -8px 32px rgba(33,33,33,.06)` | Footer 上緣（v2 調淡） |
| `--shadow-panel` | `-2px 2px 40px rgba(33,33,33,.25)` | 購物車側欄、篩選面板 |
| `--shadow-card` | `-2px 2px 10px rgba(33,33,33,.25)` | 彈窗卡片 |
| `--overlay-scrim` | `rgba(33,33,33,.5)` | 彈窗遮罩 |

- 邊框一律 1px `#D9D9D9`；外框按鈕 1px `#212121`；米白／灰底按鈕 1px `#9F9F9F`。

```css
:root {
  --radius-sm: 8px; --radius-pill: 999px; --radius-full: 50%;
  --border: 1px solid var(--border-default);
}
```

---

## 6. 元件（Components）

### 6.1 Header

- **左對齊版**（除線上插花外的所有頁）：高 72、左右 40、底色 `#FAFAFA`。Logo（左）｜導覽 4 項（間距 50，≤ 1279 為 28）｜icon：搜尋、購物車、會員（24px，間距 28，點擊範圍 40px）。
- **置中版**（線上插花）：高 196、底色 `#EDECE7`，v2.1 起不加下緣陰影；icon 列靠右 → Logo 286 × 35 置中 → 導覽置中，彼此間距 24。
- 導覽文字 Nav 14px，hover 為 `#696931`。

### 6.2 主選單與分類（依資訊架構）

點主選單的分類，下方分類列就地換成該分類的子項目（不換頁）；沒有分類列的頁面（線上插花、結帳、訂單結果）點主選單則前往該分類的頁面。

| 主選單 | 分類列按鈕 → 前往 |
|---|---|
| 空間 盆花 / 佈置 | 全部商品 → 商品列表、大盆花、小盆花 → 商品列表篩選、商業空間 → 案例頁、婚禮佈置、抓周派對、居家擺設 |
| 花束 | 約會花束、生日 / 祝賀花束、探望花束 → 花束頁（暫無商品） |
| 節日系列 | 母親節花禮、情人節花禮、婚宴 / 拍攝用花 → 節日系列頁（暫無商品） |
| 探索品牌服務 | 品牌故事與門市 → 首頁、線上體驗插花、花藝體驗課程、聯絡我們 / 客製化需求 |

- 右上 icon：搜尋 → 搜尋膠囊（§6.4）、購物車 → 結帳頁、會員中心（尚未設計）。
- Footer 按鈕：品牌故事 → 首頁、聯繫我們 → 需求單、訂閱社群與門市地圖（尚未設計）。

### 6.3 分類列（Filter Bar）與 chip ✦

- 分類列高 64、左右 40、底色同 Header；右側篩選 icon 24px（在商品列表打開篩選面板，其他頁前往商品列表並打開面板）。
- chip：**高 32、左右 16、字 14（Nav）**、間距 12、pill。
  - 未啟用：1px `#D9D9D9` 外框、文字 `#9F9F9F`；hover 文字 `#212121`、框 `#9F9F9F`。
  - 啟用：`#8B1F18` 底、`#FAFAFA` 字，無邊框。
  - **不顯示外圍焦點框線**；鍵盤聚焦時改以外框加深表示。
- 放不下時可左右滑動（觸控板、觸控、滑鼠按住拖曳），邊緣 56px 淡出提示還有按鈕；切換分類時淡出淡入。

### 6.4 搜尋 ✦

- 點放大鏡 → 在 icon 左側由右往左展開膠囊輸入框：**寬 240、高 36、圓角 999**、1px `#D9D9D9`、底 `#FAFAFA`、字 14、placeholder「搜尋商品」。
- Enter 送出 → 商品列表顯示「「關鍵字」的搜尋結果」（比對編號、描述、分類、色系）；Esc 或點外面收起。

### 6.5 按鈕 ✦

| 類型 | 底 | 字 | 邊框 | 用途 |
|---|---|---|---|---|
| Primary | `#212121` | `#FAFAFA` | 無 | 結帳、製作完成、分享至社群、聯絡我們 |
| Outline | 透明 | `#212121` | 1px `#212121` | Footer、重置、確認、線上花禮推薦 |
| Neutral | `#D9D9D9` | `#212121` | 1px `#9F9F9F` | 檢視購物車、預約實體課 |
| Ivory | `#EDECE7` | `#212121` | 1px `#9F9F9F` | 加入購物車、確認付款、送出需求單、加入行事曆 |

| 尺寸 | 高 | 左右內距 | 字 |
|---|---|---|---|
| 一般 | **36** | 20 | 14 |
| 大（主要行動） | **48** | 32 | 14 |

- 全部為 pill；表單主按鈕最小寬 140；線上插花右側按鈕寬 300。
- hover：Primary → `#696931`；Outline → `#EDECE7` 底（Footer 上改 `#FAFAFA`）；Neutral／Ivory → 框線 `#212121`。
- focus：2px `#696931` outline、offset 2px（chip 除外，見 §6.3）。

### 6.6 商品卡

- 編號 Caption 12 → 間距 8 → 圖片 280 : 343、圓角 8 → 間距 8 → 價格 14。無邊框、無陰影。
- hover：圖片 `scale(1.02)`，300ms。商品列表另有「卡片放大版」效果：原圖淡出、去背圖由 0.9 倍淡入放大到 1 倍（僅限可 hover 的裝置）。

### 6.7 表單 ✦

- 單行輸入：pill、**高 40**、左右 24、1px `#D9D9D9`、底 `#FAFAFA`、字 16。
- 標籤：**14px**，在欄位左側（標籤欄最窄 80、間距 6）；面板寬度 < 400 時移到欄位上方。
- 日期欄位：上下內距 7（內容高 = 一行字 24），日期文字垂直置中。
- select：同單行輸入，右側 chevron（11 × 7），右內距 56。
- textarea：圓角 8，結帳頁高 338、需求單高 200。
- 數量控制：pill 146 × 40，−／＋ 20px（點擊範圍 40）。
- 群組面板：標題列高 60、左右 40、H3 20px、`#EDECE7` 底；內容區 `#FAFAFA`；整體圓角 8。

### 6.8 拉桿（Slider）

- 軌道 1px、滑塊 10px 圓；兩端文字 **14px**。
- 商品說明頁（顯示用）：軌道 200、軌道與滑塊皆 `#696931`、欄距 41。
- 花禮推薦頁（可拖曳）：軌道 360、軌道 `#696931`、滑塊 `#8B1F18`；標題「色調／個性」Inter Bold 16，兩端文字 14px＋圖示：色調列的圖示 24px、緊貼文字（間距 0）；個性列的圖示 16px、間距 4（同設計稿）。

### 6.9 購物車側欄（Drawer）

- 寬 394，固定在畫面右上，自右滑入 300ms；底 `#EDECE7`、`--shadow-panel`、內距 40 / 16；內容寬 309、間距 40。
- 內容：「商品 013 已加至購物車」→ 商品卡 → 按鈕列（檢視購物車 Neutral、結帳 Primary，皆為大按鈕，間距 24）；右上關閉 icon 24px。

### 6.10 彈窗（售後服務、分享社群）

- 卡片寬 451、底 `#EDECE7`、圓角 8、`--shadow-card`、內距 40；右上關閉 icon 24px（距上、右 20；點擊範圍 40）；遮罩 `--overlay-scrim`。
- 600px 以上：遮罩只蓋住商品主區（Header 不變暗），卡片位於主區左 76／上 108；600 以下改全畫面置中。

### 6.11 Footer ✦

- 底 `#EDECE7`、上緣 `--shadow-footer`（淡）、內距 **56 / 40**；三欄左右分散、垂直置中。
- 左：Logo 201 × 25 → 間距 12 → 地點列高 24（定位 icon **24px**、緊接文字不留間距，「Taipei, Taiwan」**16px / 500**）。
- 中：資訊表——小標 **12px / 500、全大寫、字距 0.08em**；資料 **14px**；欄距 32、列距 10、基線對齊。
- 右：寬 360；Outline 按鈕 **36px**（品牌故事、聯繫我們、訂閱社群一排，間距 12）＋ 門市地圖整排。

### 6.11b 首頁 OUR GARDEN 卡片 ✦

- 尺寸維持設計稿：368 × 224、圓角 8、底 `#EDECE7`；外加 1px 細框 `ink 8%`（hover 20%）。
- 內部改成編輯式排版（v2.2）：內距 28 / 32；icon 32 在左上、編號 01–03（12px、字距 0.08em、次要色）在右上、標題 **20px（--text-h3）** 在左下，中間留白是刻意的。
- 圖示改用 **Lucide**（sliders-horizontal／flower-2／sprout，32px、2px 線寬），中文標題下加一行英文小標（12px、字距 0.12em、次要色）：RECOMMENDATION／ARRANGEMENT／DECORATION。
- hover：**淡入一張相關作品照**（400ms，壓一層由上 52% 到下 80% 的遮罩，上半部看得到照片、下半部維持淺底讓標題清楚）＋細框變深、icon 上移 2px、標題下方 1px 細線由左往右展開。
- 三張的照片：`products/p013.jpg`／`arrange/choose-center.jpg`／`decor/decor-013-main.jpg`。

### 6.11c 居家擺設：空間照 ✦

- 四張空間照下方原本只是情境參考，現在把 **013 的作品疊到每張照片的牆面上**，讓人看得到「這件作品放在這個空間的樣子」。
- 做法：作品照（`decor-013-main.jpg`，背景是淺色牆面）以 `mix-blend-mode: multiply` 疊上去——淺色背景自然消失，只留下作品與它原本的影子；再用 `radial-gradient` 遮罩把照片的方形邊界柔化，看不出是後製。
- 每張的位置與大小寫在 HTML 的 `--x` / `--y` / `--w`（相對照片的百分比），四張各自微調過。

### 6.12 空狀態與圖片空位

- 「暫無商品」「沒有符合條件的商品」：14–16px 文字置中，保留一列商品卡的高度（300–480）。
- 沒有照片的位置保留原本尺寸，填 `#EDECE7` 色塊，不放「暫無圖片」文字。

---

## 7. 互動規格

| 功能 | 規格 |
|---|---|
| 首頁主視覺（滑鼠一碰，花從牆面長出來） | 主視覺是一段影片（`assets/video/hero.mp4` 5.9 秒／`hero.webm` 5 秒，皆 1152 × 768，牆上的花慢慢長出來；mp4 位元率約為 webm 的兩倍，所以 `<source>` 把 mp4 放前面），平常**暫停在第一格**＝ poster `assets/img/hero/garden-hero.jpg`，也就是設計稿上的那張照片，所以靜止時看起來就是靜態主視覺。滑鼠進到照片區（不含左邊的文字欄）就往前播，花從牆面長出來；滑到滿開就停住，不循環。滑鼠離開改用 seek 一格一格倒帶（1.8 倍速、等上一格 seek 完成才送下一格），花縮回牆面。觸控裝置：點一下播、再點一下倒回。影片圖層與照片一樣做 `scaleX(-1)`（設計稿的圖層是鏡射的），裁切 `object-position: 8% 50%`。開啟「減少動態效果」時完全不播，維持靜態照片 |
| 首頁 PRODUCTS | 由右往左無限循環（約 35px/秒）；滑鼠移上或鍵盤聚焦時暫停；可拖曳、觸控滑動 |
| 商品列表 | 往下捲動時 Header＋分類列收起，改顯示高 80 的細條（「查看全部品項」＋篩選 icon，`#FAFAFA` 60% 半透明＋模糊）；往上捲或點「查看全部品項」再展開 |
| 篩選面板 | 右側滑入，寬 280、全高、內距 40；預算（單選）、色系（複選）；重置、確認、線上花禮推薦 |
| 商品縮圖 | 第 1 張為原圖，第 2–4 張為細節；點縮圖換主圖。放大鏡在半圓圖上原地放大 2 倍，跟著游標移動 |
| 花禮推薦 | 版面由上而下：說明文字（高 60、靠左 40）→ 4 張商品卡（280 × 419，編號在上、價格在下）→ 兩條拉桿。拉桿兩端是文字＋圖示（暖 🌷／冷 🌸／溫柔 棉花／個性 ✦，圖示 24 / 16px，取自設計稿的 openmoji 與 game-icons）。進頁顯示設計稿上畫的 4 款；拉動拉桿後依色調（暖→冷）與個性（甜美溫柔→優雅個性）推薦最接近的 4 款 |
| 線上插花 | 選花器 → 拖曳花材到畫布；按住 SHIFT 拖曳可縮放與旋轉（觸控：雙指）；拖出畫布即移除 → 製作完成 → 分享（Instagram、Facebook、Threads） |
| 結帳與預約 | 必填檢查；付款成功 → 訂單成立，失敗 → 付款失敗（展示用，不儲存任何卡號）；課程與需求單可「加入行事曆」（.ics） |

---

## 8. 動效

- 一般為 `200–300ms ease-out`：chip 切換 200ms、側欄與面板滑入 300ms、圖片 hover 300ms、搜尋框展開 300ms。
- 例外：首頁主視覺的開花是影片本身的節奏（5 秒滿開、倒帶 1.8 倍速）。
- 不使用彈跳、旋轉等誇張動效。
- 使用者開啟「減少動態效果」時：首頁主視覺維持靜態照片（不播放開花）、跑馬燈不自動移動、商品列表影片只顯示封面。

---

## 9. 影像與圖標

- 照片為品牌核心，使用原色、不加濾鏡；容器圓角 8（滿版與貼邊圖片除外）。
- 商品列表主視覺為影片（`assets/video/hero.webm`／`hero.mp4`，靜音循環播放），封面 `assets/img/hero/garden-hero.jpg`。
- 首頁主視覺：與商品列表同一支影片（`assets/video/hero.webm`／`hero.mp4`），封面同為 `assets/img/hero/garden-hero.jpg`；首頁不自動播放，靠滑鼠互動（見 §7）。（`assets/img/home/hero-mirrored.jpg`、`hero-still.jpg` 是先前試過的靜態版本，目前未使用。）
- 商品圖 280 : 343；案例頁細節圖 4 欄無間距滿版。
- Icon 取自 Figma（search、cart、person、setting-config、location-dot、close-circle、chevron），24px，顏色 `#212121`。

---

## 10. 實作說明

1. `css/tokens.css`：本文件 §1.5、§2.3、§4、§5 的 token；全站最先載入。
2. `css/components.css`：Header、分類列、搜尋、Footer、按鈕、商品卡、拉桿、側欄、彈窗。
3. `js/core.js`：產生 Header／分類列／Footer、主選單分類（§6.2 的 `NAV`）、搜尋、購物車、側欄、彈窗。
4. `js/data.js`：商品資料（除 013 外為示範資料）。
5. 各頁樣式與程式：`css/pages/<頁面>.css`、`js/pages/<頁面>.js`。
6. 所有顏色與字級只引用 token；間距、尺寸可寫 px。
7. 改了共用 CSS／JS 後，把各頁 HTML 引用後面的 `?v=` 數字加 1，瀏覽器才不會用舊檔。

---

## 11. 與初版 design.md 的差異

| 項目 | 初版 | v2 |
|---|---|---|
| 頁面底色 | 一律 `#FAFAFA` | 首頁 `#F2F2EF`、結帳相關頁 `#F5F5F5`、案例頁 `#EDECE7`（依 Figma） |
| H3（面板標題） | 24px | **20px** |
| 商品編號 013 | H1 48px / 500 | **32px / 400** |
| 按鈕、表單標籤、連結 | 16px | **14px**（新增 UI token） |
| 一般按鈕 | 高 40、左右 24 | **高 36、左右 20** |
| 大按鈕 | （Figma 高 56、左右 44） | **高 48、左右 32** |
| 分類 chip | 規範高 32、左右 16（Figma 為 34 / 21） | **高 32、左右 16**，不顯示焦點框線，可左右滑動 |
| 單行輸入框 | 規範高 40（Figma 為 44） | **高 40** |
| Header | 高 64、icon 20、間距 24 | 依 Figma：高 72、icon 24、間距 28 |
| 購物車側欄 | 寬 360、圓角 8 | 依 Figma：寬 394、無圓角 |
| 拉桿 | 軌道 2、滑塊 12 | 依 Figma：軌道 1、滑塊 10；文字 14 |
| Footer | 內距 48 / 32、標籤 Body Bold 16、按鈕 40 | 內距 56 / 40、小標 12px 大寫＋字距、資料 14、按鈕 36、陰影調淡 |
| 陰影 | 只用於 Header 與側欄（8% 淺陰影） | 依 Figma 形狀、改用 ink 色；Footer 陰影調淡 |
| 版面斷點 | ≥1280 4 欄、768–1279 2 欄、<768 1 欄 | **600 以上維持設計稿排版等比縮放**，< 600 才重排 |
| 新增 | — | 主選單分類切換（依資訊架構）、搜尋膠囊、空狀態與圖片空位、首頁主視覺滑鼠平移、PRODUCTS 跑馬燈 |

### 11.1 v2.1（2026-09-30）：依更新後的 Figma 同步

| 項目 | v2 | v2.1 |
|---|---|---|
| Logo | 舊標準字（234 × 26，比例 9 : 1） | 新標準字（向量 455 × 56，比例約 8.1 : 1）；Header 230 × 28、置中版 286 × 35、Footer 201 × 25、主視覺 455 × 56 |
| 首頁主視覺 | 照片＋ 7 顆白色圓球，滑鼠靠近推開 | 設計稿已移除圓球；改成「靜態照片＋滑鼠一碰就從牆面長出花」的影片互動（見 §7） |
| 首頁 OUR GARDEN 卡片 | 置中的通用 UI icon ＋ 16px 標題、無邊框 | 編輯式排版（icon 左上／編號右上／20px 標題＋英文小標左下）、Lucide 圖示、1px 細框、hover 淡入作品照與細線（見 §6.11b） |
| 首頁 OUR GARDEN / PRODUCTS | Inter 40（--text-h2） | 依設計稿改回 **Alkalami 40**（--text-section-title） |
| Footer 左欄 | Logo 204 × 23、間距 14、定位 icon 16、文字 14 | Logo 201 × 25、間距 12、定位 icon **24**（不縮小）、icon 與文字間距 4、文字 16 / 500 |
| 商品編號與價格 | 置中 | **靠右**（商品說明頁與居家擺設頁，對齊 Figma ai=MAX） |
| 線上插花（選盆花） | 置中版 Header 下方有 60px 大陰影；滑過的卡片有上緣內陰影 | 兩個陰影都移除（滑過時只保留其他兩張變暗與 1.02 放大） |
| 彈窗關閉 icon | 40 × 40（距上、右 12） | **24 × 24**（距上、右 20，點擊範圍仍為 40） |
| 線上插花（插花畫布） | 右欄「插花小撇步 7 點＋注意事項」 | 依設計稿改成「如何開始插花」＋三段說明 |
| 花禮推薦 | 說明文字在最下方置中、拉桿兩端只有文字 | 說明文字移到最上方靠左（高 60）、拉桿兩端加上設計稿的圖示（緊貼文字） |
