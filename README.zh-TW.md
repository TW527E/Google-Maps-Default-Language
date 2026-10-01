[English](https://github.com/TW527E/Google-Maps-Default-Language/blob/main/README.md) · [**繁體中文**](https://github.com/TW527E/Google-Maps-Default-Language/blob/main/README.zh-TW.md)

# Google Maps 預設語言

**自動讓 Google Maps 保持你偏好的顯示語言。**

[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-%E5%AE%89%E8%A3%9D%E8%85%B3%E6%9C%AC-670000?style=for-the-badge)](https://greasyfork.org/zh-TW/scripts/588875-google-maps-%E9%A0%90%E8%A8%AD%E8%AA%9E%E8%A8%80)

[![版本](https://img.shields.io/greasyfork/v/588875?label=%E7%89%88%E6%9C%AC)](https://greasyfork.org/zh-TW/scripts/588875-google-maps-%E9%A0%90%E8%A8%AD%E8%AA%9E%E8%A8%80)
[![總安裝數](https://img.shields.io/greasyfork/dt/588875?label=%E5%AE%89%E8%A3%9D%E6%95%B8)](https://greasyfork.org/zh-TW/scripts/588875-google-maps-%E9%A0%90%E8%A8%AD%E8%AA%9E%E8%A8%80)

## 簡介

Google Maps 通常會依據瀏覽器、Google 帳戶或地區設定決定顯示語言。這個 Tampermonkey 使用者腳本讓語言行為更穩定、可預期：

- 第一次執行時，若 Google Maps 不是中文，便自動切換成**繁體中文（`zh-TW`）**。
- 若 Google Maps 已使用任一中文語系（`zh-*`），則保留目前的中文語系。
- 之後若從 Google Maps 語言選單手動選擇其他語言，腳本會將它記住為新的預設語言。
- 每次開啟 Google Maps 時，都會自動套用已記住的偏好。

## 安裝

### Greasy Fork（推薦）

1. 安裝 [Tampermonkey](https://www.tampermonkey.net/) 等使用者腳本管理器。
2. 開啟 Greasy Fork 上的 [Google Maps 預設語言](https://greasyfork.org/zh-TW/scripts/588875-google-maps-%E9%A0%90%E8%A8%AD%E8%AA%9E%E8%A8%80)頁面。
3. 按下「**安裝腳本**」。

### 手動安裝

1. 安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. 開啟 Tampermonkey 管理面板並建立新的使用者腳本。
3. 將 [`google-maps-default-language.user.js`](https://github.com/TW527E/Google-Maps-Default-Language/blob/main/google-maps-default-language.user.js) 的全部內容貼入編輯器。
4. 儲存腳本，然後重新開啟 [Google Maps](https://www.google.com/maps)。

## 運作方式

| 情況 | 處理結果 |
| --- | --- |
| 第一次使用，且目前為非中文語言 | 切換為繁體中文（`zh-TW`） |
| 第一次使用，且目前為任一中文語系 | 保留目前的中文語系 |
| 後續開啟 Google Maps | 套用已記住的語言 |
| 在 Google Maps 手動切換語言 | 將選擇的語言儲存為新的預設值 |

腳本會監看 Google Maps 網址中的 `hl` 參數、`<html lang>` 變化及語言選單導覽，並透過 Tampermonkey 的 `GM_setValue` API 將偏好保存在本機。

## 變更或重設預設語言

你可以依照一般方式，從 **Google Maps → 選單 → 語言** 選擇其他語言，腳本會自動記住新的選擇。

你也可以在 Google Maps 頁面開啟 Tampermonkey 選單，使用以下指令：

- **將預設語言設為繁體中文**：立即將繁體中文設為預設語言。
- **清除已記住的語言**：清除語言偏好，並重新執行第一次使用時的語言偵測。

## 支援頁面

- `https://www.google.com/maps*`
- `https://maps.google.com/*`
- `google.com.tw`、`google.co.jp` 等地區 Google Maps 網域

## 隱私

- 不會收集或傳送任何資料。
- 偏好語言僅由使用者腳本管理器儲存在本機。
- 不會修改 Google 帳戶的全域語言設定。

## 技術說明

- 自動切換使用 `location.replace()`，不會在瀏覽器歷史記錄中額外增加一筆頁面。
- 同時支援一般頁面載入及 Google Maps SPA 導覽。
- 使用短效的操作標記，區分使用者手動切換與腳本自動重新導向。

## 授權

本專案採用 [MIT License](https://github.com/TW527E/Google-Maps-Default-Language/blob/main/LICENSE) 授權。
