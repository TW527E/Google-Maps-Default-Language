<div align="center">

[**English**](./README.md) · [繁體中文](./README.zh-TW.md)

# Google Maps Default Language

**Keep Google Maps in your preferred language—automatically.**

[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-Install%20Userscript-670000?style=for-the-badge)](https://greasyfork.org/zh-TW/scripts/588875-google-maps-%E9%A0%90%E8%A8%AD%E8%AA%9E%E8%A8%80)

[![Version](https://img.shields.io/greasyfork/v/588875?label=version)](https://greasyfork.org/zh-TW/scripts/588875-google-maps-%E9%A0%90%E8%A8%AD%E8%AA%9E%E8%A8%80)
[![Total installs](https://img.shields.io/greasyfork/dt/588875?label=installs)](https://greasyfork.org/zh-TW/scripts/588875-google-maps-%E9%A0%90%E8%A8%AD%E8%AA%9E%E8%A8%80)

</div>

## Overview

Google Maps normally chooses its display language from your browser, account, or regional settings. This Tampermonkey userscript makes that behavior predictable:

- If Google Maps is not in Chinese on the first run, it switches to **Traditional Chinese (`zh-TW`)**.
- If Google Maps is already using a Chinese locale (`zh-*`), that locale is preserved.
- If you later choose another language from the Google Maps language menu, the script remembers it as your new default.
- Your preference is applied automatically whenever you open Google Maps.

## Install

### Greasy Fork (recommended)

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/).
2. Open the [Google Maps Default Language page on Greasy Fork](https://greasyfork.org/zh-TW/scripts/588875-google-maps-%E9%A0%90%E8%A8%AD%E8%AA%9E%E8%A8%80).
3. Click **Install this script**.

### Manual installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the Tampermonkey dashboard and create a new userscript.
3. Copy the entire contents of [`google-maps-default-language.user.js`](./google-maps-default-language.user.js) into the editor.
4. Save the script and reopen [Google Maps](https://www.google.com/maps).

## How It Works

| Situation | Result |
| --- | --- |
| First visit in a non-Chinese language | Switches to Traditional Chinese (`zh-TW`) |
| First visit in any Chinese locale | Preserves the current Chinese locale |
| Later visits | Applies the remembered language |
| Manual language change in Google Maps | Saves the selected language as the new default |

The script monitors the Google Maps `hl` URL parameter, `<html lang>` changes, and language-selection navigation. The preference is stored locally through Tampermonkey's `GM_setValue` API.

## Changing or Resetting the Default

You can change the language normally from **Google Maps → Menu → Language**. The script will remember your selection.

You can also open the Tampermonkey menu while viewing Google Maps and choose:

- **將預設語言設為繁體中文** — set Traditional Chinese as the default.
- **清除已記住的語言** — clear the saved preference and run first-time detection again.

## Supported Pages

- `https://www.google.com/maps*`
- `https://maps.google.com/*`
- Regional Google Maps domains such as `google.com.tw` and `google.co.jp`

## Privacy

- No data is collected or transmitted.
- The preferred language is stored locally by your userscript manager.
- The script does not modify your Google Account's global language setting.

## Technical Notes

- Automatic switching uses `location.replace()`, avoiding an extra browser-history entry.
- Regular page loads and Google Maps SPA navigation are both handled.
- Short-lived interaction markers distinguish manual language changes from automatic redirects.

## License

This project is released under the [MIT License](./LICENSE).
